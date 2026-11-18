# AGENTS.md: Mobile Chat

Owncast plugin, slug `mobichat`. UI focused.

Author guide: https://github.com/owncast/plugin-sdk/blob/main/docs/PLUGIN_AUTHOR_GUIDE.md

## Rules

- Permissions in `plugin.manifest.json` must match every handler and `owncast.*` call. No more, no less.
- Do not add `chat.send`, filters, uploads, `network.fetch`, or a bot identity unless the product goal changes.
- `/api/users` may return only `{ name, mod }`. Never return user ids, IPs, tokens, or user-agents.
- `assets/handoff.js` is an IIFE. No-op inside iframes, on `/admin`, and on `/plugins/mobichat`.
- Plugin scripts do **not** run inside `/embed/*`. Parent-page logic that touches the chat DOM must go through the same-origin iframe `contentDocument`, or use `styles` (which do reach embeds).
- Do not put secrets in `public/` or in viewer-injected scripts. `assets/` is host-inlined for scripts/styles, not a place for API keys either.
- After code changes: `npm test`, then `npm run package`.

## Who's-here provenance

`currentUsers()` / SSE broadcast are adapted from cameronurnes/owncast-chat-tools (MIT). Keep that attribution in INSTRUCTIONS.md when the list logic changes.
