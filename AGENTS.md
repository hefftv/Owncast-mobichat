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

## Upstream docs

- [Plugin Author Guide](https://github.com/owncast/plugin-sdk/blob/main/docs/PLUGIN_AUTHOR_GUIDE.md)
- [Wire Protocol](https://github.com/owncast/plugin-sdk/blob/main/docs/WIRE_PROTOCOL.md)
- [Packaging & publishing](https://owncast.online/docs/plugins/packaging/)

## Quick checks

```sh
cd mobichat
npm install
npm run release:check
```

Do not commit `dev/owncast/`, `mobichat/node_modules/`, `mobichat/*.ocpkg`,
`mobichat/mobichat.js`, or `mobichat/.owncast-build/`.
