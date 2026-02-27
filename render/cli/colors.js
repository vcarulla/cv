// Dracula-inspired palette (256 colors)
// https://draculatheme.com/contribute
const RESET = "\x1b[0m";
const fg = (code, s) => `\x1b[38;5;${code}m${s}${RESET}`;

export default {
  RESET,
  // styles
  dim: (s) => `\x1b[2m${s}${RESET}`,
  bold: (s) => `\x1b[1m${s}${RESET}`,
  // dracula palette
  purple: (s) => fg(141, s), // #bd93f9 - accent, links
  pink: (s) => fg(212, s), // #ff79c6 - titles
  cyan: (s) => fg(117, s), // #8be9fd - labels
  green: (s) => fg(84, s), // #50fa7b - prompt $
  yellow: (s) => fg(228, s), // #f1fa8c - dates
  orange: (s) => fg(215, s), // #ffb86c - alternative accent
};
