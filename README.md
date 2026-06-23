# LIBRAScript MCP

Torne qualquer IA capaz de **produzir conteúdo em LIBRAS** usando as APIs oficiais do [VLibras](https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras) (Governo Digital).

Funciona com **Cursor, Grok, Claude Desktop, Claude Code** e qualquer ferramenta que suporte o [protocolo MCP](https://modelcontextprotocol.io).

---

## Comece em 3 minutos

### 1. Teste sem configurar nada

```bash
git clone https://github.com/fabricioartur/librascript-mcp.git
cd librascript-mcp
npm install
npm run build
npm run demo
```

Ou, com texto personalizado:

```bash
node dist/index.js --demo "Bem-vindo ao nosso curso de programação"
```

### 2. Verifique se está tudo funcionando

```bash
npm run doctor
```

### 3. Conecte na sua IA

Copie um arquivo de `examples/` para a config MCP do seu editor:

| Ferramenta | Arquivo de config |
|------------|-------------------|
| **Claude Desktop** | `~/.config/claude/claude_desktop_config.json` |
| **Cursor** | Configurações → MCP |
| **Grok Build** | Config MCP do projeto |

Exemplo (funciona na maioria dos clientes):

```json
{
  "mcpServers": {
    "librascript": {
      "command": "npx",
      "args": ["-y", "librascript-mcp"]
    }
  }
}
```

Reinicie o editor e pronto.

---

## O que pedir para a IA

Você não precisa saber os nomes das ferramentas. Basta escrever em português:

| Você escreve | A IA faz |
|--------------|----------|
| *"Traduza para LIBRAS: Bem-vindo ao curso"* | Traduz e valida |
| *"Este texto está bom para LIBRAS?"* | Audita antes de traduzir |
| *"Gere o roteiro em LIBRAS deste parágrafo"* | Traduz + roteiro com tempos |
| *"Traduza cada slide abaixo"* | Tradução em lote |

### Prompts prontos (se o seu cliente suportar)

- **traduzir-para-libras** — fluxo completo
- **tornar-site-acessivel** — audita README ou página web
- **traduzir-slides** — vários trechos de uma vez

---

## Ferramentas disponíveis

| Ferramenta | Para que serve |
|------------|----------------|
| `translate_and_validate` | **Comece por aqui** — audita, traduz e valida |
| `text_to_gloss` | Só traduzir |
| `validate_gloss` | Conferir qualidade da glossa |
| `audit_content` | Melhorar o texto em português antes de traduzir |
| `gloss_to_script` | Roteiro com tempos para vídeo/aula |
| `batch_translate` | Vários trechos (slides, FAQ…) |
| `lookup_sign` | Buscar sinal no dicionário |
| `submit_review` | Enviar feedback ao VLibras |
| `dictionary_stats` | Quantos sinais existem no dicionário |

---

## Quem pode usar

Qualquer IA com **cliente MCP** — não fica preso a um modelo específico.

| Funciona | Não funciona diretamente |
|----------|--------------------------|
| Cursor, Grok, Claude Desktop | ChatGPT no navegador (sem MCP) |
| Claude Code, VS Code + MCP | Apps sem suporte ao protocolo |

**Requisitos:** Node.js 18+, internet (APIs do governo).

**Custo:** R$ 0 — sem API key, sem cadastro.

---

## Aviso importante

> O VLibras **não substitui um intérprete humano** de LIBRAS.
>
> Este projeto ajuda a **preparar** conteúdo (glossas, roteiros, revisões). Para aulas, vídeos publicados, audiências ou materiais oficiais, sempre envolva um fluente em LIBRAS na revisão final.

[Fonte oficial](https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras)

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| MCP não aparece | Reinicie o editor após salvar a config |
| `command not found: node` | Instale Node 18+ em [nodejs.org](https://nodejs.org) |
| Erro de tradução | Rode `npm run doctor` — API do governo pode estar fora |
| Glossa com score baixo | Simplifique frases; use `audit_content` primeiro |
| Palavra soletrada | Normal se não há sinal no dicionário — use `lookup_sign` |

---

## Desenvolvimento local

```bash
npm install
npm run build
npm run doctor
npm run demo
npm start          # inicia servidor MCP
```

Estrutura do projeto:

```
src/
  index.ts         # servidor MCP + prompts
  vlibras-client.ts # APIs do governo
  audit.ts         # auditoria de texto
  script.ts        # roteiros
  doctor.ts        # verificação de saúde
```

APIs utilizadas (gratuitas):

- `https://traducao2.vlibras.gov.br/translate`
- `https://dicionario2.vlibras.gov.br/bundles`

Código oficial VLibras: [github.com/spbgovbr-vlibras](https://github.com/spbgovbr-vlibras)

---

## Publicar no npm (mantenedores)

```bash
npm login
npm publish --access public
```

Depois, qualquer pessoa instala com:

```bash
npx -y librascript-mcp --doctor
```

## Licença

MIT — integra serviços do VLibras (Software Público Brasileiro, LGPL-3.0).