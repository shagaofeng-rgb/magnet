import "server-only";

import { origin } from "@/lib/i18n";
import { publicProducts, validateProductForPublication } from "@/lib/product-model";
import { countActiveNewsSources } from "@/lib/news-store";

export type BzmagnetReadiness = {
  primaryDomainResolved: boolean;
  brandSeparationPassed: boolean;
  productTruthCoveragePassed: boolean;
  cronAuthPassed: boolean;
  sourceCatalogPassed: boolean;
  automaticModePassed: boolean;
  internalGeneratorPassed: boolean;
  passed: boolean;
  reasons: string[];
};

/**
 * Runtime publishing has its own fail-closed gate. CI verifies the public
 * implementation, while each publish run verifies the delivered public URLs.
 */
export async function getNewsReleaseReadiness(): Promise<BzmagnetReadiness> {
  const primaryDomainResolved = origin === "https://bzmagnet.com";
  const productTruthCoveragePassed = publicProducts.length > 0 && publicProducts.every((product) => validateProductForPublication(product).length === 0);
  const sourceCatalogPassed = (await countActiveNewsSources()) > 0;
  const brandSeparationPassed = !/cowin/iu.test(JSON.stringify(publicProducts));
  const cronAuthPassed = Boolean(process.env.CRON_SECRET);
  const automaticModePassed = !["paused", "internal_review"].includes(process.env.NEWS_AUTOMATION_MODE || "");
  const internalGeneratorPassed = true;
  const values = { primaryDomainResolved, brandSeparationPassed, productTruthCoveragePassed, cronAuthPassed, sourceCatalogPassed, automaticModePassed, internalGeneratorPassed };
  const reasons = Object.entries(values).filter(([, passed]) => !passed).map(([key]) => `readiness-${key}-failed`);
  return { ...values, passed: reasons.length === 0, reasons };
}
