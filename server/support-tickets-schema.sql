-- Support Tickets System Schema
-- Run this in Supabase SQL Editor

-- Support tickets table (from chatbot)
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  user_name TEXT,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_user', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category TEXT CHECK (category IN ('general', 'order', 'product', 'payment', 'shipping', 'technical', 'other')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Ticket messages table (conversation)
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin', 'bot')),
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_internal BOOLEAN DEFAULT false, -- ملاحظات داخلية للأدمن فقط
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can manage all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can view their ticket messages" ON ticket_messages;
DROP POLICY IF EXISTS "Users can send messages to their tickets" ON ticket_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON ticket_messages;
DROP POLICY IF EXISTS "Admins can send messages" ON ticket_messages;

-- RLS Policies for support_tickets
-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create tickets
CREATE POLICY "Users can create tickets"
  ON support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own tickets (limited fields)
CREATE POLICY "Users can update their own tickets"
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admins can manage all tickets
CREATE POLICY "Admins can manage all tickets"
  ON support_tickets
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- RLS Policies for ticket_messages
-- Users can view messages in their tickets (excluding internal notes)
CREATE POLICY "Users can view their ticket messages"
  ON ticket_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
    AND is_internal = false
  );

-- Users can send messages to their tickets
CREATE POLICY "Users can send messages to their tickets"
  ON ticket_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
    AND sender_id = auth.uid()
    AND sender_type = 'user'
  );

-- Admins can view all messages (including internal)
CREATE POLICY "Admins can view all messages"
  ON ticket_messages
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admins can send messages
CREATE POLICY "Admins can send messages"
  ON ticket_messages
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  v_count INTEGER;
  v_number TEXT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM support_tickets;
  v_number := 'TKT-' || LPAD((v_count + 1)::TEXT, 6, '0');
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update ticket updated_at
CREATE OR REPLACE FUNCTION update_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE support_tickets
  SET updated_at = NOW()
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ticket timestamp when message is added
DROP TRIGGER IF EXISTS update_ticket_on_message ON ticket_messages;
CREATE TRIGGER update_ticket_on_message
  AFTER INSERT ON ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_timestamp();

-- Function to create notification when admin replies
CREATE OR REPLACE FUNCTION notify_user_on_admin_reply()
RETURNS TRIGGER AS $$
DECLARE
  v_ticket support_tickets%ROWTYPE;
BEGIN
  -- Only notify if sender is admin
  IF NEW.sender_type = 'admin' AND NEW.is_internal = false THEN
    -- Get ticket info
    SELECT * INTO v_ticket FROM support_tickets WHERE id = NEW.ticket_id;
    
    -- Create notification for user
    INSERT INTO notifications (
      user_id,
      type,
      title_ar,
      title_en,
      message_ar,
      message_en,
      data
    ) VALUES (
      v_ticket.user_id,
      'admin_message',
      'رد جديد على تذكرة الدعم',
      'New reply on support ticket',
      'تلقيت رداً جديداً على تذكرة الدعم رقم ' || v_ticket.ticket_number,
      'You received a new reply on support ticket #' || v_ticket.ticket_number,
      jsonb_build_object(
        'ticket_id', v_ticket.id,
        'ticket_number', v_ticket.ticket_number,
        'message', NEW.message
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to send notification on admin reply
DROP TRIGGER IF EXISTS notify_on_admin_reply ON ticket_messages;
CREATE TRIGGER notify_on_admin_reply
  AFTER INSERT ON ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_on_admin_reply();

-- Function to update ticket updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for support_tickets
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_timestamp();

-- Comments
COMMENT ON TABLE support_tickets IS 'Support tickets from chatbot and contact forms';
COMMENT ON TABLE ticket_messages IS 'Messages/conversation in support tickets';
COMMENT ON COLUMN support_tickets.status IS 'Ticket status: open, in_progress, waiting_user, resolved, closed';
COMMENT ON COLUMN support_tickets.priority IS 'Ticket priority: low, normal, high, urgent';
COMMENT ON COLUMN ticket_messages.is_internal IS 'Internal admin notes, not visible to users';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Support Tickets system created successfully!';
  RAISE NOTICE 'Tables: support_tickets, ticket_messages';
  RAISE NOTICE 'Triggers: Auto-notification on admin reply';
END $$;
