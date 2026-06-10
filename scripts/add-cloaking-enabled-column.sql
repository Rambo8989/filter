-- Add cloaking_enabled column to websites table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'websites' 
        AND column_name = 'cloaking_enabled'
    ) THEN
        ALTER TABLE websites ADD COLUMN cloaking_enabled BOOLEAN DEFAULT true;
        
        -- Add index for better performance
        CREATE INDEX IF NOT EXISTS idx_websites_cloaking_enabled 
        ON websites(cloaking_enabled);
        
        -- Add composite index for domain and cloaking status
        CREATE INDEX IF NOT EXISTS idx_websites_domain_cloaking 
        ON websites(domain, is_active, cloaking_enabled);
        
        -- Update existing websites to have cloaking enabled by default
        UPDATE websites 
        SET cloaking_enabled = true 
        WHERE cloaking_enabled IS NULL;
        
        -- Add comment to the column
        COMMENT ON COLUMN websites.cloaking_enabled IS 'Whether cloaking/traffic filtering is enabled for this website';
        
        RAISE NOTICE 'Added cloaking_enabled column to websites table';
    ELSE
        RAISE NOTICE 'cloaking_enabled column already exists in websites table';
    END IF;
END $$;

-- Ensure all existing websites have cloaking enabled
UPDATE websites 
SET cloaking_enabled = true 
WHERE cloaking_enabled IS NULL;

-- Show current status of all websites
SELECT 
  id,
  name,
  domain,
  is_active,
  cloaking_enabled,
  CASE 
    WHEN NOT is_active THEN 'Campaign Inactive - No Processing'
    WHEN is_active AND cloaking_enabled THEN 'Cloaking ON - Traffic Filtered'
    WHEN is_active AND NOT cloaking_enabled THEN 'Cloaking OFF - All Traffic to Landing Page'
  END as traffic_flow_status,
  created_at
FROM websites 
ORDER BY created_at DESC;
