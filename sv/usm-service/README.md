# USM Service (User & Security Management)

## Overview

The USM Service handles all **user authentication, authorization, and organizational management** for the ESSEDUM platform. It is decomposed from the monolithic `iamp-lib-usm` module along with security components from `common-app`.

## Technical Details

| Property          | Value                  |
|-------------------|------------------------|
| **Port**          | `8081`                 |
| **Service Name**  | `usm-service`          |
| **Framework**     | Spring Boot 3.3.5      |
| **Java Version**  | 21                     |
| **Main Class**    | `com.lfn.usm.UsmServiceApplication` |
| **Source Files**   | 370 Java files         |

## Responsibilities

- **Authentication** — JWT-based authentication, OAuth2, database JWT auth
- **Authorization** — Role-based access control (RBAC), permissions management
- **User Management** — CRUD operations for users, user profiles
- **Organization Management** — Organizations, org units, portfolios
- **Role Management** — Roles, role-to-role mappings, role processes
- **Module & Permissions** — Module permissions, API permissions, permission mappings
- **Project Management** — Projects, user-project-role assignments
- **Notifications** — User notifications management
- **Secrets Management** — Integration with Vault/Azure Key Vault for secret storage

## Source Modules (from Monolith)

| Original Module      | Description                          |
|----------------------|--------------------------------------|
| `iamp-lib-usm`      | Core USM domain, services, REST APIs |
| `common-app`         | Security filters, JWT config, CORS   |
| `comm-lib-util`      | Shared utilities                     |
| `comm-lib-secrets`   | Secrets management library           |
| `common-lib-rest`    | Common REST utilities                |

## REST Endpoints

### User Management
| Resource                      | Base Path               |
|-------------------------------|-------------------------|
| `UsersResource`               | `/api/users`            |
| `UserUnitResource`            | `/api/user-units`       |
| `UserProjectRoleResource`     | `/api/user-project-roles` |
| `UserProcessMappingResource`  | `/api/user-process`     |
| `UserApiPermissionsResource`  | `/api/user-api-perms`   |
| `DelegateResource`            | `/api/delegates`        |

### Role & Permission Management
| Resource                      | Base Path               |
|-------------------------------|-------------------------|
| `RoleResource`                | `/api/roles`            |
| `RoleProcessResource`         | `/api/role-process`     |
| `UsmPermissionsResource`      | `/api/permissions`      |
| `UsmRolePermissionsResource`  | `/api/role-permissions` |
| `ModulePermissionResource`    | `/api/module-perms`     |
| `UsmPermissionApiResource`    | `/api/permission-api`   |

### Organization Management
| Resource                         | Base Path               |
|----------------------------------|-------------------------|
| `OrganisationResource`           | `/api/organisations`    |
| `OrgUnitResource`                | `/api/org-units`        |
| `UsmModuleResource`              | `/api/modules`          |
| `UsmModuleOrganisationResource`  | `/api/module-org`       |
| `UsmPortfolioResource`           | `/api/portfolios`       |

### Auth & Config
| Controller                    | Base Path               |
|-------------------------------|-------------------------|
| `DbJwtAuthController`        | `/api/auth`             |
| `OAuth2AuthController`       | `/api/oauth2`           |
| `GitHubOAuthController`      | `/api/github/oauth`     |
| `SecretManagerController`    | `/api/secrets`          |
| `ApplicationConfigResource`  | `/api/app-config`       |

## Database

- Supports **MySQL** and **PostgreSQL** via Spring profiles (`mysql`, `postgresql`)
- Schema managed by **Liquibase** changelogs
- Database name: `essedum_usm` (recommended)

## Running

```bash
# Start discovery-service first, then:
mvn spring-boot:run -pl usm-service -Dspring-boot.run.profiles=mysql

# Or with PostgreSQL
mvn spring-boot:run -pl usm-service -Dspring-boot.run.profiles=postgresql
```

## Configuration

- `src/main/resources/application.yml` — Main configuration
- `src/main/resources/application-mysql.yml` — MySQL profile
- `src/main/resources/application-postgresql.yml` — PostgreSQL profile
- `src/main/resources/application-oauth2.yml` — OAuth2 profile

