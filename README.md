# NetPulse

[![Status: WIP](https://img.shields.io/badge/status-early--WIP-orange.svg)](#project-status)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)

> Lightweight network monitoring and diagnostics service built on Node.js + Express.

## Project Status

**Early work-in-progress.** This repository currently contains project scaffolding
and design intent only — it is published to reserve the name and share the roadmap,
not as a finished product. Track progress and milestones in the
[Issues](https://github.com/donny-devops/netpulse/issues) tab.

If you are evaluating my work for production-ready examples, see instead:
[`infra-monitoring-dashboard`](https://github.com/donny-devops/infra-monitoring-dashboard),
[`fastapi-starter-kit`](https://github.com/donny-devops/fastapi-starter-kit), or
[`terraform-aws-modules`](https://github.com/donny-devops/terraform-aws-modules).

## Overview

NetPulse aims to be a small, self-hostable service that runs periodic network
diagnostics (latency, packet loss, DNS resolution, port/HTTP reachability) and
exposes the results over a simple REST API and dashboard.

## Planned Features

- [ ] Scheduled ping / latency and packet-loss probes
- [ ] HTTP(S) endpoint uptime checks with response-time tracking
- [ ] DNS resolution and TCP port reachability checks
- [ ] REST API (`/health`, `/checks`, `/results`) built with Express
- [ ] Prometheus-compatible `/metrics` endpoint
- [ ] Configurable alerting (Slack / email / webhook)
- [ ] Dockerfile + docker-compose for one-command self-hosting

## Tech Stack (intended)

Node.js · Express · TypeScript · Prometheus client · Docker

## Roadmap

| Milestone | Scope                                             | Status  |
| --------- | ------------------------------------------------- | ------- |
| M1        | Core probe engine + `/health` and `/checks` API   | Planned |
| M2        | Persistence + `/results` history                  | Planned |
| M3        | `/metrics` (Prometheus) + alerting integrations   | Planned |
| M4        | Container packaging + docs                         | Planned |

## Contributing

Ideas and issues are welcome while the design settles. Please open an issue
before submitting a pull request. See [`SECURITY.md`](SECURITY.md) for
vulnerability reporting.

## License

Released under the [MIT License](LICENSE).
