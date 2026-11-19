# Publishing `mobichat`

Follows [Owncast: Packaging & publishing plugins](https://owncast.online/docs/plugins/packaging/).

## Version identity

| Field | Value | Notes |
| --- | --- | --- |
| `slug` | `mobichat` | Permanent catalog key. Do not change after first publish. |
| `version` | SemVer in `mobichat/plugin.manifest.json` | Bump for every catalog submit. |
| `category` | `overlays` | Canonical registry browse category. |
| Artifact | `mobichat.ocpkg` | Single file admins install. |

Repo tag convention: `vX.Y.Z` matches manifest `X.Y.Z`.

**Version policy (from 0.1.1 onward):** bump only the **patch** number (`0.1.X`)
and only when cutting a package release (tag + `.ocpkg`). Do not bump for
docs-only or repo-vendor commits.

Patch numbers are normal integers — after `0.1.9` the next release is
`0.1.10`, then `0.1.11`, and so on (not `0.1.90` and not a minor bump).
Tags stay `v0.1.10`, `v0.1.11`, …

## What goes in the `.ocpkg` (keep it lean)

Exactly these nine entries — nothing else:

`plugin.manifest.json`, `plugin.js`, `INSTRUCTIONS.md`, `icon.png`, `assets/*`, `public/*`

**Not packaged** (stay in git for agents/devs only): `docs/` SDK guides, `examples/`, `.agents/` skills, tests, `make-ocpkg.js`, `node_modules/`. `npm run release:check` fails if the zip contains unexpected paths.

## Pre-release checklist

From `mobichat/`:

```sh
npm install
npm run release:check   # package + verify-ocpkg (exact allowlist)
```

On Linux/macOS you can use `npm run package` instead of `package:win` if the SDK host binary is available. Prefer `npm test` on Linux CI when the host binary is present.

Confirm before tagging:

- [ ] `plugin.manifest.json` `version` matches the intended release and git tag `vX.Y.Z`
- [ ] `description` is one clear sentence for the catalog card
- [ ] Permissions are only what the code uses
- [ ] `icon.png` and `INSTRUCTIONS.md` are in the `.ocpkg`
- [ ] Verifier reports exactly 9 entries / no bloat
- [ ] Screenshots in `docs/screenshots/` are current (preview ≤ 5 MB) — use `01-stacked-live.png`

## GitHub release

1. Commit the version bump + changelog on the default branch.
2. Tag and push:

```sh
git tag -a v0.1.4 -m "mobichat 0.1.4"
git push origin v0.1.4
```

3. The [release workflow](../.github/workflows/release.yml) builds `mobichat.ocpkg` and attaches it to a GitHub Release named `v0.1.4`.
4. Or create the release manually and upload `mobichat/mobichat.ocpkg`.

## Owncast plugin catalog

Catalog API used by Owncast admins: `https://owncast.directory/api` (override with `OWNCAST_PLUGIN_REGISTRY`).

Author submit flow (website only — no CLI publish):

1. Sign in with magic link: [owncast.directory/login](https://owncast.directory/login)
2. Submit the package: [owncast.directory/plugins/submit](https://owncast.directory/plugins/submit)
3. Upload `mobichat.ocpkg`
4. Optional form fields:
   - Preview image — use `docs/screenshots/01-stacked-live.png`
   - Homepage — this repository URL
   - Browse tags — e.g. `mobile`, `chat`, `ui`
   - Summary — only if you want to override the manifest description

First submitter owns slug `mobichat`. Later updates: bump `version`, re-package, submit again.

Browse listings: [owncast.directory/plugins](https://owncast.directory/plugins)

## What operators see

In Owncast admin → Plugins → Browse: name, author, description, icon, version, preview. On install they review permissions, `INSTRUCTIONS.md`, and any chat commands (this plugin registers none).
