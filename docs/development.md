# Development notes

Owncast plugin, slug `mobichat`. UI focused.

Plugin layout follows the SDK JS scaffold (`create-owncast-plugin` template). Agent skills: [mobichat/AGENTS.md](../mobichat/AGENTS.md), [mobichat/.agents/skills/](../mobichat/.agents/skills/), [root AGENTS.md](../AGENTS.md).

Author guide: [`PLUGIN_AUTHOR_GUIDE.md`](PLUGIN_AUTHOR_GUIDE.md)  
Wire protocol: [`WIRE_PROTOCOL.md`](WIRE_PROTOCOL.md)  
Architecture: [`ARCHITECTURE.md`](ARCHITECTURE.md)  
SDK examples: [`../examples/`](../examples/)  
Vendor pin: [`SDK_VENDOR.md`](SDK_VENDOR.md)

## Rules

- Permissions in `plugin.manifest.json` must match every handler and `owncast.*` call. No more, no less.
- Do not add `chat.send`, filters, uploads, `network.fetch`, or a bot identity unless the product goal changes.
- `/api/users` may return only `{ name, mod }`. Never return user ids, IPs, tokens, or user-agents.
- `assets/handoff.js` is an IIFE. No-op inside iframes, on `/admin`, and on `/plugins/mobichat`. It follows Owncast's mobile Chat button (not a separate width check). Public URL is `/plugins/mobichat/` — Owncast does not let plugins register other path prefixes.
- Plugin scripts do **not** run inside `/embed/*`. Parent-page logic that touches the chat DOM must go through the same-origin iframe `contentDocument`, or use `styles` (which do reach embeds).
- Do not put secrets in `public/` or in viewer-injected scripts.
- After code changes: `npm test` when the SDK host binary is available, then `npm run release:check` before tagging (Windows uses `package:win`).
- Release / catalog steps: [`publishing.md`](publishing.md).

## Who's-here provenance

`currentUsers()` / SSE broadcast are adapted from cameronurnes/owncast-chat-tools (MIT). Keep that attribution in `INSTRUCTIONS.md` when the list logic changes.
