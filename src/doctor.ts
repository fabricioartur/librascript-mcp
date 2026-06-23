import { VLibrasClient } from "./vlibras-client.js";

export interface DoctorCheck {
  name: string;
  ok: boolean;
  detail: string;
}

export async function runDoctor(): Promise<{ ok: boolean; checks: DoctorCheck[] }> {
  const checks: DoctorCheck[] = [];
  const client = new VLibrasClient();

  const nodeVersion = process.versions.node;
  const nodeMajor = Number(nodeVersion.split(".")[0]);
  checks.push({
    name: "Node.js",
    ok: nodeMajor >= 18,
    detail: nodeMajor >= 18 ? `v${nodeVersion}` : `v${nodeVersion} — requer Node 18+`,
  });

  try {
    const gloss = await client.translate("Teste de conexão.");
    checks.push({
      name: "API de tradução VLibras",
      ok: gloss.length > 0,
      detail: `Resposta: ${gloss}`,
    });
  } catch (error) {
    checks.push({
      name: "API de tradução VLibras",
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    });
  }

  try {
    const stats = await client.getDictionaryStats();
    checks.push({
      name: "API do dicionário VLibras",
      ok: stats.totalSigns > 1000,
      detail: `${stats.totalSigns.toLocaleString("pt-BR")} sinais carregados`,
    });
  } catch (error) {
    checks.push({
      name: "API do dicionário VLibras",
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    });
  }

  return { ok: checks.every((check) => check.ok), checks };
}