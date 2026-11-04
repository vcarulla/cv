import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { transform } from "esbuild";
import worker from "../src/index.js";

describe("assets", () => {
  it("styles.min.css is up to date with styles.css (npm run build:css)", async () => {
    const src = readFileSync("public/assets/css/styles.css", "utf8");
    const { code } = await transform(src, { loader: "css", minify: true });
    assert.equal(
      readFileSync("public/assets/css/styles.min.css", "utf8"),
      code,
      "styles.min.css desactualizado: correr npm run build:css",
    );
  });

  it("CSP allows every inline script of the HTML pages by hash", async () => {
    for (const path of ["/", "/es/skills", "/nope"]) {
      const res = await worker.fetch(
        new Request(`https://cv.test${path}`, {
          headers: { "user-agent": "Mozilla/5.0" },
        }),
      );
      const csp = res.headers.get("content-security-policy");
      const scripts = [
        ...(await res.text()).matchAll(/<script>([\s\S]*?)<\/script>/g),
      ];
      assert.ok(scripts.length > 0);
      for (const [, body] of scripts) {
        const hash = createHash("sha256").update(body).digest("base64");
        assert.ok(
          csp.includes(`'sha256-${hash}'`),
          `${path}: falta 'sha256-${hash}' en la CSP de src/index.js`,
        );
      }
    }
  });
});
