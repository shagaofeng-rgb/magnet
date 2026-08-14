import fs from "node:fs";
import postgres from "postgres";

const cleanUrl = (value) => value?.trim().replace(/^(['"])(.*)\1$/, "$2") || undefined;
const url = [process.env.NEWS_DATABASE_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL].map(cleanUrl).find(Boolean);
if (!url) throw new Error("Set NEWS_DATABASE_URL, POSTGRES_URL or DATABASE_URL before bootstrapping the News store.");
const sql = postgres(url, { prepare: false, max: 1 });
try {
  const tables = await sql`select to_regclass('public.sites') as sites`;
  if (!tables[0]?.sites) await sql.unsafe(fs.readFileSync("database/admin-schema.sql", "utf8"));
  else await sql.unsafe(fs.readFileSync("database/migrations/20260814_news_automation.sql", "utf8"));
  await sql`
    insert into sites (id, name, origin, timezone, locales)
    values ('bzmagnet', 'BZMAGNET', 'https://bzmagnet.com', 'Asia/Shanghai', ${sql.json(["en", "es", "pt", "ar", "ru"])})
    on conflict (id) do update set name = excluded.name, origin = excluded.origin, timezone = excluded.timezone, locales = excluded.locales
  `;
  console.log("BZMAGNET News store is ready.");
} finally { await sql.end({ timeout: 5 }); }
