-- Add missing columns to websites table
-- This script will check and add only the columns that don't exist

-- First, let's see what columns currently exist
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'websites' 
ORDER BY ordinal_position;

-- Add cloaking_enabled column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'websites' AND column_name = 'cloaking_enabled'
    ) THEN
        ALTER TABLE websites ADD COLUMN cloaking_enabled BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added cloaking_enabled column';
    ELSE
        RAISE NOTICE 'cloaking_enabled column already exists';
    END IF;
END $$;

-- Add frequency column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'websites' AND column_name = 'frequency'
    ) THEN
        ALTER TABLE websites ADD COLUMN frequency VARCHAR(20) DEFAULT 'daily';
        RAISE NOTICE 'Added frequency column';
    ELSE
        RAISE NOTICE 'frequency column already exists';
    END IF;
END $$;

-- Update existing records to have default values
UPDATE websites 
SET cloaking_enabled = true 
WHERE cloaking_enabled IS NULL;

UPDATE websites 
SET frequency = 'daily' 
WHERE frequency IS NULL;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_websites_cloaking_enabled ON websites(cloaking_enabled);
CREATE INDEX IF NOT EXISTS idx_websites_frequency ON websites(frequency);

-- Show final table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE 
        WHEN column_name IN ('cloaking_enabled', 'frequency') THEN '✅ NEW'
        ELSE '📋 EXISTING'
    END as status
FROM information_schema.columns 
WHERE table_name = 'websites' 
ORDER BY ordinal_position;

-- Show current websites
SELECT 
    id,
    name,
    domain,
    is_active,
    COALESCE(cloaking_enabled, true) as cloaking_enabled,
    COALESCE(frequency, 'daily') as frequency,
    created_at
FROM websites 
ORDER BY created_at DESC;

SELECT '✅ Database schema updated successfully!' as status;
