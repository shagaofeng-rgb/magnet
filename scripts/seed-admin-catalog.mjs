import fs from "node:fs";
import postgres from "postgres";

const SITE_ID = "bzmagnet";
const cleanUrl = (value) => value?.trim().replace(/^(['"])(.*)\1$/, "$2") || undefined;
const url = [process.env.ADMIN_DATABASE_URL, process.env.NEWS_DATABASE_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL]
  .map(cleanUrl)
  .find(Boolean);

if (!url) {
  throw new Error("Set ADMIN_DATABASE_URL, NEWS_DATABASE_URL, POSTGRES_URL or DATABASE_URL before seeding the admin catalog.");
}

const catalog = JSON.parse(fs.readFileSync("data/products.generated.json", "utf8"));
const products = catalog.products.filter((product) => product.status === "published" && product.locale?.en?.title && product.locale.en.slug);
const sql = postgres(url, { prepare: false, max: 1 });

try {
  await sql.begin(async (transaction) => {
    for (const product of products) {
      const locale = product.locale.en;
      await transaction`
        insert into catalog_records (
          id, site_id, record_type, status, locale, title, slug, payload, revision
        ) values (
          ${product.id}, ${SITE_ID}, 'product', 'published', 'en', ${locale.title}, ${locale.slug}, ${transaction.json(product)}, 1
        )
        on conflict (id) do update set
          site_id = excluded.site_id,
          record_type = excluded.record_type,
          status = excluded.status,
          locale = excluded.locale,
          title = excluded.title,
          slug = excluded.slug,
          payload = excluded.payload,
          revision = catalog_records.revision + 1,
          updated_at = now()
      `;
    }
  });
  console.log(`Seeded ${products.length} published BZMAGNET catalog records for the internal admin.`);
} finally {
  await sql.end({ timeout: 5 });
}
