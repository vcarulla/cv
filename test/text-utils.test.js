import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { box } from "../render/cli/box.js";
import {
  cols,
  pad,
  sideBySide,
  stripAnsi,
  truncate,
} from "../render/cli/text.js";
import { compactUrl, wrap } from "../render/text.js";

describe("wrap", () => {
  it("breaks text into lines no wider than width", () => {
    const lines = wrap("the quick brown fox jumps over the lazy dog", 10);
    for (const l of lines) assert.ok(l.length <= 10, `"${l}" exceeds width`);
    assert.equal(
      lines.join(" "),
      "the quick brown fox jumps over the lazy dog",
    );
  });

  it("keeps a word longer than width on its own line", () => {
    assert.deepEqual(wrap("supercalifragilistic ok", 5), [
      "supercalifragilistic",
      "ok",
    ]);
  });

  it("handles empty / nullish input", () => {
    assert.deepEqual(wrap("", 10), []);
    assert.deepEqual(wrap(null, 10), []);
    assert.deepEqual(wrap(undefined, 10), []);
  });
});

describe("compactUrl", () => {
  it("strips protocol and trailing slash", () => {
    assert.equal(compactUrl("https://example.com/"), "example.com");
    assert.equal(compactUrl("http://a.b/c"), "a.b/c");
  });
  it("returns a dash for empty input", () => {
    assert.equal(compactUrl(""), "-");
    assert.equal(compactUrl(null), "-");
  });
});

describe("stripAnsi", () => {
  it("removes color escapes and zero-width LRM", () => {
    assert.equal(stripAnsi("\x1b[38;5;141mhi\x1b[0m"), "hi");
    assert.equal(stripAnsi("a‎b"), "ab");
  });
});

describe("truncate", () => {
  it("leaves short strings untouched", () => {
    assert.equal(truncate("abc", 10), "abc");
  });
  it("adds ellipsis and resets color when over the limit", () => {
    const out = truncate("abcdefgh", 5);
    assert.equal(stripAnsi(out), "ab...");
    assert.ok(out.endsWith("\x1b[0m"));
  });
  it("counts visible width, not escape bytes", () => {
    const colored = "\x1b[1mabcdefgh\x1b[0m";
    assert.equal(stripAnsi(truncate(colored, 5)), "ab...");
  });
  it("can truncate without ellipsis", () => {
    assert.equal(stripAnsi(truncate("abcdef", 3, false)), "abc");
  });
});

describe("pad", () => {
  it("pads to the requested visible width", () => {
    assert.equal(stripAnsi(pad("ab", 5)).length, 5);
  });
  it("does not shrink content longer than width", () => {
    assert.ok(stripAnsi(pad("abcdef", 3)).length >= 6);
  });
});

describe("cols", () => {
  it("joins left and right with a padded gap", () => {
    const out = stripAnsi(cols("a", "b", 10, 2));
    assert.equal(out, "a" + " ".repeat(9) + "  b");
  });
});

describe("sideBySide", () => {
  it("aligns columns and pads the shorter side", () => {
    const out = sideBySide(["L1", "L2"], 5, ["R1"], 5, 2).split("\n");
    assert.equal(out.length, 2);
    assert.ok(out[0].includes("R1"));
    assert.ok(stripAnsi(out[1]).startsWith("L2"));
  });
});

describe("box", () => {
  it("produces lines of uniform visible width", () => {
    const lines = box("title", ["a", "bb", "ccc"], 40).split("\n");
    const widths = new Set(lines.map((l) => stripAnsi(l).length));
    assert.equal(widths.size, 1, `uneven widths: ${[...widths].join(",")}`);
  });

  it("keeps uniform width even with zero-width characters in content", () => {
    const lines = box(
      "t",
      ["plain", "with‎lrm", "\x1b[1mbold\x1b[0m"],
      30,
    ).split("\n");
    const widths = new Set(lines.map((l) => stripAnsi(l).length));
    assert.equal(widths.size, 1, `uneven widths: ${[...widths].join(",")}`);
  });

  it("draws top, bottom and padding rows", () => {
    const lines = box("x", ["hi"], 20).split("\n");
    assert.ok(lines[0].includes("┌") && lines[0].includes("┐"));
    assert.ok(lines.at(-1).includes("└") && lines.at(-1).includes("┘"));
  });
});
