import { parseGloss } from "./gloss.js";

export interface ScriptLine {
  index: number;
  sign: string;
  startSeconds: number;
  durationSeconds: number;
  notes: string;
}

export interface VideoScript {
  gloss: string;
  estimatedDurationSeconds: number;
  lines: ScriptLine[];
  markdown: string;
}

const SECONDS_PER_SIGN = 2;
const PUNCTUATION_PAUSE_SECONDS = 0.5;

export function glossToScript(gloss: string, title = "Roteiro LIBRAS"): VideoScript {
  const tokens = parseGloss(gloss);
  const lines: ScriptLine[] = [];
  let cursor = 0;

  tokens.forEach((token, index) => {
    const duration = token.isPunctuation ? PUNCTUATION_PAUSE_SECONDS : SECONDS_PER_SIGN;
    const notes = token.isPunctuation
      ? "Pausa de pontuação"
      : token.raw.includes("&")
        ? "Sinal composto (sequência de movimentos)"
        : "Plano médio no avatar";

    lines.push({
      index: index + 1,
      sign: token.raw,
      startSeconds: cursor,
      durationSeconds: duration,
      notes,
    });

    cursor += duration;
  });

  const markdown = [
    `# ${title}`,
    ``,
    `Duração estimada: ${formatTime(cursor)}`,
    ``,
    `| # | Sinal | Início | Duração | Notas |`,
    `|---|-------|--------|---------|-------|`,
    ...lines.map(
      (line) =>
        `| ${line.index} | ${line.sign} | ${formatTime(line.startSeconds)} | ${line.durationSeconds}s | ${line.notes} |`,
    ),
  ].join("\n");

  return {
    gloss,
    estimatedDurationSeconds: cursor,
    lines,
    markdown,
  };
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}