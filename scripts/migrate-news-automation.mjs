import fs from "node:fs";
import postgres from "postgres";

const cleanUrl = (value) => value?.trim().replace(/^(['"])(.*)\1$/, "$2") || undefined;
const url = [process.env.NEWS_DATABASE_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL].map(cleanUrl).find(Boolean);
if (!url) throw new Error("Set NEWS_DATABASE_URL, POSTGRES_URL or DATABASE_URL before applying the News migration.");
const sql = postgres(url, { prepare: false, max: 1 });
try {
  const migration = fs.readFileSync("database/migrations/20260814_news_automation.sql", "utf8");
  const sources = fs.readFileSync("database/migrations/20260820_news_source_catalog.sql", "utf8");
  await sql.unsafe(migration);
  await sql.unsafe(sources);
  console.log("News automation and versioned source-catalog migrations applied.");
} finally { await sql.end({ timeout: 5 }); }
