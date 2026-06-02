# Vibe Coding — GitHub Integration

## Overview

The Vibe Coding module integrates with GitHub to automatically push AI-generated session code to a remote repository. Each session gets its own branch, enabling traceability, code review, and version control of all generated artifacts.

When GitHub integration is **disabled** (`vibe.github.enabled=false`), code is stored only in the database (legacy mode).

---

## Architecture

```
┌──────────────┐       ┌─────────────────────┐       ┌────────────────────┐
│  Vibe Studio │──────▶│ VibeGitHubController │──────▶│  VibeGitHubService │
│  (Frontend)  │ REST  │  (REST API layer)    │       │  (Git operations)  │
└──────────────┘       └─────────────────────┘       └────────┬───────────┘
                                                              │
                                ┌─────────────────────────────┼──────────────┐
                                │                             │              │
                                ▼                             ▼              ▼
                       ┌────────────────┐          ┌───────────────┐  ┌────────────┐
                       │ vibe_github_   │          │  Goose Working│  │   GitHub    │
                       │ config (DB)    │          │  Directory    │  │   Remote    │
                       └────────────────┘          └───────────────┘  └────────────┘
```

### Key Components

| Component | Package / Class | Responsibility |
|---|---|---|
| **VibeGitHubProperties** | `config.VibeGitHubProperties` | Binds `vibe.github.*` config properties |
| **VibeGitHubController** | `rest.VibeGitHubController` | REST endpoints for push, status, and listing |
| **VibeGitHubService** | `service.VibeGitHubService` | Clones repo, creates branch, copies files, commits & pushes via JGit |
| **VibeGitHubConfig** | `model.VibeGitHubConfig` | JPA entity persisting push metadata (`vibe_github_config` table) |
| **VibeGitHubConfigRepository** | `repository.VibeGitHubConfigRepository` | Spring Data JPA repository |

---

## Configuration

Add the following properties to your application YAML (e.g. `application-mysql.yml`):

```yaml
vibe:
  goose:
    working-dir: /home/engne2/essedum/goose    # Directory containing Goose-generated code
  github:
    enabled: true                               # true = push to GitHub, false = DB-only
    repo-url: https://github.com/org/repo       # Default target repository
    username: your-github-username               # GitHub username
    token: ghp_xxxxxxxxxxxxxxxxxxxx              # GitHub Personal Access Token (PAT)
    work-dir: /tmp/vibe-github                   # Local temp directory for git clone/push
    commit-message-template: "Vibe session {sessionId} — auto-generated code"
    branch-prefix: "vibe-session/"               # Branch name = prefix + sessionId
```

### Required GitHub PAT Scopes

The personal access token needs the following permissions:

- `repo` — full control of private repositories (or `public_repo` for public-only)

---

## REST API

Base path: `/{icip.pathPrefix}/service/v1/vibe-coding`

### 1. Push Session Code to GitHub

```
POST /sessions/{sessionId}/push-to-github
Content-Type: application/json
```

**Request Body:**

```json
{
  "org": "myOrganisation",
  "repoUrl": "https://github.com/org/repo"   // optional — overrides default
}
```

**Response** (`202 Accepted`):

```json
{
  "message": "Push to GitHub initiated",
  "sessionId": "abc-123",
  "branchName": "vibe-session/abc-123",
  "status": "IN_PROGRESS"
}
```

> The push runs **asynchronously** (`@Async`). Poll the status endpoint to track progress.

### 2. Get Push Status

```
GET /sessions/{sessionId}/github-status?org=myOrganisation
```

**Response** (`200 OK`):

```json
{
  "id": 1,
  "sessionId": "abc-123",
  "org": "myOrganisation",
  "repoUrl": "https://github.com/org/repo",
  "branchName": "vibe-session/abc-123",
  "commitSha": "a1b2c3d4e5f6...",
  "status": "SUCCESS",
  "storageType": "GITHUB",
  "errorMessage": null,
  "createdBy": "admin",
  "createdAt": "2026-04-23T10:00:00.000+00:00",
  "updatedAt": "2026-04-23T10:00:05.000+00:00"
}
```

**Status values:** `PENDING` → `IN_PROGRESS` → `SUCCESS` | `FAILED`

### 3. List All GitHub Configs for an Org

```
GET /github-configs?org=myOrganisation
```

**Response** (`200 OK`): Array of `VibeGitHubConfig` objects.

---

## Push Flow (Step-by-Step)

1. **API call** — Frontend sends `POST /sessions/{sessionId}/push-to-github`.
2. **Validation** — Controller checks `vibe.github.enabled` and required `org` field.
3. **DB record** — A `vibe_github_config` row is upserted with status `IN_PROGRESS`.
4. **Clone/Init** — Service clones the target repo (or initialises a fresh repo if empty).
5. **Branch** — A new branch `vibe-session/{sessionId}` is created and checked out.
6. **Copy files** — All files from the Goose working directory are copied into the local clone (`.git` directories are skipped).
7. **Commit** — Files are staged and committed with the configured message template.
8. **Push** — The branch is pushed to the GitHub remote using PAT authentication.
9. **Status update** — On success the commit SHA and `SUCCESS` status are saved; on failure the error message and `FAILED` status are recorded.
10. **Cleanup** — The local clone directory is deleted.

---

## Database Schema

**Table:** `vibe_github_config`

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT (PK, auto) | Primary key |
| `session_id` | VARCHAR(256) | Goose session identifier |
| `org` | VARCHAR(256) | Organisation / tenant |
| `repo_url` | VARCHAR(1024) | GitHub repository URL |
| `branch_name` | VARCHAR(512) | Branch created for the session |
| `commit_sha` | VARCHAR(64) | Latest pushed commit SHA |
| `status` | VARCHAR(32) | `PENDING`, `IN_PROGRESS`, `SUCCESS`, `FAILED` |
| `error_message` | VARCHAR(2048) | Error details (nullable) |
| `storage_type` | VARCHAR(32) | `DATABASE` or `GITHUB` |
| `created_by` | VARCHAR(256) | User who triggered the push |
| `created_at` | TIMESTAMP | Row creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Unique constraint:** (`session_id`, `org`)

---

## Enabling / Disabling

| Mode | Config | Behaviour |
|---|---|---|
| **GitHub** | `vibe.github.enabled: true` | Code is pushed to GitHub; metadata stored in DB |
| **Legacy (DB-only)** | `vibe.github.enabled: false` | Push endpoint returns `400 Bad Request` |

---

## Troubleshooting

| Symptom | Possible Cause | Fix |
|---|---|---|
| `400 — GitHub integration is disabled` | `vibe.github.enabled` is `false` | Set to `true` and restart |
| Status stays `IN_PROGRESS` | Async thread blocked or app crashed | Check application logs; re-trigger push |
| `FAILED` with auth error | Invalid PAT or insufficient scopes | Regenerate PAT with `repo` scope |
| `FAILED` — Goose dir not found | `vibe.goose.working-dir` path incorrect | Verify the directory exists and contains session output |
| Clone fails on empty repo | First push to a brand-new repo | Service handles this automatically (falls back to `git init`) |

