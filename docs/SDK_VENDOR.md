# Vendored Owncast plugin-sdk material

Pinned from [owncast/plugin-sdk](https://github.com/owncast/plugin-sdk) tag **`v0.11.0`** (matches `@owncast/plugin-sdk@^0.11.0` in `mobichat/package.json`).

## What is vendored here

| Path | Purpose |
| --- | --- |
| `docs/PLUGIN_AUTHOR_GUIDE.md` | Exhaustive author reference |
| `docs/WIRE_PROTOCOL.md` | Host ↔ plugin wire protocol |
| `docs/ARCHITECTURE.md` | SDK architecture overview |
| `examples/js/` | JavaScript example plugins |
| `examples/python/` | Python example plugins |

Mobichat-specific docs (`publishing.md`, `mobile-chat.md`, `development.md`, `screenshots/`) are **not** from the SDK.

## What is intentionally not vendored

- **`host-runtime/`** — Go host that loads plugins. Lives upstream; Owncast embeds the production runtime.
- **`tools/`** toolchain binaries (extism, binaryen, etc.) — maintainer-only, fetched when building engines upstream.
- Host **test/serve** binaries — downloaded by `@owncast/plugin-sdk` postinstall into `node_modules/@owncast/plugin-sdk/bin/.cache` (not committed).

Do not copy any of the above into `mobichat.ocpkg`. The package stays plugin source + assets only.

## Re-sync when bumping the SDK

1. Bump `@owncast/plugin-sdk` in `mobichat/package.json` and run `npm install`.
2. Sparse-checkout the matching tag from `owncast/plugin-sdk` (`docs/` + `examples/` only).
3. Replace the three guides under `docs/` and the `examples/` tree.
4. Update the pin tag in this file.
