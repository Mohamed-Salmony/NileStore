-- Governorates and Payment Methods Schema
-- Run this in Supabase SQL Editor

-- Governorates table (المحافظات المصرية)
CREATE TABLE IF NOT EXISTS governorates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_free_shipping BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment methods configuration table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  method_type TEXT NOT NULL CHECK (method_type IN ('vodafone_cash', 'instapay')),
  is_active BOOLEAN DEFAULT true,
  vodafone_number TEXT,
  instapay_email TEXT,
  instructions_ar TEXT,
  instructions_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(method_type)
);

-- Add payment proof and method to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('vodafone_cash', 'instapay')),
  ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS governorate_id UUID REFERENCES governorates(id),
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Insert Egyptian governorates
INSERT INTO governorates (name_ar, name_en, shipping_cost) VALUES
  ('القاهرة', 'Cairo', 50),
  ('الجيزة', 'Giza', 50),
  ('الإسكندرية', 'Alexandria', 60),
  ('الدقهلية', 'Dakahlia', 70),
  ('البحيرة', 'Beheira', 70),
  ('الفيوم', 'Fayoum', 60),
  ('الغربية', 'Gharbia', 70),
  ('الإسماعيلية', 'Ismailia', 65),
  ('المنوفية', 'Monufia', 60),
  ('المنيا', 'Minya', 80),
  ('القليوبية', 'Qalyubia', 50),
  ('الوادي الجديد', 'New Valley', 100),
  ('الشرقية', 'Sharqia', 70),
  ('سوهاج', 'Sohag', 85),
  ('جنوب سيناء', 'South Sinai', 90),
  ('كفر الشيخ', 'Kafr El Sheikh', 70),
  ('مطروح', 'Matrouh', 95),
  ('الأقصر', 'Luxor', 90),
  ('قنا', 'Qena', 85),
  ('أسوان', 'Aswan', 95),
  ('أسيوط', 'Asyut', 80),
  ('بني سويف', 'Beni Suef', 70),
  ('بورسعيد', 'Port Said', 75),
  ('دمياط', 'Damietta', 75),
  ('شمال سيناء', 'North Sinai', 90),
  ('السويس', 'Suez', 65),
  ('البحر الأحمر', 'Red Sea', 95)
ON CONFLICT DO NOTHING;

-- Insert default payment methods
INSERT INTO payment_methods (method_type, is_active, instructions_ar, instructions_en) VALUES
  ('vodafone_cash', true, 'قم بتحويل المبلغ إلى رقم فودافون كاش الموضح أدناه', 'Transfer the amount to the Vodafone Cash number shown below'),
  ('instapay', true, 'قم بتحويل المبلغ إلى البريد الإلكتروني الموضح أدناه', 'Transfer the amount to the InstaPay email shown below')
ON CONFLICT (method_type) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_governorates_active ON governorates(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_governorate ON orders(governorate_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- RLS Policies
ALTER TABLE governorates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Governorates: Public read active, admin full access
CREATE POLICY "Active governorates are viewable by everyone" ON governorates 
  FOR SELECT USING (is_active = true OR (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Governorates are insertable by admins" ON governorates 
  FOR INSERT WITH CHECK ((SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Governorates are updatable by admins" ON governorates 
  FOR UPDATE USING ((SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Governorates are deletable by admins" ON governorates 
  FOR DELETE USING ((SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin');

-- Payment methods: Public read active, admin full access
CREATE POLICY "Active payment methods are viewable by everyone" ON payment_methods 
  FOR SELECT USING (is_active = true OR (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Payment methods are insertable by admins" ON payment_methods 
  FOR INSERT WITH CHECK ((SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Payment methods are updatable by admins" ON payment_methods 
  FOR UPDATE USING ((SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Payment methods are deletable by admins" ON payment_methods 
  FOR DELETE USING ((SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin');
