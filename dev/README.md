# Local Owncast (Podman)

Optional harness for trying `mobichat` against Owncast 0.3.0. **Not required to build or publish the plugin.** Container data stays in `dev/owncast/` and is gitignored — never commit or push that directory.

- Viewer: http://localhost:8080/
- Admin: http://localhost:8080/admin — fresh installs use password `abc123`
- Plugin page: http://localhost:8080/plugins/mobichat/

Owncast only hosts plugin HTTP under `/plugins/<slug>/`. This harness does not add a reverse proxy.

## Start / stop

```powershell
podman compose -f dev/compose.yaml up -d
podman compose -f dev/compose.yaml logs -f owncast
podman compose -f dev/compose.yaml down
```

If the Podman machine was stopped: `podman machine start`.

RTMP ingest: `rtmp://localhost:1935/live` — default stream key `abc123`.

## Fake a live stream (for chat testing)

```powershell
.\dev\start-dummy-stream.ps1
.\dev\start-dummy-stream.ps1 -Stop
```

## Install mobichat

```powershell
cd mobichat
npm install
npm run build
node make-ocpkg.js
Copy-Item .\mobichat.ocpkg ..\dev\owncast\data\plugins\
curl.exe -s -u admin:abc123 -X POST http://127.0.0.1:8080/api/admin/plugins/mobichat/enable
```

Then open a phone-width window on http://localhost:8080/ and tap **Chat**, or open http://localhost:8080/plugins/mobichat/ directly.
