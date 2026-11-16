-- Restore accidentally deleted rbac_menu_item rows.
-- Safe to run multiple times — each INSERT is guarded by NOT EXISTS.
-- Run directly against the application database if a backend restart is not
-- immediately possible.  After a restart the Liquibase changeSets rbac-24
-- and rbac-25 will also apply these (and skip rows already present).

-- ── Admin-console items (min_role_rank ≥ 1) ─────────────────────────────────

INSERT INTO rbac_menu_item (label, route, min_role_rank, display_order, icon, parent_id, max_role_rank)
SELECT 'Overview', '/admin-console/overview', 1, 0, 'tachometer', NULL, NULL
    WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/admin-console/overview');

INSERT INTO rbac_menu_item (label, route, min_role_rank, display_order, icon, parent_id, max_role_rank)
SELECT 'Organizations & Projects', '/admin-console/tenancy', 2, 1, 'sitemap', NULL, NULL
    WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/admin-console/tenancy');

INSERT INTO rbac_menu_item (label, route, min_role_rank, display_order, icon, parent_id, max_role_rank)
SELECT 'Members & Roles', '/admin-console/access', 2, 2, 'users', NULL, NULL
    WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/admin-console/access');

INSERT INTO rbac_menu_item (label, route, min_role_rank, display_order, icon, parent_id, max_role_rank, roles)
SELECT 'My Drafts', '/admin-console/publishing', 99, 3, 'file-text-o', NULL, NULL,
       'Developer,Project Admin,Organization Admin,Admin'
    WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/admin-console/publishing');

INSERT INTO rbac_menu_item (label, route, min_role_rank, display_order, icon, parent_id, max_role_rank)
SELECT 'Approvals', '/admin-console/approvals', 2, 4, 'check-square-o', NULL, NULL
    WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/admin-console/approvals');

INSERT INTO rbac_menu_item (label, route, min_role_rank, display_order, icon, parent_id, max_role_rank)
SELECT 'Audit Log', '/admin-console/audit', 3, 5, 'history', NULL, NULL
    WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/admin-console/audit');

INSERT INTO rbac_menu_item (label, route, min_role_rank, display_order, icon, parent_id, max_role_rank)
SELECT 'Asset Catalog', '/admin-console/catalog', 1, 8, 'shopping-bag', NULL, NULL
    WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/admin-console/catalog');

INSERT INTO rbac_menu_item (label, route, min_role_rank, display_order, icon, parent_id, max_role_rank)
SELECT 'Identity Sync', '/admin-console/identity-sync', 3, 7, 'refresh', NULL, NULL
    WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/admin-console/identity-sync');

INSERT INTO rbac_menu_item (label, route, min_role_rank, display_order, icon, parent_id, max_role_rank)
SELECT 'Menu Configuration', '/admin-console/menu-configuration', 4, 6, 'th-list', NULL, NULL
    WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/admin-console/menu-configuration');

-- ── Product sidebar items (min_role_rank = 0, shown for AI Client / AI Engineer) ──

INSERT INTO rbac_menu_item (label, route, min_role_rank, display_order, icon, parent_id, max_role_rank)
SELECT 'Dashboard', '/dashboard', 0, 1, 'tachometer', NULL, NULL
    WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/dashboard');

INSERT INTO rbac_menu_item (label, route, min_role_rank, display_order, icon, parent_id, max_role_rank)
SELECT 'Pipelines', '/agent/pipeline', 0, 2, 'wpexplorer', NULL, NULL
    WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/agent/pipeline');

INSERT INTO rbac_menu_item (label, route, min_role_rank, display_order, icon, parent_id, max_role_rank)
SELECT 'Datasets', '/data/datasets', 0, 3, 'table', NULL, NULL
    WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/data/datasets');

INSERT INTO rbac_menu_item (label, route, min_role_rank, display_order, icon, parent_id, max_role_rank)
SELECT 'Models', '/data/models', 0, 4, 'superpowers', NULL, NULL
    WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/data/models');

INSERT INTO rbac_menu_item (label, route, min_role_rank, display_order, icon, parent_id, max_role_rank)
SELECT 'Connections', '/data/connections', 0, 5, 'plug', NULL, NULL
    WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/data/connections');

INSERT INTO rbac_menu_item (label, route, min_role_rank, display_order, icon, parent_id, max_role_rank)
SELECT 'Adapters', '/integration/implementations', 0, 6, 'exchange', NULL, NULL
    WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/integration/implementations');

INSERT INTO rbac_menu_item (label, route, min_role_rank, display_order, icon, parent_id, max_role_rank)
SELECT 'Agent Directory', '/agent/directory', 0, 7, 'address-book', NULL, NULL
    WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/agent/directory');

INSERT INTO rbac_menu_item (label, route, min_role_rank, display_order, icon, parent_id, max_role_rank)
SELECT 'Vibe Studio', '/vibe/editor', 0, 8, 'code', NULL, NULL
    WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/vibe/editor');

INSERT INTO rbac_menu_item (label, route, min_role_rank, display_order, icon, parent_id, max_role_rank)
SELECT 'Skills', '/agent/skills', 0, 10, 'star', NULL, NULL
    WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/agent/skills');

-- Verify
SELECT id, label, route, min_role_rank, display_order, icon FROM rbac_menu_item ORDER BY min_role_rank DESC, display_order;
