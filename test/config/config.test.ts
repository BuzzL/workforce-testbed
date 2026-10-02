import { describe, expect, it } from "vitest";

import { APP_ENVS, loadConfig } from "../../src/config/index.js";

describe("loadConfig", () => {
  it("defaults to test when APP_ENV is unset", () => {
    expect(loadConfig({}).env).toBe("test");
  });

  it("knows the test, qual and demo environments", () => {
    expect(APP_ENVS).toEqual(["test", "qual", "demo"]);
  });

  it("names every environment with exactly four lowercase letters", () => {
    for (const env of APP_ENVS) {
      expect(env).toMatch(/^[a-z]{4}$/);
    }
  });

  it.each(APP_ENVS)("loads the %s configuration", (env) => {
    expect(loadConfig({ APP_ENV: env }).env).toBe(env);
  });

  it("logs more in test than in qual and demo", () => {
    expect(loadConfig({ APP_ENV: "test" }).logLevel).toBe("debug");
    expect(loadConfig({ APP_ENV: "qual" }).logLevel).toBe("info");
    expect(loadConfig({ APP_ENV: "demo" }).logLevel).toBe("info");
  });

  it.each(["development", "production", "qa"])(
    "rejects the retired %s environment",
    (env) => {
      expect(() => loadConfig({ APP_ENV: env })).toThrow(
        new RegExp(`Unknown APP_ENV "${env}"`),
      );
    },
  );

  it("rejects an unknown environment", () => {
    expect(() => loadConfig({ APP_ENV: "staging" })).toThrow(
      /Unknown APP_ENV "staging"/,
    );
  });
});
