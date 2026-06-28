import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as render from "../render/cli/ansi.js";
import { BOX_W } from "../render/cli/layout.js";
import { stripAnsi } from "../render/cli/text.js";
import * as data from "../render/data.js";

const RENDERERS = [
  "renderHome",
  "renderHelp",
  "renderSkillsFull",
  "renderExperience",
  "renderContact",
  "renderYsap",
  "render404",
];

describe("CLI renderers", () => {
  for (const lang of ["en", "es"]) {
    const name = data.cv(lang).identity.name;

    for (const fn of RENDERERS) {
      describe(`${fn} (${lang})`, () => {
        const out = render[fn]({ host: "cv.test", lang });

        it("returns a non-empty string", () => {
          assert.equal(typeof out, "string");
          assert.ok(out.length > 0);
        });

        it("never emits a line wider than the box", () => {
          for (const line of out.split("\n")) {
            assert.ok(
              stripAnsi(line).length <= BOX_W,
              `line exceeds ${BOX_W}: "${stripAnsi(line)}"`,
            );
          }
        });
      });
    }

    it(`renderHome (${lang}) includes the person's name`, () => {
      assert.ok(
        stripAnsi(render.renderHome({ host: "cv.test", lang })).includes(name),
      );
    });

    it(`render404 (${lang}) shows a 404 marker`, () => {
      assert.ok(
        stripAnsi(render.render404({ host: "cv.test", lang })).includes("404"),
      );
    });
  }

  it("defaults to English when no lang is given", () => {
    const out = stripAnsi(render.renderHome({ host: "cv.test" }));
    assert.ok(out.includes(data.cv("en").identity.name));
  });
});
