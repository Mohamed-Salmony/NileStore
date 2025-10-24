-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER, -- NULL means unlimited
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Coupon usage tracking
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  order_total DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promotions table (for featured products/deals)
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  promotion_type TEXT NOT NULL CHECK (promotion_type IN ('featured', 'deal', 'flash_sale')),
  discount_percentage DECIMAL(5, 2),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'scheduled', 'expired')),
  priority INTEGER DEFAULT 0, -- Higher priority shows first
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Promotion products (many-to-many relationship)
CREATE TABLE IF NOT EXISTS promotion_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  custom_price DECIMAL(10, 2), -- Optional custom price for this promotion
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(promotion_id, product_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON coupons(valid_until);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotion_products_promotion ON promotion_products(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_products_product ON promotion_products(product_id);

-- Row Level Security (RLS) Policies
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_products ENABLE ROW LEVEL SECURITY;

-- Coupons: Public can view active coupons, admin full access
CREATE POLICY "Active coupons are viewable by everyone" ON coupons FOR SELECT USING (
  status = 'active' AND (valid_until IS NULL OR valid_until > NOW())
  OR (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Coupons are insertable by admins" ON coupons FOR INSERT WITH CHECK (
  (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Coupons are updatable by admins" ON coupons FOR UPDATE USING (
  (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Coupons are deletable by admins" ON coupons FOR DELETE USING (
  (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- Coupon usage: Users can view their own usage, admins can view all
CREATE POLICY "Users can view their own coupon usage" ON coupon_usage FOR SELECT USING (
  user_id = auth.uid() OR (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Coupon usage is insertable by authenticated users" ON coupon_usage FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Promotions: Public can view active promotions, admin full access
CREATE POLICY "Active promotions are viewable by everyone" ON promotions FOR SELECT USING (
  status = 'active' AND (end_date IS NULL OR end_date > NOW())
  OR (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Promotions are insertable by admins" ON promotions FOR INSERT WITH CHECK (
  (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Promotions are updatable by admins" ON promotions FOR UPDATE USING (
  (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Promotions are deletable by admins" ON promotions FOR DELETE USING (
  (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- Promotion products: Public can view, admin full access
CREATE POLICY "Promotion products are viewable by everyone" ON promotion_products FOR SELECT USING (true);

CREATE POLICY "Promotion products are insertable by admins" ON promotion_products FOR INSERT WITH CHECK (
  (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Promotion products are updatable by admins" ON promotion_products FOR UPDATE USING (
  (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Promotion products are deletable by admins" ON promotion_products FOR DELETE USING (
  (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- Function to update coupon used_count
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coupons 
  SET used_count = used_count + 1,
      updated_at = NOW()
  WHERE id = NEW.coupon_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_coupon_usage
AFTER INSERT ON coupon_usage
FOR EACH ROW
EXECUTE FUNCTION increment_coupon_usage();

-- Function to auto-update status based on dates
CREATE OR REPLACE FUNCTION update_coupon_status()
RETURNS void AS $$
BEGIN
  UPDATE coupons
  SET status = 'expired'
  WHERE status = 'active' 
    AND valid_until IS NOT NULL 
    AND valid_until < NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_promotion_status()
RETURNS void AS $$
BEGIN
  UPDATE promotions
  SET status = 'expired'
  WHERE status = 'active' 
    AND end_date IS NOT NULL 
    AND end_date < NOW();
    
  UPDATE promotions
  SET status = 'active'
  WHERE status = 'scheduled' 
    AND start_date <= NOW()
    AND (end_date IS NULL OR end_date > NOW());
END;
$$ LANGUAGE plpgsql;
