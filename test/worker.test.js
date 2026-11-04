import assert from "node:assert/strict";
import { describe, it } from "node:test";
import worker from "../src/index.js";

const req = (path, { ua = "Mozilla/5.0", headers = {} } = {}) =>
  new Request(`https://cv.test${path}`, {
    headers: { "user-agent": ua, host: "cv.test", ...headers },
  });

const get = (path, opts) => worker.fetch(req(path, opts));

describe("worker routing", () => {
  it("serves HTML to browsers on /", async () => {
    const res = await get("/");
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type"), /text\/html/);
  });

  it("serves plain text to curl on /", async () => {
    const res = await get("/", { ua: "curl/8.0" });
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type"), /text\/plain/);
  });

  it("returns JSON on /json", async () => {
    const res = await get("/json");
    assert.match(res.headers.get("content-type"), /application\/json/);
    const body = await res.json();
    assert.ok(body.identity?.name);
  });

  it("pretty-prints JSON for curl", async () => {
    const res = await get("/json", { ua: "curl/8.0" });
    assert.ok((await res.text()).includes("\n  "));
  });

  it("answers /healthz with ok", async () => {
    const res = await get("/healthz");
    assert.equal(res.status, 200);
    assert.equal((await res.text()).trim(), "ok");
  });

  it("exposes the sitemap in robots.txt", async () => {
    const res = await get("/robots.txt", { ua: "curl/8.0" });
    assert.match(await res.text(), /Sitemap: https:\/\/cv\.test\/sitemap\.xml/);
  });

  it("returns 404 for unknown paths", async () => {
    const res = await get("/nope");
    assert.equal(res.status, 404);
  });

  it("honours the /es language prefix", async () => {
    const res = await get("/es");
    assert.ok((await res.text()).includes('<html lang="es">'));
  });

  it("detects Spanish from Accept-Language", async () => {
    const res = await get("/", { headers: { "accept-language": "es-AR,es" } });
    assert.ok((await res.text()).includes('<html lang="es">'));
  });

  it("sets hardening headers on every response", async () => {
    const res = await get("/");
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.equal(res.headers.get("x-frame-options"), "DENY");
    assert.ok(res.headers.get("strict-transport-security"));
    assert.ok(res.headers.get("content-security-policy"));
  });

  it("redirects http visitors to https", async () => {
    const res = await get("/", {
      headers: { "cf-visitor": '{"scheme":"http"}' },
    });
    assert.equal(res.status, 301);
    assert.ok(res.headers.get("location").startsWith("https://"));
  });

  it("ignores X-Forwarded-Host (client-controlled) when building links", async () => {
    const headers = { "x-forwarded-host": "evil.example" };
    const sitemap = await (await get("/sitemap.xml", { headers })).text();
    assert.ok(!sitemap.includes("evil.example"));
    assert.ok(sitemap.includes("https://cv.test/"));
    const res = await get("/", { headers });
    assert.ok(!res.headers.get("link").includes("evil.example"));
    assert.ok(!(await res.text()).includes("evil.example"));
  });

  it("sends Vary for User-Agent / Accept-Language negotiated responses", async () => {
    for (const ua of ["Mozilla/5.0", "curl/8.7.1"]) {
      const vary = (await get("/", { ua })).headers.get("vary");
      assert.equal(vary, "User-Agent, Accept-Language");
    }
  });
  it("rejects non-GET/HEAD methods with 405", async () => {
    const res = await worker.fetch(
      new Request("https://cv.test/", { method: "POST" }),
    );
    assert.equal(res.status, 405);
    assert.equal(res.headers.get("allow"), "GET, HEAD");
  });

  it("redirects trailing slashes to the clean path", async () => {
    for (const [from, to] of [
      ["/skills/", "https://cv.test/skills"],
      ["/es/", "https://cv.test/es"],
      ["/es/contact/?x=1", "https://cv.test/es/contact?x=1"],
    ]) {
      const res = await get(from);
      assert.equal(res.status, 301);
      assert.equal(res.headers.get("location"), to);
    }
  });

  it("uses the same URL for canonical, hreflang and sitemap", async () => {
    const sitemap = await (await get("/sitemap.xml")).text();
    for (const [path, lang, canonical] of [
      ["/en/skills", "en", "https://cv.test/skills"],
      ["/skills", "en", "https://cv.test/skills"],
      ["/en", "en", "https://cv.test/"],
      ["/es/skills", "es", "https://cv.test/es/skills"],
    ]) {
      const body = await (await get(path)).text();
      assert.ok(body.includes(`rel="canonical" href="${canonical}"`), path);
      assert.ok(body.includes(`hreflang="${lang}" href="${canonical}"`), path);
      assert.ok(sitemap.includes(`<loc>${canonical}</loc>`), path);
    }
  });

  it("marks 404 pages noindex, without canonical", async () => {
    const body = await (await get("/nope")).text();
    assert.ok(body.includes('<meta name="robots" content="noindex"/>'));
    assert.ok(!body.includes('rel="canonical"'));
  });
});
