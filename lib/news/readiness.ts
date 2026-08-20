import "server-only";

import { origin } from "@/lib/i18n";
import { publicProducts, validateProductForPublication } from "@/lib/product-model";
import { countActiveNewsSources } from "@/lib/news-store";

export type BzmagnetReadiness = {
  primaryDomainResolved: boolean;
  redirectChainPassed: boolean;
  publicRobotsPassed: boolean;
  canonicalAndHreflangPassed: boolean;
  brandSeparationPassed: boolean;
  productTruthCoveragePassed: boolean;
  duplicateContentRiskPassed: boolean;
  publicTemplateLeakCheckPassed: boolean;
  cronAuthPassed: boolean;
  sourceCatalogPassed: boolean;
  passed: boolean;
  reasons: string[];
};

const affirmative = (value: string | undefined) => value === "true";

/**
 * Runtime publishing has its own fail-closed gate. CI verifies public output;
 * deployment writes the audit attestations only after those checks pass.
 */
export async function getNewsReleaseReadiness(): Promise<BzmagnetReadiness> {
  const primaryDomainResolved = origin === "https://bzmagnet.com";
  const productTruthCoveragePassed = publicProducts.length > 0 && publicProducts.every((product) => validateProductForPublication(product).length === 0);
  const sourceCatalogPassed = (await countActiveNewsSources()) > 0;
  const redirectChainPassed = affirmative(process.env.BZMAGNET_REDIRECT_AUDIT_PASSED);
  const publicRobotsPassed = affirmative(process.env.BZMAGNET_ROBOTS_AUDIT_PASSED);
  const canonicalAndHreflangPassed = affirmative(process.env.BZMAGNET_CANONICAL_AUDIT_PASSED);
  const brandSeparationPassed = affirmative(process.env.BZMAGNET_BRAND_AUDIT_PASSED);
  const duplicateContentRiskPassed = affirmative(process.env.BZMAGNET_SIMILARITY_AUDIT_PASSED);
  const publicTemplateLeakCheckPassed = affirmative(process.env.BZMAGNET_PUBLIC_AUDIT_PASSED);
  const cronAuthPassed = Boolean(process.env.CRON_SECRET && process.env.NEWS_RELEASE_READY === "true");
  const values = { primaryDomainResolved, redirectChainPassed, publicRobotsPassed, canonicalAndHreflangPassed, brandSeparationPassed, productTruthCoveragePassed, duplicateContentRiskPassed, publicTemplateLeakCheckPassed, cronAuthPassed, sourceCatalogPassed };
  const reasons = Object.entries(values).filter(([, passed]) => !passed).map(([key]) => `readiness-${key}-failed`);
  return { ...values, passed: reasons.length === 0, reasons };
}
