# Mobile Chat

When Owncast is in its mobile layout, chat sits behind a button that opens a popup over the video. This plugin sends that button to `/plugins/mobichat/`, where the stream fills the width on top and chat stays open underneath. The page also has a **who's here** list, adapted from [owncast-chat-tools](https://github.com/cameronurnes/owncast-chat-tools).

Desktop layout is unchanged: Owncast's side-by-side chat still appears when Owncast is not in mobile mode.

Requires Owncast 0.3.0 or newer.

**Route note:** Owncast only gives plugins HTTP under `/plugins/<slug>/`. This plugin cannot register `/stream/mobile/` (or any other path) on the Owncast process itself.

## Setup

1. Upload `mobichat.ocpkg` under **Admin → Plugins**, or copy it to `data/plugins/`.
2. Review the permissions below, approve them, then enable the plugin.
3. Open the stream on a phone. Tap **Chat**, or open `/plugins/mobichat/` directly.

## Usage

- **Back** returns to the main stream page.
- **N in chat** opens the list of people currently in chat. Moderators are marked and listed first.
- Chat is Owncast's normal read/write chat embed (names, emotes, moderation). It is only available while the stream is live.
- The video starts muted so mobile browsers will autoplay it. Viewers can unmute in the player.
- `https` image and GIF links posted in chat show a small preview under the link on this page.

This plugin does **not** add GIF search, image uploads, or a GIPHY key. Install [Chat Tools](https://github.com/cameronurnes/owncast-chat-tools) alongside it if you want those on the main desktop chat.

## Permissions

- **ui.modify** — injects the phone handoff script and denser chat CSS into Owncast's pages, and adds the Mobile chat action button.
- **http.serve** — serves the watch page and the `/api/users` JSON endpoint under `/plugins/mobichat/`.
- **http.sse** — pushes live updates to the who's-here list (capped at 64 connections; beyond that the list polls every 30 seconds).
- **chat.history** — reads who is connected to chat for the list.
- **users.read** — looks up moderator status for the list. User ids never leave the server.

## What is exposed

Everything under `/plugins/mobichat/` is public while the plugin is enabled. That is Owncast's plugin HTTP model.

| Path | Who can call it | What it returns |
| --- | --- | --- |
| `/plugins/mobichat/` | Anyone | The stacked watch page (HTML/CSS/JS) |
| `/plugins/mobichat/api/users` | Anyone | `{ users: [{ name, mod }] }` only |
| `/plugins/mobichat/_sse/room` | Anyone | The same name list, pushed live |

Not exposed:

- Chat access tokens, user ids, IPs, or user-agents
- Admin endpoints
- Uploaded files or third-party API keys

The page embeds Owncast's own `/embed/video` and `/embed/chat/readwrite` on the same origin. This plugin never puts an access token in a URL.

Image previews load `https` image URLs in the viewer's browser. Only links ending in gif/png/jpg/jpeg/webp are previewed.
