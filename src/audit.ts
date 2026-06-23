export interface AuditIssue {
  type: "long_sentence" | "acronym" | "long_word" | "parenthetical" | "semicolon_chain";
  message: string;
  excerpt: string;
}

export interface AuditResult {
  score: number;
  issues: AuditIssue[];
  suggestions: string[];
  sentenceCount: number;
  averageSentenceLength: number;
}

const LONG_SENTENCE_THRESHOLD = 120;
const LONG_WORD_THRESHOLD = 25;

export function auditPortugueseText(text: string): AuditResult {
  const issues: AuditIssue[] = [];
  const suggestions: string[] = [];

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const sentence of sentences) {
    if (sentence.length > LONG_SENTENCE_THRESHOLD) {
      issues.push({
        type: "long_sentence",
        message: `Frase longa (${sentence.length} caracteres). Prefira frases curtas para tradução em LIBRAS.`,
        excerpt: sentence.slice(0, 80) + (sentence.length > 80 ? "…" : ""),
      });
    }

    if (sentence.includes("(") && sentence.includes(")")) {
      issues.push({
        type: "parenthetical",
        message: "Parenteses dificultam a linearidade visual da LIBRAS. Considere mover a informação para outra frase.",
        excerpt: sentence.slice(0, 80) + (sentence.length > 80 ? "…" : ""),
      });
    }

    if ((sentence.match(/;/g) ?? []).length >= 2) {
      issues.push({
        type: "semicolon_chain",
        message: "Muitos ponto-e-vírgulas na mesma frase. Divida em frases menores.",
        excerpt: sentence.slice(0, 80) + (sentence.length > 80 ? "…" : ""),
      });
    }
  }

  const words = text.split(/\s+/).filter(Boolean);
  for (const word of words) {
    if (word.length > LONG_WORD_THRESHOLD) {
      issues.push({
        type: "long_word",
        message: `Palavra muito longa (${word.length} caracteres) pode não ter sinal direto no dicionário.`,
        excerpt: word,
      });
    }
  }

  const acronyms = text.match(/\b[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ]{2,}\b/g) ?? [];
  for (const acronym of [...new Set(acronyms)]) {
    issues.push({
      type: "acronym",
      message: `Sigla "${acronym}" — expanda na primeira menção (ex.: "${acronym} (nome por extenso)").`,
      excerpt: acronym,
    });
  }

  if (issues.some((i) => i.type === "long_sentence")) {
    suggestions.push("Divida parágrafos em frases de até ~80 caracteres.");
  }
  if (issues.some((i) => i.type === "acronym")) {
    suggestions.push("Expanda siglas e acrônimos antes de traduzir.");
  }
  if (issues.length === 0) {
    suggestions.push("Texto adequado para tradução inicial. Prossiga com text_to_gloss.");
  }

  const avgLength =
    sentences.length === 0
      ? 0
      : Math.round(sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length);

  const penalty = Math.min(issues.length * 8, 80);
  const score = Math.max(20, 100 - penalty);

  return {
    score,
    issues,
    suggestions,
    sentenceCount: sentences.length,
    averageSentenceLength: avgLength,
  };
}