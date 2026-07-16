# VS Code Extension — Scope

## Objective

Provide a **VS Code extension** that integrates the Essedum AI Platform into the developer's editor. The extension enables authentication via OAuth 2.0/PKCE, pipeline browsing, job submission, and real-time execution monitoring — without leaving VS Code.

---

## Functional Requirements

### Authentication

| ID | Requirement |
|---|---|
| FR-EXT1 | Users can authenticate with the Essedum platform via OAuth 2.0 with PKCE (Proof Key for Code Exchange). The extension launches the system browser for the Keycloak login page and receives the authorization code via a local callback server. |
| FR-EXT2 | Access tokens are refreshed automatically before expiry. Users do not need to re-authenticate during a session. |
| FR-EXT3 | Users can log out, which clears the stored tokens from VS Code's secret storage. |
| FR-EXT4 | The local OAuth callback server port is configurable (default: 8085). |

### Pipeline Browsing

| ID | Requirement |
|---|---|
| FR-EXT5 | Users can browse available pipelines on the Essedum platform from a sidebar panel in the VS Code Activity Bar. |
| FR-EXT6 | Pipelines are grouped and displayed with their name, type, and current status. |

### Job Submission & Monitoring

| ID | Requirement |
|---|---|
| FR-EXT7 | Users can submit a pipeline job directly from VS Code, specifying execution parameters via a UI form in the sidebar. |
| FR-EXT8 | Real-time execution status (running, completed, failed) and logs are displayed in the sidebar without requiring the user to open a browser. |
| FR-EXT9 | All API calls to the Essedum backend include the current Bearer token as the `Authorization` header. |

### VS Code Integration

| ID | Requirement |
|---|---|
| FR-EXT10 | The extension registers a custom sidebar view accessible from the VS Code Activity Bar via an Essedum icon. |
| FR-EXT11 | Extension commands are available via the VS Code Command Palette. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-EXT1 | The extension requires VS Code **1.103.0 or higher**. |
| NFR-EXT2 | OAuth tokens are stored in VS Code's built-in **SecretStorage** API — never written to disk or settings files. |
| NFR-EXT3 | PKCE code verifier and challenge are generated per authentication session — no static secrets are stored in the extension bundle. |
| NFR-EXT4 | The extension is built with TypeScript and webpack. It runs in the VS Code **extension host** process, not the renderer. |
| NFR-EXT5 | The backend server URL is configurable via VS Code settings (`essedum.serverUrl`) so the extension works with any Essedum deployment. |
