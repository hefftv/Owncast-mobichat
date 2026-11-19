# Development notes

Owncast plugin, slug `mobichat`. UI focused.

Plugin layout follows the SDK JS scaffold (`create-owncast-plugin` template). Agent skills: [mobichat/AGENTS.md](../mobichat/AGENTS.md), [mobichat/.agents/skills/](../mobichat/.agents/skills/), [root AGENTS.md](../AGENTS.md).

Author guide: [`PLUGIN_AUTHOR_GUIDE.md`](PLUGIN_AUTHOR_GUIDE.md)  
Wire protocol: [`WIRE_PROTOCOL.md`](WIRE_PROTOCOL.md)  
Architecture: [`ARCHITECTURE.md`](ARCHITECTURE.md)  
SDK examples: [`../examples/`](../examples/)  
Vendor pin: [`SDK_VENDOR.md`](SDK_VENDOR.md)

## Rules

Aligned with vendored [`PLUGIN_AUTHOR_GUIDE.md`](PLUGIN_AUTHOR_GUIDE.md) and [Owncast permissions](https://owncast.online/docs/plugins/permissions) (Owncast **0.3.0+**):

- Permissions in `plugin.manifest.json` must match every handler and `owncast.*` call. No more, no less (least privilege).
- Do not add `chat.send`, filters, uploads, `network.fetch`, or a bot identity unless the product goal changes.
- `/api/users` may return only `{ name, mod }`. Never return user ids, IPs, tokens, or user-agents.
- `assets/` is host-inlined (`scripts` / `styles`); `public/` is web-served at `/plugins/mobichat/` (`http.serve`). Do not put secrets in either.
- `assets/handoff.js` is an IIFE. No-op inside iframes, on `/admin`, and on `/plugins/mobichat`. It follows Owncast's mobile Chat button (not a separate width check). Owncast does not let plugins register other path prefixes.
- Plugin scripts do **not** run inside `/embed/*`. Parent-page logic that touches the chat DOM must go through the same-origin iframe `contentDocument`, or use `styles` (which do reach embeds).
- After code changes: `npm run test:layout`; `npm test` when the SDK host binary is available; `npm run release:check` before tagging (Windows uses `package:win`).
- Release / catalog steps: [`publishing.md`](publishing.md) · upstream [Packaging & publishing](https://owncast.online/docs/plugins/packaging/).

**Host-serve note (SDK guide):** the old standalone `owncast-plugin-serve` **v0.4.0** binary served static files from `assets/` instead of `public/`. Owncast **0.3.0+** and current `owncast-plugin serve` use `public/` — that is what mobichat targets.

## Who's-here provenance

`currentUsers()` / SSE broadcast are adapted from cameronurnes/owncast-chat-tools (MIT). The watch page does not render the list; keep the attribution in `src/plugin.js` (and restore it in `INSTRUCTIONS.md` if the UI returns).
