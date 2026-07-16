# Vibe Service — Architecture

---

## 1. Service Architecture

Vibe Service is a **relay and session manager**. It does not generate code itself — it forwards requests to the Goose AI engine and streams the response back to the UI via SSE. All state (sessions, recipes, schedules) is persisted in its own database so any service instance can serve any session.

```mermaid
graph TB
    subgraph Inbound
        GW["API Gateway"]
        SSE_CLIENT["Browser (SSE connection)"]
    end

    subgraph Vibe Service
        CTL["REST Controllers\nCoding · Sessions · Recipes · Schedules · GitHub · OAuth"]
        SVC["Service Layer\nSession management · Recipe resolution · GitHub sync · Schedule mgmt"]
        SSE_HANDLER["SSE Handler\nStream AI tokens to UI as they arrive"]
        GOOSE_CLIENT["Goose API Client\nHTTP relay to Goose AI engine"]
        GH_CLIENT["GitHub Client\nOAuth + REST API"]
        SCHED["Scheduler\nRecurring coding tasks"]
    end

    subgraph External
        DB[("MySQL\nessedum_vibe")]
        GOOSE["Goose AI Engine\n(external process / pod)"]
        GITHUB["GitHub API"]
        VAULT["Vault / Azure KV\n(OAuth token storage)"]
    end

    GW --> CTL --> SVC
    SSE_CLIENT --> SSE_HANDLER
    SVC --> GOOSE_CLIENT --> GOOSE
    GOOSE_CLIENT --> SSE_HANDLER
    SVC --> GH_CLIENT --> GITHUB
    SVC --> SCHED
    SVC --> DB
    GH_CLIENT --> VAULT
```

**Key internal subsystems:**
- **SSE Handler** — holds open HTTP connections to browser clients. As Goose AI streams tokens, the handler pushes each chunk to the correct client connection identified by session ID.
- **Goose API Client** — wraps the HTTP call to the Goose AI engine. It reads the streaming response and feeds chunks to the SSE handler in real time.
- **GitHub Client** — handles OAuth token exchange and all GitHub REST operations (push, PR creation, branch listing).
- **Scheduler** — triggers recurring coding tasks using a lightweight internal scheduler backed by the `essedum_vibe` database.

---

## 2. Dependency Map

```mermaid
graph LR
    VIBE["Vibe Service"]

    subgraph Databases
        DB[("MySQL\nessedum_vibe")]
    end

    subgraph External
        GOOSE["Goose AI Engine\nHTTP / SSE stream"]
        GH["GitHub API\npush · PR · branch"]
        VAULT["Vault / Azure KV\nOAuth token storage"]
    end

    VIBE --> DB
    VIBE -->|relay prompts| GOOSE
    VIBE -->|push code / PR| GH
    VIBE -->|store / fetch tokens| VAULT
```

 Sessions, recipes, schedules, system config, GitHub OAuth token references |
| Goose AI Engine | External (HTTP/Stream) | Receives coding prompts; streams back generated code and explanations |
| GitHub API | External (HTTP) | Push code, create branches, open pull requests, list repos |
| Vault / Azure Key Vault | External (HTTP) | Store and retrieve GitHub OAuth access tokens |

Vibe Service has **no dependency on USM, ICIP, or Data services** at runtime.

---

## 3. Architectural Decisions

### AD-VIBE1 — Vibe is a relay, not a code generator
Vibe does not embed an LLM or run inference. It proxies requests to the Goose AI engine. This separation keeps Vibe lightweight and means the AI model can be upgraded or swapped (different Goose version, different engine) without changing the Vibe service.

### AD-VIBE2 — SSE for streaming over WebSocket
SSE (Server-Sent Events) is used instead of WebSocket for streaming AI responses. SSE is unidirectional (server → client), works over standard HTTP, and does not require a persistent bidirectional socket. For the use case of streaming text tokens, SSE is simpler and equally effective.

### AD-VIBE3 — Sessions are stateless across instances
Session state (conversation history, status) is persisted in MySQL. Any Vibe instance can resume any session. The SSE connection is the only in-memory state, and it re-attaches to the session record on reconnect.

### AD-VIBE4 — GitHub OAuth tokens stored in Vault, not in MySQL
After the OAuth callback, the GitHub access token is written to Vault. MySQL stores only the Vault path. This prevents token exposure in a database dump and centralises token lifecycle management.

### AD-VIBE5 — One OAuth token per user, not a shared platform credential
Each user connects their own GitHub account. Vibe uses the per-user token for all GitHub operations on their behalf. The platform never has a shared GitHub token, eliminating the risk of one user's action affecting another's repositories.

---

## 4. Architecturally Significant Flows

### Flow 1 — AI Coding Request with SSE Streaming

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant GW as API Gateway
    participant VIBE as Vibe Service
    participant GOOSE as Goose AI Engine
    participant DB as MySQL

    U->>GW: POST /api/vibe/coding/run {sessionId, prompt}
    GW->>VIBE: Forward
    VIBE->>DB: Load session + recipe context
    VIBE->>GOOSE: POST /run {prompt + context} (streaming response)
    VIBE-->>U: 200 OK (SSE stream opens)
    loop Token by token
        GOOSE-->>VIBE: Next token chunk
        VIBE-->>U: SSE event: data={chunk}
    end
    GOOSE-->>VIBE: Stream complete
    VIBE->>DB: Persist full response to session history
    VIBE-->>U: SSE event: data=[DONE]
```

### Flow 2 — Push Generated Code to GitHub

```mermaid
sequenceDiagram
    participant U as User
    participant VIBE as Vibe Service
    participant VAULT as Vault
    participant GH as GitHub API

    U->>VIBE: POST /api/vibe/github/push {sessionId, repo, branch, message}
    VIBE->>VAULT: Fetch GitHub OAuth token for user
    VAULT-->>VIBE: access_token
    VIBE->>GH: Get current file SHA (if file exists)
    GH-->>VIBE: SHA or 404
    VIBE->>GH: PUT /repos/{owner}/{repo}/contents/{path} {content, message, branch, sha?}
    GH-->>VIBE: 201 Created / 200 Updated
    VIBE-->>U: 200 OK {commitUrl}
```

### Flow 3 — GitHub OAuth Authorisation Flow

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant VIBE as Vibe Service
    participant GH as GitHub OAuth
    participant VAULT as Vault
    participant DB as MySQL

    U->>VIBE: GET /api/vibe/github/auth/initiate
    VIBE-->>U: Redirect to GitHub OAuth consent page
    U->>GH: User grants access
    GH-->>VIBE: GET /api/vibe/github/auth/callback?code=xxx
    VIBE->>GH: POST /login/oauth/access_token {code, client_id, secret}
    GH-->>VIBE: access_token
    VIBE->>VAULT: Store access_token under user path
    VIBE->>DB: Record vault path for user's GitHub token
    VIBE-->>U: Redirect to UI (auth complete)
```
