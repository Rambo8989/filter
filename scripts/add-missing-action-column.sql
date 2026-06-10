-- Add missing columns to access_logs table if they don't exist
DO $$ 
BEGIN
    -- Add action column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'access_logs' AND column_name = 'action') THEN
        ALTER TABLE access_logs ADD COLUMN action VARCHAR(50) DEFAULT 'allowed';
    END IF;
    
    -- Add website_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'access_logs' AND column_name = 'website_id') THEN
        ALTER TABLE access_logs ADD COLUMN website_id VARCHAR(50) DEFAULT '1';
    END IF;
    
    -- Add page_shown column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'access_logs' AND column_name = 'page_shown') THEN
        ALTER TABLE access_logs ADD COLUMN page_shown VARCHAR(100) DEFAULT 'landing';
    END IF;
    
    -- Add referrer column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'access_logs' AND column_name = 'referrer') THEN
        ALTER TABLE access_logs ADD COLUMN referrer TEXT;
    END IF;
    
    -- Add pathname column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'access_logs' AND column_name = 'pathname') THEN
        ALTER TABLE access_logs ADD COLUMN pathname VARCHAR(255) DEFAULT '/';
    END IF;
    
    -- Add screen_width column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'access_logs' AND column_name = 'screen_width') THEN
        ALTER TABLE access_logs ADD COLUMN screen_width INTEGER;
    END IF;
    
    -- Add screen_height column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'access_logs' AND column_name = 'screen_height') THEN
        ALTER TABLE access_logs ADD COLUMN screen_height INTEGER;
    END IF;
    
    -- Add timezone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'access_logs' AND column_name = 'timezone') THEN
        ALTER TABLE access_logs ADD COLUMN timezone VARCHAR(100);
    END IF;
    
    -- Add language column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'access_logs' AND column_name = 'language') THEN
        ALTER TABLE access_logs ADD COLUMN language VARCHAR(10);
    END IF;
    
    -- Add page_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'access_logs' AND column_name = 'page_url') THEN
        ALTER TABLE access_logs ADD COLUMN page_url TEXT;
    END IF;
    
    -- Add bot_confidence column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'access_logs' AND column_name = 'bot_confidence') THEN
        ALTER TABLE access_logs ADD COLUMN bot_confidence DECIMAL(3,2);
    END IF;
    
    -- Add bot_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'access_logs' AND column_name = 'bot_type') THEN
        ALTER TABLE access_logs ADD COLUMN bot_type VARCHAR(100);
    END IF;
    
    -- Update existing records to have default values
    UPDATE access_logs 
    SET action = 'allowed' 
    WHERE action IS NULL;
    
    UPDATE access_logs 
    SET website_id = '1' 
    WHERE website_id IS NULL;
    
    UPDATE access_logs 
    SET page_shown = 'landing' 
    WHERE page_shown IS NULL;
    
    UPDATE access_logs 
    SET pathname = '/' 
    WHERE pathname IS NULL;
    
END $$;

-- Create index on action column for better performance
CREATE INDEX IF NOT EXISTS idx_access_logs_action ON access_logs(action);
CREATE INDEX IF NOT EXISTS idx_access_logs_website_id ON access_logs(website_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_page_shown ON access_logs(page_shown);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_access_logs_is_bot ON access_logs(is_bot);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'access_logs' 
ORDER BY ordinal_position;
