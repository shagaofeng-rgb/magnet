import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const args = process.argv.slice(2);
const valueAfter = (flag) => args[args.indexOf(flag) + 1];
const has = (flag) => args.includes(flag);
const input = valueAfter("--file");
const name = valueAfter("--name") || "unnamed-source-catalog";
const dryRun = has("--dry-run");
const activate = has("--activate");
const confirmReplace = has("--confirm-replace");
if (!input) throw new Error("Usage: npm run news:sources:import -- --file <raw-list.md> --name <catalog-name> [--dry-run] [--activate --confirm-replace]");
if (activate && !confirmReplace) throw new Error("Activating a source catalog changes the eligible source set. Add --confirm-replace after reviewing the draft import.");

const rawPath = path.resolve(input);
const raw = fs.readFileSync(rawPath, "utf8");
const checksum = createHash("sha256").update(raw.replace(/\r\n/g, "\n")).digest("hex");
const group = (ordinal) => ordinal <= 35 ? "magnetics-rare-earths-metallurgy" : ordinal <= 90 ? "recycling-waste-ewaste" : ordinal <= 155 ? "mining-aggregates-cement" : ordinal <= 200 ? "food-grain-agriculture" : ordinal <= 245 ? "chemicals-plastics-ceramics-glass" : ordinal <= 280 ? "bulk-handling-engineering" : "community-discovery";
const entries = raw.split(/\r?\n/).flatMap((line) => {
  const match = line.match(/^\s*(\d{1,3})\.\s+(.+?)\s*$/u);
  if (!match) return [];
  const ordinal = Number(match[1]);
  const parsed = match[2].match(/^(.+?)(?:\s+\(([^)]*)\))?$/u);
  const requestedDomain = (parsed?.[1] || match[2]).trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
  const valid = /^[a-z0-9.-]+(?:\/[a-z0-9._~:/?#[\]@!$&'()*+,;=%-]*)?$/i.test(requestedDomain) && !/\s/.test(requestedDomain);
  const sourceGroup = group(ordinal);
  return [{ id: randomUUID(), ordinal, rawEntry: line, name: (parsed?.[2] || requestedDomain).trim(), requestedDomain, sourceGroup, discoveryMethods: sourceGroup === "community-discovery" ? ["public-page"] : ["rss", "sitemap", "public-page"], tier: sourceGroup === "community-discovery" ? "discovery-only" : "C", validationStatus: valid ? "pending" : "needs_review", notes: valid ? "Imported pending low-frequency health and robots validation." : "Raw entry is retained unchanged; manual review is required before use." }];
});
if (!entries.length) throw new Error("No numbered source entries were found. Raw content is left unchanged.");
if (new Set(entries.map((entry) => entry.ordinal)).size !== entries.length) throw new Error("Duplicate source ordinals found; no import was performed.");
console.log(JSON.stringify({ name, file: rawPath, checksum, entries: entries.length, pending: entries.filter((entry) => entry.validationStatus === "pending").length, needsReview: entries.filter((entry) => entry.validationStatus === "needs_review").length, activate, dryRun }, null, 2));
if (dryRun) process.exit(0);

const cleanUrl = (value) => value?.trim().replace(/^(['"])(.*)\1$/, "$2") || undefined;
const databaseUrl = [process.env.NEWS_DATABASE_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL].map(cleanUrl).find(Boolean);
if (!databaseUrl) throw new Error("Set NEWS_DATABASE_URL, POSTGRES_URL or DATABASE_URL before importing a source catalog.");
const sql = postgres(databaseUrl, { prepare: false, max: 1 });
const versionId = randomUUID();
try {
  await sql.begin(async (transaction) => {
    const existing = await transaction`select id::text from news_source_catalog_versions where site_id = 'bzmagnet' and raw_checksum = ${checksum} limit 1`;
    if (existing.length) throw new Error("This raw source list has already been imported; create a new version only when its source content changes.");
    const prior = await transaction`select id::text from news_source_catalog_versions where site_id = 'bzmagnet' and status = 'active' limit 1`;
    await transaction`insert into news_source_catalog_versions (id, site_id, name, raw_checksum, raw_file_name, status, replaces_version_id, activated_at) values (${versionId}::uuid, 'bzmagnet', ${name}, ${checksum}, ${path.basename(rawPath)}, ${activate ? 'active' : 'draft'}, ${prior[0]?.id ?? null}::uuid, ${activate ? new Date().toISOString() : null})`;
    for (const entry of entries) await transaction`insert into news_sources (id, site_id, catalog_version_id, source_ordinal, raw_entry, name, requested_domain, source_group, industry_tags, content_languages, discovery_methods, tier, active, validation_status, notes) values (${entry.id}::uuid, 'bzmagnet', ${versionId}::uuid, ${entry.ordinal}, ${entry.rawEntry}, ${entry.name}, ${entry.requestedDomain}, ${entry.sourceGroup}, ${transaction.json([])}, ${transaction.json(['en'])}, ${transaction.json(entry.discoveryMethods)}, ${entry.tier}, false, ${entry.validationStatus}, ${entry.notes})`;
    if (activate && prior[0]?.id) await transaction`update news_source_catalog_versions set status = 'archived' where id = ${prior[0].id}::uuid`;
  });
  console.log(`Imported ${entries.length} sources as ${activate ? 'active' : 'draft'} catalog version ${versionId}.`);
} finally { await sql.end({ timeout: 5 }); }
