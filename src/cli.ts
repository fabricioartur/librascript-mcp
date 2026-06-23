import { auditPortugueseText } from "./audit.js";
import { runDoctor } from "./doctor.js";
import { glossToScript } from "./script.js";
import { validateGloss } from "./validation.js";
import { VLibrasClient } from "./vlibras-client.js";

const VERSION = "0.3.0";

function printHelp(): void {
  console.log(`
LIBRAScript MCP v${VERSION}
Conecta qualquer IA (via protocolo MCP) às APIs oficiais do VLibras.

Uso:
  librascript-mcp                    Inicia o servidor MCP (modo normal)
  librascript-mcp --help             Mostra esta ajuda
  librascript-mcp --version          Mostra a versão
  librascript-mcp --doctor           Testa Node.js e APIs do VLibras
  librascript-mcp --demo "texto"     Demo rápida sem configurar MCP

Configuração MCP (exemplo):
  Veja a pasta examples/ ou o README.md

Mais info: https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras
`);
}

export async function runCli(args: string[]): Promise<boolean> {
  if (args.length === 0) return false;

  const command = args[0];

  if (command === "--help" || command === "-h") {
    printHelp();
    return true;
  }

  if (command === "--version" || command === "-v") {
    console.log(VERSION);
    return true;
  }

  if (command === "--doctor") {
    console.log("Verificando LIBRAScript MCP...\n");
    const result = await runDoctor();
    for (const check of result.checks) {
      const icon = check.ok ? "✓" : "✗";
      console.log(`${icon} ${check.name}: ${check.detail}`);
    }
    console.log(result.ok ? "\nTudo certo! Pode configurar o MCP." : "\nCorrija os itens acima antes de usar.");
    return true;
  }

  if (command === "--demo") {
    const text = args.slice(1).join(" ").trim();
    if (!text) {
      console.error('Informe um texto: librascript-mcp --demo "Olá, bem-vindo ao curso"');
      process.exitCode = 1;
      return true;
    }

    const client = new VLibrasClient();
    console.log("Texto:", text);
    console.log("");

    const audit = auditPortugueseText(text);
    console.log(`Auditoria: ${audit.score}/100 (${audit.issues.length} alerta(s))`);

    const gloss = await client.translate(text);
    console.log("Glossa:", gloss);

    const validation = await validateGloss(client, gloss);
    console.log(`Validação: ${validation.score}/100 — ${validation.missing.length} sinal(is) ausente(s)`);

    const script = glossToScript(gloss);
    console.log(`Roteiro: ~${script.estimatedDurationSeconds}s estimados`);
    console.log("");
    console.log(script.markdown);
    return true;
  }

  return false;
}