-- Add support_reply type to notifications
-- Run this in Supabase SQL Editor

-- Drop the existing check constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add new check constraint with support_reply type
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'welcome',
  'order_created',
  'order_confirmed',
  'order_processing',
  'order_shipped',
  'order_delivered',
  'order_cancelled',
  'admin_message',
  'promotion',
  'system',
  'support_reply'  -- New type for support ticket replies
));

-- Function to create support reply notification
CREATE OR REPLACE FUNCTION create_support_reply_notification(
  p_user_id UUID,
  p_ticket_id UUID,
  p_ticket_number TEXT,
  p_message_preview TEXT
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Insert notification
  INSERT INTO notifications (
    user_id,
    type,
    title_ar,
    title_en,
    message_ar,
    message_en,
    data
  ) VALUES (
    p_user_id,
    'support_reply',
    '💬 رد جديد على تذكرتك',
    '💬 New reply on your ticket',
    'تلقيت رداً جديداً على تذكرة الدعم رقم ' || p_ticket_number,
    'You received a new reply on support ticket #' || p_ticket_number,
    jsonb_build_object(
      'ticket_id', p_ticket_id,
      'ticket_number', p_ticket_number,
      'message_preview', p_message_preview
    )
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Support notifications added successfully!';
  RAISE NOTICE 'New type: support_reply';
  RAISE NOTICE 'New function: create_support_reply_notification';
END $$;
