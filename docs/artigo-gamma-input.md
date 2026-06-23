# LIBRAScript MCP

## Conectando qualquer IA às APIs oficiais do VLibras

---

## O Problema

- 2 milhões+ de brasileiros usam LIBRAS como língua principal
- Conteúdo digital é produzido quase só em português escrito
- VLibras traduz para quem **consome** — não para quem **cria** com IA

---

## A Solução

**LIBRAScript MCP** — servidor open source v0.3.0

- Funciona com Cursor, Grok, Claude e qualquer cliente MCP
- APIs gratuitas do Governo Digital (VLibras)
- **R$ 0** — sem API key

github.com/fabricioartur/librascript-mcp

---

## Como Funciona

1. Você pede à IA: *"Traduza para LIBRAS"*
2. A IA chama o LIBRAScript MCP
3. MCP consulta a API federal `traducao2.vlibras.gov.br`
4. Retorna glossa + validação + roteiro

---

## 9 Ferramentas

| Tool | Uso |
|------|-----|
| translate_and_validate | Atalho principal |
| text_to_gloss | Só traduzir |
| validate_gloss | Conferir qualidade |
| audit_content | Melhorar texto antes |
| gloss_to_script | Roteiro para vídeo |
| batch_translate | Slides e seções |
| lookup_sign | Buscar no dicionário |
| submit_review | Feedback ao VLibras |
| dictionary_stats | 22.500+ sinais |

---

## Demo em 30 Segundos

```
npm run demo
npm run doctor
```

**Exemplo:**
- Entrada: "Bem-vindo ao nosso curso de programação"
- Glossa: BEM_VINDO NOSSO CURSO&ESTUDAR PROGRAMAÇÃO
- Validação: **100%**

---

## Configuração

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

---

## Aviso

O VLibras **não substitui intérprete humano**.

Revisão por fluente em LIBRAS sempre recomendada.

---

## Impacto

- Acessibilidade digital real
- Open source (MIT)
- 120 mil+ sites já usam VLibras
- Qualquer IA com MCP pode adotar

---

## Links

- github.com/fabricioartur/librascript-mcp
- gov.br/governodigital/vlibras
- modelcontextprotocol.io