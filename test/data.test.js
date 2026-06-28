import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as data from "../render/data.js";

describe("data accessors", () => {
  for (const lang of ["en", "es"]) {
    it(`cv(${lang}) exposes identity and contact`, () => {
      const cv = data.cv(lang);
      assert.ok(cv.identity?.name, "identity.name missing");
      assert.ok(cv.identity?.title, "identity.title missing");
      assert.ok(cv.contact, "contact missing");
      assert.ok(Array.isArray(cv.experience), "experience must be an array");
    });

    it(`experienceFull(${lang}) returns an experience array`, () => {
      assert.ok(Array.isArray(data.experienceFull(lang).experience));
    });

    it(`skillsFull(${lang}) returns a non-empty object`, () => {
      assert.ok(Object.keys(data.skillsFull(lang)).length > 0);
    });

    it(`ysap(${lang}) has intro and links`, () => {
      const y = data.ysap(lang);
      assert.ok(Array.isArray(y.intro) && y.intro.length >= 4);
      assert.ok(Array.isArray(y.links) && y.links.length > 0);
    });
  }

  it("falls back to English for unknown languages", () => {
    assert.equal(data.cv("zz").identity.name, data.cv("en").identity.name);
  });
});
