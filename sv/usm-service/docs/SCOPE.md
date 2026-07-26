# USM Service — Scope

## Objective

Own the entire **identity, access, and organisational model** for the platform. Every user, role, permission, organisation, and project is defined here. All other services rely on USM-issued tokens and USM-defined permissions to make authorisation decisions.

---

## Functional Requirements

### Authentication

| ID | Requirement |
|---|---|
| FR-USM1 | Users can authenticate with username + password. The service issues a signed JWT on success. |
| FR-USM2 | The service supports OAuth2 / OIDC login via Keycloak. External identity providers (LDAP, SAML) can be federated through Keycloak. |
| FR-USM3 | Tokens have a configurable expiry. Expired tokens are rejected with HTTP 401. |
| FR-USM4 | Users can reset their password via a time-limited email link. |

### User Management

| ID | Requirement |
|---|---|
| FR-USM5 | Administrators can create, update, and deactivate user accounts. |
| FR-USM6 | Each user has a profile (name, email, timezone, notification preferences). |
| FR-USM7 | Administrators can assign users to projects and define their role within each project. |
| FR-USM8 | One user can delegate access to another user for a defined period. |

### Role & Permission Management

| ID | Requirement |
|---|---|
| FR-USM9 | Roles are created and managed by administrators. Each role has a named set of permissions. |
| FR-USM10 | Permissions are defined at the module level and at the individual API endpoint level. |
| FR-USM11 | Every API call is checked against the calling user's permissions. Unauthorised calls return HTTP 403. |
| FR-USM12 | Role-to-role mappings allow hierarchical permission inheritance. |

### Organisation & Project Management

| ID | Requirement |
|---|---|
| FR-USM13 | The system supports a three-level hierarchy: Organisation → Org Unit → Portfolio → Project. |
| FR-USM14 | Projects are isolated boundaries — users cannot access data, pipelines, or models outside their assigned projects. |
| FR-USM15 | Administrators can create, update, and archive organisations, org units, and projects. |

### Secrets & Notifications

| ID | Requirement |
|---|---|
| FR-USM16 | Sensitive credentials (API keys, cloud secrets) are stored and retrieved via HashiCorp Vault or Azure Key Vault — never in the database as plaintext. |
| FR-USM17 | Users receive in-app notifications for key events. Notification preferences are configurable per user. |
| FR-USM18 | The service can send transactional emails (password reset, account invite). |

---

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-USM1 | Authentication endpoint (`/api/authenticate`) must respond in **< 300 ms** at 100 concurrent users. |
| NFR-USM2 | All user passwords must be hashed with a strong algorithm (bcrypt or Argon2). Plaintext passwords must never be logged or stored. |
| NFR-USM3 | The service must support **at least 500 concurrent authenticated sessions** without degradation. |
| NFR-USM4 | The service is stateless — token validation requires no shared in-process state, enabling horizontal scaling. |
| NFR-USM5 | Database connection pool is capped at **20 connections** to prevent MySQL exhaustion. |
| NFR-USM6 | All secrets are injected via environment variables or Vault. No credential is hardcoded in source or config files. |
| NFR-USM7 | The service exposes `/actuator/health` for Kubernetes liveness and readiness probes. |
| NFR-USM8 | Audit events (login, logout, role change, user deactivation) must be logged with a timestamp and actor identity. |
