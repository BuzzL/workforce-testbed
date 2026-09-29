# workforce-testbed

The TypeScript application that AI Workforce agents iterate on. Cross-repo context (architecture, environments, conventions) lives in the workspace `CLAUDE.md` one level up, when it's present.

## Rules

- **Commit rule**: every commit is short (one logical change), testable (it comes with the test/check that proves it) and not breakable (CI green on its own). Conventional Commits, because release-please derives versions from them.
- Changes land on `main` only through a squash-merged PR with green CI.
- Public repo: no secrets, AWS account IDs, emails or ARNs.

## Layout

_Skeleton in progress: toolchain, tests and app are added commit by commit._
