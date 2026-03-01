import banner from "../banner.js";
import { compactUrl, wrap } from "../text.js";
import { box } from "./box.js";
import c from "./colors.js";
import { BOX_W, HEADER_GAP, HEADER_LEFT, TEXT_W, WRAP_W } from "./layout.js";
import { cols, sideBySide, stripAnsi, truncate } from "./text.js";
import * as data from "../data.js";

// --- formatting helpers ---
const bullet = (text, wrapW = WRAP_W) =>
  wrap(text, wrapW).map((l, i) => `${i === 0 ? "  • " : "    "}${l}`);

const techLines = (text) =>
  text ? ["", ...wrap(text, WRAP_W).map((l) => c.purple(`  ${l}`))] : [];

const jobHeader = (j) =>
  `${c.bold(j.company)} — ${j.role} ${c.yellow(`[${j.period}]`)}`;

const entryHeader = (main, sub, date) =>
  `${c.bold(main)}${sub ? ` — ${sub}` : ""} ${date ? c.yellow(`[${date}]`) : ""}`;

// --- section renderers ---
function renderHeader(cv) {
  const { identity: id = {}, contact: ct = {} } = cv;
  const labels = cv.labels?.fields || {};
  const RIGHT = BOX_W - HEADER_LEFT - HEADER_GAP;

  const rawBanner = banner().split("\n");
  const bannerW = Math.max(...rawBanner.map((l) => stripAnsi(l).length));
  const leftPad = Math.floor((HEADER_LEFT - bannerW) / 2);
  const bannerLines = rawBanner.map((l) =>
    truncate(" ".repeat(leftPad) + c.purple(l), HEADER_LEFT, false),
  );

  const infoLines = [
    c.bold(`${id.name} — ${id.title}`),
    `${id.location} | ${id.tagline}`,
    "",
    `${c.cyan(`${labels.linkedin || "LinkedIn"}:`)} ${c.purple(compactUrl(ct.linkedin))}`,
    `${c.cyan(`${labels.github || "GitHub"}:`)}   ${c.purple(compactUrl(ct.github))}`,
    `${c.cyan(`${labels.email || "Email"}:`)}    ${c.purple(ct.email || "-")}`,
  ];

  return "\n" + sideBySide(bannerLines, HEADER_LEFT, infoLines, RIGHT, HEADER_GAP) + "\n\n";
}

function renderJobs(jobs) {
  return jobs.flatMap((j) => [
    jobHeader(j),
    ...(j.highlights || []).flatMap((h) => bullet(h)),
    ...techLines(j.environment),
    ...techLines(j.technologies),
    ...techLines(j.tech?.join(" · ")),
    c.dim(" "),
  ]);
}

function renderEducation(cv) {
  const lines = [];
  const ui = cv.labels?.ui || {};

  if (cv.education?.length) {
    lines.push(c.bold(ui.education || "EDUCATION"), c.dim(" "));
    for (const e of cv.education) {
      lines.push(
        entryHeader(
          e.institution || e.name,
          e.program || e.title,
          e.period || e.date,
        ),
      );
      if (e.details) lines.push(...wrap(e.details, TEXT_W - 2).map((l) => `  ${l}`));
      lines.push(c.dim(" "));
    }
  }

  if (cv.certifications?.length) {
    lines.push(
      c.bold(ui.certifications || "LICENSES & CERTIFICATIONS"),
      c.dim(" "),
    );
    for (const cert of cv.certifications) {
      lines.push(
        entryHeader(
          cert.issuer || cert.provider,
          cert.title || cert.name,
          cert.date || cert.period,
        ),
      );
      if (cert.url) lines.push(`  ${compactUrl(cert.url)}`);
      lines.push(c.dim(" "));
    }
  }

  return lines;
}

function renderSkillsCompact(cv) {
  const areas = cv.skills?.areas || [];
  const langs = cv.languages || [];
  const ui = cv.labels?.ui || {};

  const areaLines = [];
  let line = "";
  const maxLineW = TEXT_W - 12; // 70 - leaves room for indent + separators
  for (const area of areas) {
    const sep = line ? " · " : "";
    if ((line + sep + area).length > maxLineW) {
      areaLines.push(`  ${line}`);
      line = area;
    } else {
      line += sep + area;
    }
  }
  if (line) areaLines.push(`  ${line}`);

  return [
    c.purple(ui.areas || "AREAS"),
    ...areaLines,
    "",
    c.purple(ui.languages || "LANGUAGES"),
    ...langs.map((l) => `  ${c.bold(l.name.toUpperCase())}  ${l.level}`),
  ];
}

const ENDPOINTS = [
  ["/", "Home"],
  ["/skills", "Full tech stack"],
  ["/experience", "Full career history"],
  ["/contact", "Get in touch"],
];

const curlCmd = (host, path) =>
  `${c.green("$")} ${c.bold(`curl -L ${host}${path}`)}`;

function legendLines(host, labels, lang, { excludePath = null, showUsage = false } = {}) {
  const lg = labels?.legend || {};
  const ui = labels?.ui || {};
  const prefix = `/${lang}`;

  const endpoints = ENDPOINTS
    .filter(([path]) => path !== excludePath)
    .map(([path, fallback]) => [path, lg[path] || fallback]);

  const switchPath = lang === "en" ? "/es" : "/en";
  const switchLabel =
    lg.switchLang || (lang === "en" ? "Versión en español" : "English version");

  return [
    ...(showUsage ? [c.bold(ui.usage || "Usage:"), ""] : []),
    ...endpoints.map(([path, desc]) =>
      cols(curlCmd(host, `${prefix}${path === "/" ? "" : path}`), c.cyan(desc)),
    ),
    "",
    cols(curlCmd(host, switchPath), c.cyan(switchLabel)),
  ];
}

function legend(host, labels, lang, currentPath = "/") {
  return legendLines(host, labels, lang, { excludePath: currentPath });
}

const page = (cv, boxes, host, lang, currentPath) =>
  renderHeader(cv) +
  [...boxes, box(c.pink(cv.labels?.sections?.legend || "$help"), legend(host, cv.labels, lang, currentPath), BOX_W)].join("\n\n") +
  "\n";

// --- public renderers ---
export function renderHome({ host, lang = "en" }) {
  const cv = data.cv(lang);
  const s = cv.labels?.sections || {};
  const summary = cv.summary || [];
  const whoami = summary.flatMap((p, i) => {
    if (p === "") return [""];
    const lines = wrap(p, TEXT_W);
    return i === 0 ? [...lines.map((l) => c.purple(l)), ""] : lines;
  });

  return page(cv, [
    box(c.pink(s.whoami || "$whoami"), whoami, BOX_W),
    box(c.pink(s.skills || "$./skills"), renderSkillsCompact(cv), BOX_W),
    box(c.pink(s.experience || "$jobs"), renderJobs(cv.experience || []), BOX_W),
    box(c.pink(s.education || "$cv | grep education"), renderEducation(cv), BOX_W),
  ], host, lang, "/");
}

export function renderHelp({ host, lang = "en" }) {
  const cv = data.cv(lang);
  return (
    box(
      c.pink(cv.labels?.sections?.legend || "$help"),
      legendLines(host, cv.labels, lang, { showUsage: true }),
      BOX_W,
    ) + "\n"
  );
}

export function renderSkillsFull({ host, lang = "en" } = {}) {
  const cv = data.cv(lang);
  const s = cv.labels?.sections || {};
  const skills = data.skillsFull(lang);
  const lines = Object.entries(skills || {}).flatMap(([section, items]) => [
    c.bold(section),
    ...items.map((it) => {
      const match = it.match(/^([^(]+)(\(.+\))$/);
      return match ? `  • ${match[1]}${c.dim(match[2])}` : `  • ${it}`;
    }),
    c.dim(" "),
  ]);
  return page(cv, [
    box(c.pink(s.skillsFull || "$ echo ${SKILLS[@]}"), lines, BOX_W),
  ], host, lang, "/skills");
}

export function renderExperience({ host, lang = "en" } = {}) {
  const cv = data.cv(lang);
  const s = cv.labels?.sections || {};
  const { experience = [] } = data.experienceFull(lang);
  return page(cv, [
    box(c.pink(s.experienceFull || "$jobs --all"), renderJobs(experience), BOX_W),
  ], host, lang, "/experience");
}

export function renderContact({ host, lang = "en" } = {}) {
  const cv = data.cv(lang);
  const ct = cv.contact || {};
  const fields = cv.labels?.fields || {};
  return page(cv, [
    box(
      c.pink(cv.labels?.ui?.contact || "contact"),
      [
        cols(c.cyan(fields.email || "Email"), ct.email || "-"),
        cols(c.cyan(fields.linkedin || "LinkedIn"), ct.linkedin || "-"),
        cols(c.cyan(fields.github || "GitHub"), ct.github || "-"),
      ],
      BOX_W,
    ),
  ], host, lang, "/contact");
}

export function renderYsap({ host, lang = "en" } = {}) {
  const cv = data.cv(lang);
  const y = data.ysap(lang);
  const [inspired, daveIntro, daveDesc, spark] = y.intro;

  const linkLines = y.links.map((link) =>
    link.cmd
      ? cols(`  ${c.green("$")} ${c.bold(link.cmd)}`, c.cyan(link.label))
      : cols(`  ${c.purple(link.display)}`, c.cyan(link.label))
  );

  return page(cv, [
    box(
      c.pink(y.title),
      [
        "",
        `${inspired} ${c.yellow("ysap.sh")}`,
        "",
        daveIntro,
        `${c.yellow(y.programName)} - ${daveDesc}`,
        "",
        spark,
        "",
        c.bold(y.checkOut),
        ...linkLines,
        "",
        c.cyan(y.thanks),
        "",
      ],
      BOX_W,
    ),
  ], host, lang, "/ysap");
}

export function render404({ host, lang = "en" } = {}) {
  const cv = data.cv(lang);
  const contentW = TEXT_W;
  const ctr = (line, w) => " ".repeat(Math.max(0, Math.floor((contentW - w) / 2))) + line;
  const msg = lang === "en" ? "404 NOT FOUND" : "404 PAGINA NO ENCONTRADA";
  const cowLines = [
    `${c.dim("\\|/")}          ${c.bold("(__)")}`,
    `     ${c.dim("`\\------")}${c.bold("(oo)")}`,
    `       ${c.dim("||")}    ${c.bold("(__)")}`,
    `       ${c.dim("||w--||")}     ${c.dim("\\|/")}`,
    `   ${c.dim("\\|/")}`,
  ];
  const cowW = Math.max(...cowLines.map((l) => stripAnsi(l).length));
  const cow = ["", ...cowLines.map((l) => ctr(l, cowW)), "", ctr(c.bold(msg), stripAnsi(msg).length), ""];
  return page(cv, [box(c.pink("404"), cow, BOX_W)], host, lang);
}
