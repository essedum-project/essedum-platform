-- Add/Update approval status for native pipelines
-- Default all existing pipelines to DRAFT if not already set
UPDATE mlpipeline
SET approval_status = 'DRAFT'
WHERE type = 'NativeScript' AND (approval_status IS NULL OR approval_status = '');

-- Verify project_id is set for PROJECT_APPROVED pipelines
-- (This is optional - can be null for non-approved items)

-- Add index for faster queries on approval_status and type
CREATE INDEX idx_approval_status_type ON mlpipeline(approval_status, type);
CREATE INDEX idx_project_id_approval ON mlpipeline(project_id, approval_status);
```

