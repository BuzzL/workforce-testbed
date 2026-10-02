# workforce-testbed

The TypeScript application that AI Workforce agents iterate on. Cross-repo context (architecture, environments, conventions) lives in the workspace `CLAUDE.md` one level up, when it's present.

## Rules

- **Commit rule**: every commit is short (one logical change), testable (it comes with the test/check that proves it) and not breakable (CI green on its own). Conventional Commits, because release-please derives versions from them.
- Changes land on `main` only through a squash-merged PR with green CI.
- Public repo: no secrets, AWS account IDs, emails or ARNs.

## Commands

| Command | What it does |
|---|---|
| `npm run lint` | ESLint + Prettier check |
| `npm run format` | Prettier write |
| `npm run typecheck` | `tsc --noEmit` over `src/` and `test/` |
| `npm test` | Vitest with v8 coverage (80% thresholds) |
| `npm run build` / `npm start` | compile to `dist/` / run the server (`PORT`, `HOST`) |

Local development: open the repo in its devcontainer (`.devcontainer/`, Node 24). It uses the `base` image from `workforce-images`, pinned by digest; bump the digest by hand when a new image is published. Its build is verified by the `Devcontainer` workflow whenever it changes.

No local Node? Push the branch, then run `gh workflow run autofix.yml --ref <branch>`. It regenerates `package-lock.json`, applies Prettier and commits the result to the branch. Run it before opening the PR so CI runs on the fixed head. It never runs on `main`.

## Releases

release-please (`.github/workflows/release.yml`) keeps a release PR open on `main` and derives the next SemVer from Conventional Commits. Merging it tags `vX.Y.Z` and publishes a GitHub Release. It authenticates as the workforce agent GitHub App (secret `AGENT_APP_PRIVATE_KEY`, variable `AGENT_APP_CLIENT_ID`) so the release PR triggers CI.

The App key is an **environment secret** of the GitHub Environment `agent-app` (limited to `main`), used by the `release-please` job via `environment: agent-app`, so PR workflows cannot read it. `test/workflows/app-key.test.ts` (a line-based lint) fails if a workflow uses it without that environment. Setup, minimal App permissions, key storage and rotation live in one place: `docs/AGENT_APP_KEY.md` in `workforce-images`.

## Deploys

`.github/workflows/deploy.yml` deploys to the `test` GitHub Environment for every pull request, to `quality` on every push to `main`, and to `demo` when a `v*` tag is pushed (release-please tags on merge of its release PR). `release/*` branches are the real production release: fully manual, no workflow handles them. `demo` needs maintainer approval and only accepts `main` or `v*` tags. The finer promotion mechanics (canary rollout, rollback) are defined in the Linear project (milestone M6). `APP_ENV` takes `test` (the default), `quality` or `demo`. The deploy step is a stub until `workforce-infra` provides the accounts and OIDC roles.

## Layout

- `src/app.ts`: `buildApp()`, the Fastify app and routes (the unit under test)
- `src/server.ts`: process entrypoint (excluded from coverage; covered by the CI smoke test)
- `src/issues/`: the issue domain (`normalizeTitle`, in-memory `IssueStore`)
- `test/`: Vitest tests mirroring `src/`, using `app.inject()` for HTTP
