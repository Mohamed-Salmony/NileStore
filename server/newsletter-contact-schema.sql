-- Newsletter Subscriptions and Contact Messages Schema (Alternative)
-- This version works with or without user_profiles table
-- Run this in Supabase SQL Editor

-- Newsletter subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscriptions(status);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_email ON contact_messages(email);

-- Enable Row Level Security (RLS)
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Only admins can manage subscriptions" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Anyone can send contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Only admins can view contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Only admins can update contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Only admins can delete contact messages" ON contact_messages;

-- RLS Policies for newsletter_subscriptions
-- Allow anyone to subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscriptions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to view their own subscription
CREATE POLICY "Users can view their own subscription"
  ON newsletter_subscriptions
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated admins can update/delete
-- This checks the app_metadata.role in the JWT token
CREATE POLICY "Only admins can manage subscriptions"
  ON newsletter_subscriptions
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- RLS Policies for contact_messages
-- Allow anyone to send contact messages (insert)
CREATE POLICY "Anyone can send contact messages"
  ON contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated admins can view messages
CREATE POLICY "Only admins can view contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Only authenticated admins can update messages
CREATE POLICY "Only admins can update contact messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Only authenticated admins can delete messages
CREATE POLICY "Only admins can delete contact messages"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;

-- Trigger for contact_messages
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE newsletter_subscriptions IS 'Stores email subscriptions for newsletter';
COMMENT ON TABLE contact_messages IS 'Stores contact form submissions from users';
COMMENT ON COLUMN newsletter_subscriptions.status IS 'Subscription status: active or unsubscribed';
COMMENT ON COLUMN contact_messages.status IS 'Message status: new, read, replied, or archived';

-- Grant permissions (optional, adjust based on your setup)
-- GRANT ALL ON newsletter_subscriptions TO authenticated;
-- GRANT ALL ON contact_messages TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Newsletter and Contact Messages tables created successfully!';
  RAISE NOTICE 'Tables: newsletter_subscriptions, contact_messages';
  RAISE NOTICE 'RLS Policies: Enabled and configured';
END $$;
