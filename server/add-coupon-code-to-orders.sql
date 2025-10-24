-- Add coupon_code column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON orders(coupon_code);

-- Add comment
COMMENT ON COLUMN orders.coupon_code IS 'Coupon code used for this order (if any)';
