# LIBRAScript MCP — Conectando IAs ao VLibras oficial

## O que é

O **LIBRAScript MCP** é um servidor open source do protocolo MCP (Model Context Protocol) que permite que **qualquer inteligência artificial** — Cursor, Grok, Claude Desktop, Claude Code, OpenAI Codex, Google Antigravity e outros clientes compatíveis — produza conteúdo em **LIBRAS** usando as **APIs gratuitas e oficiais do VLibras** (Governo Digital do Brasil).

**Repositório:** https://github.com/fabricioartur/librascript-mcp

---

## O problema que resolve

Mais de **2 milhões de brasileiros** usam a LIBRAS como língua principal. A maior parte do conteúdo digital é criada só em português escrito.

O VLibras já traduz páginas web para quem **consome** conteúdo (widget com o avatar Ícaro). Mas quem **produz** conteúdo — desenvolvedores, educadores, criadores, ONGs — não tinha uma ferramenta integrada ao fluxo de trabalho com IA.

O LIBRAScript MCP preenche essa lacuna.

---

## Como funciona

```
Qualquer IA com cliente MCP
        ↓
  LIBRAScript MCP
        ↓
  APIs VLibras (governo, gratuitas)
        ↓
  Glossa + validação + roteiro
```

### APIs utilizadas (R$ 0, sem API key)

- `POST traducao2.vlibras.gov.br/translate` — português → glossa
- `GET dicionario2.vlibras.gov.br/bundles` — ~22.500 sinais

**Base oficial:** https://github.com/spbgovbr-vlibras

---

## 9 ferramentas disponíveis

| Ferramenta | Para que serve |
|------------|----------------|
| `translate_and_validate` | **Recomendada** — audita, traduz e valida |
| `text_to_gloss` | Traduz português → glossa |
| `validate_gloss` | Verifica se sinais existem no dicionário |
| `audit_content` | Melhora o texto em PT antes de traduzir |
| `gloss_to_script` | Roteiro com tempos para vídeo/aula |
| `batch_translate` | Vários trechos de uma vez |
| `lookup_sign` | Busca sinal no dicionário |
| `submit_review` | Envia feedback ao VLibras |
| `dictionary_stats` | Estatísticas do dicionário |

### 3 prompts prontos

- **traduzir-para-libras** — fluxo completo
- **tornar-site-acessivel** — audita README ou página web
- **traduzir-slides** — vários trechos em lote

---

## Teste em 30 segundos

```bash
git clone https://github.com/fabricioartur/librascript-mcp.git
cd librascript-mcp
npm install
npm run build
npm run demo
```

Verificar APIs:

```bash
npm run doctor
```

---

## Configuração na sua IA

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

Compatível com: **Cursor**, **Grok Build**, **Claude Desktop**, **Claude Code**, **OpenAI Codex**, **Google Antigravity**.

| Cliente | Onde configurar |
|---------|-----------------|
| Cursor | Configurações → MCP |
| Grok Build | Config MCP do projeto |
| Claude Desktop | `~/.config/claude/claude_desktop_config.json` |
| OpenAI Codex | `~/.codex/config.toml` ou `codex mcp add` |
| Google Antigravity | MCP settings — [docs](https://antigravity.google/docs/mcp) |

---

## Exemplo real

**Entrada:** "Bem-vindo ao nosso curso de programação"

**Glossa:** `BEM_VINDO NOSSO CURSO&ESTUDAR PROGRAMAÇÃO`

**Validação:** 100% dos sinais no dicionário oficial

**Roteiro:** ~8 segundos estimados

---

## Aviso importante

> O VLibras **não substitui um intérprete humano** de LIBRAS.
>
> Fonte: [página oficial do Governo Digital](https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras)

Este MCP é ferramenta de **apoio à produção**. Para materiais publicados oficialmente, envolva um fluente em LIBRAS na revisão final.

---

## Por que este projeto importa

- **Impacto social:** acessibilidade para a comunidade surda brasileira
- **Open source:** MIT + Software Público Brasileiro (VLibras)
- **Democratização:** Node.js + IA compatível = pronto para usar
- **Custo zero:** APIs governamentais gratuitas

---

## Links

- GitHub: https://github.com/fabricioartur/librascript-mcp
- Release v0.3.0: https://github.com/fabricioartur/librascript-mcp/releases/tag/v0.3.0
- VLibras: https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras
- MCP: https://modelcontextprotocol.io

---

## Próximos passos

- [ ] Publicar no npm
- [ ] Registrar no MCP Registry
- [ ] Integração com VLibras Video
- [ ] Regionalismo por UF
- [ ] Validação com comunidade surda