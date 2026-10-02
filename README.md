# workforce-testbed

[![CI](https://github.com/BuzzL/workforce-testbed/actions/workflows/ci.yml/badge.svg)](https://github.com/BuzzL/workforce-testbed/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

A small TypeScript application that serves as the **target codebase** for the AI Workforce. The developer agents pick up Linear issues, change this code, open PRs and cut releases. The agents run on AWS and are triggered by Linear issues.

The code is deliberately small but real, with tests and CI, so every agent change can be verified automatically.

> **Status:** early skeleton. See the [commit history](https://github.com/BuzzL/workforce-testbed/commits/main) for what exists so far.

## The AI Workforce repositories

| Repository | Purpose |
|---|---|
| [workforce-infra](https://github.com/BuzzL/workforce-infra) | Terraform: AWS Organization, workforce and environment accounts, cross-account roles |
| [workforce-images](https://github.com/BuzzL/workforce-images) | Developer container images (base, Python) for agents and devcontainers |
| **workforce-testbed** | This repo: the TypeScript codebase the agents iterate on |

## Local development

Development happens inside the repo's devcontainer, which uses the published `base` image from [workforce-images](https://github.com/BuzzL/workforce-images), the same `base` image the agents run. You need no local Node.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/), running (`docker info` works), and network access to pull the image from GHCR on the first start
- [Visual Studio Code](https://code.visualstudio.com/)
- the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension (`ms-vscode-remote.remote-containers`)

### Open it

1. Clone the repo and open it in VS Code: `git clone https://github.com/BuzzL/workforce-testbed.git && code workforce-testbed`.
2. Choose **Reopen in Container** when prompted, or run **Dev Containers: Reopen in Container** from the command palette. The first start pulls the image (pinned by digest) and runs `npm ci`.
3. In the integrated terminal, check the toolchain and the tests:

   ```sh
   git --version; gh --version; node -v; claude --version; aws --version; terraform version
   id -un        # dev
   npm run lint && npm run typecheck && npm test
   ```

4. Optionally start the server with `npm run build && PORT=3000 npm start`. Port 3000 is forwarded, so `http://localhost:3000/health` answers with `"environment": "test"`.

ESLint, Prettier and Vitest are installed in the container for you. If you need `gh` to talk to GitHub and it is not logged in inside the container, run `gh auth login`. If the container fails to start, **Dev Containers: Show Container Log** has the details.

## Environments

| Environment | Deployed when | Protection |
|---|---|---|
| `test` | every pull request | none |
| `qual` | every merge to `main` | none |
| `demo` | a `v*` tag is pushed | maintainer approval |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Every commit is short, testable and leaves CI green.

## License

[Apache-2.0](LICENSE)
