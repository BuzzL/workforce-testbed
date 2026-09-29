import Fastify, { type FastifyInstance } from "fastify";

import { type AppConfig, loadConfig } from "./config/index.js";
import { type Issue, IssueStore } from "./issues/store.js";
import { SERVICE_NAME } from "./service.js";

export interface AppOptions {
  config?: AppConfig;
  store?: IssueStore;
  logger?: boolean;
}

const createIssueSchema = {
  body: {
    type: "object",
    required: ["title"],
    properties: { title: { type: "string" } },
    additionalProperties: false,
  },
} as const;

export function buildApp(options: AppOptions = {}): FastifyInstance {
  const config = options.config ?? loadConfig({});
  const app = Fastify({
    logger: options.logger ? { level: config.logLevel } : false,
  });
  const store = options.store ?? new IssueStore();

  app.get("/health", () => ({
    status: "ok",
    service: SERVICE_NAME,
    environment: config.env,
  }));

  app.get("/issues", () => store.list());

  app.get<{ Params: { id: string } }>("/issues/:id", async (request, reply) => {
    const issue = store.get(request.params.id);
    if (!issue) {
      return reply.code(404).send({ error: "Issue not found" });
    }
    return issue;
  });

  app.post<{ Body: { title: string } }>(
    "/issues",
    { schema: createIssueSchema },
    async (request, reply) => {
      let issue: Issue;
      try {
        issue = store.create(request.body.title);
      } catch (error) {
        if (error instanceof RangeError) {
          return reply.code(400).send({ error: error.message });
        }
        throw error;
      }
      return reply.code(201).send(issue);
    },
  );

  return app;
}
