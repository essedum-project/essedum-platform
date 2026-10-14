-- Manual, idempotent equivalent of changelog/rbac/rbac.xml (changesets rbac-1
-- through rbac-10), for applying directly against a local dev DB where
-- Liquibase is disabled / its changelog history has unrelated drift.
-- Run against essedum_coredb. Safe to re-run — every statement checks first.
--
-- Usage: mysql -u <user> -p essedum_coredb < manual-apply.sql
--
-- NOTE: several UPDATEs below filter on non-key columns (route, name), which
-- MySQL Workbench's "safe update mode" rejects with Error 1175. Disable it for
-- this session so the whole script runs (harmless for a one-off dev apply):
SET SQL_SAFE_UPDATES = 0;

-- rbac-1: roles
CREATE TABLE IF NOT EXISTS rbac_role (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE,
  `rank` INT NOT NULL
);

-- rbac-1-seed
INSERT INTO rbac_role (name, `rank`)
SELECT * FROM (SELECT 'viewer' AS name, 0 AS `rank`) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM rbac_role);

INSERT INTO rbac_role (name, `rank`)
SELECT * FROM (SELECT 'developer' AS name, 1 AS `rank`) AS tmp
WHERE (SELECT COUNT(*) FROM rbac_role) = 1;

INSERT INTO rbac_role (name, `rank`)
SELECT * FROM (SELECT 'project_admin' AS name, 2 AS `rank`) AS tmp
WHERE (SELECT COUNT(*) FROM rbac_role) = 2;

INSERT INTO rbac_role (name, `rank`)
SELECT * FROM (SELECT 'org_admin' AS name, 3 AS `rank`) AS tmp
WHERE (SELECT COUNT(*) FROM rbac_role) = 3;

INSERT INTO rbac_role (name, `rank`)
SELECT * FROM (SELECT 'platform_admin' AS name, 4 AS `rank`) AS tmp
WHERE (SELECT COUNT(*) FROM rbac_role) = 4;

-- rbac-2
CREATE TABLE IF NOT EXISTS rbac_role_assignment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  organization_id INT NULL,
  project_id INT NULL,
  granted_at DATETIME(6) NOT NULL,
  revoked_at DATETIME(6) NULL
);

-- rbac-3
CREATE TABLE IF NOT EXISTS rbac_asset (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  asset_type VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  scope VARCHAR(32) NOT NULL,
  current_version_id INT NULL
);

-- rbac-4
CREATE TABLE IF NOT EXISTS rbac_asset_version (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT NOT NULL,
  environment_id INT NULL,
  version_no INT NOT NULL,
  status VARCHAR(32) NOT NULL,
  content_digest VARCHAR(255) NULL,
  payload_ref VARCHAR(500) NULL,
  updated_at DATETIME(6) NOT NULL
);

-- rbac-5
CREATE TABLE IF NOT EXISTS rbac_promotion_event (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_version_id INT NOT NULL,
  gate VARCHAR(32) NOT NULL,
  action VARCHAR(32) NOT NULL,
  actor_id INT NOT NULL,
  actor_name VARCHAR(255) NULL,
  note VARCHAR(1000) NULL,
  occurred_at DATETIME(6) NOT NULL
);

-- rbac-6
CREATE TABLE IF NOT EXISTS rbac_menu_item (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NULL,
  label VARCHAR(255) NOT NULL,
  route VARCHAR(255) NOT NULL,
  min_role_rank INT NOT NULL,
  display_order INT NOT NULL
);

-- rbac-6-seed (explicit ids, matches the Liquibase seed exactly)
INSERT INTO rbac_menu_item (id, parent_id, label, route, min_role_rank, display_order)
SELECT 1, NULL, 'Admin Console', '/admin-console', 0, 1
WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item);

INSERT INTO rbac_menu_item (id, parent_id, label, route, min_role_rank, display_order)
SELECT 2, 1, 'Organizations & Projects', '/admin-console/tenancy', 2, 1
WHERE (SELECT COUNT(*) FROM rbac_menu_item) = 1;

INSERT INTO rbac_menu_item (id, parent_id, label, route, min_role_rank, display_order)
SELECT 3, 1, 'Members & Roles', '/admin-console/access', 2, 2
WHERE (SELECT COUNT(*) FROM rbac_menu_item) = 2;

INSERT INTO rbac_menu_item (id, parent_id, label, route, min_role_rank, display_order)
SELECT 4, 1, 'My Drafts', '/admin-console/publishing', 1, 3
WHERE (SELECT COUNT(*) FROM rbac_menu_item) = 3;

INSERT INTO rbac_menu_item (id, parent_id, label, route, min_role_rank, display_order)
SELECT 5, 1, 'Approvals', '/admin-console/approvals', 2, 4
WHERE (SELECT COUNT(*) FROM rbac_menu_item) = 4;

INSERT INTO rbac_menu_item (id, parent_id, label, route, min_role_rank, display_order)
SELECT 6, 1, 'Audit Log', '/admin-console/audit', 3, 5
WHERE (SELECT COUNT(*) FROM rbac_menu_item) = 5;

INSERT INTO rbac_menu_item (id, parent_id, label, route, min_role_rank, display_order)
SELECT 7, 1, 'Menu Configuration', '/admin-console/menu-configuration', 4, 6
WHERE (SELECT COUNT(*) FROM rbac_menu_item) = 6;

-- rbac-7
CREATE TABLE IF NOT EXISTS rbac_audit_event (
  id INT AUTO_INCREMENT PRIMARY KEY,
  correlation_id VARCHAR(64) NOT NULL,
  entity VARCHAR(64) NOT NULL,
  action VARCHAR(64) NOT NULL,
  actor_id INT NULL,
  actor_name VARCHAR(255) NULL,
  occurred_at DATETIME(6) NOT NULL,
  details VARCHAR(1000) NULL
);

-- rbac-8: closes the Project<->Organisation FK gap (only if column missing)
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usm_project' AND COLUMN_NAME = 'organisation_id'
);
SET @ddl := IF(@col_exists = 0, 'ALTER TABLE usm_project ADD COLUMN organisation_id INT NULL', 'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- rbac-9
CREATE TABLE IF NOT EXISTS rbac_environment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  name VARCHAR(64) NOT NULL,
  config_ref VARCHAR(500) NULL
);

-- rbac-10
CREATE TABLE IF NOT EXISTS rbac_identity_projection_target (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  target_type VARCHAR(32) NOT NULL,
  external_ref VARCHAR(255) NULL,
  sync_status VARCHAR(32) NOT NULL,
  last_attempt_at DATETIME(6) NULL
);

-- rbac-11: icon, roles (CSV role-override), project (scope) columns
SET @c := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='rbac_menu_item' AND COLUMN_NAME='icon');
SET @d := IF(@c=0,'ALTER TABLE rbac_menu_item ADD COLUMN icon VARCHAR(64) NULL','SELECT 1'); PREPARE s FROM @d; EXECUTE s; DEALLOCATE PREPARE s;
SET @c := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='rbac_menu_item' AND COLUMN_NAME='roles');
SET @d := IF(@c=0,'ALTER TABLE rbac_menu_item ADD COLUMN roles VARCHAR(512) NULL','SELECT 1'); PREPARE s FROM @d; EXECUTE s; DEALLOCATE PREPARE s;
SET @c := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='rbac_menu_item' AND COLUMN_NAME='project');
SET @d := IF(@c=0,'ALTER TABLE rbac_menu_item ADD COLUMN project VARCHAR(255) NULL','SELECT 1'); PREPARE s FROM @d; EXECUTE s; DEALLOCATE PREPARE s;

-- rbac-12: Overview landing entry
INSERT INTO rbac_menu_item (id, parent_id, label, route, min_role_rank, display_order, icon)
SELECT 8, 1, 'Overview', '/admin-console/overview', 2, 0, 'tachometer'
WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/admin-console/overview');

-- rbac-13: seed icons for admin-console menu items
UPDATE rbac_menu_item SET icon='shield'         WHERE route='/admin-console'                    AND (icon IS NULL OR icon='');
UPDATE rbac_menu_item SET icon='sitemap'        WHERE route='/admin-console/tenancy'            AND (icon IS NULL OR icon='');
UPDATE rbac_menu_item SET icon='users'          WHERE route='/admin-console/access'             AND (icon IS NULL OR icon='');
UPDATE rbac_menu_item SET icon='file-text-o'    WHERE route='/admin-console/publishing'         AND (icon IS NULL OR icon='');
UPDATE rbac_menu_item SET icon='check-square-o' WHERE route='/admin-console/approvals'          AND (icon IS NULL OR icon='');
UPDATE rbac_menu_item SET icon='history'        WHERE route='/admin-console/audit'              AND (icon IS NULL OR icon='');
UPDATE rbac_menu_item SET icon='th-list'        WHERE route='/admin-console/menu-configuration' AND (icon IS NULL OR icon='');

-- rbac-14: Identity Sync Status menu entry
INSERT INTO rbac_menu_item (id, parent_id, label, route, min_role_rank, display_order, icon)
SELECT 9, 1, 'Identity Sync', '/admin-console/identity-sync', 3, 7, 'refresh'
WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/admin-console/identity-sync');

-- rbac-15: Asset Catalog (marketplace) menu entry
INSERT INTO rbac_menu_item (id, parent_id, label, route, min_role_rank, display_order, icon)
SELECT 10, 1, 'Asset Catalog', '/admin-console/catalog', 1, 8, 'shopping-bag'
WHERE NOT EXISTS (SELECT 1 FROM rbac_menu_item WHERE route = '/admin-console/catalog');

-- rbac-16: Promote portfolios to first-class Organizations (§1 tenancy schema).
-- Each portfolio becomes the organisation its projects belong to (1:1 by id);
-- usm_project.organisation_id is backfilled so org-scoped visibility resolves.
-- usm_portfolio stays in place but dormant.
UPDATE usm_organisation o JOIN usm_portfolio p ON p.id = o.id SET o.name = p.portfolio_name;
INSERT INTO usm_organisation (id, name, status)
  SELECT p.id, p.portfolio_name, 'active' FROM usm_portfolio p
  WHERE NOT EXISTS (SELECT 1 FROM usm_organisation o WHERE o.id = p.id);
UPDATE usm_project SET organisation_id = portfolio_id
  WHERE organisation_id IS NULL AND portfolio_id IS NOT NULL;
