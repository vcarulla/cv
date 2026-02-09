import * as render from "../render/ansi.js";
import * as data from "../render/data.js";
import { htmlHome, htmlSkills, htmlExperience, htmlContact, htmlYsap, html404 } from "../render/html.js";

const isCli = (request) => {
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  return ua.includes("curl") || ua.includes("wget") || ua.includes("httpie");
};

const getHost = (request) =>
  request.headers.get("x-forwarded-host") ||
  request.headers.get("host") ||
  "cv.local";

const SUPPORTED_LANGS = new Set(["es"]);

const secHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

const text = (body, status = 200, maxAge = 3600) => new Response(body, {
  status,
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": `public, max-age=${maxAge}`,
    ...secHeaders
  }
});

const html = (body, host, status = 200) => new Response(body, {
  status,
  headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:; script-src 'sha256-nfU9GH4vMYtBGEhmbYodN1VSSuqE+65EE8e4UnxXYGM=' 'sha256-PjJkFu3E9pAXOag3lJ7FMAGEIT18Mr7EAJAv3Hmt7zQ=' https://static.cloudflareinsights.com; connect-src https://cloudflareinsights.com 'self'; require-trusted-types-for 'script'",
    "Link": `<https://${host}/json>; rel="alternate"; type="application/ld+json"`,
    ...secHeaders,
  }
});

const json = (body, pretty = false) => new Response(
  pretty ? JSON.stringify(body, null, 2) + "\n" : JSON.stringify(body),
  { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=3600", ...secHeaders } }
);

function parseLang(path) {
  const match = path.match(/^\/(es)(\/|$)/);
  if (match && SUPPORTED_LANGS.has(match[1])) {
    const lang = match[1];
    const cleanPath = path.replace(/^\/es/, "") || "/";
    return { lang, cleanPath };
  }
  return { lang: "en", cleanPath: path };
}

export default {
  async fetch(request) {
    // Redirect HTTP to HTTPS
    const cfVisitor = request.headers.get("cf-visitor");
    if (cfVisitor && cfVisitor.includes('"http"')) {
      const url = new URL(request.url);
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const host = getHost(request);

    const { lang, cleanPath } = parseLang(path);

    switch (cleanPath) {
      case "/":
        return isCli(request)
          ? text(render.renderHome({ host, lang }))
          : html(htmlHome(host, lang), host);

      case "/help":
        return text(render.renderHelp({ host, lang }));

      case "/skills":
        return isCli(request)
          ? text(render.renderSkillsFull({ lang }))
          : html(htmlSkills(host, lang), host);

      case "/experience":
        return isCli(request)
          ? text(render.renderExperience({ lang }))
          : html(htmlExperience(host, lang), host);

      case "/contact":
        return isCli(request)
          ? text(render.renderContact({ lang }))
          : html(htmlContact(host, lang), host);

      case "/json":
        return json(data.cv(lang), isCli(request));

      case "/robots.txt":
        return text(`User-agent: *\nAllow: /\nSitemap: https://${host}/sitemap.xml\n`, 200, 86400);

      case "/sitemap.xml":
        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
            ["", "/skills", "/experience", "/contact"].flatMap(p => [
              `  <url><loc>https://${host}${p || "/"}</loc></url>`,
              `  <url><loc>https://${host}/es${p}</loc></url>`,
            ]).join("\n")
          }\n</urlset>\n`,
          { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=86400", ...secHeaders } }
        );

      case "/healthz":
        return text("ok\n", 200, 0);

      case "/og-image.svg":
        return new Response(
          `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#282a36"/>
  <text x="600" y="240" text-anchor="middle" font-family="monospace" font-size="48" fill="#bd93f9" xml:space="preserve">
    <tspan x="600" dy="0">██╗   ██╗  █████╗</tspan>
    <tspan x="600" dy="58">██║   ██║ ██╔═══╝</tspan>
    <tspan x="600" dy="58">██║   ██║ ██║</tspan>
    <tspan x="600" dy="58">╚██╗ ██╔╝ ██║</tspan>
    <tspan x="600" dy="58"> ╚████╔╝   █████╗</tspan>
    <tspan x="600" dy="58">  ╚═══╝    ╚════╝</tspan>
  </text>
  <text x="600" y="580" text-anchor="middle" font-family="monospace" font-size="32" fill="#f8f8f2">Victor Carulla</text>
</svg>`,
          { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=31536000", ...secHeaders } }
        );

      case "/ysap":
        return isCli(request)
          ? text(render.renderYsap({ lang }))
          : html(htmlYsap(host, lang), host);

      default:
        return isCli(request)
          ? text(render.render404({ host, lang }), 404)
          : html(html404(host, lang), host, 404);
    }
  }
};
