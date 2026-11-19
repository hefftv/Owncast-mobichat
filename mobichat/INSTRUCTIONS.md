# Mobile Chat

When Owncast is in its mobile layout, chat sits behind a button that opens a popup over the video. This plugin sends that button to `/plugins/mobichat/`, where **chat stays open above a docked stream** at the bottom. Player controls (Back, Mute, Full screen) sit on a bar under the video.

Desktop layout is unchanged: Owncast's side-by-side chat still appears when Owncast is not in mobile mode.

Requires Owncast 0.3.0 or newer.

**Route note:** Owncast only gives plugins HTTP under `/plugins/<slug>/`. This plugin cannot register `/stream/mobile/` (or any other path) on the Owncast process itself.

## Setup

1. Upload `mobichat.ocpkg` under **Admin → Plugins**, or copy it to `data/plugins/`.
2. Review the permissions below, approve them, then enable the plugin.
3. Open the stream on a phone. Tap **Chat**, or open `/plugins/mobichat/` directly.

## Usage

- Chat fills the upper area; the stream stays docked at the bottom so it remains visible while you read and type.
- **Back** returns to the main stream page.
- **Unmute / Mute** and **Full screen** control the docked player.
- Chat is Owncast's normal read/write chat embed (names, emotes, moderation). It is only available while the stream is live.
- The video starts muted so mobile browsers will autoplay it.
- `https` image and GIF links posted in chat show a small preview under the link on this page.

This plugin does **not** add GIF search, image uploads, or a GIPHY key. Install [Chat Tools](https://github.com/cameronurnes/owncast-chat-tools) alongside it if you want those on the main desktop chat.

## Permissions

- **ui.modify** — injects the phone handoff script and denser chat CSS into Owncast's pages, and adds the Mobile chat action button.
- **http.serve** — serves the watch page and the `/api/users` JSON endpoint under `/plugins/mobichat/`.
- **http.sse** — reserved for live room updates (who's-here UI is currently disabled).
- **chat.history** — reserved for room membership reads.
- **users.read** — reserved for moderator lookups. User ids never leave the server.

## What is exposed

Everything under `/plugins/mobichat/` is public while the plugin is enabled. That is Owncast's plugin HTTP model.

| Path | Who can call it | What it returns |
| --- | --- | --- |
| `/` (and static files under `public/`) | Anyone | The stacked watch page |
| `/api/users` | Anyone | `{ "users": [ { "name", "mod" } ] }` only — no ids, IPs, or tokens |
| `/_sse/room` | Anyone (Owncast SSE) | `users` events with the same public shape |

## Limits

- Plugin HTTP and SSE follow Owncast host caps (request/response body size, 64 SSE connections per plugin).
- If SSE is saturated, clients can still poll `/api/users`.
