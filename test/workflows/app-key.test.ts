import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const SECRET = "AGENT_APP_PRIVATE_KEY";
const DIR = fileURLToPath(new URL("../../.github/workflows", import.meta.url));
const OUTSIDE_JOB = "<outside a job>";
// Ways to reach every secret without naming the App key.
const BROAD_ACCESS = [/secrets:\s*inherit/, /toJSON\(\s*secrets\s*\)/, /secrets\[/];

/** Problems that would let a workflow read the App key outside `agent-app`. */
function violations(text: string): string[] {
  const bad: string[] = [];
  let inJobs = false;
  let job = OUTSIDE_JOB;
  let lines: string[] = [];
  const flush = () => {
    if (!lines.some((l) => l.includes(SECRET))) return;
    const scoped =
      job !== OUTSIDE_JOB &&
      lines.some((l) =>
        /^ {4}environment:\s*["']?agent-app["']?\s*(#.*)?$/.test(l),
      );
    if (!scoped) bad.push(job);
  };
  for (const line of text.split("\n")) {
    if (/^\s*(#.*)?$/.test(line)) continue; // blanks and comments
    if (/^\S/.test(line)) {
      flush();
      job = OUTSIDE_JOB;
      lines = [line];
      inJobs = line.startsWith("jobs:");
    } else if (inJobs && /^ {2}[\w-]+:\s*(#.*)?$/.test(line)) {
      flush();
      job = line.trim().split(":")[0] ?? OUTSIDE_JOB;
      lines = [];
    } else {
      lines.push(line);
    }
  }
  flush();
  for (const pattern of BROAD_ACCESS) {
    if (pattern.test(text)) bad.push(String(pattern));
  }
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

  it("is not switched off by a column-0 comment inside jobs", () => {
    const text = `jobs:
  a:
    runs-on: x
# note
  b:
    steps:
      - run: echo \${{ secrets.${SECRET} }}
`;
    expect(violations(text)).toEqual(["b"]);
  });

  it("flags the key outside any job", () => {
    expect(violations(`env:\n  K: \${{ secrets.${SECRET} }}\njobs:\n`)).toEqual([
      OUTSIDE_JOB,
    ]);
  });

  it("flags broad secret access", () => {
    expect(violations("jobs:\n  a:\n    secrets: inherit\n")).toHaveLength(1);
    expect(violations("jobs:\n  a:\n    env: ${{ toJSON(secrets) }}\n")).toHaveLength(1);
    expect(violations("jobs:\n  a:\n    env: ${{ secrets['X'] }}\n")).toHaveLength(1);
  });

  it("every workflow uses the key only through agent-app", () => {
    const files = readdirSync(DIR).filter((f) => /\.ya?ml$/.test(f));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      expect(violations(readFileSync(join(DIR, file), "utf8")), file).toEqual(
        [],
      );
    }
  });
});
