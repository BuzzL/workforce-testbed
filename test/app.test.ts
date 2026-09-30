import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { test as testConfig } from "../src/config/test.js";
import {
  buildApp,
  IssueStore,
  loadConfig,
  SERVICE_NAME,
} from "../src/index.js";

describe("http api", () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = buildApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it("reports health", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      service: SERVICE_NAME,
      environment: "test",
    });
  });

  it("creates, lists and fetches an issue", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/issues",
      payload: { title: "  Add   search " },
    });
    expect(created.statusCode).toBe(201);
    const issue = created.json<{ id: string; title: string; status: string }>();
    expect(created.headers.location).toBe(`/issues/${issue.id}`);
    const followed = await app.inject({
      method: "GET",
      url: created.headers.location as string,
    });
    expect(followed.json()).toEqual(issue);
    expect(issue).toMatchObject({ title: "Add search", status: "open" });

    const list = await app.inject({ method: "GET", url: "/issues" });
    expect(list.json()).toEqual([issue]);

    const fetched = await app.inject({
      method: "GET",
      url: `/issues/${issue.id}`,
    });
    expect(fetched.statusCode).toBe(200);
    expect(fetched.json()).toEqual(issue);
  });

  it("returns 404 for an unknown issue", async () => {
    const response = await app.inject({ method: "GET", url: "/issues/nope" });

    expect(response.statusCode).toBe(404);
  });

  it("rejects a blank title with 400", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/issues",
      payload: { title: "   " },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "Title must not be empty" });
  });

  it("rejects a body without title with 400", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/issues",
      payload: {},
    });

    expect(response.statusCode).toBe(400);
  });
});

describe("buildApp options", () => {
  it("reports the configured environment", async () => {
    const app = buildApp({ config: loadConfig({ APP_ENV: "demo" }) });

    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.json()).toMatchObject({ environment: "demo" });
    await app.close();
  });

  it("logs at the configured level when logging is enabled", async () => {
    const app = buildApp({ config: testConfig, logger: true });

    expect(app.log.level).toBe("debug");
    await app.close();
  });

  it("uses the provided store", async () => {
    const store = new IssueStore();
    store.create("Seeded");
    const app = buildApp({ store });

    const response = await app.inject({ method: "GET", url: "/issues" });

    expect(response.json()).toHaveLength(1);
    await app.close();
  });
});
