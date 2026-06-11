-- ============================================================
-- Adds a single `status` column to `websites` so the admin UI's
-- 4-state Status selector (Active / Under Review / Paused / Block All)
-- can be stored and displayed accurately, instead of being collapsed
-- into the `is_active` + `cloaking_enabled` booleans (which can't
-- distinguish "Under Review" from "Active" or "Block All" from "Paused").
--
-- Safe to run multiple times.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'websites' AND column_name = 'status'
  ) THEN
    ALTER TABLE websites ADD COLUMN status VARCHAR(20) DEFAULT 'active';

    -- One-time backfill: derive status from the existing booleans for
    -- campaigns created before this column existed.
    UPDATE websites SET status = CASE
      WHEN cloaking_enabled = false THEN 'block_all'
      WHEN is_active = false THEN 'paused'
      ELSE 'active'
    END;
  END IF;
END $$;

-- Verify
SELECT id, name, status, is_active, cloaking_enabled FROM websites ORDER BY id;
