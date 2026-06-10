-- Add campaign_code column to websites table if it doesn't exist
DO $$ 
BEGIN
    -- Check if column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'websites' 
        AND column_name = 'campaign_code'
        AND table_schema = 'public'
    ) THEN
        -- Add the column
        ALTER TABLE public.websites ADD COLUMN campaign_code VARCHAR(50);
        
        -- Create index for better performance
        CREATE INDEX IF NOT EXISTS idx_websites_campaign_code ON public.websites(campaign_code);
        
        -- Update existing records with generated campaign codes
        UPDATE public.websites 
        SET campaign_code = UPPER(SUBSTRING(REPLACE(name, ' ', ''), 1, 3)) || 
                           SUBSTRING(EXTRACT(EPOCH FROM NOW())::TEXT, -6) || 
                           UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 3))
        WHERE campaign_code IS NULL;
        
        RAISE NOTICE 'campaign_code column added successfully';
    ELSE
        RAISE NOTICE 'campaign_code column already exists';
    END IF;
END $$;

-- Ensure all existing records have campaign codes
UPDATE public.websites 
SET campaign_code = UPPER(SUBSTRING(REPLACE(COALESCE(name, 'UNK'), ' ', ''), 1, 3)) || 
                   SUBSTRING(EXTRACT(EPOCH FROM NOW())::TEXT, -6) || 
                   UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 3))
WHERE campaign_code IS NULL OR campaign_code = '';

-- Add a comment to the column
COMMENT ON COLUMN public.websites.campaign_code IS 'Unique campaign identifier for tracking and code generation';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'websites' 
AND column_name = 'campaign_code'
AND table_schema = 'public';
