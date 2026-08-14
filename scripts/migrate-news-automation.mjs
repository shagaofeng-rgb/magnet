import fs from "node:fs";
import postgres from "postgres";

const url = process.env.NEWS_DATABASE_URL || process.env.POSTGRES_URL;
if (!url) throw new Error("Set NEWS_DATABASE_URL or POSTGRES_URL before applying the News migration.");
const sql = postgres(url, { prepare: false, max: 1 });
try {
  const migration = fs.readFileSync("database/migrations/20260814_news_automation.sql", "utf8");
  await sql.unsafe(migration);
  console.log("News automation migration applied.");
} finally { await sql.end({ timeout: 5 }); }
