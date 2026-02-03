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
  const LEFT = 24, RIGHT = W - LEFT - 3;

  const rawBanner = banner().split("\n");
  const bannerW = Math.max(...rawBanner.map(l => stripAnsi(l).length));
  const leftPad = Math.floor((LEFT - bannerW) / 2);
  const bannerLines = rawBanner.map(l => truncate(" ".repeat(leftPad) + c.purple(l), LEFT, false));

  const infoLines = [
    c.bold(`${id.name} — ${id.title}`),
    `${id.location} | ${id.tagline}`,
    "",
    `${c.cyan("LinkedIn:")} ${c.purple(compactUrl(ct.linkedin))}`,
    `${c.cyan("GitHub:")}   ${c.purple(compactUrl(ct.github))}`,
    `${c.cyan("Email:")}    ${c.purple(ct.email || "-")}`,
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

  if (cv.education?.length) {
    lines.push(c.bold("EDUCATION"), c.dim(" "));
    for (const e of cv.education) {
      lines.push(entryHeader(e.institution || e.name, e.program || e.title, e.period || e.date));
      if (e.details) lines.push(...wrap(e.details, 80).map(l => `  ${l}`));
      lines.push(c.dim(" "));
    }
  }

  if (cv.certifications?.length) {
    lines.push(c.bold("LICENSES & CERTIFICATIONS"), c.dim(" "));
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
    c.purple("AREAS"),
    ...areaLines,
    "",
    c.purple("LANGUAGES"),
    ...langs.map(l => `  ${c.bold(l.name.toUpperCase())}  ${l.level}`)
  ];
}

function legend(host) {
  const endpoints = [
    ["", "Get main CV (ANSI)"],
    ["/skills", "Full skills breakdown"],
    ["/experience", "Work history"],
    ["/json", "Machine-readable CV"],
  ];
  return endpoints.map(([path, desc]) =>
    cols(`${c.green("$")} ${c.bold(`curl ${host}${path}`)}`, c.cyan(desc))
  );
}

// --- public renderers ---
export function renderHome({ host }) {
  const cv = data.cv();
  const header = renderHeader(cv);
  const whoami = (cv.summary || []).flatMap(s => wrap(s, 80));

  return header + [
    box(c.pink("whoami"), whoami, W),
    box(c.pink("skills"), renderSkillsCompact(cv), W),
    box(c.pink("experience --lasts"), renderJobs(cv.experience || []), W),
    box(c.pink("education"), renderEducation(cv), W),
    box(c.pink("legend"), legend(host), W),
  ].join("\n\n") + "\n";
}

export function renderHelp({ host }) {
  const cmd = path => `${c.green("$")} ${c.bold(`curl ${host}${path}`)}`;
  return box(c.pink("help"), [
    c.bold("Available commands:"), "",
    cols("help", "Show this help"),
    cols("skills", "Full skills breakdown"),
    cols("experience", "Work history"),
    cols("contact", "Contact info"),
    cols("json", "Machine-readable CV"), "",
    c.dim("Usage:"),
    cols(cmd(""), "main output"),
    cols(cmd("/skills"), "full skills"),
    cols(cmd("/experience"), "full experience"),
    cols(cmd("/json"), "JSON (pretty)"),
  ], W) + "\n";
}

export function renderSkillsFull() {
  const cv = data.cv();
  const skills = data.skillsFull();
  const lines = Object.entries(skills || {}).flatMap(([section, items]) => [
    c.bold(section),
    ...items.map(it => c.dim(`  • ${it}`)),
    c.dim(" ")
  ]);
  return renderHeader(cv) + box(c.pink("skills"), lines, W) + "\n";
}

export function renderExperience() {
  const cv = data.cv();
  const { experience = [] } = data.experienceFull();
  return renderHeader(cv) + box(c.pink("experience"), renderJobs(experience), W) + "\n";
}

export function renderContact() {
  const cv = data.cv();
  const ct = cv.contact || {};
  return renderHeader(cv) + box(c.pink("contact"), [
    cols(c.cyan("Email"), ct.email || "-"),
    cols(c.cyan("Phone"), ct.phone || "-"),
    cols(c.cyan("LinkedIn"), ct.linkedin || "-"),
    cols(c.cyan("GitHub"), ct.github || "-"),
  ], W) + "\n";
}

export function renderYsap() {
  const cv = data.cv();
  return renderHeader(cv) + box(c.pink("YOU SUCK AT PROGRAMMING"), [
    "",
    `This project was inspired by Dave Eddy's ${c.yellow("ysap.sh")}`,
    "",
    `Dave is a YouTube and Twitch streamer who created`,
    `${c.yellow("You Suck at Programming")} - a brilliant series that teaches`,
    `programming through humor and real-world examples.`,
    "",
    `His idea of delivering content via curl was the spark`,
    `that made this terminal-friendly CV possible.`,
    "",
    c.bold("Check out his work:"),
    cols(`  ${c.green("$")} ${c.bold("curl ysap.sh")}`, c.cyan("The original inspiration")),
    cols(`  ${c.purple("twitch.tv/dave_eddy")}`, c.cyan("Twitch channel")),
    cols(`  ${c.purple("ysap.sh/youtube")}`, c.cyan("YouTube channel")),
    cols(`  ${c.purple("course.ysap.sh")}`, c.cyan("Complete Bash Course")),
    cols(`  ${c.purple("daveeddy.com")}`, c.cyan("His personal site")),
    "",
    c.cyan("Thanks Dave for showing us a better way to share our work!"),
    ""
  ], W) + "\n";
}
