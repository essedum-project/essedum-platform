# Essedum AI Platform — VS Code Extension

> Architecture & design decisions: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

Integrates VS Code with the Essedum AI Platform: OAuth 2.0/PKCE authentication, pipeline browsing, job submission, and real-time execution monitoring.

## Features

- **OAuth 2.0 / PKCE Authentication** — one-click login via Keycloak, no manual token copying
- **Pipeline Browsing** — view available pipelines from the Activity Bar sidebar
- **Job Submission** — submit and monitor pipeline executions without leaving the editor
- **Automatic Token Refresh** — seamless session management

## Requirements

- VS Code 1.103.0+
- Active Essedum Platform account
- Port 8085 available (OAuth callback — configurable)

## Installation

Install via VS Code Extensions Marketplace or from the `.vsix` package.

## Configuration

| Setting | Default | Purpose |
|---|---|---|
| `essedum.serverUrl` | — | Essedum backend URL |
| `essedum.oauthPort` | `8085` | Local OAuth callback port |

## Usage

1. Open the Command Palette (`Ctrl+Shift+P`) → **Essedum: Login**
2. Complete authentication in the browser
3. Browse pipelines in the Essedum sidebar panel
