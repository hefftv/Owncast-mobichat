# Mobile Chat

An Owncast plugin. Slug `mobichat`. On a phone, the Chat button opens `/plugins/mobichat/`, where `/embed/video` sits on top of `/embed/chat/readwrite`, with a who's-here list adapted from [owncast-chat-tools](https://github.com/cameronurnes/owncast-chat-tools) (MIT).

Owncast 0.3.0 or newer. Built with [`@owncast/plugin-sdk`](https://www.npmjs.com/package/@owncast/plugin-sdk). Follow the [Plugin Author Guide](https://github.com/owncast/plugin-sdk/blob/main/docs/PLUGIN_AUTHOR_GUIDE.md) when changing handlers or permissions.

## Develop

```sh
npm install
npm test
npm run serve
npm run package
```

`npm run serve` hosts the plugin at `http://localhost:8080/plugins/mobichat/`. The video and chat iframes load from the same origin, so they show Owncast's embeds only when this page is served by Owncast itself.

`npm run package` writes `mobichat.ocpkg`. Upload it under **Admin → Plugins**, approve the permissions listed in `INSTRUCTIONS.md`, and enable it.

## Files

- `public/index.html` — stacked watch page
- `public/watch.css`, `public/watch.js` — layout, who's-here UI, image previews inside the chat iframe
- `assets/handoff.js` — narrow-screen Chat button opens this page
- `assets/chat.css` — denser chat message spacing (also applies on embeds)
- `src/plugin.js` — who's-here API + SSE broadcast
- `plugin.manifest.json` — permissions, scripts, styles, action button

## Security notes

Permissions match what the code calls. `/api/users` returns display names and a moderator flag only. No GIPHY keys, uploads, or chat tokens are served by this plugin. See `INSTRUCTIONS.md` for the full exposure table.
