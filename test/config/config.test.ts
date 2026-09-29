import { describe, expect, it } from "vitest";

import { APP_ENVS, loadConfig } from "../../src/config/index.js";

describe("loadConfig", () => {
  it("defaults to development when APP_ENV is unset", () => {
    expect(loadConfig({}).env).toBe("development");
  });

  it.each(APP_ENVS)("loads the %s configuration", (env) => {
    expect(loadConfig({ APP_ENV: env }).env).toBe(env);
  });

  it("logs less in production than in development", () => {
    expect(loadConfig({ APP_ENV: "development" }).logLevel).toBe("debug");
    expect(loadConfig({ APP_ENV: "production" }).logLevel).toBe("info");
  });

  it("rejects an unknown environment", () => {
    expect(() => loadConfig({ APP_ENV: "staging" })).toThrow(
      /Unknown APP_ENV "staging"/,
    );
  });
});
