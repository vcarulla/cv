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

function shell(title, body) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${esc(title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: ${D.bg};
      color: ${D.fg};
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
      border: 1px solid ${D.border};
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .box-title {
      color: ${D.pink};
      padding: 10px 20px;
      border-bottom: 1px solid ${D.border};
      font-weight: bold;
    }
    .box-body { padding: 16px 20px; }
    .box-body p { margin: 6px 0; }
    .spacer { height: 12px; }
    .yellow { color: ${D.yellow}; }
    .cyan { color: ${D.cyan}; }
    .purple { color: ${D.purple}; }
    .pink { color: ${D.pink}; }
    .green { color: ${D.green}; }
    .orange { color: ${D.orange}; }
    .dim { color: ${D.dim}; }
    .bold { font-weight: bold; }
    a { text-decoration: none; transition: opacity 0.2s; }
    a:hover { opacity: 0.8; text-decoration: underline; }
    a.purple { color: ${D.purple}; }
    a.cyan { color: ${D.cyan}; }
    .header {
      display: flex;
      gap: 40px;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .banner { color: ${D.purple}; white-space: pre; font-size: 13px; line-height: 1.2; }
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
    ul.bullets li::before { content: "• "; color: ${D.dim}; }
    ul.bullets li { padding-left: 8px; }
    .job { margin-bottom: 16px; }
    .job-header { margin-bottom: 4px; }
    .tech { color: ${D.purple}; padding-left: 8px; margin-top: 4px; }
    .skills-list { padding-left: 8px; }
    .lang { padding-left: 8px; margin: 2px 0; }
    .cert { margin-bottom: 10px; }
    @media (max-width: 600px) {
      body { padding: 12px; padding-top: 20px; }
      .header { gap: 16px; }
      .banner { font-size: 10px; }
      .row { flex-direction: column; gap: 2px; padding-left: 8px; }
      .row .right { text-align: left; }
    }
  </style>
</head>
<body>
<div class="wrap">
${body}
</div>
</body>
</html>`;
}

function renderHeaderHtml(cv) {
  const { identity: id = {}, contact: ct = {} } = cv;
  return `
  <div class="header">
    <div class="banner">${esc(BANNER)}</div>
    <div class="info">
      <p class="bold">${esc(id.name)} — ${esc(id.title)}</p>
      <p>${esc(id.location)} | ${esc(id.tagline)}</p>
      <div class="spacer"></div>
      <p><span class="cyan">LinkedIn:</span> <a class="purple" href="${esc(ct.linkedin)}" target="_blank">${esc(compactUrl(ct.linkedin))}</a></p>
      <p><span class="cyan">GitHub:</span>   <a class="purple" href="${esc(ct.github)}" target="_blank">${esc(compactUrl(ct.github))}</a></p>
      <p><span class="cyan">Email:</span>    <span class="purple">${esc(ct.email || "-")}</span></p>
    </div>
  </div>`;
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

function legendHtml(host) {
  const items = [
    ["/", "Get main CV (ANSI)"],
    ["/skills", "Full skills breakdown"],
    ["/experience", "Work history"],
    ["/contact", "Contact info"],
    ["/json", "Machine-readable CV"],
  ];
  return `
  <div class="box">
    <div class="box-title">legend</div>
    <div class="box-body">
      ${items.map(([path, desc]) => `
      <div class="row">
        <a class="left" href="${path}" style="color:inherit">
          <span class="green">$</span> <span class="bold">curl ${esc(host)}${path === "/" ? "" : path}</span>
        </a>
        <a class="cyan right" href="${path}">${esc(desc)}</a>
      </div>`).join("\n")}
    </div>
  </div>`;
}

export function htmlHome(host) {
  const cv = data.cv();
  const { experience = [] } = cv;

  return shell(host, `
  ${renderHeaderHtml(cv)}

  <div class="box">
    <div class="box-title">whoami</div>
    <div class="box-body">
      ${(cv.summary || []).map(s => s === "" ? '<div class="spacer"></div>' : `<p>${esc(s)}</p>`).join("\n      ")}
    </div>
  </div>

  <div class="box">
    <div class="box-title">skills</div>
    <div class="box-body">
      <p class="purple bold">AREAS</p>
      <p class="skills-list">${(cv.skills?.areas || []).map(esc).join(" · ")}</p>
      <div class="spacer"></div>
      <p class="purple bold">LANGUAGES</p>
      ${(cv.languages || []).map(l =>
        `<p class="lang"><span class="bold">${esc(l.name.toUpperCase())}</span>  ${esc(l.level)}</p>`
      ).join("\n      ")}
    </div>
  </div>

  <div class="box">
    <div class="box-title">experience --latest</div>
    <div class="box-body">
      ${renderJobsHtml(experience)}
    </div>
  </div>

  <div class="box">
    <div class="box-title">education</div>
    <div class="box-body">
      <p class="bold">EDUCATION</p>
      <div class="spacer"></div>
      ${(cv.education || []).map(e => `
      <div class="cert">
        <p><span class="bold">${esc(e.institution || e.name)}</span> — ${esc(e.program || e.title)} <span class="yellow">[${esc(e.period || e.date)}]</span></p>
        ${e.details ? `<p style="padding-left:8px">${esc(e.details)}</p>` : ""}
      </div>`).join("\n")}

      <p class="bold">LICENSES &amp; CERTIFICATIONS</p>
      <div class="spacer"></div>
      ${(cv.certifications || []).map(c => `
      <div class="cert">
        <p><span class="bold">${esc(c.issuer || c.provider)}</span> — ${esc(c.title || c.name)} <span class="yellow">[${esc(c.date || c.period)}]</span></p>
        ${c.url ? `<p style="padding-left:8px"><a class="purple" href="${esc(ensureHttps(c.url))}" target="_blank">${esc(compactUrl(c.url))}</a></p>` : ""}
      </div>`).join("\n")}
    </div>
  </div>

  ${legendHtml(host)}
  `);
}

export function htmlSkills(host) {
  const cv = data.cv();
  const skills = data.skillsFull();

  return shell(`${host}/skills`, `
  ${renderHeaderHtml(cv)}

  <div class="box">
    <div class="box-title">skills</div>
    <div class="box-body">
      ${Object.entries(skills || {}).map(([section, items]) => `
      <p class="bold">${esc(section)}</p>
      <ul class="bullets">
        ${items.map(it => `<li class="dim">${esc(it)}</li>`).join("\n        ")}
      </ul>
      <div class="spacer"></div>`).join("\n")}
    </div>
  </div>

  ${legendHtml(host)}
  `);
}

export function htmlExperience(host) {
  const cv = data.cv();
  const { experience = [] } = data.experienceFull();

  return shell(`${host}/experience`, `
  ${renderHeaderHtml(cv)}

  <div class="box">
    <div class="box-title">experience</div>
    <div class="box-body">
      ${renderJobsHtml(experience)}
    </div>
  </div>

  ${legendHtml(host)}
  `);
}

export function htmlContact(host) {
  const cv = data.cv();
  const ct = cv.contact || {};

  return shell(`${host}/contact`, `
  ${renderHeaderHtml(cv)}

  <div class="box">
    <div class="box-title">contact</div>
    <div class="box-body">
      <div class="row">
        <span class="cyan left">Email</span>
        <span class="right">${esc(ct.email || "-")}</span>
      </div>
      <div class="row">
        <span class="cyan left">LinkedIn</span>
        <a class="purple right" href="${esc(ct.linkedin)}" target="_blank">${esc(compactUrl(ct.linkedin))}</a>
      </div>
      <div class="row">
        <span class="cyan left">GitHub</span>
        <a class="purple right" href="${esc(ct.github)}" target="_blank">${esc(compactUrl(ct.github))}</a>
      </div>
    </div>
  </div>

  ${legendHtml(host)}
  `);
}

export function htmlYsap(host) {
  return shell(`${host}/ysap`, `
  <div class="box">
    <div class="box-title">YOU SUCK AT PROGRAMMING</div>
    <div class="box-body">
      <p>This project was inspired by Dave Eddy's <span class="yellow">ysap.sh</span></p>

      <div class="spacer"></div>

      <p>Dave is a YouTube and Twitch streamer who created
      <span class="yellow">You Suck at Programming</span> - a brilliant series that teaches
      programming through humor and real-world examples.</p>

      <p>His idea of delivering content via curl was the spark
      that made this terminal-friendly CV possible.</p>

      <div class="spacer"></div>

      <p class="bold">Check out his work:</p>
      <div class="row">
        <span class="left"><span class="green">$</span> <span class="bold">curl ysap.sh</span></span>
        <a href="https://ysap.sh" class="cyan right" target="_blank">The original inspiration</a>
      </div>
      <div class="row">
        <a href="https://www.twitch.tv/dave_eddy" class="purple left" target="_blank">twitch.tv/dave_eddy</a>
        <a href="https://www.twitch.tv/dave_eddy" class="cyan right" target="_blank">Twitch channel</a>
      </div>
      <div class="row">
        <a href="https://ysap.sh/youtube" class="purple left" target="_blank">ysap.sh/youtube</a>
        <a href="https://ysap.sh/youtube" class="cyan right" target="_blank">YouTube channel</a>
      </div>
      <div class="row">
        <a href="https://course.ysap.sh" class="purple left" target="_blank">course.ysap.sh</a>
        <a href="https://course.ysap.sh" class="cyan right" target="_blank">Complete Bash Course</a>
      </div>
      <div class="row">
        <a href="https://daveeddy.com" class="purple left" target="_blank">daveeddy.com</a>
        <a href="https://daveeddy.com" class="cyan right" target="_blank">His personal site</a>
      </div>

      <div class="spacer"></div>

      <p class="cyan">Thanks Dave for showing us a better way to share our work!</p>
    </div>
  </div>`);
}
