-- Migration: add correlation_id to audit_logs
-- Allows correlating multiple audit entries that belong to the same
-- business operation (e.g., approve fuel + create inventory movement).

ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS correlation_id VARCHAR(64);

-- Index for fast lookup by correlation_id within a tenant
CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation_id
  ON audit_logs (tenant_id, correlation_id)
  WHERE correlation_id IS NOT NULL;
