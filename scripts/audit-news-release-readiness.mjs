import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://bzmagnet.com";
const checks = {
  primaryDomainResolved: origin === "https://bzmagnet.com",
  redirectChainPassed: process.env.BZMAGNET_REDIRECT_AUDIT_PASSED === "true",
  publicRobotsPassed: process.env.BZMAGNET_ROBOTS_AUDIT_PASSED === "true",
  canonicalAndHreflangPassed: process.env.BZMAGNET_CANONICAL_AUDIT_PASSED === "true",
  brandSeparationPassed: process.env.BZMAGNET_BRAND_AUDIT_PASSED === "true",
  duplicateContentRiskPassed: process.env.BZMAGNET_SIMILARITY_AUDIT_PASSED === "true",
  publicTemplateLeakCheckPassed: process.env.BZMAGNET_PUBLIC_AUDIT_PASSED === "true",
  cronAuthPassed: Boolean(process.env.CRON_SECRET),
  releaseSwitchEnabled: process.env.NEWS_RELEASE_READY === "true" && process.env.NEWS_AUTO_PUBLISH === "true",
};
const failed = Object.entries(checks).filter(([, value]) => !value).map(([name]) => name);
const report = { generatedAt: new Date().toISOString(), origin, checks, passed: failed.length === 0, failed };
fs.mkdirSync(path.join(root, "docs/implementation-reports"), { recursive: true });
fs.writeFileSync(path.join(root, "docs/implementation-reports/bzmagnet-news-readiness.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.passed ? 0 : 2;
