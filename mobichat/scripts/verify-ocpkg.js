// Verify mobichat.ocpkg matches Owncast packaging expectations before release.
// Exact allowlist: no docs/, examples/, skills, node_modules, or other repo bloat.
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const pkg = path.resolve(__dirname, "..", "mobichat.ocpkg");
const manifestPath = path.resolve(__dirname, "..", "plugin.manifest.json");

if (!fs.existsSync(pkg)) {
  console.error("missing mobichat.ocpkg — run npm run package or package:win first");
  process.exit(1);
}

const expected = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const allowed = [
  "plugin.manifest.json",
  "plugin.js",
  "INSTRUCTIONS.md",
  "icon.png",
  "assets/handoff.js",
  "assets/chat.css",
  "public/index.html",
  "public/watch.css",
  "public/watch.js",
];

const py = `
import json, sys, zipfile
pkg = r"""${pkg.replace(/\\/g, "\\\\")}"""
allowed = set(${JSON.stringify(allowed)})
with zipfile.ZipFile(pkg) as z:
  names = {n for n in z.namelist() if not n.endswith("/")}
  missing = sorted(allowed - names)
  extra = sorted(names - allowed)
  if missing:
    print("missing entries:", ", ".join(missing))
    sys.exit(1)
  if extra:
    print("unexpected bloat entries:", ", ".join(extra))
    sys.exit(1)
  if z.testzip() is not None:
    print("corrupt zip member:", z.testzip())
    sys.exit(1)
  manifest = json.loads(z.read("plugin.manifest.json"))
print(json.dumps({"ok": True, "bytes": __import__("os").path.getsize(pkg), "version": manifest.get("version"), "slug": manifest.get("slug"), "files": len(names)}))
print("MANIFEST", json.dumps(manifest, sort_keys=True))
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
  return { status: 1, stderr: "python3/python not found\n" };
}

const result = runPython(py);
if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout || "verify failed\n");
  process.exit(result.status || 1);
}

const lines = (result.stdout || "").trim().split(/\r?\n/);
const summary = JSON.parse(lines[0]);
const packaged = JSON.parse(lines[1].replace(/^MANIFEST\s+/, ""));

if (packaged.version !== expected.version) {
  console.error(
    `version mismatch: package ${packaged.version} vs source ${expected.version}`,
  );
  process.exit(1);
}
if (packaged.slug !== expected.slug) {
  console.error(`slug mismatch: package ${packaged.slug} vs source ${expected.slug}`);
  process.exit(1);
}

console.log(
  `verified ${path.basename(pkg)} v${summary.version} (${summary.bytes} bytes, ${summary.files} entries)`,
);
