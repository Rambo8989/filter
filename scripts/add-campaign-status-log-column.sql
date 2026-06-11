-- ============================================================
-- Adds `campaign_status` to `access_logs` — a snapshot of the
-- campaign's status (active/paused/under_review/block_all) AT THE
-- TIME of the visit, so the Click Log's "Campaign State" column
-- reflects history accurately instead of always showing the
-- campaign's CURRENT status for old rows too.
--
-- Safe to run multiple times.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'access_logs' AND column_name = 'campaign_status'
  ) THEN
    ALTER TABLE access_logs ADD COLUMN campaign_status VARCHAR(20);
  END IF;
END $$;

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'access_logs' AND column_name = 'campaign_status';
