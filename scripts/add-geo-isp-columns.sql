-- Adds the IP-geolocation / ISP / language columns needed by the
-- detailed Click Log table (Region, City, ISP, Organization, ASN, Language).
-- Safe to run multiple times.
DO $$
BEGIN
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

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'access_logs' AND column_name = 'language') THEN
        ALTER TABLE access_logs ADD COLUMN language VARCHAR(20);
    END IF;
END $$;

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'access_logs'
ORDER BY ordinal_position;
