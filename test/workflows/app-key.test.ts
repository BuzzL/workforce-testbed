import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const SECRET = "AGENT_APP_PRIVATE_KEY";
const DIR = ".github/workflows";

/** Job ids that read the App key without `environment: agent-app`. */
export function violations(text: string): string[] {
  const bad: string[] = [];
  let inJobs = false;
  let job: string | undefined;
  let lines: string[] = [];
  const flush = () => {
    if (
      job &&
      lines.some((l) => l.includes(SECRET)) &&
      !lines.some((l) => /^ {4}environment:\s*agent-app\s*$/.test(l))
    ) {
      bad.push(job);
    }
  };
  for (const line of text.split("\n")) {
    if (/^\S/.test(line)) {
      flush();
      job = undefined;
      lines = [];
      inJobs = line.startsWith("jobs:");
    } else if (inJobs && /^ {2}[\w-]+:\s*$/.test(line)) {
      flush();
      job = line.trim().slice(0, -1);
      lines = [];
    } else {
      lines.push(line);
    }
  }
  flush();
  return bad;
}

const GOOD = `jobs:
  release:
    environment: agent-app
    steps:
      - with:
          private-key: \${{ secrets.${SECRET} }}
`;

describe("agent App key scope", () => {
  it("accepts a job in the agent-app environment", () => {
    expect(violations(GOOD)).toEqual([]);
  });

  it("flags a job without the environment", () => {
    expect(
      violations(GOOD.replace("    environment: agent-app\n", "")),
    ).toEqual(["release"]);
  });

  it("flags another environment", () => {
    expect(violations(GOOD.replace("agent-app\n", "other\n"))).toEqual([
      "release",
    ]);
  });

  it("every workflow uses the key only through agent-app", () => {
    for (const file of readdirSync(DIR).filter((f) => f.endsWith(".yml"))) {
      expect(violations(readFileSync(join(DIR, file), "utf8")), file).toEqual(
        [],
      );
    }
  });
});
