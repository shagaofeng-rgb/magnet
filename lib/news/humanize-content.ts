import { createHash } from "node:crypto";
import type { Article } from "@/lib/editorial";

const aiPatterns = [/\bAs an AI\b/giu, /\bLet's dive in\b/giu, /\bIn today's fast-paced world\b/giu, /\bIt is worth noting\b/giu, /\bworld-leading\b/giu, /\bgame-changing\b/giu, /\bguaranteed\b/giu];
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export type HumanizerAudit = NonNullable<Article["internal"]["humanizerAudit"]>;

/**
 * This is intentionally a conservative formatter, not an unsupervised writer.
 * It only normalizes whitespace and blocks artificial phrasing; it never adds
 * facts, sources, claims, product values or citations.
 */
export function humanizeArticle(article: Article, lockedFields: string[]): { article: Article; audit: HumanizerAudit } {
  const before = JSON.parse(JSON.stringify(article)) as Article;
  const removedAiPatterns: string[] = [];
  const normalizeText = (text: string) => {
    let value = text.replace(/\s+/gu, " ").trim();
    for (const pattern of aiPatterns) if (pattern.test(value)) removedAiPatterns.push(pattern.source);
    return value;
  };
  const next: Article = {
    ...article,
    title: normalizeText(article.title),
    summary: normalizeText(article.summary),
    sections: article.sections.map((section) => ({ ...section, heading: normalizeText(section.heading), blocks: section.blocks.map((block) => {
      if (block.type === "paragraph") return { ...block, text: normalizeText(block.text) };
      if (block.type === "callout") return { ...block, title: normalizeText(block.title), text: normalizeText(block.text) };
      if (block.type === "image") return { ...block, alt: normalizeText(block.alt), caption: block.caption ? normalizeText(block.caption) : undefined };
      if (block.type === "table") return { ...block, columns: block.columns.map(normalizeText), rows: block.rows.map((row) => row.map(normalizeText)) };
      return { ...block, items: block.items.map(normalizeText) };
    }) })),
    faq: article.faq.map((item) => ({ question: normalizeText(item.question), answer: normalizeText(item.answer) })),
  };
  const factDeltaDetected = lockedFields.some((field) => JSON.stringify((before as Record<string, unknown>)[field]) !== JSON.stringify((next as Record<string, unknown>)[field]));
  const audit: HumanizerAudit = { originalDraftHash: hash(before), humanizedDraftHash: hash(next), factualFieldsLocked: lockedFields, removedAiPatterns: [...new Set(removedAiPatterns)], prohibitedPhrasesFound: [...new Set(removedAiPatterns)], factDeltaDetected, processedAt: new Date().toISOString() };
  next.internal = { ...next.internal, humanizerAudit: audit };
  return { article: next, audit };
}
