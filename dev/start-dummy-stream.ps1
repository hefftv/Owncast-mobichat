# Push a looping test pattern into the local Owncast RTMP ingest.
# Requires ffmpeg on PATH (or C:\ffmpeg\bin\ffmpeg.exe). Owncast must be up.
#
#   .\dev\start-dummy-stream.ps1
#   .\dev\start-dummy-stream.ps1 -Stop

param(
  [switch]$Stop,
  [string]$RtmpUrl = "rtmp://127.0.0.1:1935/live/abc123"
)

$ErrorActionPreference = "Stop"
$stateDir = Join-Path $PSScriptRoot "owncast"
$pidFile = Join-Path $stateDir "dummy-stream.pid"
$outLog = Join-Path $stateDir "dummy-stream.out.log"
$errLog = Join-Path $stateDir "dummy-stream.err.log"

function Get-FfmpegPath {
  $cmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  if (Test-Path "C:\ffmpeg\bin\ffmpeg.exe") { return "C:\ffmpeg\bin\ffmpeg.exe" }
  return $null
}

function Stop-DummyStream {
  if (Test-Path $pidFile) {
    $procId = [int](Get-Content $pidFile -Raw).Trim()
    if ($procId -gt 0) {
      Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
      Write-Host "Stopped dummy stream (pid $procId)."
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
  }

  Get-CimInstance Win32_Process -Filter "Name = 'ffmpeg.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like "*1935/live*" } |
    ForEach-Object {
      Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
      Write-Host "Stopped ffmpeg pid $($_.ProcessId)."
    }
}

if ($Stop) {
  Stop-DummyStream
  exit 0
}

$ffmpeg = Get-FfmpegPath
if (-not $ffmpeg) {
  Write-Error "ffmpeg not found. Install ffmpeg or add it to PATH."
}

New-Item -ItemType Directory -Force -Path $stateDir | Out-Null
Stop-DummyStream

# Color bars + tone. -re paces realtime so Owncast stays online.
$argLine = @(
  "-hide_banner", "-loglevel", "info", "-re",
  "-f", "lavfi", "-i", "testsrc=size=1280x720:rate=30",
  "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=44100",
  "-c:v", "libx264", "-preset", "veryfast", "-tune", "zerolatency",
  "-pix_fmt", "yuv420p", "-g", "60", "-b:v", "1200k",
  "-c:a", "aac", "-b:a", "128k", "-shortest",
  "-f", "flv", $RtmpUrl
) -join " "

$proc = Start-Process -FilePath $ffmpeg -ArgumentList $argLine `
  -RedirectStandardOutput $outLog -RedirectStandardError $errLog `
  -PassThru -WindowStyle Hidden

Set-Content -Path $pidFile -Value $proc.Id -NoNewline
Write-Host "Dummy stream started (pid $($proc.Id)) -> $RtmpUrl"
Write-Host "Stop with: .\dev\start-dummy-stream.ps1 -Stop"
