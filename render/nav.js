// Canonical navigation endpoints, shared by the CLI and Web renderers so the two
// stay in parity (see CLAUDE.md). Each entry is [path, fallbackLabel].
export const ENDPOINTS = [
  ["/", "Home"],
  ["/skills", "Full tech stack"],
  ["/experience", "Full career history"],
  ["/contact", "Get in touch"],
];

// Resolves endpoint labels against the CV's `labels.legend`, optionally hiding the
// current page. Returns [path, label] pairs.
export function navItems(legendLabels = {}, { excludePath = null } = {}) {
  return ENDPOINTS.filter(([path]) => path !== excludePath).map(
    ([path, fallback]) => [path, legendLabels[path] || fallback],
  );
}

// The "switch language" target for the given current language.
export function switchLang(lang, legendLabels = {}) {
  return {
    path: lang === "en" ? "/es" : "/en",
    label:
      legendLabels.switchLang ||
      (lang === "en" ? "Versión en español" : "English version"),
  };
}
