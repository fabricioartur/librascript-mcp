import {
  MAX_TEXT_LENGTH,
  VLIBRAS_BUNDLES_URL,
  VLIBRAS_REVIEW_URL,
  VLIBRAS_TRANSLATE_URL,
} from "./constants.js";
import { normalizeSignToken } from "./gloss.js";

export class VLibrasClient {
  private bundles: string[] | null = null;
  private bundleSet: Set<string> | null = null;

  async translate(text: string): Promise<string> {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error("O texto não pode estar vazio.");
    }
    if (trimmed.length > MAX_TEXT_LENGTH) {
      throw new Error(`O texto excede o limite de ${MAX_TEXT_LENGTH} caracteres da API VLibras.`);
    }

    const response = await fetch(VLIBRAS_TRANSLATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed }),
    });

    if (!response.ok) {
      throw new Error(`API de tradução VLibras retornou status ${response.status}.`);
    }

    const gloss = (await response.text()).trim();
    if (!gloss) {
      throw new Error("A API de tradução VLibras retornou uma resposta vazia.");
    }

    return gloss;
  }

  async loadBundles(): Promise<string[]> {
    if (this.bundles) return this.bundles;

    const response = await fetch(VLIBRAS_BUNDLES_URL);
    if (!response.ok) {
      throw new Error(`API do dicionário VLibras retornou status ${response.status}.`);
    }

    const data = (await response.json()) as unknown;
    if (!Array.isArray(data) || !data.every((item) => typeof item === "string")) {
      throw new Error("Formato inesperado na resposta do dicionário VLibras.");
    }

    this.bundles = data;
    this.bundleSet = new Set(data.map((item) => normalizeSignToken(item)));
    return this.bundles;
  }

  private async getBundleSet(): Promise<Set<string>> {
    await this.loadBundles();
    return this.bundleSet!;
  }

  async hasSign(sign: string): Promise<boolean> {
    const set = await this.getBundleSet();
    return set.has(normalizeSignToken(sign));
  }

  async submitReview(params: {
    text: string;
    translation: string;
    rating: "good" | "bad";
    suggestion?: string;
  }): Promise<void> {
    const body: Record<string, string> = {
      text: params.text.trim(),
      translation: params.translation.trim(),
      rating: params.rating,
    };

    if (params.suggestion?.trim()) {
      body.suggestion = params.suggestion.trim();
      body.correctedTranslation = params.suggestion.trim();
    }

    const response = await fetch(VLIBRAS_REVIEW_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`API de revisão VLibras retornou status ${response.status}: ${detail}`);
    }
  }

  async getDictionaryStats(): Promise<{ totalSigns: number; sample: string[] }> {
    const bundles = await this.loadBundles();
    return {
      totalSigns: bundles.length,
      sample: bundles.slice(0, 5),
    };
  }

  async lookupSign(query: string, limit = 10): Promise<string[]> {
    const bundles = await this.loadBundles();
    const normalizedQuery = normalizeSignToken(query);

    const exact = bundles.filter((item) => normalizeSignToken(item) === normalizedQuery);
    if (exact.length > 0) {
      return exact.slice(0, limit);
    }

    const partial = bundles.filter((item) => normalizeSignToken(item).includes(normalizedQuery));
    return partial.slice(0, limit);
  }
}