import fs from "node:fs";

const tag = process.argv[2];
if (!tag) {
  console.error("Expected a semver tag like 0.1.0.");
  process.exit(1);
}

if (tag.startsWith("v")) {
  console.error("Obsidian releases must be tagged without a leading v.");
  process.exit(1);
}

const expected = tag;
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const versions = JSON.parse(fs.readFileSync("versions.json", "utf8"));

const errors = [];
if (manifest.version !== expected) errors.push(`manifest.json version is ${manifest.version}, expected ${expected}`);
if (pkg.version !== expected) errors.push(`package.json version is ${pkg.version}, expected ${expected}`);
if (!versions[expected]) errors.push(`versions.json is missing ${expected}`);

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Version ${expected} is ready to release.`);
