import { describe, expect, it } from "vitest";

import { MAX_TITLE_LENGTH, normalizeTitle } from "../../src/issues/title.js";

describe("normalizeTitle", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeTitle("  Fix \t the\n  bug ")).toBe("Fix the bug");
  });

  it("rejects an empty title", () => {
    expect(() => normalizeTitle(" \n\t ")).toThrow(RangeError);
  });

  it("accepts a title at the maximum length", () => {
    const title = "a".repeat(MAX_TITLE_LENGTH);
    expect(normalizeTitle(title)).toBe(title);
  });

  it("rejects a title over the maximum length", () => {
    expect(() => normalizeTitle("a".repeat(MAX_TITLE_LENGTH + 1))).toThrow(
      RangeError,
    );
  });
});
