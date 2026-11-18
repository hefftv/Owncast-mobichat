# Changelog

All notable releases of the `mobichat` Owncast plugin.

## [0.1.2] — 2026-11-18

- Fix Safari mobile layout so the stream stays on-screen (fixed visual-viewport shell; no translateY offset)
- Stage sizing uses container width + `aspect-ratio` instead of `100vw`

## [0.1.1] — 2026-11-18

- Keep ChatClient secrets (ids, IPs, user-agents) off the public `/api/users` response
- Lean `.ocpkg` allowlist check so docs/examples/skills never ship in the package
- Repo now vendors plugin-sdk author docs + examples (not packaged)

## [0.1.0] — 2026-11-18

First public release candidate for the Owncast plugin catalog.

- Stacked mobile watch page at `/plugins/mobichat/` (video on top, chat open underneath)
- Handoff from Owncast's mobile Chat button (follows Owncast mobile UI, not a separate width check)
- Who's-here list with moderator badges (API + SSE)
- HTTPS image/GIF link previews inside the chat embed
- Denser chat spacing via injected styles
- Full-bleed 16:9 stage sizing for phones and tablets
- Catalog assets: `icon.png`, `INSTRUCTIONS.md`, SemVer `0.1.0`

Requires Owncast **0.3.0+**.
