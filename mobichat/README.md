# Mobile Chat

Owncast plugin (`mobichat`). When Owncast is in its mobile layout, the floating **Chat** button opens `/plugins/mobichat/`: `/embed/video` fills the width above `/embed/chat/readwrite`, with a who's-here list adapted from [owncast-chat-tools](https://github.com/cameronurnes/owncast-chat-tools) (MIT).

Owncast only hosts plugin HTTP under `/plugins/<slug>/`. This plugin cannot claim other path prefixes on the Owncast process.

Requires Owncast **0.3.0+**. Built with [`@owncast/plugin-sdk`](https://www.npmjs.com/package/@owncast/plugin-sdk). Follow the [Plugin Author Guide](https://github.com/owncast/plugin-sdk/blob/main/docs/PLUGIN_AUTHOR_GUIDE.md) when changing handlers or permissions.

Admin-facing setup and the permission table live in [`INSTRUCTIONS.md`](INSTRUCTIONS.md) (included in the package).

## Develop

```sh
npm install
npm test
npm run serve
npm run release:check   # preferred before tagging a release
```

On Windows, `release:check` uses `package:win` (`build` + `make-ocpkg.js`) because the SDK host binary is unavailable there. On Linux/macOS, `npm run package` after `npm run build` is fine.

Release tagging and catalog submit: [`../docs/publishing.md`](../docs/publishing.md).

Optional in-app testing: Podman harness in [`../dev/`](../dev/). Page: http://localhost:8080/plugins/mobichat/

## Files

| Path | Role |
| --- | --- |
| `public/index.html` | Stacked watch page |
| `public/watch.css`, `public/watch.js` | Layout, who's-here UI, image previews in the chat iframe |
| `assets/handoff.js` | Mobile Chat button → this page |
| `assets/chat.css` | Denser chat spacing (also on embeds) |
| `src/plugin.js` | Who's-here API + SSE |
| `plugin.manifest.json` | Permissions, scripts, styles, action button |

## Security

Permissions match what the code calls. `/api/users` returns display names and a moderator flag only. No GIPHY keys, uploads, or chat tokens are served by this plugin. See `INSTRUCTIONS.md` for the exposure table.
