// Generic text utilities (shared between CLI and Web)

export function wrap(text, width) {
  const words = String(text || "")
    .split(/\s+/)
    .filter(Boolean);
  const lines = [];
  let line = "";

  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (candidate.length <= width) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function compactUrl(url) {
  return url
    ? String(url)
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "")
    : "-";
}
