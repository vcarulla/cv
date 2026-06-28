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
});
