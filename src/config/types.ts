export const APP_ENVS = ["development", "production"] as const;

export type AppEnv = (typeof APP_ENVS)[number];

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface AppConfig {
  env: AppEnv;
  logLevel: LogLevel;
}
