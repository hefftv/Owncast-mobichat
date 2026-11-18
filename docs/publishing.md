# Publishing `mobichat`

Follows [Owncast: Packaging & publishing plugins](https://owncast.online/docs/plugins/packaging/).

## Version identity

| Field | Value | Notes |
| --- | --- | --- |
| `slug` | `mobichat` | Permanent catalog key. Do not change after first publish. |
| `version` | SemVer in `mobichat/plugin.manifest.json` | Bump for every catalog submit. |
| `category` | `overlays` | Canonical registry browse category. |
| Artifact | `mobichat.ocpkg` | Single file admins install. |

Repo tag convention: `v0.1.0` matches manifest `0.1.0`.

## Pre-release checklist

From `mobichat/`:

```sh
npm install
npm run release:check   # test + package + verify-ocpkg
```

On Linux/macOS you can use `npm run package` instead of `package:win` if the SDK host binary is available.

Confirm before tagging:

- [ ] `plugin.manifest.json` `version` matches the intended release
- [ ] `description` is one clear sentence for the catalog card
- [ ] Permissions are only what the code uses
- [ ] `icon.png` and `INSTRUCTIONS.md` are in the `.ocpkg`
- [ ] `npm test` is green
- [ ] Screenshots in `docs/screenshots/` are current (catalog preview ≤ 5 MB)

## GitHub release

1. Commit the version bump + changelog on the default branch.
2. Tag and push:

```sh
git tag -a v0.1.0 -m "mobichat 0.1.0"
git push origin v0.1.0
```

3. The [release workflow](../.github/workflows/release.yml) builds `mobichat.ocpkg` and attaches it to a GitHub Release named `v0.1.0`.
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
