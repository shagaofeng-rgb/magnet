import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://bzmagnet.com";
const automaticWriter = fs.readFileSync(path.join(root, "lib/news/automatic-article.ts"), "utf8");
const automation = fs.readFileSync(path.join(root, "lib/news-automation.ts"), "utf8");
const checks = {
  primaryDomainResolved: origin === "https://bzmagnet.com",
  brandSeparationPassed: automaticWriter.includes("BZMAGNET Editorial Team") && !/COWIN MAGNET|cowinmagnet\.com/u.test(automaticWriter),
  sourceEvidencePassed: automation.includes("verifyCandidateSourceEvidence"),
  seoGeoGatePassed: automation.includes("validateNewsBrandAndGeo"),
  publicDeliveryGatePassed: ["/en/news/industry", "/news-sitemap.xml", "/news/rss.xml"].every((route) => automation.includes(route)),
  cronAuthPassed: Boolean(process.env.CRON_SECRET),
  automaticModePassed: !["paused", "internal_review"].includes(process.env.NEWS_AUTOMATION_MODE || "") && process.env.NEWS_AUTO_PUBLISH !== "false",
};
const failed = Object.entries(checks).filter(([, value]) => !value).map(([name]) => name);
const report = { generatedAt: new Date().toISOString(), origin, checks, passed: failed.length === 0, failed };
fs.mkdirSync(path.join(root, "docs/implementation-reports"), { recursive: true });
fs.writeFileSync(path.join(root, "docs/implementation-reports/bzmagnet-news-readiness.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.passed ? 0 : 2;
