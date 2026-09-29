import { development } from "./development.js";
import { production } from "./production.js";
import { APP_ENVS, type AppConfig, type AppEnv } from "./types.js";

export {
  APP_ENVS,
  type AppConfig,
  type AppEnv,
  type LogLevel,
} from "./types.js";

const configs: Record<AppEnv, AppConfig> = { development, production };

function isAppEnv(value: string): value is AppEnv {
  return (APP_ENVS as readonly string[]).includes(value);
}

/** Selects the configuration from APP_ENV; defaults to development. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const name = env.APP_ENV ?? "development";
  if (!isAppEnv(name)) {
    throw new Error(
      `Unknown APP_ENV "${name}"; expected one of: ${APP_ENVS.join(", ")}`,
    );
  }
  return configs[name];
}
