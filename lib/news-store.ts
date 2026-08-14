import "server-only";

import postgres from "postgres";
import type { Article } from "./editorial";
import type { CandidateStatus, NewsCandidate } from "./editorial-workflow";
import type { Locale } from "./i18n";

const cleanUrl = (value: string | undefined) => value?.trim().replace(/^(['"])(.*)\1$/, "$2") || undefined;
const url = [process.env.NEWS_DATABASE_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL].map(cleanUrl).find(Boolean);
const sql = url ? postgres(url, { prepare: false, max: 2, idle_timeout: 10, connect_timeout: 10 }) : null;

export const isNewsStoreConfigured = () => Boolean(sql);
export type NewsRun = { id: string; kind: "review" | "publish"; status: "running" | "succeeded" | "failed" | "skipped"; startedAt: string; finishedAt?: string; details: Record<string, unknown> };

function uuid() { return crypto.randomUUID(); }
function articleFromRow(row: { article: Article }) { return row.article; }

export async function listPublishedNews(locale?: Locale) {
  if (!sql) return [] as Article[];
  const rows = locale
    ? await sql<{ article: Article }[]>`select article from news_articles where status = 'published' and locale = ${locale} order by published_at desc nulls last`
    : await sql<{ article: Article }[]>`select article from news_articles where status = 'published' order by published_at desc nulls last`;
  return rows.map(articleFromRow);
}

export async function getPublishedNewsBySlug(locale: Locale, type: Article["contentType"], slug: string) {
  if (!sql || type === "blog") return undefined;
  const rows = await sql<{ article: Article }[]>`select article from news_articles where status = 'published' and locale = ${locale} and content_type = ${type} and slug = ${slug} limit 1`;
  return rows[0] ? articleFromRow(rows[0]) : undefined;
}

export async function listAutomationCandidates(limit = 100) {
  if (!sql) return [] as NewsCandidate[];
  const rows = await sql<{ candidate: NewsCandidate }[]>`select candidate from news_candidates order by discovered_at desc limit ${limit}`;
  return rows.map((row) => row.candidate);
}

export async function getLastSuccessfulPublishAt() {
  if (!sql) return null;
  const rows = await sql<{ published_at: string }[]>`select published_at from news_articles where status = 'published' order by published_at desc limit 1`;
  return rows[0]?.published_at ?? null;
}

export async function upsertCandidate(candidate: NewsCandidate) {
  if (!sql) throw new Error("NEWS_DATABASE_URL is not configured");
  await sql`
    insert into news_candidates (id, site_id, status, source_fingerprint, event_fingerprint, discovered_at, candidate, rejection_reasons)
    values (${candidate.id}, 'bzmagnet', ${candidate.status}, ${candidate.sourceFingerprint}, ${candidate.eventFingerprint}, ${candidate.discoveredAt}, ${sql.json(candidate)}, ${sql.json(candidate.rejectionReasons)})
    on conflict (site_id, source_fingerprint) do update set
      status = excluded.status, event_fingerprint = excluded.event_fingerprint, candidate = excluded.candidate,
      rejection_reasons = excluded.rejection_reasons, updated_at = now()
  `;
}

export async function saveGeneratedArticle(candidateId: string, article: Article, status: CandidateStatus, reasons: string[] = []) {
  if (!sql) throw new Error("NEWS_DATABASE_URL is not configured");
  await sql.begin(async (transaction) => {
    await transaction`
      insert into news_articles (id, site_id, candidate_id, locale, content_type, status, slug, title, content_fingerprint, article, published_at, modified_at)
      values (${article.id}, 'bzmagnet', ${candidateId}, ${article.locale}, ${article.contentType}, ${status}, ${article.seo.slug}, ${article.title}, ${article.internal.generationRecordId}, ${transaction.json(article)}, ${article.publishedAt ?? null}, ${article.modifiedAt ?? null})
      on conflict (site_id, slug, locale) do update set status = excluded.status, title = excluded.title, content_fingerprint = excluded.content_fingerprint, article = excluded.article, modified_at = now()
    `;
    await transaction`update news_candidates set status = ${status}, article_id = ${article.id}, rejection_reasons = ${transaction.json(reasons)}, updated_at = now() where id = ${candidateId} and site_id = 'bzmagnet'`;
  });
}

export async function setArticleState(article: Article, state: Extract<CandidateStatus, Article["status"]>, reasons: string[] = [], publishedAt?: string) {
  if (!sql) throw new Error("NEWS_DATABASE_URL is not configured");
  const updated: Article = { ...article, status: state, publishedAt: publishedAt ?? article.publishedAt, modifiedAt: new Date().toISOString(), internal: { ...article.internal, validationOutput: reasons } };
  await sql.begin(async (transaction) => {
    await transaction`update news_articles set status = ${state}, article = ${transaction.json(updated)}, published_at = ${updated.publishedAt ?? null}, modified_at = now() where id = ${article.id} and site_id = 'bzmagnet'`;
    await transaction`update news_candidates set status = ${state}, rejection_reasons = ${transaction.json(reasons)}, updated_at = now() where article_id = ${article.id} and site_id = 'bzmagnet'`;
  });
  return updated;
}

export async function nextScheduledArticle() {
  if (!sql) return undefined;
  const rows = await sql<{ article: Article }[]>`select article from news_articles where site_id = 'bzmagnet' and status = 'scheduled' and content_type in ('company_news', 'industry_news') order by created_at asc limit 1`;
  return rows[0] ? articleFromRow(rows[0]) : undefined;
}

export async function existingNewsForDeduplication() {
  if (!sql) return [] as Article[];
  const rows = await sql<{ article: Article }[]>`select article from news_articles where site_id = 'bzmagnet' and status in ('scheduled', 'publishing', 'published') order by created_at desc limit 200`;
  return rows.map(articleFromRow);
}

export async function acquireNewsLock(key: string, ttlSeconds = 600) {
  if (!sql) return false;
  const token = uuid();
  const rows = await sql<{ token: string }[]>`
    insert into news_locks (lock_key, token, expires_at) values (${key}, ${token}, now() + (${ttlSeconds} || ' seconds')::interval)
    on conflict (lock_key) do update set token = excluded.token, expires_at = excluded.expires_at where news_locks.expires_at < now()
    returning token
  `;
  return rows[0]?.token === token;
}

export async function releaseNewsLock(key: string) { if (sql) await sql`delete from news_locks where lock_key = ${key}`; }

export async function recordNewsRun(run: NewsRun) {
  if (!sql) return;
  await sql`insert into news_runs (id, site_id, kind, status, started_at, finished_at, details) values (${run.id}, 'bzmagnet', ${run.kind}, ${run.status}, ${run.startedAt}, ${run.finishedAt ?? null}, ${sql.json(run.details as never)})`;
}

export async function newsStoreStatus() {
  if (!sql) return { configured: false, published: 0, candidates: 0, lastSuccessfulPublishAt: null as string | null };
  const [published, candidates, lastSuccessfulPublishAt] = await Promise.all([
    sql<{ count: string }[]>`select count(*)::text as count from news_articles where site_id = 'bzmagnet' and status = 'published'`,
    sql<{ count: string }[]>`select count(*)::text as count from news_candidates where site_id = 'bzmagnet'`,
    getLastSuccessfulPublishAt(),
  ]);
  return { configured: true, published: Number(published[0]?.count ?? 0), candidates: Number(candidates[0]?.count ?? 0), lastSuccessfulPublishAt };
}
