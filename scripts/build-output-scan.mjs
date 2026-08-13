import fs from "node:fs";
import path from "node:path";

const roots = [".next/server/app", ".next/static", "public"];
const forbidden = [/cowinmagnet/iu, /cowinmagnet\.co\.za/iu, /cowinmagnet\.cl/iu];
const textExtensions = new Set([".html", ".js", ".css", ".json", ".xml", ".txt", ".map", ".svg"]);
const failures = [];
for (const root of roots) walk(root);
if (failures.length) {
  console.error(`Build-output isolation scan failed:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log("Build-output isolation scan passed: zero prohibited public references.");

function walk(target) {
  if (!fs.existsSync(target)) return;
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const file = path.join(target, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (textExtensions.has(path.extname(entry.name).toLowerCase())) {
      const content = fs.readFileSync(file, "utf8");
      for (const rule of forbidden) if (rule.test(content)) failures.push(file);
    }
  }
}
