# USM Service — Architecture

---

## 1. Service Architecture

USM is a **standard layered Spring Boot service**. Requests arrive from the gateway, pass through security filters, reach a REST controller, and flow down through the service and repository layers to the database.

```mermaid
graph TB
    subgraph Inbound
        GW["API Gateway"]
    end

    subgraph USM Service
        SEC["Security Filter\nRBAC permission check"]
        CTL["REST Controllers\nUsers · Roles · Orgs · Auth · Notifications"]
        SVC["Service Layer\nBusiness logic · Token issuance · Delegation"]
        REPO["Repository Layer\nSpring Data JPA"]
        SEC_LIB["Shared Libs\ncomm-lib-util · common-lib-rest · comm-lib-secrets"]
    end

    subgraph External
        DB[("MySQL\nessedum_usm")]
        KC["Keycloak\nOAuth2 / OIDC"]
        VAULT["HashiCorp Vault\n/ Azure Key Vault"]
        EMAIL["Email Provider\nSMTP"]
    end

    GW --> SEC --> CTL --> SVC --> REPO --> DB
    SVC --> KC
    SVC --> VAULT
    SVC --> EMAIL
    SEC_LIB -.->|used by| SVC
```

**Layer responsibilities:**
- **Security Filter** — verifies the JWT, resolves the user's roles, and checks permissions against the requested endpoint before the controller is reached.
- **Controllers** — parse HTTP requests, validate inputs, delegate to services, return responses. No business logic.
- **Service Layer** — owns all business rules: token issuance, RBAC evaluation, delegation logic, notification dispatch.
- **Repository Layer** — JPA-based persistence. One repository per aggregate root (User, Role, Organisation, Project, etc.).

---

## 2. Dependency Map

```mermaid
graph LR
    USM["USM Service"]

    subgraph Databases
        DB[("MySQL\nessedum_usm")]
    end

    subgraph External
        KC["Keycloak\nOAuth2 / OIDC"]
        VAULT["Vault / Azure KV\nSecrets"]
        EMAIL["SMTP\nEmail Provider"]
    end

    subgraph Libraries
        LIB1["comm-lib-util"]
        LIB2["comm-lib-secrets"]
        LIB3["common-lib-rest"]
    end

    USM --> DB
    USM --> KC
    USM --> VAULT
    USM --> EMAIL
    USM -.->|uses| LIB1 & LIB2 & LIB3
```

 Stores users, roles, permissions, organisations, projects, notifications |
| Keycloak | External (HTTP) | OAuth2 / OIDC token exchange; federates external IdPs (LDAP, SAML) |
| HashiCorp Vault / Azure KV | External (HTTP) | Read and write secrets (API keys, cloud credentials) |
| Email Provider (SMTP) | External | Send password-reset and account-invite emails |
| `comm-lib-util` | Shared library | Logging, common utilities |
| `comm-lib-secrets` | Shared library | Vault / Key Vault client abstraction |
| `common-lib-rest` | Shared library | Error response format, REST helpers |

USM has **no dependency on any other domain service** (ICIP, Data, Vibe).

---

## 3. Architectural Decisions

### AD-USM1 — RBAC enforced in the service layer, not just the UI
Permission checks run server-side on every API call. The UI can hide buttons, but access is ultimately controlled by the server. This prevents privilege escalation via direct API calls.

### AD-USM2 — JWT issued by USM, validated by the gateway
USM mints tokens for DB-JWT auth mode. For OAuth2 mode, Keycloak mints the token and USM validates it. In both cases, the gateway is the single validation point — USM does not re-validate tokens arriving from the gateway.

### AD-USM3 — Project as the isolation boundary
All data in the platform (files, pipelines, models) is scoped to a project. USM owns the project definition and user-project-role assignment. Other services enforce the boundary by checking the project claim in the token.

### AD-USM4 — Secrets stored in Vault, not the database
Credentials and API keys referenced by users or pipelines are stored in Vault / Azure Key Vault. The database holds only a reference (path/key name). This ensures secrets are never exposed in a database dump.

### AD-USM5 — Auth mode switchable via Spring profile
The service supports `dbjwt` (self-issued JWT) and `oauth2` (Keycloak) auth modes, toggled by the active Spring profile. The same binary runs in both modes; no code branching.

---

## 4. Architecturally Significant Flows

### Flow 1 — User Login (DB JWT mode)

```mermaid
sequenceDiagram
    participant C as Client
    participant GW as API Gateway
    participant USM as USM Service
    participant DB as MySQL

    C->>GW: POST /api/authenticate {username, password}
    GW->>USM: Forward (no token required for this endpoint)
    USM->>DB: Load user record + hashed password
    USM->>USM: Verify bcrypt hash
    alt Invalid credentials
        USM-->>C: 401 Unauthorized
    else Valid
        USM->>DB: Load roles + permissions for user
        USM->>USM: Sign JWT with user claims + roles
        USM-->>C: 200 OK {token, expiry}
    end
```

### Flow 2 — Permission Check on Protected Endpoint

```mermaid
sequenceDiagram
    participant C as Client
    participant GW as API Gateway
    participant USM as USM Service
    participant DB as MySQL

    C->>GW: GET /api/usm/roles (Bearer token)
    GW->>GW: Validate token signature + expiry
    GW->>USM: Forward request + user claims in headers
    USM->>USM: Extract user ID + roles from token
    USM->>DB: Load permission set for roles
    alt Missing permission
        USM-->>C: 403 Forbidden
    else Permitted
        USM->>DB: Fetch roles
        USM-->>C: 200 OK [roles]
    end
```

### Flow 3 — User-Project-Role Assignment

```mermaid
sequenceDiagram
    participant ADMIN as Admin User
    participant GW as API Gateway
    participant USM as USM Service
    participant DB as MySQL

    ADMIN->>GW: POST /api/usm/user-project-roles {userId, projectId, roleId}
    GW->>USM: Forward
    USM->>USM: Verify caller has ADMIN permission on the project
    USM->>DB: Insert user_project_role record
    USM-->>ADMIN: 201 Created
    Note over USM: Next token issued to that user<br/>will include the new project + role claim
```
