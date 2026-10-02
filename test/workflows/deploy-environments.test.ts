import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { APP_ENVS } from "../../src/config/index.js";

const DEPLOY = fileURLToPath(
  new URL("../../.github/workflows/deploy.yml", import.meta.url),
);

/** GitHub Environments named by `environment:` lines (line-based, like app-key.test.ts). */
function environments(text: string): string[] {
  return [...text.matchAll(/^\s+environment:\s*(\S+)\s*$/gm)].flatMap((m) =>
    m[1] ? [m[1]] : [],
  );
}

/** Each deploy job's `if:` guard, keyed by the environment it deploys to. */
function guards(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of text.matchAll(
    /^ {2}\w+:\n {4}if: (.+)\n(?: {4}.*\n)*? {4}environment: (\S+)$/gm,
  )) {
    if (m[1] && m[2]) out[m[2]] = m[1];
  }
  return out;
}

describe("deploy workflow", () => {
  const text = readFileSync(DEPLOY, "utf8");
  const found = environments(text);

  it("gates test on pull requests, qual on main and demo on tags", () => {
    expect(guards(text)).toEqual({
      test: "github.event_name == 'pull_request'",
      qual: "github.ref_type == 'branch' && github.event_name == 'push'",
      demo: "github.ref_type == 'tag'",
    });
  });

  it("deploys to test, qual and demo", () => {
    expect(found).toEqual(["test", "qual", "demo"]);
  });

  it("names every deployed environment with exactly four lowercase letters", () => {
    for (const env of found) {
      expect(env).toMatch(/^[a-z]{4}$/);
    }
  });

  it("only targets environments the app knows", () => {
    for (const env of found) {
      expect(APP_ENVS as readonly string[]).toContain(env);
    }
  });

  it("is triggered by pull_request and push only", () => {
    const block = /^on:\n((?: {2}.*\n|\n)+)/m.exec(text)?.[1] ?? "";
    const triggers = [...block.matchAll(/^ {2}(\w+):/gm)].map((m) => m[1]);
    expect(triggers).toEqual(["pull_request", "push"]);
  });

  it("deploys demo from v* tags only and never touches release branches", () => {
    const code = text
      .split("\n")
      .filter((line) => !line.trimStart().startsWith("#"))
      .join("\n");
    expect(code).toMatch(/tags: \[["']v\*["']\]/);
    expect(code).not.toMatch(/release\//);
    expect(code).not.toMatch(/^\s+release:/m);
  });
});
