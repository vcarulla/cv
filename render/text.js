// ANSI helpers
export function stripAnsi(s) {
  return String(s).replace(/\x1b\[[0-9;]*m/g, "");
}

export function truncate(input, max, ellipsis = true) {
  const s = String(input);
  const visible = stripAnsi(s).length;
  if (visible <= max) return s;

  const target = ellipsis ? Math.max(0, max - 3) : max;
  let out = "",
    count = 0,
    i = 0;

  while (i < s.length && count < target) {
    if (s[i] === "\x1b" && s[i + 1] === "[") {
      const m = s.slice(i).match(/^\x1b\[[0-9;]*m/);
      if (m) {
        out += m[0];
        i += m[0].length;
        continue;
      }
    }
    out += s[i];
    count++;
    i++;
  }

  return out + (ellipsis ? "..." : "") + "\x1b[0m";
}

export function pad(input, width) {
  const s = String(input).includes("\x1b[0m") ? input : input + "\x1b[0m";
  return s + " ".repeat(Math.max(0, width - stripAnsi(s).length));
}

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

export function cols(left, right, leftW = 38, gap = 2) {
  return pad(left, leftW) + " ".repeat(gap) + String(right);
}

export function sideBySide(leftLines, leftW, rightLines, rightW, gap = 6) {
  const height = Math.max(leftLines.length, rightLines.length);
  const L = [...leftLines],
    R = [...rightLines];
  while (L.length < height) L.push("");
  while (R.length < height) R.push("");

  return L.map((l, i) => {
    const lFit = truncate(l, leftW, false);
    const rFit = truncate(R[i], rightW, true);
    return pad(lFit, leftW) + " ".repeat(gap) + rFit;
  }).join("\n");
}
