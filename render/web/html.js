import banner from "../banner.js";
import * as data from "../data.js";
import { compactUrl } from "../text.js";
import { iconSun, iconMoon, iconDownload, iconCooldown } from "./icons.js";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function ensureHttps(url) {
  if (!url) return "#";
  return url.startsWith("http") ? url : `https://${url}`;
}

const BANNER = banner();

function hreflangTags(host, pagePath) {
  const clean = pagePath === "/" ? "" : pagePath;
  return `<link rel="alternate" hreflang="en" href="https://${esc(host)}${clean || "/"}"/>
  <link rel="alternate" hreflang="es" href="https://${esc(host)}/es${clean}"/>
  <link rel="alternate" hreflang="x-default" href="https://${esc(host)}${clean || "/"}"/>`;
}

function shell(
  { title, description, host, lang = "en", pagePath = "/" },
  body,
) {
  const cv = data.cv(lang);
  const prefix = `/${lang}`;
  const altPrefix = lang === "en" ? "/es" : "/en";
  const canonical = `https://${host}${prefix}${pagePath === "/" ? "" : pagePath}`;
  const altLangUrl = `${altPrefix}${pagePath === "/" ? "/" : pagePath}`;
  const desc =
    description ||
    `${cv.identity.name} — ${cv.identity.title}. ${cv.identity.location}. curl-first CV.`;
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
  <meta name="theme-color" content="#282a36"/>
  <link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgcng9JzEyJyBmaWxsPScjMjgyYTM2Jy8+PHRleHQgeD0nNTAnIHk9JzY4JyBmb250LWZhbWlseT0nbW9ub3NwYWNlJyBmb250LXNpemU9JzQ4JyBmb250LXdlaWdodD0nYm9sZCcgZmlsbD0nI2JkOTNmOScgdGV4dC1hbmNob3I9J21pZGRsZSc+VkM8L3RleHQ+PC9zdmc+"/>

  <meta property="og:type" content="website"/>
  <meta property="og:title" content="${esc(title)}"/>
  <meta property="og:description" content="${esc(desc)}"/>
  <meta property="og:url" content="${esc(canonical)}"/>
  <meta property="og:site_name" content="${esc(host)}"/>
  <meta property="og:image" content="https://${esc(host)}/assets/img/og-image.svg"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>

  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${esc(title)}"/>
  <meta name="twitter:description" content="${esc(desc)}"/>
  <meta name="twitter:image" content="https://${esc(host)}/assets/img/og-image.svg"/>

  <link rel="preload" href="/assets/css/styles.min.css" as="style">
  <link rel="stylesheet" href="/assets/css/styles.min.css">
  <script>document.documentElement.dataset.theme=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme:light)').matches?'light':'dark');</script>
</head>
<body>
<a class="skip-link" href="#main">${esc(ui.skipToContent || "Skip to content")}</a>

<div class="float-btns">
  <a href="${altLangUrl}" aria-label="${lang === "en" ? "Cambiar a espa\u00f1ol" : "Switch to English"}">
    <img src="/assets/img/flag-${lang === "en" ? "es" : "en"}.svg" alt="${lang === "en" ? "Espa\u00f1ol" : "English"}" width="20" height="14">
  </a>
  <button id="theme-toggle" type="button" aria-label="${lang === "en" ? "Toggle theme" : "Cambiar tema"}">
    ${iconSun(lang)}
    ${iconMoon(lang)}
  </button>
  <button id="download-cv" type="button" data-url="${lang === "es" ? "/Carulla%20Victor%20Curriculum%20Completo.pdf" : "/Carulla%20Victor%20Resume%20Complete.pdf"}" aria-label="${lang === "es" ? "Descargar CV en PDF" : "Download CV as PDF"}">
    ${iconDownload(lang)}
    ${iconCooldown(lang)}
  </button>
</div>

<main id="main" class="wrap" role="main">
${body}
</main>
<script>
document.getElementById('theme-toggle').addEventListener('click',function(){
  var t=document.documentElement.dataset.theme==='dark'?'light':'dark';
  document.documentElement.dataset.theme=t;
  localStorage.setItem('theme',t);
});
</script>
<script>
(function(){var btn=document.getElementById('download-cv');if(!btn)return;var CD=5000,KEY='cv_dl_ts';btn.addEventListener('click',function(){var last=parseInt(localStorage.getItem(KEY)||'0',10);var now=Date.now();if(now-last<CD){btn.classList.add('cooldown');return;}localStorage.setItem(KEY,String(now));btn.classList.add('cooldown');setTimeout(function(){btn.classList.remove('cooldown');},CD);var a=document.createElement('a');a.href=btn.dataset.url;a.download='';document.body.appendChild(a);a.click();document.body.removeChild(a);});})();
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
  return jobs
    .map(
      (j) => `
    <div class="job">
      <div class="job-header">
        <span class="bold">${esc(j.company)}</span> — ${esc(j.role)} <span class="yellow">[${esc(j.period)}]</span>
      </div>
      <ul class="bullets">
        ${(j.highlights || []).map((h) => `<li>${esc(h)}</li>`).join("\n        ")}
      </ul>
      ${j.environment ? `<p class="tech">${esc(j.environment)}</p>` : ""}
      ${j.technologies ? `<p class="tech">${esc(j.technologies)}</p>` : ""}
      ${j.tech?.length ? `<p class="tech">${j.tech.map(esc).join(" · ")}</p>` : ""}
    </div>`,
    )
    .join("\n");
}

function legendHtml(host, lang, currentPath = "/") {
  const cv = data.cv(lang);
  const lg = cv.labels?.legend || {};
  const s = cv.labels?.sections || {};
  const ui = cv.labels?.ui || {};
  const prefix = `/${lang}`;
  const items = [
    ["/", lg["/"] || "Home"],
    ["/skills", lg["/skills"] || "Full tech stack"],
    ["/experience", lg["/experience"] || "Full career history"],
    ["/contact", lg["/contact"] || "Get in touch"],
  ].filter(([path]) => path !== currentPath);
  return `
  <nav class="box" role="navigation" aria-label="${esc(ui.siteNavigation || "Site navigation")}">
    <div class="box-title">${esc(s.legend || "$help")}</div>
    <div class="box-body">
      ${items
        .map(
          ([path, desc]) => `
      <div class="row" style="padding-left:0">
        <a class="left" href="${prefix}${path}" style="color:inherit">
          <span class="green">$</span> <span class="bold">curl -L ${esc(host)}${prefix}${path === "/" ? "" : path}</span>
        </a>
        <a class="cyan right" href="${prefix}${path}">${esc(desc)}</a>
      </div>`,
        )
        .join("\n")}
    </div>
  </nav>`;
}

export function htmlHome(host, lang = "en") {
  const cv = data.cv(lang);
  const s = cv.labels?.sections || {};
  const ui = cv.labels?.ui || {};
  const descs = cv.labels?.descriptions || {};
  const { experience = [] } = cv;

  return shell(
    {
      title: `${cv.identity.name} — ${cv.identity.title}`,
      host,
      pagePath: "/",
      lang,
      description: descs.home,
    },
    `
  ${renderHeaderHtml(cv)}

  <div class="box">
    <div class="box-title">${esc(s.whoami || "$whoami")}</div>
    <div class="box-body">
      ${(cv.summary || [])
        .map((s, i) => {
          if (s === "") return '<div class="spacer"></div>';
          if (i === 0)
            return `<p class="purple">${esc(s)}</p><div class="spacer"></div>`;
          return `<p>${esc(s)}</p>`;
        })
        .join("\n      ")}
    </div>
  </div>

  <div class="box">
    <div class="box-title">${esc(s.skills || "$ echo $SKILLS")}</div>
    <div class="box-body">
      <p class="purple bold">${esc(ui.areas || "AREAS")}</p>
      <p class="skills-list">${(cv.skills?.areas || []).map(esc).join(" · ")}</p>
      <div class="spacer"></div>
      <p class="purple bold">${esc(ui.languages || "LANGUAGES")}</p>
      ${(cv.languages || [])
        .map(
          (l) =>
            `<p class="lang"><span class="bold">${esc(l.name.toUpperCase())}</span>  ${esc(l.level)}</p>`,
        )
        .join("\n      ")}
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
      ${(cv.education || [])
        .map(
          (e) => `
      <div class="cert">
        <p><span class="bold">${esc(e.institution || e.name)}</span> — ${esc(e.program || e.title)} <span class="yellow">[${esc(e.period || e.date)}]</span></p>
        ${e.details ? `<p style="padding-left:8px">${esc(e.details)}</p>` : ""}
      </div>`,
        )
        .join("\n")}

      <p class="bold">${esc(ui.certifications || "LICENSES & CERTIFICATIONS")}</p>
      <div class="spacer"></div>
      ${(cv.certifications || [])
        .map(
          (c) => `
      <div class="cert">
        <p><span class="bold">${esc(c.issuer || c.provider)}</span> — ${esc(c.title || c.name)} <span class="yellow">[${esc(c.date || c.period)}]</span></p>
        ${c.url ? `<p style="padding-left:8px"><a class="purple" href="${esc(ensureHttps(c.url))}" target="_blank" rel="noopener">${esc(compactUrl(c.url))}</a></p>` : ""}
      </div>`,
        )
        .join("\n")}
    </div>
  </div>

  ${legendHtml(host, lang, "/")}
  `,
  );
}

export function htmlSkills(host, lang = "en") {
  const cv = data.cv(lang);
  const s = cv.labels?.sections || {};
  const descs = cv.labels?.descriptions || {};
  const skills = data.skillsFull(lang);

  return shell(
    {
      title: `Skills — ${host}`,
      host,
      pagePath: "/skills",
      lang,
      description: descs.skills,
    },
    `
  ${renderHeaderHtml(cv)}

  <div class="box">
    <div class="box-title">${esc(s.skillsFull || "$ echo ${SKILLS[@]}")}</div>
    <div class="box-body">
      ${Object.entries(skills || {})
        .map(
          ([section, items]) => `
      <p class="bold">${esc(section)}</p>
      <ul class="bullets">
        ${items
          .map((it) => {
            const match = it.match(/^([^(]+)(\(.+\))$/);
            if (match) {
              return `<li>${esc(match[1])}<span class="dim">${esc(match[2])}</span></li>`;
            }
            return `<li>${esc(it)}</li>`;
          })
          .join("\n        ")}
      </ul>
      <div class="spacer"></div>`,
        )
        .join("\n")}
    </div>
  </div>

  ${legendHtml(host, lang, "/skills")}
  `,
  );
}

export function htmlExperience(host, lang = "en") {
  const cv = data.cv(lang);
  const s = cv.labels?.sections || {};
  const descs = cv.labels?.descriptions || {};
  const { experience = [] } = data.experienceFull(lang);

  return shell(
    {
      title: `Experience — ${host}`,
      host,
      pagePath: "/experience",
      lang,
      description: descs.experience,
    },
    `
  ${renderHeaderHtml(cv)}

  <div class="box">
    <div class="box-title">${esc(s.experienceFull || "$jobs --all")}</div>
    <div class="box-body">
      ${renderJobsHtml(experience)}
    </div>
  </div>

  ${legendHtml(host, lang, "/experience")}
  `,
  );
}

export function htmlContact(host, lang = "en") {
  const cv = data.cv(lang);
  const ct = cv.contact || {};
  const fields = cv.labels?.fields || {};
  const descs = cv.labels?.descriptions || {};

  return shell(
    {
      title: `Contact — ${host}`,
      host,
      pagePath: "/contact",
      lang,
      description: descs.contact,
    },
    `
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
        <a class="purple right" href="${esc(ct.linkedin)}" target="_blank" rel="noopener">${esc(compactUrl(ct.linkedin))}</a>
      </div>
      <div class="row" style="padding-left:0">
        <span class="cyan left">${esc(fields.github || "GitHub")}</span>
        <a class="purple right" href="${esc(ct.github)}" target="_blank" rel="noopener">${esc(compactUrl(ct.github))}</a>
      </div>
    </div>
  </div>

  ${legendHtml(host, lang, "/contact")}
  `,
  );
}

export function htmlYsap(host, lang = "en") {
  const cv = data.cv(lang);
  const y = cv.labels?.ysap || {};
  const descs = cv.labels?.descriptions || {};

  return shell(
    {
      title: `You Suck at Programming — ${host}`,
      host,
      pagePath: "/ysap",
      lang,
      description: descs.ysap,
    },
    `
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
        <a href="https://ysap.sh" class="cyan right" target="_blank" rel="noopener">${esc(y.originalInspiration || "The original inspiration")}</a>
      </div>
      <div class="row">
        <a href="https://www.twitch.tv/dave_eddy" class="purple left" target="_blank" rel="noopener">twitch.tv/dave_eddy</a>
        <a href="https://www.twitch.tv/dave_eddy" class="cyan right" target="_blank" rel="noopener">${esc(y.twitchChannel || "Twitch channel")}</a>
      </div>
      <div class="row">
        <a href="https://ysap.sh/youtube" class="purple left" target="_blank" rel="noopener">ysap.sh/youtube</a>
        <a href="https://ysap.sh/youtube" class="cyan right" target="_blank" rel="noopener">${esc(y.youtubeChannel || "YouTube channel")}</a>
      </div>
      <div class="row">
        <a href="https://course.ysap.sh" class="purple left" target="_blank" rel="noopener">course.ysap.sh</a>
        <a href="https://course.ysap.sh" class="cyan right" target="_blank" rel="noopener">${esc(y.bashCourse || "Complete Bash Course")}</a>
      </div>
      <div class="row">
        <a href="https://daveeddy.com" class="purple left" target="_blank" rel="noopener">daveeddy.com</a>
        <a href="https://daveeddy.com" class="cyan right" target="_blank" rel="noopener">${esc(y.personalSite || "His personal site")}</a>
      </div>

      <div class="spacer"></div>

      <p class="cyan">${esc(y.thanks || "Thanks Dave for showing us a better way to share our work!")}</p>
    </div>
  </div>`,
  );
}

export function html404(host, lang = "en") {
  const cv = data.cv(lang);
  const msg = lang === "en" ? "404 NOT FOUND" : "404 PAGINA NO ENCONTRADA";

  return shell(
    { title: `404 — ${host}`, host, pagePath: "/", lang },
    `
  ${renderHeaderHtml(cv)}

  <div class="box">
    <div class="box-title">404</div>
    <div class="box-body" style="text-align:center">
      <pre style="display:inline-block;text-align:left;line-height:1.3;margin:12px 0" class="dim">
 \\|/          <span style="color:var(--fg)" class="bold">(__)</span>
      \`\\------<span style="color:var(--fg)" class="bold">(oo)</span>
        ||    <span style="color:var(--fg)" class="bold">(__)</span>
        ||w--||     \\|/
    \\|/</pre>
      <p class="bold" style="font-size:16px;margin:12px 0">${esc(msg)}</p>
    </div>
  </div>

  ${legendHtml(host, lang, "/404")}
  `,
  );
}
