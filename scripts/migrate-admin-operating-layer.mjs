import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const cleanUrl = (value) => value?.trim().replace(/^(['"])(.*)\1$/, "$2") || undefined;
const url = [process.env.ADMIN_DATABASE_URL, process.env.NEWS_DATABASE_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL].map(cleanUrl).find(Boolean);
if (!url) throw new Error("Set ADMIN_DATABASE_URL, NEWS_DATABASE_URL, POSTGRES_URL or DATABASE_URL before applying migrations.");

const migrations = [
  "20260814_admin_operating_layer.sql",
  "20260823_admin_analytics_quality.sql",
];
const sql = postgres(url, { prepare: false, max: 1 });
try {
  for (const migration of migrations) {
    await sql.unsafe(fs.readFileSync(path.join("database", "migrations", migration), "utf8"));
    console.log("Applied ".concat(migration));
  }
} finally {
  await sql.end({ timeout: 5 });
}
