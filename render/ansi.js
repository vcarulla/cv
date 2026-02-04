import c from "./colors.js";
import banner from "./banner.js";
import { box } from "./box.js";
import { wrap, compactUrl, cols, sideBySide, stripAnsi, truncate } from "./text.js";
import * as data from "./data.js";

const W = 88;
const INNER = 76;

// --- formatting helpers ---
const bullet = (text, wrapW = INNER) =>
  wrap(text, wrapW).map((l, i) => `${i === 0 ? "  • " : "    "}${l}`);

const labeled = (label, text, wrapW = INNER) => [
  c.bold(`  ${label}:`),
  ...wrap(text, wrapW).map(l => `    ${l}`)
];

const jobHeader = j => `${c.bold(j.company)} — ${j.role} ${c.yellow(`[${j.period}]`)}`;

const entryHeader = (main, sub, date) =>
  `${c.bold(main)}${sub ? ` — ${sub}` : ""} ${date ? c.yellow(`[${date}]`) : ""}`;

// --- section renderers ---
function renderHeader(cv) {
  const { identity: id = {}, contact: ct = {} } = cv;
  const labels = cv.labels?.fields || {};
  const LEFT = 24, RIGHT = W - LEFT - 3;

  const rawBanner = banner().split("\n");
  const bannerW = Math.max(...rawBanner.map(l => stripAnsi(l).length));
  const leftPad = Math.floor((LEFT - bannerW) / 2);
  const bannerLines = rawBanner.map(l => truncate(" ".repeat(leftPad) + c.purple(l), LEFT, false));

  const infoLines = [
    c.bold(`${id.name} — ${id.title}`),
    `${id.location} | ${id.tagline}`,
    "",
    `${c.cyan(`${labels.linkedin || "LinkedIn"}:`)} ${c.purple(compactUrl(ct.linkedin))}`,
    `${c.cyan(`${labels.github || "GitHub"}:`)}   ${c.purple(compactUrl(ct.github))}`,
    `${c.cyan(`${labels.email || "Email"}:`)}    ${c.purple(ct.email || "-")}`,
  ];

  return "\n" + sideBySide(bannerLines, LEFT, infoLines, RIGHT, 3) + "\n\n";
}

function renderJobs(jobs) {
  return jobs.flatMap(j => [
    jobHeader(j),
    ...(j.highlights || []).flatMap(h => bullet(h)),
    ...(j.environment ? labeled("environment", j.environment) : []),
    ...(j.technologies ? labeled("technologies", j.technologies) : []),
    ...(j.tech?.length ? ["  tech:", c.purple(`    ${j.tech.join(" · ")}`)] : []),
    c.dim(" ")
  ]);
}

function renderEducation(cv) {
  const lines = [];
  const ui = cv.labels?.ui || {};

  if (cv.education?.length) {
    lines.push(c.bold(ui.education || "EDUCATION"), c.dim(" "));
    for (const e of cv.education) {
      lines.push(entryHeader(e.institution || e.name, e.program || e.title, e.period || e.date));
      if (e.details) lines.push(...wrap(e.details, 80).map(l => `  ${l}`));
      lines.push(c.dim(" "));
    }
  }

  if (cv.certifications?.length) {
    lines.push(c.bold(ui.certifications || "LICENSES & CERTIFICATIONS"), c.dim(" "));
    for (const cert of cv.certifications) {
      lines.push(entryHeader(cert.issuer || cert.provider, cert.title || cert.name, cert.date || cert.period));
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

  // Split areas into lines of ~70 chars
  const areaLines = [];
  let line = "";
  for (const area of areas) {
    const sep = line ? " · " : "";
    if ((line + sep + area).length > 70) {
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
    ...langs.map(l => `  ${c.bold(l.name.toUpperCase())}  ${l.level}`)
  ];
}

function legend(host, labels, lang) {
  const lg = labels?.legend || {};
  const prefix = lang === "en" ? "" : `/${lang}`;
  const endpoints = [
    ["", lg["/"] || "Full CV"],
    ["/skills", lg["/skills"] || "Tech stack"],
    ["/experience", lg["/experience"] || "Career history"],
    ["/contact", lg["/contact"] || "Get in touch"],
  ];
  return endpoints.map(([path, desc]) =>
    cols(`${c.green("$")} ${c.bold(`curl ${host}${prefix}${path}`)}`, c.cyan(desc))
  );
}

// --- public renderers ---
export function renderHome({ host, lang = "en" }) {
  const cv = data.cv(lang);
  const s = cv.labels?.sections || {};
  const header = renderHeader(cv);
  const whoami = (cv.summary || []).flatMap(s => wrap(s, 80));

  return header + [
    box(c.pink(s.whoami || "$whoami"), whoami, W),
    box(c.pink(s.skills || "$./skills"), renderSkillsCompact(cv), W),
    box(c.pink(s.experience || "$jobs"), renderJobs(cv.experience || []), W),
    box(c.pink(s.education || "$cv | grep education"), renderEducation(cv), W),
    box(c.pink(s.legend || "$help"), legend(host, cv.labels, lang), W),
  ].join("\n\n") + "\n";
}

export function renderHelp({ host, lang = "en" }) {
  const cv = data.cv(lang);
  const lg = cv.labels?.legend || {};
  const ui = cv.labels?.ui || {};
  const prefix = lang === "en" ? "" : `/${lang}`;
  const cmd = path => `${c.green("$")} ${c.bold(`curl ${host}${prefix}${path}`)}`;
  return box(c.pink(cv.labels?.sections?.legend || "$help"), [
    c.bold(ui.availableCommands || "Available commands:"), "",
    cols("help", "Show this help"),
    cols("skills", lg["/skills"] || "Tech stack"),
    cols("experience", lg["/experience"] || "Career history"),
    cols("contact", lg["/contact"] || "Get in touch"), "",
    c.dim(ui.usage || "Usage:"),
    cols(cmd(""), lg["/"] || "Full CV"),
    cols(cmd("/skills"), lg["/skills"] || "Tech stack"),
    cols(cmd("/experience"), lg["/experience"] || "Career history"),
  ], W) + "\n";
}

export function renderSkillsFull({ lang = "en" } = {}) {
  const cv = data.cv(lang);
  const s = cv.labels?.sections || {};
  const skills = data.skillsFull(lang);
  const lines = Object.entries(skills || {}).flatMap(([section, items]) => [
    c.bold(section),
    ...items.map(it => c.dim(`  • ${it}`)),
    c.dim(" ")
  ]);
  return renderHeader(cv) + box(c.pink(s.skills || "$./skills"), lines, W) + "\n";
}

export function renderExperience({ lang = "en" } = {}) {
  const cv = data.cv(lang);
  const s = cv.labels?.sections || {};
  const { experience = [] } = data.experienceFull(lang);
  return renderHeader(cv) + box(c.pink(s.experience || "$jobs"), renderJobs(experience), W) + "\n";
}

export function renderContact({ lang = "en" } = {}) {
  const cv = data.cv(lang);
  const ct = cv.contact || {};
  const fields = cv.labels?.fields || {};
  return renderHeader(cv) + box(c.pink(cv.labels?.ui?.contact || "contact"), [
    cols(c.cyan(fields.email || "Email"), ct.email || "-"),
    cols(c.cyan(fields.phone || "Phone"), ct.phone || "-"),
    cols(c.cyan(fields.linkedin || "LinkedIn"), ct.linkedin || "-"),
    cols(c.cyan(fields.github || "GitHub"), ct.github || "-"),
  ], W) + "\n";
}

export function renderYsap({ lang = "en" } = {}) {
  const cv = data.cv(lang);
  const y = cv.labels?.ysap || {};
  return renderHeader(cv) + box(c.pink(y.title || "YOU SUCK AT PROGRAMMING"), [
    "",
    `${y.inspired || "This project was inspired by Dave Eddy's"} ${c.yellow("ysap.sh")}`,
    "",
    `${y.daveIntro || "Dave is a YouTube and Twitch streamer who created"}`,
    `${c.yellow("You Suck at Programming")} - ${y.daveDesc || "a brilliant series that teaches programming through humor and real-world examples."}`,
    "",
    `${y.spark || "His idea of delivering content via curl was the spark that made this terminal-friendly CV possible."}`,
    "",
    c.bold(`${y.checkOut || "Check out his work:"}`),
    cols(`  ${c.green("$")} ${c.bold("curl ysap.sh")}`, c.cyan(y.originalInspiration || "The original inspiration")),
    cols(`  ${c.purple("twitch.tv/dave_eddy")}`, c.cyan(y.twitchChannel || "Twitch channel")),
    cols(`  ${c.purple("ysap.sh/youtube")}`, c.cyan(y.youtubeChannel || "YouTube channel")),
    cols(`  ${c.purple("course.ysap.sh")}`, c.cyan(y.bashCourse || "Complete Bash Course")),
    cols(`  ${c.purple("daveeddy.com")}`, c.cyan(y.personalSite || "His personal site")),
    "",
    c.cyan(y.thanks || "Thanks Dave for showing us a better way to share our work!"),
    ""
  ], W) + "\n";
}
