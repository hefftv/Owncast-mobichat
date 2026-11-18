// Build mobichat.ocpkg without the SDK's Windows-missing host binary check.
// Prefer Python zipfile when available (Owncast/Go-friendly), else JSZip.
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const slug = "mobichat";
const outFile = path.resolve(`${slug}.ocpkg`);
const staging = path.resolve(".ocpkg-staging");

function rimraf(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function addTree(srcDir, destDir) {
  for (const name of fs.readdirSync(srcDir)) {
    const from = path.join(srcDir, name);
    const to = path.join(destDir, name);
    if (fs.statSync(from).isDirectory()) addTree(from, to);
    else copyFile(from, to);
  }
}

rimraf(staging);
fs.mkdirSync(staging, { recursive: true });
copyFile("plugin.manifest.json", path.join(staging, "plugin.manifest.json"));
copyFile(`${slug}.js`, path.join(staging, "plugin.js"));
copyFile("INSTRUCTIONS.md", path.join(staging, "INSTRUCTIONS.md"));
if (fs.existsSync("icon.png")) {
  copyFile("icon.png", path.join(staging, "icon.png"));
}
addTree("public", path.join(staging, "public"));
addTree("assets", path.join(staging, "assets"));

fs.rmSync(outFile, { force: true });

const py = `
import pathlib, zipfile
root = pathlib.Path(r"${staging.replace(/\\/g, "\\\\")}")
out = pathlib.Path(r"${outFile.replace(/\\/g, "\\\\")}")
with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED) as z:
    for path in sorted(root.rglob("*")):
        if path.is_file():
            z.write(path, path.relative_to(root).as_posix())
print("packaged", out.name, out.stat().st_size, "bytes")
`;

function runPython(code) {
  const attempts = [
    ["py", ["-3", "-c", code]],
    ["python3", ["-c", code]],
    ["python", ["-c", code]],
  ];
  for (const [bin, args] of attempts) {
    const result = spawnSync(bin, args, { encoding: "utf8" });
    if (result.error && result.error.code === "ENOENT") continue;
    if (result.status === 0) return result;
  }
  return null;
}

const pyResult = runPython(py);
if (pyResult) {
  process.stdout.write(pyResult.stdout || "");
  rimraf(staging);
  process.exit(0);
}

// Fallback: JSZip
const JSZip = require("jszip");
(async () => {
  const zip = new JSZip();
  function walk(dir, prefix) {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const rel = (prefix ? prefix + "/" : "") + name;
      if (fs.statSync(full).isDirectory()) walk(full, rel);
      else zip.file(rel.split(path.sep).join("/"), fs.readFileSync(full));
    }
  }
  walk(staging, "");
  const buf = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
    platform: "UNIX",
  });
  fs.writeFileSync(outFile, buf);
  console.log("packaged " + path.basename(outFile) + " (" + buf.length + " bytes, jszip fallback)");
  rimraf(staging);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
