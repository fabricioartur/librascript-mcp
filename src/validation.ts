import { extractSignCandidates } from "./gloss.js";
import { VLibrasClient } from "./vlibras-client.js";

export interface GlossValidation {
  gloss: string;
  score: number;
  totalSigns: number;
  found: string[];
  missing: string[];
  warnings: string[];
}

export async function validateGloss(client: VLibrasClient, gloss: string): Promise<GlossValidation> {
  const candidates = extractSignCandidates(gloss);
  const results = await Promise.all(
    candidates.map(async (sign) => ({
      sign,
      found: await client.hasSign(sign),
    })),
  );

  const missing = results.filter((item) => !item.found).map((item) => item.sign);
  const found = results.filter((item) => item.found).map((item) => item.sign);
  const score =
    candidates.length === 0 ? 0 : Math.round((found.length / candidates.length) * 100);

  const warnings = missing.map(
    (sign) =>
      `"${sign}" não está no dicionário VLibras — o avatar soletraria letra por letra em vez de assinar.`,
  );

  return { gloss, score, totalSigns: candidates.length, found, missing, warnings };
}