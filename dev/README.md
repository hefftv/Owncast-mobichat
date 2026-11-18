# Local Owncast (Podman)

Runs Owncast 0.3.0 so you can install and try `mobichat` in a real viewer. Container data stays in `dev/owncast/` and is gitignored.

## Start / stop

From the repo root (Podman already required; no other installs):

```powershell
podman compose -f dev/compose.yaml up -d
podman compose -f dev/compose.yaml logs -f owncast
podman compose -f dev/compose.yaml down
```

- Viewer: http://localhost:8080/
- Admin: http://localhost:8080/admin  
  Fresh installs use admin password `abc123` (change it under Server Setup).

RTMP ingest (OBS, etc.): `rtmp://localhost:1935/live` — default stream key is `abc123`.

## Fake a live stream (for chat testing)

Owncast only enables chat while a stream is online. You do not need a camera — push a looping test pattern with ffmpeg:

```powershell
.\dev\start-dummy-stream.ps1
# stop later:
.\dev\start-dummy-stream.ps1 -Stop
```

Then open http://localhost:8080/ — the server should show as live and chat should be available.

## Install mobichat

1. Build the package (needs Node 18+ and npm once):

   ```powershell
   cd mobichat
   npm install
   npm test
   npm run package
   ```

2. Copy `mobichat/mobichat.ocpkg` into `dev/owncast/data/plugins/`.
3. In Admin → Plugins, refresh if needed, approve permissions, enable it.
4. Open the viewer on a phone-width window and tap **Chat**, or open http://localhost:8080/plugins/mobichat/ directly.

Chat only works while a stream is live.
