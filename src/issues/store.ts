import { randomUUID } from "node:crypto";

import { normalizeTitle } from "./title.js";

export type IssueStatus = "open" | "closed";

export interface Issue {
  id: string;
  title: string;
  status: IssueStatus;
  createdAt: string;
}

/** In-memory issue store. Good enough for a testbed; swapped out later. */
export class IssueStore {
  readonly #issues = new Map<string, Issue>();

  create(title: string): Issue {
    const issue: Issue = {
      id: randomUUID(),
      title: normalizeTitle(title),
      status: "open",
      createdAt: new Date().toISOString(),
    };
    this.#issues.set(issue.id, issue);
    return issue;
  }

  get(id: string): Issue | undefined {
    return this.#issues.get(id);
  }

  list(): Issue[] {
    return [...this.#issues.values()];
  }
}
