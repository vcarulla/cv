import * as render from "../render/cli/sections.js";
import * as data from "../render/data.js";
import {
  html404,
  htmlContact,
  htmlExperience,
  htmlHome,
  htmlSkills,
  htmlYsap,
} from "../render/web/html.js";

const isCli = (request) => {
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  return ua.includes("curl") || ua.includes("wget") || ua.includes("httpie");
};

const TYPE_TEXT = "text/plain; charset=utf-8";
const TYPE_HTML = "text/html; charset=utf-8";
const TYPE_JSON = "application/json; charset=utf-8";
const TYPE_XML = "application/xml; charset=utf-8";

const SITEMAP_PATHS = ["", "/skills", "/experience", "/contact", "/ysap"];

const secHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

const response = (
  body,
  type,
  { status = 200, maxAge = 3600, headers = {} } = {},
) =>
  new Response(body, {
    status,
    headers: {
      "Content-Type": type,
      "Cache-Control": `public, max-age=${maxAge}`,
      // La misma URL responde ANSI o HTML según User-Agent, y es/en según
      // Accept-Language: sin Vary, un cache compartido puede mezclarlos.
      Vary: "User-Agent, Accept-Language",
      ...secHeaders,
      ...headers,
    },
  });

const text = (body, status, maxAge) =>
  response(body, TYPE_TEXT, { status, maxAge });

const html = (body, host, status) =>
  response(body, TYPE_HTML, {
    status,
    headers: {
      "Content-Security-Policy":
        "default-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'sha256-nfU9GH4vMYtBGEhmbYodN1VSSuqE+65EE8e4UnxXYGM=' 'sha256-PjJkFu3E9pAXOag3lJ7FMAGEIT18Mr7EAJAv3Hmt7zQ=' 'sha256-CUFgxL8obn0VrJJWSqwD9hfUMxmYC74g15ZVBNHiHpM=' https://static.cloudflareinsights.com; connect-src https://cloudflareinsights.com 'self'; require-trusted-types-for 'script'",
      Link: `<https://${host}/json>; rel="alternate"; type="application/ld+json"`,
    },
  });

const json = (body, pretty = false) =>
  response(
    pretty ? JSON.stringify(body, null, 2) + "\n" : JSON.stringify(body),
    TYPE_JSON,
  );

function detectLang(acceptLang) {
  // Spanish for es-*, English for everything else
  return (acceptLang || "").toLowerCase().startsWith("es") ? "es" : "en";
}

function parseLang(path, acceptLang) {
  // Explicit prefix takes priority; without one, detect from Accept-Language
  const match = path.match(/^\/(en|es)(\/.*)?$/);
  if (match) return { lang: match[1], cleanPath: match[2] || "/" };
  return { lang: detectLang(acceptLang), cleanPath: path };
}

const sitemap = (host) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SITEMAP_PATHS.flatMap((p) => [
  `  <url><loc>https://${host}${p || "/"}</loc></url>`,
  `  <url><loc>https://${host}/es${p}</loc></url>`,
]).join("\n")}
</urlset>
`;

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Redirect HTTP to HTTPS
    const cfVisitor = request.headers.get("cf-visitor");
    if (cfVisitor?.includes('"http"')) {
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    // Solo lectura: un POST/PUT/etc. no tiene por qué recibir la página.
    if (request.method !== "GET" && request.method !== "HEAD") {
      return response("Method Not Allowed\n", TYPE_TEXT, {
        status: 405,
        maxAge: 0,
        headers: { Allow: "GET, HEAD" },
      });
    }

    // /skills/ → /skills (las rutas no llevan barra final)
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.replace(/\/+$/, "") || "/";
      return Response.redirect(url.toString(), 301);
    }

    const path = url.pathname;
    // Host de la URL que resolvió Cloudflare, no de headers: X-Forwarded-Host lo
    // manda el cliente y se reflejaba en links, sitemap y header Link.
    const host = url.host;
    const acceptLang = request.headers.get("Accept-Language");

    const { lang, cleanPath } = parseLang(path, acceptLang);

    switch (cleanPath) {
      case "/":
        return isCli(request)
          ? text(render.renderHome({ host, lang }))
          : html(htmlHome(host, lang), host);

      case "/help":
        return text(render.renderHelp({ host, lang }));

      case "/skills":
        return isCli(request)
          ? text(render.renderSkillsFull({ host, lang }))
          : html(htmlSkills(host, lang), host);

      case "/experience":
        return isCli(request)
          ? text(render.renderExperience({ host, lang }))
          : html(htmlExperience(host, lang), host);

      case "/contact":
        return isCli(request)
          ? text(render.renderContact({ host, lang }))
          : html(htmlContact(host, lang), host);

      case "/json":
        return json(data.cv(lang), isCli(request));

      case "/robots.txt":
        return text(
          `User-agent: *\nAllow: /\nSitemap: https://${host}/sitemap.xml\n`,
          200,
          86400,
        );

      case "/sitemap.xml":
        return response(sitemap(host), TYPE_XML, { maxAge: 86400 });

      case "/healthz":
        return text("ok\n", 200, 0);

      case "/ysap":
        return isCli(request)
          ? text(render.renderYsap({ host, lang }))
          : html(htmlYsap(host, lang), host);

      default:
        return isCli(request)
          ? text(render.render404({ host, lang }), 404)
          : html(html404(host, lang), host, 404);
    }
  },
};
