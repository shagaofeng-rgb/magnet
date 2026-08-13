import fs from "node:fs";
import path from "node:path";

const roots = ["app", "components", "lib"];
const usage = new Map();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx|ts|css)$/.test(entry.name)) {
      const source = fs.readFileSync(full, "utf8");
      const visibleSource = source.replace(/export async function generateMetadata[\s\S]*?\n}\n/m, "");
      for (const match of visibleSource.matchAll(/\/media\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|webp|avif)/g)) {
        const files = usage.get(match[0]) || [];
        if (!files.includes(full)) files.push(full);
        usage.set(match[0], files);
      }
    }
  }
}

for (const root of roots) walk(root);
const missing = [...usage.keys()].filter((asset) => !fs.existsSync(path.join("public", asset)));
const repeats = [...usage].filter(([, files]) => files.length > 1);
if (missing.length || repeats.length) {
  if (missing.length) console.error(`Missing image files:\n${missing.join("\n")}`);
  if (repeats.length) console.error(repeats.map(([asset, files]) => `${asset}: ${files.join(", ")}`).join("\n"));
  process.exit(1);
}
console.log(`Unique visible image references passed: ${usage.size} assets, no repeated page references.`);
