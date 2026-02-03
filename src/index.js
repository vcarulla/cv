import * as render from "../render/ansi.js";
import * as data from "../render/data.js";
import { htmlHome } from "../render/html.js";

const isCli = (request) => {
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  return ua.includes("curl") || ua.includes("wget") || ua.includes("httpie");
};

const getHost = (request) =>
  request.headers.get("x-forwarded-host") ||
  request.headers.get("host") ||
  "cv.local";

const text = (body) => new Response(body, {
  headers: { "Content-Type": "text/plain; charset=utf-8" }
});

const html = (body) => new Response(body, {
  headers: { "Content-Type": "text/html; charset=utf-8" }
});

const json = (body, pretty = false) => new Response(
  pretty ? JSON.stringify(body, null, 2) + "\n" : JSON.stringify(body),
  { headers: { "Content-Type": "application/json; charset=utf-8" } }
);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const host = getHost(request);

    switch (path) {
      case "/":
        return isCli(request)
          ? text(render.renderHome({ host }))
          : html(htmlHome(host));

      case "/help":
        return text(render.renderHelp({ host }));

      case "/skills":
        return text(render.renderSkillsFull());

      case "/experience":
        return text(render.renderExperience());

      case "/contact":
        return text(render.renderContact());

      case "/json":
        return json(data.cv(), isCli(request));

      case "/healthz":
        return text("ok\n");

      case "/ysap":
        return text(render.renderYsap());

      default:
        return text("Not found\n", { status: 404 });
    }
  }
};
