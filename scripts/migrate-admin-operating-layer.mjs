import fs from "node:fs";
import postgres from "postgres";

const cleanUrl = (value) => value?.trim().replace(/^(['"])(.*)\1$/, "$2") || undefined;
const url = [process.env.ADMIN_DATABASE_URL, process.env.NEWS_DATABASE_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL].map(cleanUrl).find(Boolean);
if (!url) throw new Error("Set ADMIN_DATABASE_URL, NEWS_DATABASE_URL, POSTGRES_URL or DATABASE_URL before applying the admin operating-layer migration.");

const sql = postgres(url, { prepare: false, max: 1 });
try {
  await sql.unsafe(fs.readFileSync("database/migrations/20260814_admin_operating_layer.sql", "utf8"));
  console.log("Admin operating-layer migration applied.");
} finally {
  await sql.end({ timeout: 5 });
}
