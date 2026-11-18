const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

async function main() {
  const slug = "mobichat";
  const zip = new JSZip();
  zip.file("plugin.manifest.json", fs.readFileSync("plugin.manifest.json"));
  zip.file("plugin.js", fs.readFileSync(slug + ".js"));
  zip.file("INSTRUCTIONS.md", fs.readFileSync("INSTRUCTIONS.md"));
  let n = 3;
  function addDir(dir, prefix) {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const rel = (prefix + "/" + name).split(path.sep).join("/");
      if (fs.statSync(full).isDirectory()) {
        addDir(full, prefix + "/" + name);
      } else {
        zip.file(rel, fs.readFileSync(full));
        n++;
      }
    }
  }
  addDir("public", "public");
  addDir("assets", "assets");
  const buf = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  fs.writeFileSync(slug + ".ocpkg", buf);
  console.log(
    "packaged " + slug + ".ocpkg (" + Math.round(buf.length / 1024) + " KB, " + n + " files)",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
