-- Add bilingual support for categories and products
-- Run this in Supabase SQL Editor
-- Note: slug field is used as English name for both categories and products

-- Add English description field to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Add English description and specifications fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS specifications_en JSONB DEFAULT '{}';

-- Update existing products to have empty specifications if null
UPDATE products SET specifications = '{}' WHERE specifications IS NULL;
UPDATE products SET specifications_en = '{}' WHERE specifications_en IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN categories.name IS 'Category name in Arabic';
COMMENT ON COLUMN categories.slug IS 'Category slug - used as English name';
COMMENT ON COLUMN categories.description IS 'Category description in Arabic';
COMMENT ON COLUMN categories.description_en IS 'Category description in English';
COMMENT ON COLUMN products.name IS 'Product name in Arabic';
COMMENT ON COLUMN products.slug IS 'Product slug - used as English name';
COMMENT ON COLUMN products.description IS 'Product description in Arabic';
COMMENT ON COLUMN products.description_en IS 'Product description in English';
COMMENT ON COLUMN products.specifications IS 'Product specifications in Arabic (JSON format)';
COMMENT ON COLUMN products.specifications_en IS 'Product specifications in English (JSON format)';
