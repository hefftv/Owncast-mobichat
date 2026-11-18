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
  First-boot admin password is printed in the container logs.

RTMP ingest (OBS, etc.): `rtmp://localhost:1935/live` — stream key is in Admin → Configuration.

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
