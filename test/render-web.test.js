import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as data from "../render/data.js";
import {
  html404,
  htmlContact,
  htmlExperience,
  htmlHome,
  htmlSkills,
  htmlYsap,
} from "../render/web/html.js";

const PAGES = {
  htmlHome,
  htmlSkills,
  htmlExperience,
  htmlContact,
  htmlYsap,
  html404,
};

describe("web renderers", () => {
  for (const lang of ["en", "es"]) {
    for (const [name, fn] of Object.entries(PAGES)) {
      describe(`${name} (${lang})`, () => {
        const out = fn("cv.test", lang);

        it("is a complete HTML document", () => {
          assert.ok(out.startsWith("<!doctype html>"));
          assert.ok(out.includes(`<html lang="${lang}">`));
          assert.ok(out.trimEnd().endsWith("</html>"));
        });

        it("declares the canonical host", () => {
          assert.ok(out.includes("cv.test"));
        });
      });
    }
  }

  it("includes the person's name on the home page", () => {
    assert.ok(htmlHome("cv.test", "en").includes(data.cv("en").identity.name));
  });
});

describe("HTML escaping", () => {
  it("escapes angle brackets coming from the host", () => {
    const out = htmlHome('"><script>alert(1)</script>', "en");
    assert.ok(
      !out.includes("<script>alert(1)"),
      "raw script tag leaked into HTML",
    );
    assert.ok(out.includes("&lt;script&gt;"));
  });
});
