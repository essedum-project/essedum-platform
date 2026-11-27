-- Adds the admin approval/rejection comment column to approval-workflow tables (icip-service)
ALTER TABLE mlpipeline ADD COLUMN comments TEXT;
ALTER TABLE mlfederatedmodels ADD COLUMN comments TEXT;
