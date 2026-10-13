# admin-console (Role & Access Management)

New MFE remote implementing the UI screens from
[`docs/RBAC_Admin_Replatform_Plan.md`](../../docs/RBAC_Admin_Replatform_Plan.md) §10.

**Status: fully wired.** All six screens call real `sv/usm-service`
endpoints via `src/app/core/api.service.ts` — the new `access`/`publishing`/
`menu`/`audit`/`tenancy`/`identity` packages (§9), plus the existing legacy
`OrganisationResource`/`ProjectResource` for Tenancy's orgs/projects. The
existing `essedum-ui/shell/projects/iamp-usm` module and legacy `sv/usm-service`
RBAC code are untouched; this ships alongside them per the doc's
strangler-fig plan (§11), not as a replacement yet.

## Screens (§10)

| Route | Screen |
|---|---|
| `tenancy` | Organizations & Projects (legacy APIs) + Environments (`rbac_environment`, new) — **live API** |
| `access` | Members & Roles (grant/revoke, scoped to project/org/platform) — **live API** |
| `publishing` | My Drafts (asset versions, submit for review) — **live API** |
| `approvals` | Single adaptive approval queue (§6), filtered by viewer's gates — **live API** |
| `audit` | Audit log viewer (`rbac_audit_event`, NFR-O2) — **live API** |
| `menu-configuration` | Manage `rbac_menu_item` rows driving `MenuService` (§7) — **live API** |

## Run standalone

```bash
npm install
$env:ESSEDUM_BACKEND_HOST = "http://localhost:8080"   # usm-service gateway
npm start   # serves on http://localhost:8090, proxies /api/** per proxy.config.js
```

The live screens call endpoints that take a caller id (`userId`/`actorId`).
`core/user-context.service.ts` resolves this from the shell's own
`sessionStorage.getItem('user')` (same mechanism `apis.service.ts` and
`sidebar.component.ts` already use) when running inside the shell — so a
real logged-in user is used automatically. Falls back to a manual "Acting
as User ID" field only when there's no session (e.g. standalone `npm start`
without logging in first). Note this id still isn't verified server-side
against a JWT (NFR-SEC2/SEC7 gap, §4) — any caller can claim any user id.

## Wire into the shell

Registered in `essedum-ui/shell/src/assets/json/mf.manifest.json` under key
`admin-console`, `routePath: "admin-console"`, pointing at
`/mfe/admin-console/remoteEntry.js` — the same convention used by the other
remotes. That path is served by the shell's own nginx once built:

- Root `essedum-ui/Dockerfile` (multi-stage) now has a build stage for this
  module and copies `dist/admin-console` to `/app/ui/admin-console/` in the
  runtime image, alongside the other MFEs.
- `essedum-ui/nginx_ui_multi.conf` now maps `location /mfe/admin-console/`
  to that directory, matching the `agent`/`data-ops`/`integration`/
  `vibe-studio` locations.

No separate AKS deployment is needed — `aks-deployment/essedum-ui.yaml`
builds from the same root `Dockerfile`, so this module ships in the existing
`essedum-ui` image.

**Local dev override:** when running this module standalone via `npm start`
(port 8090) against a shell served some other way (not the built nginx
image), temporarily point the manifest's `remoteEntry` at
`http://localhost:8090/remoteEntry.js` instead — see the `mfe14` entry in
the same manifest for the pattern. Don't commit that change.


## Next steps toward the full design

1. Server-side JWT verification of the caller id (NFR-SEC2/SEC7) — today the
   gateway/endpoints trust whatever `userId`/`actorId` the client sends.
2. Short-TTL cache on `AccessContextService.resolve()`, invalidated on
   `rbac_role_assignment` writes (§4) — every call still hits the DB fresh.
3. `organisation_id` on `usm_project` (added this pass) is nullable and
   unpopulated for existing legacy projects — org-scoped reach only works
   once those rows are backfilled (§11 phase-2 migration data step).
4. Identity sync (§8): `com.lfn.iamp.usm.identity` only implements the
   outbox/queue half (enqueue + status tracking) — the four actual
   Git/K8s/Storage/Gateway connectors aren't built (no infra access to
   build/test them against from here), and there's deliberately no UI
   screen for this (dropped per an earlier decision in this project).
5. Dependency-closure promotion (§5) and break-glass access (§15) remain
   open design questions, unstarted.
6. Migration phase 0 (extract iamp-usm's shared utilities to
   `@essedum/shared-lib`) was checked, not built: nothing outside
   `iamp-usm` itself imports from its `public-api.ts` today (confirmed via
   repo-wide search) — `@essedum/shared-lib` already has its own
   consolidated versions of these utilities for the 4 real MFEs. The risk
   the plan flagged no longer applies; no extraction needed before
   `iamp-usm` can eventually be removed on that front.
7. Phases 2, 4–6 of §11 (data migration, feature flag, cutover, removal)
   remain fully unstarted by design — this is still "ships dark" alongside
   the legacy module.
5. Follow §11 phases 2–6 for data migration and old-module retirement.
