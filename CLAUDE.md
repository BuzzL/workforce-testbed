# workforce-testbed

The TypeScript application that AI Workforce agents iterate on. Cross-repo context (architecture, environments, conventions) lives in the workspace `CLAUDE.md` one level up, when it's present.

## Rules

- **Commit rule**: every commit is short (one logical change), testable (it comes with the test/check that proves it) and not breakable (CI green on its own). Conventional Commits, because release-please derives versions from them.
- Changes land on `main` only through a squash-merged PR with green CI.
- **Branches** are named `feature/{ticket-id}-{short-summary}` (e.g. `feature/IAT-22-devcontainer-published-image`), with the Linear key as written in Linear. Create them from an up-to-date `main`.
- Public repo: no secrets, AWS account IDs, emails or ARNs.

## Commands

| Command | What it does |
|---|---|
| `npm run lint` | ESLint + Prettier check |
| `npm run format` | Prettier write |
| `npm run typecheck` | `tsc --noEmit` over `src/` and `test/` |
| `npm test` | Vitest with v8 coverage (80% thresholds) |
| `npm run build` / `npm start` | compile to `dist/` / run the server (`PORT`, `HOST`) |

Local development: open the repo in its devcontainer (`.devcontainer/`, Node 24). Its build is verified by the `Devcontainer` workflow whenever it changes.

No local Node? Push the branch, then run `gh workflow run autofix.yml --ref <branch>`. It regenerates `package-lock.json`, applies Prettier and commits the result to the branch. Run it before opening the PR so CI runs on the fixed head. It never runs on `main`.

## Releases

release-please (`.github/workflows/release.yml`) keeps a release PR open on `main` and derives the next SemVer from Conventional Commits. Merging it tags `vX.Y.Z` and publishes a GitHub Release. It authenticates as the `buzzl-workforce-agent` GitHub App (secret `AGENT_APP_PRIVATE_KEY`, variable `AGENT_APP_CLIENT_ID`) so the release PR triggers CI.

## Deploys

`.github/workflows/deploy.yml` deploys to the `development` GitHub Environment on every push to `main`, and to `production` when a release is published. `production` needs maintainer approval and only accepts `main` or `v*` tags. The deploy step is a stub until `workforce-infra` provides the accounts and OIDC roles.

## Layout

- `src/app.ts`: `buildApp()`, the Fastify app and routes (the unit under test)
- `src/server.ts`: process entrypoint (excluded from coverage; covered by the CI smoke test)
- `src/issues/`: the issue domain (`normalizeTitle`, in-memory `IssueStore`)
- `test/`: Vitest tests mirroring `src/`, using `app.inject()` for HTTP
