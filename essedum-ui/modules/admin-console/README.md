# admin-console (Role & Access Management)

New MFE remote implementing the UI screens from
[`docs/RBAC_Admin_Replatform_Plan.md`](../../docs/RBAC_Admin_Replatform_Plan.md) §10.

**Status: partially wired.** Access, My Drafts, Approvals, and Menu
Configuration call the real `sv/usm-service` endpoints (§9's `access`/
`publishing`/`menu` packages) via `src/app/core/api.service.ts`. Tenancy and
Audit still read from the in-memory `MockDataService` — Tenancy needs the
existing Organisation/Project JHipster APIs wired in (not done here), and
Audit has no backend endpoint at all yet. The existing
`essedum-ui/shell/projects/iamp-usm` module and legacy `sv/usm-service` RBAC
code are untouched; this ships alongside them per the doc's strangler-fig
plan (§11), not as a replacement yet.

## Screens (§10)

| Route | Screen |
|---|---|
| `tenancy` | Organizations, Projects & Environments — **mock data** |
| `access` | Members & Roles (grant/revoke, scoped to project/org/platform) — **live API** |
| `publishing` | My Drafts (asset versions, submit for review) — **live API** |
| `approvals` | Single adaptive approval queue (§6), filtered by viewer's gates — **live API** |
| `audit` | Audit log viewer — **mock data** |
| `menu-configuration` | Manage `rbac_menu_item` rows driving `MenuService` (§7) — **live API** |

## Run standalone

```bash
npm install
$env:ESSEDUM_BACKEND_HOST = "http://localhost:8080"   # usm-service gateway, for the live screens
npm start   # serves on http://localhost:8090, proxies /api/** per proxy.config.js
```

The live screens call endpoints that take a caller id (`userId`/`actorId`) —
there's no JWT wiring yet (see gaps below), so the shell's top-right "Acting
as User ID" field (backed by `core/user-context.service.ts`) stands in for a
logged-in user. Default is `1`; grant that user a role via Access first (or
insert a `rbac_role_assignment` row directly) to see anything in Approvals.

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

1. Wire Tenancy to the existing Organisation/Project JHipster APIs; add a
   backend endpoint for Audit (no service produces that feed yet).
2. Real auth: derive the caller from the shell's JWT instead of the "Acting
   as User ID" stand-in; add a short-TTL cache to `AccessContextService` (§4).
3. `AccessContextService.resolve()`'s `reachableProjectIds` only comes from
   explicit project-scoped `rbac_role_assignment` rows — an org_admin or
   platform_admin with only an org/platform-scoped grant currently sees no
   assets/drafts/approvals. Needs the fuller org/public-scope visibility
   query from §4 before this is correct for non-project-scoped roles.
4. Add a shell-side nav entry/permission gate so users can actually reach
   `/admin-console` (today it's reachable by URL once deployed, but isn't
   linked from the sidebar) — this is what `menu-configuration`'s data is
   *for*, but nothing reads it on the shell side yet.
5. Follow §11 phases 2–6 for data migration and old-module retirement.
