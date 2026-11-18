# AGENTS.md

Guidance for AI coding agents working in **Owncast-mobichat**.

## Plugin layout (SDK best practice)

The installable plugin lives in [`mobichat/`](mobichat/) and follows the
[`create-owncast-plugin`](https://github.com/owncast/plugin-sdk/tree/main/sdks/js/create-owncast-plugin/template)
JavaScript scaffold:

```
mobichat/
├── .agents/skills/create-owncast-plugin-js/   # bundled agent skill
├── AGENTS.md
├── INSTRUCTIONS.md
├── README.md
├── __tests__/plugin.test.js
├── package.json
├── plugin.manifest.json
├── src/plugin.js
├── icon.png                 # optional (catalog / admin)
├── public/                  # optional — served at /plugins/mobichat/
└── assets/                  # optional — inlined scripts/styles
```

Authoritative plugin notes: [`mobichat/AGENTS.md`](mobichat/AGENTS.md).  
JS playbook: [`mobichat/.agents/skills/create-owncast-plugin-js/SKILL.md`](mobichat/.agents/skills/create-owncast-plugin-js/SKILL.md).

## Repo-level skills

Copies of Owncast’s skills also live under [`.agents/skills/`](.agents/skills/)
and [`.cursor/skills/`](.cursor/skills/) so agents can discover them from the
monorepo root (router + JS + Python). Prefer the copies under `mobichat/` when
editing this plugin.

## SDK docs and examples (vendored)

Pinned from Owncast plugin-sdk **v0.11.0** — see [`docs/SDK_VENDOR.md`](docs/SDK_VENDOR.md).

- [Plugin Author Guide](docs/PLUGIN_AUTHOR_GUIDE.md)
- [Wire Protocol](docs/WIRE_PROTOCOL.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Examples](examples/) (`examples/js/`, `examples/python/`)
- [Packaging & publishing (Owncast site)](https://owncast.online/docs/plugins/packaging/)

`host-runtime/` and toolchain `tools/` binaries are **not** vendored. Host
test/serve binaries come from `@owncast/plugin-sdk` postinstall.

## Quick checks

```sh
cd mobichat
npm install
npm run release:check
```

Do not commit `dev/owncast/`, `mobichat/node_modules/`, `mobichat/*.ocpkg`,
`mobichat/mobichat.js`, `mobichat/.owncast-build/`, `host-runtime/`, or
`tools/` binary caches.
