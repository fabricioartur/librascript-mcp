#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { auditPortugueseText } from "./audit.js";
import { runCli } from "./cli.js";
import { DISCLAIMER } from "./constants.js";
import { toolResult } from "./format.js";
import { glossToScript } from "./script.js";
import { validateGloss } from "./validation.js";
import { VLibrasClient } from "./vlibras-client.js";

const VERSION = "0.3.0";
const client = new VLibrasClient();

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain && (await runCli(process.argv.slice(2)))) {
  process.exit(process.exitCode ?? 0);
}

const server = new McpServer({
  name: "librascript-mcp",
  version: VERSION,
});

server.tool(
  "text_to_gloss",
  "Traduz um texto em português para glossa LIBRAS. Use quando o usuário pedir tradução para LIBRAS, língua de sinais ou VLibras.",
  {
    text: z.string().describe("Texto em português (máximo 5000 caracteres)."),
  },
  async ({ text }) => {
    const gloss = await client.translate(text);
    return toolResult(`Glossa gerada com sucesso.`, {
      gloss,
      proximoPasso: "Use validate_gloss ou gloss_to_script para revisar e montar o roteiro.",
      disclaimer: DISCLAIMER,
    });
  },
);

server.tool(
  "lookup_sign",
  "Busca um sinal no dicionário oficial VLibras. Use para conferir se uma palavra tem sinal cadastrado.",
  {
    term: z.string().describe("Palavra ou termo para buscar."),
    limit: z.number().int().min(1).max(50).optional().describe("Máximo de resultados (padrão 10)."),
  },
  async ({ term, limit }) => {
    const matches = await client.lookupSign(term, limit ?? 10);
    const summary =
      matches.length === 0
        ? `Nenhum sinal encontrado para "${term}". O avatar soletraria letra por letra.`
        : `${matches.length} sinal(is) encontrado(s) para "${term}".`;
    return toolResult(summary, { query: term, matches });
  },
);

server.tool(
  "validate_gloss",
  "Valida uma glossa e mostra quais sinais existem no dicionário. Use sempre após traduzir.",
  {
    gloss: z.string().describe("Glossa LIBRAS para validar."),
  },
  async ({ gloss }) => {
    const result = await validateGloss(client, gloss);
    const summary =
      result.score >= 80
        ? `Boa glossa: ${result.score}% dos sinais estão no dicionário.`
        : `Atenção: ${result.score}% de cobertura. ${result.missing.length} sinal(is) seriam soletrados.`;
    return toolResult(summary, { ...result, disclaimer: DISCLAIMER });
  },
);

server.tool(
  "audit_content",
  "Analisa um texto em português ANTES de traduzir. Detecta frases longas, siglas e trechos difíceis de assinar.",
  {
    text: z.string().describe("Conteúdo em português para auditar."),
  },
  async ({ text }) => {
    const audit = auditPortugueseText(text);
    const summary =
      audit.issues.length === 0
        ? `Texto pronto para tradução (score ${audit.score}/100).`
        : `${audit.issues.length} ponto(s) de atenção encontrado(s) (score ${audit.score}/100).`;
    return toolResult(summary, { ...audit, disclaimer: DISCLAIMER });
  },
);

server.tool(
  "translate_and_validate",
  "Atalho recomendado: audita, traduz e valida em uma única chamada. Use para a maioria dos pedidos de tradução.",
  {
    text: z.string().describe("Texto em português."),
    auditFirst: z.boolean().optional().describe("Auditar antes de traduzir (padrão: true)."),
  },
  async ({ text, auditFirst }) => {
    const audit = (auditFirst ?? true) ? auditPortugueseText(text) : undefined;
    const gloss = await client.translate(text);
    const validation = await validateGloss(client, gloss);
    const summary = `Tradução concluída. Cobertura do dicionário: ${validation.score}%.`;
    return toolResult(summary, {
      gloss,
      audit,
      validation,
      recomendacao:
        validation.score < 80
          ? "Simplifique o texto ou revise a glossa com um fluente em LIBRAS."
          : "Glossa utilizável. Peça revisão humana antes de publicar em vídeo ou aula.",
      disclaimer: DISCLAIMER,
    });
  },
);

server.tool(
  "gloss_to_script",
  "Transforma uma glossa em roteiro com tempos estimados. Ideal para vídeos, aulas gravadas e intérpretes.",
  {
    gloss: z.string().describe("Glossa LIBRAS."),
    title: z.string().optional().describe("Título do roteiro."),
  },
  async ({ gloss, title }) => {
    const script = glossToScript(gloss, title);
    return toolResult(`Roteiro pronto (~${script.estimatedDurationSeconds}s).`, {
      ...script,
      disclaimer: DISCLAIMER,
    });
  },
);

server.tool(
  "batch_translate",
  "Traduz vários trechos de uma vez (slides, seções, FAQ). Máximo 20 itens.",
  {
    texts: z.array(z.string()).min(1).max(20).describe("Lista de textos em português."),
  },
  async ({ texts }) => {
    const results = [];
    for (const [index, text] of texts.entries()) {
      const gloss = await client.translate(text);
      const validation = await validateGloss(client, gloss);
      results.push({ item: index + 1, text, gloss, score: validation.score });
    }
    const averageScore = Math.round(
      results.reduce((sum, item) => sum + item.score, 0) / results.length,
    );
    return toolResult(`${results.length} trecho(s) traduzido(s). Média: ${averageScore}%.`, {
      averageScore,
      results,
      disclaimer: DISCLAIMER,
    });
  },
);

server.tool(
  "submit_review",
  "Envia feedback à equipe VLibras quando uma tradução estiver boa ou precisar de correção.",
  {
    text: z.string().describe("Texto original em português."),
    translation: z.string().describe("Glossa avaliada."),
    rating: z.enum(["good", "bad"]).describe("'good' se boa, 'bad' se ruim."),
    suggestion: z.string().optional().describe("Glossa corrigida (obrigatória se rating for 'bad')."),
  },
  async ({ text, translation, rating, suggestion }) => {
    if (rating === "bad" && !suggestion?.trim()) {
      throw new Error("Inclua 'suggestion' com a glossa corrigida quando a avaliação for 'bad'.");
    }
    await client.submitReview({ text, translation, rating, suggestion });
    return toolResult("Obrigado! Seu feedback foi enviado ao VLibras.", { status: "ok" });
  },
);

server.tool(
  "dictionary_stats",
  "Mostra quantos sinais existem no dicionário oficial carregado.",
  {},
  async () => {
    const stats = await client.getDictionaryStats();
    return toolResult(`${stats.totalSigns.toLocaleString("pt-BR")} sinais no dicionário VLibras.`, stats);
  },
);

server.registerPrompt(
  "traduzir-para-libras",
  {
    title: "Traduzir para LIBRAS",
    description: "Fluxo completo: audita, traduz, valida e gera roteiro.",
    argsSchema: {
      texto: z.string().describe("Texto em português para traduzir"),
    },
  },
  async ({ texto }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: [
            "Traduza o texto abaixo para LIBRAS usando o LIBRAScript MCP.",
            "Siga este fluxo:",
            "1. audit_content (se o texto for longo ou técnico)",
            "2. translate_and_validate",
            "3. gloss_to_script",
            "4. Explique o resultado em português simples para quem não conhece LIBRAS.",
            "5. Inclua o aviso de que não substitui intérprete humano.",
            "",
            `Texto: ${texto}`,
          ].join("\n"),
        },
      },
    ],
  }),
);

server.registerPrompt(
  "tornar-site-acessivel",
  {
    title: "Tornar conteúdo web acessível em LIBRAS",
    description: "Audita e traduz conteúdo de páginas, READMEs ou artigos.",
    argsSchema: {
      conteudo: z.string().describe("Texto do site, README ou artigo"),
    },
  },
  async ({ conteudo }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: [
            "Preciso tornar este conteúdo mais acessível em LIBRAS.",
            "1. audit_content — liste problemas e sugira reescrita",
            "2. Reescreva trechos problemáticos em português simples",
            "3. translate_and_validate na versão final",
            "4. gloss_to_script",
            "",
            conteudo,
          ].join("\n"),
        },
      },
    ],
  }),
);

server.registerPrompt(
  "traduzir-slides",
  {
    title: "Traduzir slides ou seções em lote",
    description: "Para apresentações, e-books ou FAQs com vários blocos de texto.",
    argsSchema: {
      secoes: z.string().describe("Textos separados por linha em branco ou numerados"),
    },
  },
  async ({ secoes }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: [
            "Separe os trechos abaixo e use batch_translate.",
            "Depois, gere um roteiro (gloss_to_script) para cada trecho com score abaixo de 80.",
            "",
            secoes,
          ].join("\n"),
        },
      },
    ],
  }),
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`librascript-mcp falhou: ${message}`);
  process.exit(1);
});