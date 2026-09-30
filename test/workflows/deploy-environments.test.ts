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

  it("gates test on pull requests, qa on main and demo on release", () => {
    expect(guards(text)).toEqual({
      test: "github.event_name == 'pull_request'",
      qa: "github.event_name == 'push'",
      demo: "github.event_name == 'release'",
    });
  });

  it("deploys to test, qa and demo", () => {
    expect(found).toEqual(["test", "qa", "demo"]);
  });

  it("only targets environments the app knows", () => {
    for (const env of found) {
      expect(APP_ENVS as readonly string[]).toContain(env);
    }
  });
});
