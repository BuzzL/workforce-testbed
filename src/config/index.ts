import { demo } from "./demo.js";
import { qa } from "./qa.js";
import { test } from "./test.js";
import { APP_ENVS, type AppConfig, type AppEnv } from "./types.js";

export {
  APP_ENVS,
  type AppConfig,
  type AppEnv,
  type LogLevel,
} from "./types.js";

const configs: Record<AppEnv, AppConfig> = { test, qa, demo };

function isAppEnv(value: string): value is AppEnv {
  return (APP_ENVS as readonly string[]).includes(value);
}

/** Selects the configuration from APP_ENV; defaults to test. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const name = env.APP_ENV ?? "test";
  if (!isAppEnv(name)) {
    throw new Error(
      `Unknown APP_ENV "${name}"; expected one of: ${APP_ENVS.join(", ")}`,
    );
  }
  return configs[name];
}
