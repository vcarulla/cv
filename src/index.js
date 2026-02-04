import * as render from "../render/ansi.js";
import * as data from "../render/data.js";
import { htmlHome, htmlSkills, htmlExperience, htmlContact, htmlYsap } from "../render/html.js";

const isCli = (request) => {
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  return ua.includes("curl") || ua.includes("wget") || ua.includes("httpie");
};

const getHost = (request) =>
  request.headers.get("x-forwarded-host") ||
  request.headers.get("host") ||
  "cv.local";

const secHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

const text = (body) => new Response(body, {
  headers: { "Content-Type": "text/plain; charset=utf-8", ...secHeaders }
});

const html = (body, host) => new Response(body, {
  headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:; script-src https://static.cloudflareinsights.com; connect-src https://cloudflareinsights.com 'self'; require-trusted-types-for 'script'",
    "Link": `<https://${host}/json>; rel="alternate"; type="application/ld+json"`,
    ...secHeaders,
  }
});

const json = (body, pretty = false) => new Response(
  pretty ? JSON.stringify(body, null, 2) + "\n" : JSON.stringify(body),
  { headers: { "Content-Type": "application/json; charset=utf-8", ...secHeaders } }
);

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

    switch (path) {
      case "/":
        return isCli(request)
          ? text(render.renderHome({ host }))
          : html(htmlHome(host), host);

      case "/help":
        return text(render.renderHelp({ host }));

      case "/skills":
        return isCli(request)
          ? text(render.renderSkillsFull())
          : html(htmlSkills(host), host);

      case "/experience":
        return isCli(request)
          ? text(render.renderExperience())
          : html(htmlExperience(host), host);

      case "/contact":
        return isCli(request)
          ? text(render.renderContact())
          : html(htmlContact(host), host);

      case "/json":
        return json(data.cv(), isCli(request));

      case "/robots.txt":
        return text(`User-agent: *\nAllow: /\nSitemap: https://${host}/sitemap.xml\n`);

      case "/sitemap.xml":
        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
            ["", "/skills", "/experience", "/contact"].map(p =>
              `  <url><loc>https://${host}${p}</loc></url>`
            ).join("\n")
          }\n</urlset>\n`,
          { headers: { "Content-Type": "application/xml; charset=utf-8" } }
        );

      case "/healthz":
        return text("ok\n");

      case "/ysap":
        return isCli(request)
          ? text(render.renderYsap())
          : html(htmlYsap(host), host);

      default:
        return text("Not found\n", { status: 404 });
    }
  }
};
