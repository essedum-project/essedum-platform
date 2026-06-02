# Vibe Service (AI-Assisted Coding)

## Overview

The Vibe Service provides **AI-assisted coding capabilities** for the ESSEDUM platform. It integrates with the Goose AI engine for code generation, manages coding sessions, handles GitHub synchronization, and supports SSE streaming for real-time AI responses. It is decomposed from the monolithic `icip-lib-vibe` module along with GitHub integration components from `common-app`.

## Technical Details

| Property          | Value                  |
|-------------------|------------------------|
| **Port**          | `8084`                 |
| **Service Name**  | `vibe-service`         |
| **Framework**     | Spring Boot 3.3.5      |
| **Java Version**  | 21                     |
| **Main Class**    | `com.lfn.vibe.VibeServiceApplication` |
| **Source Files**   | 383 Java files         |

## Responsibilities

- **Goose AI Integration** — Relay requests to Goose AI engine for code generation and assistance
- **Coding Sessions** — Create, manage, and track AI coding sessions
- **GitHub Sync** — Push generated code to GitHub repositories, create pull requests
- **SSE Streaming** — Server-Sent Events for real-time AI response streaming
- **Recipe Management** — Manage Goose AI recipes for different coding tasks
- **Schedule Management** — Schedule recurring AI coding tasks
- **System Configuration** — Configure Goose AI system settings
- **GitHub OAuth** — GitHub authorization flow for repository access

## Source Modules (from Monolith)

| Original Module      | Description                              |
|----------------------|------------------------------------------|
| `icip-lib-vibe`      | Goose API relay, session management, SSE |
| `common-app`         | GitHub OAuth controllers, integration    |
| `comm-lib-util`      | Shared utilities                         |
| `comm-lib-secrets`   | Secrets management library               |
| `common-lib-rest`    | Common REST utilities                    |

## REST Endpoints

### Vibe Coding
| Controller                | Description                          |
|---------------------------|--------------------------------------|
| `VibeCodingController`    | Main vibe coding operations          |
| `VibeGitHubController`   | Vibe-specific GitHub operations      |

### Goose AI
| Controller                | Description                          |
|---------------------------|--------------------------------------|
| `GooseSessionController`  | AI coding session management         |
| `GooseConfigController`   | Goose AI configuration               |
| `GooseRecipeController`   | Goose recipe management              |
| `GooseScheduleController` | Scheduled coding task management     |
| `GooseSystemController`   | Goose system settings                |

### GitHub Integration
| Controller                | Description                          |
|---------------------------|--------------------------------------|
| `GitHubController`        | GitHub repository operations         |
| `GitHubOAuthController`   | GitHub OAuth authorization flow      |

### Auth & Config
| Controller                | Description                          |
|---------------------------|--------------------------------------|
| `DbJwtAuthController`    | JWT authentication                   |
| `OAuth2AuthController`   | OAuth2 authentication                |
| `SecretManagerController` | Secret management                    |

## Key Features

### AI Code Generation
- Real-time code generation via Goose AI
- Multiple recipe support for different coding patterns
- Session-based context management

### GitHub Integration
- OAuth-based GitHub authentication
- Repository browsing and file management
- Code push and pull request creation
- Branch management

### SSE Streaming
- Real-time streaming of AI responses
- WebFlux-based reactive streaming
- Long-running code generation with progress updates

## Database

- Supports **MySQL** and **PostgreSQL** via Spring profiles
- Schema managed by **Liquibase** changelogs
- Database name: `essedum_vibe` (recommended)

## Running

```bash
# Start discovery-service first, then:
mvn spring-boot:run -pl vibe-service -Dspring-boot.run.profiles=mysql
```

## Configuration

- `src/main/resources/application.yml` — Main configuration
- `src/main/resources/application-mysql.yml` — MySQL profile
- `src/main/resources/application-postgresql.yml` — PostgreSQL profile
- `src/main/resources/application-oauth2.yml` — OAuth2 profile

