import { pad, stripAnsi, truncate } from "./text.js";

export function box(title, lines, width = 88) {
  const inner = width - 4;
  const content = Array.isArray(lines) ? lines : String(lines).split("\n");
  const padded = ["", ...content, ""];

  const titlePart = title ? ` ${title} ` : "";
  const top = `\u250c${titlePart}${"\u2500".repeat(Math.max(0, inner - stripAnsi(titlePart).length))}\u2510`;
  const bot = `\u2514${"\u2500".repeat(inner)}\u2518`;

  const rows = padded.map(
    (l) => `\u2502 ${pad(truncate(l, inner - 2), inner - 1)}\u2502`,
  );
  return [top, ...rows, bot].join("\n");
}
