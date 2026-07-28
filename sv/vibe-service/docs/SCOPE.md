# Vibe Service — Scope

## Objective

Provide **AI-assisted coding** capabilities by acting as a relay between the platform and the Goose AI engine. Manage coding sessions, stream AI responses in real time, and synchronise generated code with GitHub repositories.

---

## Functional Requirements

### AI Coding Sessions

| ID | Requirement |
|---|---|
| FR-VIBE1 | Users can start a new AI coding session with a natural-language task description. |
| FR-VIBE2 | The service relays the coding request to the Goose AI engine and streams the response back to the UI via Server-Sent Events (SSE). The user sees output as it is generated — no waiting for a complete response. |
| FR-VIBE3 | Sessions are persisted. Users can resume a previous session and view the full conversation history. |
| FR-VIBE4 | Users can cancel an in-progress coding session. The service terminates the upstream Goose request and updates the session status. |

### Recipes

| ID | Requirement |
|---|---|
| FR-VIBE5 | Users can create and manage Goose AI recipes — reusable task templates that pre-fill the coding prompt for common workflows. |
| FR-VIBE6 | Recipes can be scoped to a project or shared across the organisation. |

### GitHub Integration

| ID | Requirement |
|---|---|
| FR-VIBE7 | Users can connect their GitHub account via OAuth. The service stores the OAuth token for subsequent operations. |
| FR-VIBE8 | Generated code can be pushed to a specified GitHub repository and branch directly from the UI. |
| FR-VIBE9 | The service can open a pull request on GitHub for the pushed code, with an AI-generated description. |
| FR-VIBE10 | Users can browse available repositories and branches within their connected GitHub account. |

### Scheduling & Configuration

| ID | Requirement |
|---|---|
| FR-VIBE11 | Users can schedule a recurring AI coding task (e.g., a nightly code review or refactor job). |
| FR-VIBE12 | Administrators can configure Goose AI system settings (model selection, temperature, tool permissions) per deployment. |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-VIBE1 | First token of the AI response must reach the UI via SSE within **3 seconds** of the user submitting a request (network latency to the Goose AI engine excluded). |
| NFR-VIBE2 | The service must support **multiple concurrent coding sessions** without responses from one session leaking into another. |
| NFR-VIBE3 | GitHub OAuth tokens are stored encrypted and never returned in API responses or logs. |
| NFR-VIBE4 | A failure in the Goose AI engine must not crash the service. The service returns a clear error to the client and marks the session as failed. |
| NFR-VIBE5 | The service is stateless between requests. Session state is persisted in the database, allowing any instance to serve any session. |
| NFR-VIBE6 | Database connection pool is capped at **15 connections**. |
| NFR-VIBE7 | The service exposes `/actuator/health` for Kubernetes liveness and readiness probes. |
| NFR-VIBE8 | All GitHub API calls must use the user's own OAuth token. The service must never use a shared platform-level GitHub credential for user-initiated operations. |
