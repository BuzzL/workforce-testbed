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

## Environments

| Environment | Deployed when | Protection |
|---|---|---|
| `test` | every pull request | none |
| `qa` | every merge to `main` | none |
| `demo` | a release is published | maintainer approval |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Every commit is short, testable and leaves CI green.

## License

[Apache-2.0](LICENSE)
