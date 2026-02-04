import * as data from "./data.js";

const D = {
  bg: "#282a36",
  fg: "#f8f8f2",
  purple: "#bd93f9",
  pink: "#ff79c6",
  cyan: "#8be9fd",
  green: "#50fa7b",
  yellow: "#f1fa8c",
  orange: "#ffb86c",
  dim: "#6272a4",
  border: "#44475a",
};

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function compactUrl(url) {
  return url ? String(url).replace(/^https?:\/\//, "").replace(/\/$/, "") : "-";
}

function ensureHttps(url) {
  if (!url) return "#";
  return url.startsWith("http") ? url : `https://${url}`;
}

const BANNER = `██╗   ██╗  █████╗
██║   ██║ ██╔═══╝
██║   ██║ ██║
╚██╗ ██╔╝ ██║
 ╚████╔╝   █████╗
  ╚═══╝    ╚════╝`;

function hreflangTags(host, pagePath) {
  const clean = pagePath === "/" ? "" : pagePath;
  return `<link rel="alternate" hreflang="en" href="https://${esc(host)}${clean || "/"}"/>
  <link rel="alternate" hreflang="es" href="https://${esc(host)}/es${clean}"/>
  <link rel="alternate" hreflang="x-default" href="https://${esc(host)}${clean || "/"}"/>`;
}

function shell({ title, description, host, path = "/", lang = "en", pagePath = "/" }, body) {
  const cv = data.cv(lang);
  const prefix = lang === "en" ? "" : `/${lang}`;
  const altPrefix = lang === "en" ? "/es" : "";
  const canonical = `https://${host}${prefix}${pagePath === "/" ? "" : pagePath}`;
  const altLangUrl = `${altPrefix}${pagePath === "/" ? "/" : pagePath}`;
  const desc = description || `${cv.identity.name} — ${cv.identity.title}. ${cv.identity.location}. curl-first CV.`;
  const ui = cv.labels?.ui || {};

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}"/>
  <link rel="canonical" href="${esc(canonical)}"/>
  ${hreflangTags(host, pagePath)}
  <meta name="theme-color" content="${D.bg}"/>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='12' fill='%23282a36'/><text x='50' y='68' font-family='monospace' font-size='48' font-weight='bold' fill='%23bd93f9' text-anchor='middle'>VC</text></svg>"/>

  <meta property="og:type" content="website"/>
  <meta property="og:title" content="${esc(title)}"/>
  <meta property="og:description" content="${esc(desc)}"/>
  <meta property="og:url" content="${esc(canonical)}"/>
  <meta property="og:site_name" content="${esc(host)}"/>

  <meta name="twitter:card" content="summary"/>
  <meta name="twitter:title" content="${esc(title)}"/>
  <meta name="twitter:description" content="${esc(desc)}"/>

  <style>
    :root {
      --bg: #282a36; --fg: #f8f8f2; --purple: #bd93f9;
      --pink: #ff79c6; --cyan: #8be9fd; --green: #50fa7b;
      --yellow: #f1fa8c; --orange: #ffb86c; --dim: #9099b0;
      --border: #44475a;
    }
    [data-theme="light"] {
      --bg: #f8f8f2; --fg: #282a36; --purple: #7c3aed;
      --pink: #be185d; --cyan: #0e7490; --green: #15803d;
      --yellow: #a16207; --orange: #c2410c; --dim: #6b7280;
      --border: #d1d5db;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: var(--bg);
      color: var(--fg);
      font-family: "SF Mono", "Fira Code", "Cascadia Code", Menlo, Consolas, monospace;
      font-size: 14px;
      line-height: 1.5;
      padding: 24px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 40px;
    }
    .wrap { max-width: 740px; width: 100%; }
    .box {
      border: 1px solid var(--border);
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .box-title {
      color: var(--pink);
      padding: 10px 20px;
      border-bottom: 1px solid var(--border);
      font-weight: bold;
    }
    .box-body { padding: 16px 20px; }
    .box-body p { margin: 6px 0; }
    .spacer { height: 12px; }
    .yellow { color: var(--yellow); }
    .cyan { color: var(--cyan); }
    .purple { color: var(--purple); }
    .pink { color: var(--pink); }
    .green { color: var(--green); }
    .orange { color: var(--orange); }
    .dim { color: var(--dim); }
    .bold { font-weight: bold; }
    a { text-decoration: none; transition: opacity 0.2s; }
    a:hover { opacity: 0.8; text-decoration: underline; }
    a.purple { color: var(--purple); }
    a.cyan { color: var(--cyan); }
    .header {
      display: flex;
      gap: 40px;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .banner { color: var(--purple); white-space: pre; font-size: 13px; line-height: 1.2; }
    .info p { margin: 2px 0; }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin: 3px 0;
      padding-left: 16px;
    }
    .row .left { white-space: nowrap; }
    .row .right { text-align: right; white-space: nowrap; }
    ul.bullets { list-style: none; padding: 0; margin: 4px 0; }
    ul.bullets li::before { content: "\\2022 "; color: var(--dim); }
    ul.bullets li { padding-left: 8px; }
    .job { margin-bottom: 16px; }
    .job-header { margin-bottom: 4px; }
    .tech { color: var(--purple); padding-left: 8px; margin-top: 4px; }
    .skills-list { padding-left: 8px; }
    .lang { padding-left: 8px; margin: 2px 0; }
    .cert { margin-bottom: 10px; }
    .skip-link {
      position: absolute;
      top: -100px;
      left: 0;
      background: var(--purple);
      color: var(--bg);
      padding: 8px 16px;
      z-index: 100;
      font-weight: bold;
    }
    .skip-link:focus { top: 0; }
    .float-btns {
      position: fixed;
      top: 16px;
      right: 16px;
      display: flex;
      gap: 8px;
      z-index: 50;
    }
    .float-btns a,
    .float-btns button {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--bg);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: opacity 0.2s;
      text-decoration: none;
    }
    .float-btns a:hover,
    .float-btns button:hover { opacity: 0.8; }
    .float-btns svg { width: 18px; height: 18px; }
    .icon-sun { display: block; }
    .icon-moon { display: none; }
    [data-theme="light"] .icon-sun { display: none; }
    [data-theme="light"] .icon-moon { display: block; }
    @media (max-width: 600px) {
      body { padding: 12px; padding-top: 20px; }
      .header { gap: 16px; }
      .banner { font-size: 10px; }
      .row { flex-direction: column; gap: 2px; padding-left: 8px; }
      .row .right { text-align: left; }
      .row a, .row span { min-height: 48px; display: flex; align-items: center; }
      .float-btns { top: 8px; right: 8px; }
      .float-btns a,
      .float-btns button { width: 36px; height: 36px; }
    }
  </style>
</head>
<body>
<a class="skip-link" href="#main">${esc(ui.skipToContent || "Skip to content")}</a>

<div class="float-btns">
  <a href="${altLangUrl}" aria-label="${lang === "en" ? "Cambiar a espa\\u00f1ol" : "Switch to English"}">
    ${lang === "en"
      ? `<svg viewBox="0 0 20 14" role="img" aria-label="Espa\u00f1ol" xmlns="http://www.w3.org/2000/svg"><title>Espa\u00f1ol</title><rect width="20" height="14" fill="#c60b1e"/><rect y="3.5" width="20" height="7" fill="#ffc400"/></svg>`
      : `<svg viewBox="0 0 20 14" role="img" aria-label="English" xmlns="http://www.w3.org/2000/svg"><title>English</title><rect width="20" height="14" fill="#012169"/><path d="M0 0L20 14M20 0L0 14" stroke="#fff" stroke-width="2.5"/><path d="M0 0L20 14M20 0L0 14" stroke="#c8102e" stroke-width="1.5"/><path d="M10 0v14M0 7h20" stroke="#fff" stroke-width="4"/><path d="M10 0v14M0 7h20" stroke="#c8102e" stroke-width="2.5"/></svg>`
    }
  </a>
  <button id="theme-toggle" type="button" aria-label="${lang === "en" ? "Toggle theme" : "Cambiar tema"}">
    <svg class="icon-sun" viewBox="0 0 20 20" role="img" aria-label="${lang === "en" ? "Day" : "Día"}" xmlns="http://www.w3.org/2000/svg"><title>${lang === "en" ? "Day" : "Día"}</title><circle cx="10" cy="10" r="4" fill="var(--yellow)"/><g stroke="var(--yellow)" stroke-width="1.5" stroke-linecap="round"><line x1="10" y1="1" x2="10" y2="3.5"/><line x1="10" y1="16.5" x2="10" y2="19"/><line x1="1" y1="10" x2="3.5" y2="10"/><line x1="16.5" y1="10" x2="19" y2="10"/><line x1="3.64" y1="3.64" x2="5.4" y2="5.4"/><line x1="14.6" y1="14.6" x2="16.36" y2="16.36"/><line x1="3.64" y1="16.36" x2="5.4" y2="14.6"/><line x1="14.6" y1="5.4" x2="16.36" y2="3.64"/></g></svg>
    <svg class="icon-moon" viewBox="0 0 20 20" role="img" aria-label="${lang === "en" ? "Night" : "Noche"}" xmlns="http://www.w3.org/2000/svg"><title>${lang === "en" ? "Night" : "Noche"}</title><path d="M15 11a7 7 0 01-9.8-6.4A6 6 0 004 10a6 6 0 0012 0c0-.34-.03-.67-.08-1z" fill="var(--yellow)"/></svg>
  </button>
</div>

<main id="main" class="wrap" role="main">
${body}
</main>
<script>
(function(){
  var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme:light)').matches?'light':'dark');
  document.documentElement.dataset.theme=t;
  document.getElementById('theme-toggle').addEventListener('click',function(){
    t=t==='dark'?'light':'dark';
    document.documentElement.dataset.theme=t;
    localStorage.setItem('theme',t);
  });
})();
</script>
</body>
</html>`;
}

function renderHeaderHtml(cv) {
  const { identity: id = {}, contact: ct = {} } = cv;
  const fields = cv.labels?.fields || {};
  return `
  <header class="header" role="banner">
    <div class="banner" aria-hidden="true">${esc(BANNER)}</div>
    <div class="info">
      <h1 class="bold" style="font-size:inherit">${esc(id.name)} — ${esc(id.title)}</h1>
      <p>${esc(id.location)} | ${esc(id.tagline)}</p>
      <div class="spacer"></div>
      <p><span class="cyan">${esc(fields.linkedin || "LinkedIn")}:</span> <a class="purple" href="${esc(ct.linkedin)}" target="_blank" rel="noopener">${esc(compactUrl(ct.linkedin))}</a></p>
      <p><span class="cyan">${esc(fields.github || "GitHub")}:</span>   <a class="purple" href="${esc(ct.github)}" target="_blank" rel="noopener">${esc(compactUrl(ct.github))}</a></p>
      <p><span class="cyan">${esc(fields.email || "Email")}:</span>    <span class="purple">${esc(ct.email || "-")}</span></p>
    </div>
  </header>`;
}

function renderJobsHtml(jobs) {
  return jobs.map(j => `
    <div class="job">
      <div class="job-header">
        <span class="bold">${esc(j.company)}</span> — ${esc(j.role)} <span class="yellow">[${esc(j.period)}]</span>
      </div>
      <ul class="bullets">
        ${(j.highlights || []).map(h => `<li>${esc(h)}</li>`).join("\n        ")}
      </ul>
      ${j.environment ? `<p class="dim" style="padding-left:8px"><span class="bold">environment:</span> ${esc(j.environment)}</p>` : ""}
      ${j.technologies ? `<p class="dim" style="padding-left:8px"><span class="bold">technologies:</span> ${esc(j.technologies)}</p>` : ""}
      ${j.tech?.length ? `<p class="tech">${j.tech.map(esc).join(" · ")}</p>` : ""}
    </div>`).join("\n");
}

function legendHtml(host, lang) {
  const cv = data.cv(lang);
  const lg = cv.labels?.legend || {};
  const s = cv.labels?.sections || {};
  const ui = cv.labels?.ui || {};
  const prefix = lang === "en" ? "" : `/${lang}`;
  const items = [
    ["/", lg["/"] || "Full CV"],
    ["/skills", lg["/skills"] || "Tech stack"],
    ["/experience", lg["/experience"] || "Career history"],
    ["/contact", lg["/contact"] || "Get in touch"],
    ["/json", lg["/json"] || "JSON output"],
  ];
  return `
  <nav class="box" role="navigation" aria-label="${esc(ui.siteNavigation || "Site navigation")}">
    <div class="box-title">${esc(s.legend || "$help")}</div>
    <div class="box-body">
      ${items.map(([path, desc]) => `
      <div class="row" style="padding-left:0">
        <a class="left" href="${prefix}${path}" style="color:inherit">
          <span class="green">$</span> <span class="bold">curl ${esc(host)}${prefix}${path === "/" ? "" : path}</span>
        </a>
        <a class="cyan right" href="${prefix}${path}">${esc(desc)}</a>
      </div>`).join("\n")}
    </div>
  </nav>`;
}

export function htmlHome(host, lang = "en") {
  const cv = data.cv(lang);
  const s = cv.labels?.sections || {};
  const ui = cv.labels?.ui || {};
  const descs = cv.labels?.descriptions || {};
  const { experience = [] } = cv;

  return shell({ title: `${cv.identity.name} — ${cv.identity.title}`, host, pagePath: "/", lang, description: descs.home }, `
  ${renderHeaderHtml(cv)}

  <div class="box">
    <div class="box-title">${esc(s.whoami || "$whoami")}</div>
    <div class="box-body">
      ${(cv.summary || []).map(s => s === "" ? '<div class="spacer"></div>' : `<p>${esc(s)}</p>`).join("\n      ")}
    </div>
  </div>

  <div class="box">
    <div class="box-title">${esc(s.skills || "$./skills")}</div>
    <div class="box-body">
      <p class="purple bold">${esc(ui.areas || "AREAS")}</p>
      <p class="skills-list">${(cv.skills?.areas || []).map(esc).join(" · ")}</p>
      <div class="spacer"></div>
      <p class="purple bold">${esc(ui.languages || "LANGUAGES")}</p>
      ${(cv.languages || []).map(l =>
        `<p class="lang"><span class="bold">${esc(l.name.toUpperCase())}</span>  ${esc(l.level)}</p>`
      ).join("\n      ")}
    </div>
  </div>

  <div class="box">
    <div class="box-title">${esc(s.experience || "$jobs")}</div>
    <div class="box-body">
      ${renderJobsHtml(experience)}
    </div>
  </div>

  <div class="box">
    <div class="box-title">${esc(s.education || "$cv | grep education")}</div>
    <div class="box-body">
      <p class="bold">${esc(ui.education || "EDUCATION")}</p>
      <div class="spacer"></div>
      ${(cv.education || []).map(e => `
      <div class="cert">
        <p><span class="bold">${esc(e.institution || e.name)}</span> — ${esc(e.program || e.title)} <span class="yellow">[${esc(e.period || e.date)}]</span></p>
        ${e.details ? `<p style="padding-left:8px">${esc(e.details)}</p>` : ""}
      </div>`).join("\n")}

      <p class="bold">${esc(ui.certifications || "LICENSES & CERTIFICATIONS")}</p>
      <div class="spacer"></div>
      ${(cv.certifications || []).map(c => `
      <div class="cert">
        <p><span class="bold">${esc(c.issuer || c.provider)}</span> — ${esc(c.title || c.name)} <span class="yellow">[${esc(c.date || c.period)}]</span></p>
        ${c.url ? `<p style="padding-left:8px"><a class="purple" href="${esc(ensureHttps(c.url))}" target="_blank">${esc(compactUrl(c.url))}</a></p>` : ""}
      </div>`).join("\n")}
    </div>
  </div>

  ${legendHtml(host, lang)}
  `);
}

export function htmlSkills(host, lang = "en") {
  const cv = data.cv(lang);
  const s = cv.labels?.sections || {};
  const descs = cv.labels?.descriptions || {};
  const skills = data.skillsFull(lang);

  return shell({ title: `Skills — ${host}`, host, pagePath: "/skills", lang, description: descs.skills }, `
  ${renderHeaderHtml(cv)}

  <div class="box">
    <div class="box-title">${esc(s.skills || "$./skills")}</div>
    <div class="box-body">
      ${Object.entries(skills || {}).map(([section, items]) => `
      <p class="bold">${esc(section)}</p>
      <ul class="bullets">
        ${items.map(it => `<li class="dim">${esc(it)}</li>`).join("\n        ")}
      </ul>
      <div class="spacer"></div>`).join("\n")}
    </div>
  </div>

  ${legendHtml(host, lang)}
  `);
}

export function htmlExperience(host, lang = "en") {
  const cv = data.cv(lang);
  const s = cv.labels?.sections || {};
  const descs = cv.labels?.descriptions || {};
  const { experience = [] } = data.experienceFull(lang);

  return shell({ title: `Experience — ${host}`, host, pagePath: "/experience", lang, description: descs.experience }, `
  ${renderHeaderHtml(cv)}

  <div class="box">
    <div class="box-title">${esc(s.experience || "$jobs")}</div>
    <div class="box-body">
      ${renderJobsHtml(experience)}
    </div>
  </div>

  ${legendHtml(host, lang)}
  `);
}

export function htmlContact(host, lang = "en") {
  const cv = data.cv(lang);
  const ct = cv.contact || {};
  const fields = cv.labels?.fields || {};
  const descs = cv.labels?.descriptions || {};

  return shell({ title: `Contact — ${host}`, host, pagePath: "/contact", lang, description: descs.contact }, `
  ${renderHeaderHtml(cv)}

  <div class="box">
    <div class="box-title">${esc(cv.labels?.ui?.contact || "contact")}</div>
    <div class="box-body">
      <div class="row" style="padding-left:0">
        <span class="cyan left">${esc(fields.email || "Email")}</span>
        <span class="right">${esc(ct.email || "-")}</span>
      </div>
      <div class="row" style="padding-left:0">
        <span class="cyan left">${esc(fields.linkedin || "LinkedIn")}</span>
        <a class="purple right" href="${esc(ct.linkedin)}" target="_blank">${esc(compactUrl(ct.linkedin))}</a>
      </div>
      <div class="row" style="padding-left:0">
        <span class="cyan left">${esc(fields.github || "GitHub")}</span>
        <a class="purple right" href="${esc(ct.github)}" target="_blank">${esc(compactUrl(ct.github))}</a>
      </div>
    </div>
  </div>

  ${legendHtml(host, lang)}
  `);
}

export function htmlYsap(host, lang = "en") {
  const cv = data.cv(lang);
  const y = cv.labels?.ysap || {};
  const descs = cv.labels?.descriptions || {};

  return shell({ title: `You Suck at Programming — ${host}`, host, pagePath: "/ysap", lang, description: descs.ysap }, `
  <div class="box">
    <div class="box-title">${esc(y.title || "YOU SUCK AT PROGRAMMING")}</div>
    <div class="box-body">
      <p>${esc(y.inspired || "This project was inspired by Dave Eddy's")} <span class="yellow">ysap.sh</span></p>

      <div class="spacer"></div>

      <p>${esc(y.daveIntro || "Dave is a YouTube and Twitch streamer who created")}
      <span class="yellow">You Suck at Programming</span> - ${esc(y.daveDesc || "a brilliant series that teaches programming through humor and real-world examples.")}</p>

      <p>${esc(y.spark || "His idea of delivering content via curl was the spark that made this terminal-friendly CV possible.")}</p>

      <div class="spacer"></div>

      <p class="bold">${esc(y.checkOut || "Check out his work:")}</p>
      <div class="row">
        <span class="left"><span class="green">$</span> <span class="bold">curl ysap.sh</span></span>
        <a href="https://ysap.sh" class="cyan right" target="_blank">${esc(y.originalInspiration || "The original inspiration")}</a>
      </div>
      <div class="row">
        <a href="https://www.twitch.tv/dave_eddy" class="purple left" target="_blank">twitch.tv/dave_eddy</a>
        <a href="https://www.twitch.tv/dave_eddy" class="cyan right" target="_blank">${esc(y.twitchChannel || "Twitch channel")}</a>
      </div>
      <div class="row">
        <a href="https://ysap.sh/youtube" class="purple left" target="_blank">ysap.sh/youtube</a>
        <a href="https://ysap.sh/youtube" class="cyan right" target="_blank">${esc(y.youtubeChannel || "YouTube channel")}</a>
      </div>
      <div class="row">
        <a href="https://course.ysap.sh" class="purple left" target="_blank">course.ysap.sh</a>
        <a href="https://course.ysap.sh" class="cyan right" target="_blank">${esc(y.bashCourse || "Complete Bash Course")}</a>
      </div>
      <div class="row">
        <a href="https://daveeddy.com" class="purple left" target="_blank">daveeddy.com</a>
        <a href="https://daveeddy.com" class="cyan right" target="_blank">${esc(y.personalSite || "His personal site")}</a>
      </div>

      <div class="spacer"></div>

      <p class="cyan">${esc(y.thanks || "Thanks Dave for showing us a better way to share our work!")}</p>
    </div>
  </div>`);
}
