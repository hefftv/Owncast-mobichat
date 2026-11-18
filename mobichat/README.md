# Mobile Chat

An Owncast plugin scaffolded against [`create-owncast-plugin`](https://github.com/owncast/plugin-sdk) conventions. The slug is `mobichat`, and everything below uses it as the build artifact filename and the URL prefix Owncast routes through your plugin.

When Owncast is in its mobile layout, the floating **Chat** button opens `/plugins/mobichat/`: `/embed/video` fills the width above `/embed/chat/readwrite`, with a who's-here list adapted from [owncast-chat-tools](https://github.com/cameronurnes/owncast-chat-tools) (MIT).

Requires Owncast **0.3.0+**.

## Develop

```sh
npm install          # one-time, fetches the prebuilt test/serve host binaries
npm run build        # bundle src/plugin.js into mobichat.js
npm test             # build, then run scenarios from __tests__/
npm run serve        # build, then host the plugin on http://localhost:8080
npm run package      # build, then bundle into mobichat.ocpkg for distribution
```

Plugins ship as source and run on the JavaScript engine the Owncast host embeds,
so there's no wasm compile step and no toolchain to install. `npm install` only
fetches the host binaries `test`/`serve` use, and caches them after the first run.

On Windows, if the SDK host binary is unavailable:

```sh
npm run package:win      # build + make-ocpkg.js
npm run release:check  # package:win + verify the .ocpkg
```

Optional in-app testing: Podman harness in [`../dev/`](../dev/). Page: http://localhost:8080/plugins/mobichat/

## Ship

`npm run package` (or `npm run package:win`) produces `mobichat.ocpkg`. Install it through the Owncast admin: open **Plugins**, click **Upload plugin**, and pick the file. (You can also copy it directly to the server's `data/plugins/` directory if the admin UI isn't an option.) Toggle **Enabled** to load it after reviewing permissions.

Catalog listing and GitHub release steps: [`../docs/publishing.md`](../docs/publishing.md).

## Files

- `src/plugin.js` — handler code (who's-here API + SSE). Edit this.
- `plugin.manifest.json` — display name, slug, version, permissions, `scripts` / `styles` / `actions`
- `__tests__/plugin.test.js` — scenario tests
- `public/` — web-served at `/plugins/mobichat/` (stacked watch page)
- `assets/` — host-inlined for `scripts` / `styles` (`handoff.js`, `chat.css`); not URL-reachable
- `icon.png` — bundled into the `.ocpkg` for the admin plugin list
- `INSTRUCTIONS.md` — admin Instructions tab (bundled into the `.ocpkg`)
- `AGENTS.md` + `.agents/skills/` — AI agent notes and the JS plugin skill
- `make-ocpkg.js` / `scripts/verify-ocpkg.js` — Windows packaging helpers (not part of the SDK scaffold)

## Learn more

The full author guide covers every event handler, host API, permission, and testing pattern:

**[→ Owncast Plugin Author Guide](https://github.com/owncast/plugin-sdk/blob/main/docs/PLUGIN_AUTHOR_GUIDE.md)**

Wire shapes: **[→ Wire Protocol](https://github.com/owncast/plugin-sdk/blob/main/docs/WIRE_PROTOCOL.md)**

TypeScript declarations in `@owncast/plugin-sdk` give editor autocomplete on every API.
