-- Fix the cloaking_enabled column issue
-- This script will add the missing column if it doesn't exist

-- Check if the column exists and add it if it doesn't
DO $$ 
BEGIN
    -- Check if cloaking_enabled column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'websites' 
        AND column_name = 'cloaking_enabled'
        AND table_schema = 'public'
    ) THEN
        -- Add the column
        ALTER TABLE websites ADD COLUMN cloaking_enabled BOOLEAN DEFAULT true;
        
        -- Update existing records
        UPDATE websites SET cloaking_enabled = true WHERE cloaking_enabled IS NULL;
        
        -- Add index for performance
        CREATE INDEX IF NOT EXISTS idx_websites_cloaking_enabled ON websites(cloaking_enabled);
        
        RAISE NOTICE 'Added cloaking_enabled column to websites table';
    ELSE
        RAISE NOTICE 'cloaking_enabled column already exists';
    END IF;
    
    -- Ensure all existing websites have the column set
    UPDATE websites SET cloaking_enabled = true WHERE cloaking_enabled IS NULL;
    
END $$;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'websites' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show current website status
SELECT 
    id,
    name,
    domain,
    is_active,
    cloaking_enabled,
    created_at
FROM websites
ORDER BY created_at DESC;
