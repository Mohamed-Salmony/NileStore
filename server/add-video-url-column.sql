-- Add video_url column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add specifications column to products table (for future use)
ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications JSONB;
