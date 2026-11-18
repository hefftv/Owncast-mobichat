# Mobile chat

Phone and tablet viewers should watch the stream and keep chat open at the same time. Owncast already does that beside the video when the window is wider than 768px. At 768px and under, chat is a centered modal opened by a floating Chat button, so the picture is covered while you type.

This project is a UI plugin. It does not add chat commands, bots, or a second chat protocol.

## Decision

Use the JavaScript SDK, [`@owncast/plugin-sdk`](https://www.npmjs.com/package/@owncast/plugin-sdk), and serve a stacked page from the plugin.

The page is two official embeds in a column:

- Video on top: `/embed/video`
- Full chat underneath: `/embed/chat/readwrite`

A small script injected into the main viewer offers that page when Owncast shows its mobile Chat button. Desktop keeps the stock side-by-side layout.

Python (`owncast-plugin-py`) and native WebAssembly can build the same kind of package, and they do not help a page made of HTML and CSS. The SDK is packaging and install. The chat embed does the messaging.

## Why not restyle the modal

Plugins can add CSS, JavaScript, extra HTML, viewer tabs, and action buttons. The UI docs describe those slots and do not describe a slot that moves or replaces chat. Tabs are called out as content that should not compete with chat, which treats the chat column as host chrome.

On current `develop`:

- `web/components/ui/Content/Content.tsx` sets mobile when `window.innerWidth <= 768`.
- `MobileContent` renders About, Followers, Featured, and plugin tabs. It does not render chat.
- `ChatModal` is mounted only after the floating Chat button sets `showChatModal`.

A stylesheet cannot reveal a chat component that React has not mounted. Opening the modal and then hiding its mask still covers or fights the video, and it depends on Ant Design markup Owncast does not promise to keep. [Issue #3931](https://github.com/owncast/owncast/issues/3931) asks for watch-and-chat on mobile. The maintainer has said a layout rewrite is not planned; an earlier tab under the video was removed because of scroll bugs.

The embed guide is the supported way to place video and chat on a page we control. Parent-page CSS styles the iframe box only. Colors inside the embeds still come from the server's appearance settings.

## What the viewer gets

1. They open the stream as usual.
2. When Owncast is in its mobile layout (floating Chat button), a handoff takes them to `/plugins/<slug>/` on the same Owncast origin. The handoff follows that mobile UI, not a separate width check.
3. The stream fills the full width at the top (16:9 from the viewport).
4. Chat fills the rest of the screen and stays open, composer at the bottom.

When Owncast is in desktop layout (side chat), the stacked page is still a direct link for anyone who wants that layout.

Chat exists only while the stream is live. The page should keep the video area either way, and show the chat frame when chat is available.

The layout risk to solve on our page is the phone keyboard. The composer is inside the chat iframe, so the page around the iframes has to give that frame enough height when the keyboard opens. We size the frames. We do not restyle the documents inside them.

## SDK

All three authoring paths are one plugin system: one manifest, one permission check, one `.ocpkg` an admin uploads (or drops in `data/plugins/`) and then enables. Owncast 0.3.0 or newer. The plugin API is still evolving. There is no webhook URL to paste for this project.

| SDK | Decision | Reason |
| --- | --- | --- |
| `@owncast/plugin-sdk` (JavaScript) | Use | Viewer work is HTML, CSS, and a handoff script. Scaffold with `npx create-owncast-plugin`. npm 0.11.0, published 2026-08-30. Repo: [owncast/plugin-sdk](https://github.com/owncast/plugin-sdk). |
| `owncast-plugin-py` | Skip | Same host API. Injected viewer scripts are still JavaScript. Pure Python only. |
| Native WASM | Skip | No SDK library. Extra toolchain, same manifest fields. |

Permissions this plugin needs:

- `http.serve` so the stacked page and `/api/users` are served at `/plugins/mobichat/`
- `ui.modify` so the mobile Chat handoff, denser chat CSS, and Mobile chat action are injected
- `http.sse` so the who's-here list updates live
- `chat.history` and `users.read` so the list can read connected clients and moderator flags

`chat.send`, filters, uploads, and `network.fetch` stay unused. Messaging stays inside `/embed/chat/readwrite`. The public `/api/users` response is only `{ name, mod }` — no ids, IPs, or tokens.

Owncast only hosts plugin HTTP under `/plugins/<slug>/`. A path like `/stream/mobile/` is not available to plugins without a reverse proxy outside Owncast, which this project does not ship.

Install is the normal plugin flow: build an `.ocpkg`, upload it under Admin → Plugins, approve the two permissions, enable it. The plugin runs inside the Owncast process.

## Package shape

The plugin lives in [`mobichat/`](../mobichat/). It follows the file layout of [cameronurnes/owncast-chat-tools](https://github.com/cameronurnes/owncast-chat-tools) (MIT) and the official `scripts-demo` example: `ui.modify` plus `assets/` plus `http.serve`, with an empty `definePlugin`. It does not copy chat-tools' DOM extras.

[teklynk/owncast-chat-commands-plugin](https://github.com/teklynk/owncast-chat-commands-plugin) only replies to `!commands` and posts timed messages. It is not the UI reference.

- `mobichat/plugin.manifest.json` — slug `mobichat`, `http.serve`, `ui.modify`, `scripts: ["handoff.js"]`
- `mobichat/src/plugin.js` — empty `definePlugin`
- `mobichat/public/index.html` — column layout, video frame, chat frame
- `mobichat/public/watch.js` — viewport height and keyboard shrink
- `mobichat/assets/handoff.js` — narrow-viewport Chat button opens `/plugins/mobichat/`

Left on Owncast: the player, offline state, name registration, emotes, moderation, and the desktop column. Admin custom CSS still overrides plugin CSS on the main page. The stacked page is ours, so its frame sizes are ours.

## Sources

- [Plugins](https://owncast.online/docs/plugins/)
- [Plugin configuration](https://owncast.online/docs/configuration/plugins)
- [Contributing web UI](https://owncast.online/docs/plugins/ui/)
- [Embed video and chat](https://owncast.online/docs/embed/)
- [JavaScript SDK](https://owncast.online/docs/plugins/sdks/javascript/)
- [Native WebAssembly](https://owncast.online/docs/plugins/sdks/native-wasm/)
- [`@owncast/plugin-sdk` on npm](https://www.npmjs.com/package/@owncast/plugin-sdk)
- [`owncast-plugin-py` on PyPI](https://pypi.org/project/owncast-plugin-py/)
- [Content.tsx on develop](https://github.com/owncast/owncast/blob/develop/web/components/ui/Content/Content.tsx) — 768px split and `ChatModal`
- [MobileContent.tsx on develop](https://github.com/owncast/owncast/blob/develop/web/components/ui/Content/MobileContent.tsx) — tabs, no inline chat
- [Issue #3931](https://github.com/owncast/owncast/issues/3931) — watch and chat on mobile
- [owncast-chat-tools](https://github.com/cameronurnes/owncast-chat-tools)
- [owncast-chat-commands-plugin](https://github.com/teklynk/owncast-chat-commands-plugin)

Checked against the embed doc and `develop` as of 18 Nov 2026. The plugin API is marked evolving, so the manifest fields should be re-read when the package is scaffolded.
