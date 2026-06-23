const PUNCTUATION_TOKENS = new Set(["[PONTO]", "[VIRGULA]", "[INTERROGAÇÃO]", "[EXCLAMAÇÃO]"]);

export interface GlossToken {
  raw: string;
  normalized: string;
  isPunctuation: boolean;
  compoundParts: string[];
}

export function normalizeSignToken(token: string): string {
  return token
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .replace(/\s+/g, "_");
}

export function parseGloss(gloss: string): GlossToken[] {
  return gloss
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const isPunctuation = PUNCTUATION_TOKENS.has(raw.toUpperCase());
      const compoundParts = raw
        .split("&")
        .map((part) => normalizeSignToken(part))
        .filter(Boolean);

      return {
        raw,
        normalized: normalizeSignToken(raw.replace(/&/g, "_")),
        isPunctuation,
        compoundParts: isPunctuation ? [] : compoundParts,
      };
    });
}

export function extractSignCandidates(gloss: string): string[] {
  const candidates = new Set<string>();

  for (const token of parseGloss(gloss)) {
    if (token.isPunctuation) continue;
    for (const part of token.compoundParts) {
      candidates.add(part);
    }
  }

  return [...candidates];
}