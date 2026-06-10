-- Add missing columns to websites table
ALTER TABLE websites 
ADD COLUMN IF NOT EXISTS cloaking_enabled BOOLEAN DEFAULT true;

-- Update existing records to have cloaking_enabled = true
UPDATE websites SET cloaking_enabled = true WHERE cloaking_enabled IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'websites' AND column_name = 'cloaking_enabled';
