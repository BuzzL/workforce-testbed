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

release-please (`.github/workflows/release.yml`) keeps a release PR open on `main` and derives the next SemVer from Conventional Commits. Merging it tags `vX.Y.Z` and publishes a GitHub Release. It authenticates as the `buzzl-workforce-agent` GitHub App (secret `AGENT_APP_PRIVATE_KEY`, variable `AGENT_APP_CLIENT_ID`) so the release PR triggers CI.

The key is an **environment secret** of the GitHub Environment `agent-app` (limited to `main`, no reviewers), used by the `release-please` job via `environment: agent-app`, so PR workflows cannot read it. `test/workflows/app-key.test.ts` (a line-based check, no YAML parser) fails if any workflow file uses it without that environment, outside a job, or reaches it through `secrets: inherit`, `toJSON(secrets)` or `secrets[...]`. Any workflow on `main` can still read it, so CODEOWNERS approval on workflow changes is the real control. `workforce-images` uses the same environment for its weekly `Bump pins`.

### GitHub App `buzzl-workforce-agent`: minimal permissions

- Repository permissions: **Contents** write (push branches, tags, releases), **Pull requests** write (open and update PRs), **Checks** read, **Actions** read (runs and logs), **Metadata** read.
- Not granted: **Workflows** (agent PRs cannot edit `.github/workflows/*`; add it back only for a task that needs it), Administration, Environments, Secrets, Variables, Deployments. Checked by hand on 2026-09-30 by probing the API (403 for the missing permissions and for Actions cancel/delete).
- Key storage: the `.pem` lives in a local file now and as the `agent-app` environment secret in the repos above. Later (M4) it moves to Secrets Manager in the `workforce` account, injected into the ECS task, and the GitHub copies are removed. Rotate the key when it moves.

## Deploys

`.github/workflows/deploy.yml` deploys to the `development` GitHub Environment on every push to `main`, and to `production` when a release is published. `production` needs maintainer approval and only accepts `main` or `v*` tags. The deploy step is a stub until `workforce-infra` provides the accounts and OIDC roles.

## Layout

- `src/app.ts`: `buildApp()`, the Fastify app and routes (the unit under test)
- `src/server.ts`: process entrypoint (excluded from coverage; covered by the CI smoke test)
- `src/issues/`: the issue domain (`normalizeTitle`, in-memory `IssueStore`)
- `test/`: Vitest tests mirroring `src/`, using `app.inject()` for HTTP
