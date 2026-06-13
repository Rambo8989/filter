-- ============================================================
-- Run this ONCE in the Supabase SQL editor.
--
-- Adds every column the Click Log (/logs) feature needs
-- on access_logs. Safe to run multiple times — each column is
-- only added if it doesn't already exist, so this won't touch
-- or duplicate anything you already have.
--
-- IMPORTANT: until this is run, new visits will stop being
-- logged at all (Postgres rejects inserts that reference
-- columns that don't exist yet).
-- ============================================================
DO $$
BEGIN
    -- Why a request was/wasn't blocked (e.g. "qualified_human", "bot:googlebot")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'access_logs' AND column_name = 'reason') THEN
        ALTER TABLE access_logs ADD COLUMN reason VARCHAR(255);
    END IF;

    -- "redirect_money" or "stay_on_safe"
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'access_logs' AND column_name = 'action_taken') THEN
        ALTER TABLE access_logs ADD COLUMN action_taken VARCHAR(50);
    END IF;

    -- Detected ad platform id (facebook, google, tiktok, etc.) if matched
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'access_logs' AND column_name = 'ad_platform') THEN
        ALTER TABLE access_logs ADD COLUMN ad_platform VARCHAR(100);
    END IF;

    -- IP geolocation / ISP details (Click Log table)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'access_logs' AND column_name = 'region') THEN
        ALTER TABLE access_logs ADD COLUMN region VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'access_logs' AND column_name = 'city') THEN
        ALTER TABLE access_logs ADD COLUMN city VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'access_logs' AND column_name = 'isp') THEN
        ALTER TABLE access_logs ADD COLUMN isp VARCHAR(150);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'access_logs' AND column_name = 'organization') THEN
        ALTER TABLE access_logs ADD COLUMN organization VARCHAR(150);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'access_logs' AND column_name = 'asn') THEN
        ALTER TABLE access_logs ADD COLUMN asn VARCHAR(100);
    END IF;

    -- Visitor's Accept-Language header (e.g. "en-US")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'access_logs' AND column_name = 'language') THEN
        ALTER TABLE access_logs ADD COLUMN language VARCHAR(20);
    END IF;

    -- ── Older fields the tracking routes also write — included as a
    -- safety net in case an earlier migration was never run ─────────
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'access_logs' AND column_name = 'page_shown') THEN
        ALTER TABLE access_logs ADD COLUMN page_shown VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'access_logs' AND column_name = 'bot_type') THEN
        ALTER TABLE access_logs ADD COLUMN bot_type VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'access_logs' AND column_name = 'bot_confidence') THEN
        ALTER TABLE access_logs ADD COLUMN bot_confidence DECIMAL(3,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'access_logs' AND column_name = 'referrer') THEN
        ALTER TABLE access_logs ADD COLUMN referrer TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'access_logs' AND column_name = 'pathname') THEN
        ALTER TABLE access_logs ADD COLUMN pathname VARCHAR(255);
    END IF;
END $$;

-- Verify — should list every column above
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'access_logs'
ORDER BY ordinal_position;
