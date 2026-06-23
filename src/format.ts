export function toolResult(summary: string, data: Record<string, unknown>) {
  return {
    content: [
      {
        type: "text" as const,
        text: [summary, "", "---", "", "```json", JSON.stringify(data, null, 2), "```"].join("\n"),
      },
    ],
  };
}