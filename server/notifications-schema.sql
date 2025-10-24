-- Notifications System Schema
-- Run this in Supabase SQL Editor

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'welcome',           -- رسالة ترحيب عند إنشاء الحساب
    'order_created',     -- تم إنشاء الطلب
    'order_confirmed',   -- تم تأكيد الطلب
    'order_processing',  -- جاري تجهيز الطلب
    'order_shipped',     -- تم شحن الطلب
    'order_delivered',   -- تم توصيل الطلب
    'order_cancelled',   -- تم إلغاء الطلب
    'admin_message',     -- رسالة من الإدارة
    'promotion',         -- عرض خاص
    'system'             -- إشعار من النظام
  )),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  message_ar TEXT NOT NULL,
  message_en TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}'::jsonb, -- بيانات إضافية (order_id, link, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON notifications;

-- RLS Policies
-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can create notifications for any user
CREATE POLICY "Admins can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Admins can delete any notification
CREATE POLICY "Admins can delete notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Function to create welcome notification for new users
CREATE OR REPLACE FUNCTION create_welcome_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title_ar,
    title_en,
    message_ar,
    message_en,
    data
  ) VALUES (
    NEW.id,
    'welcome',
    'مرحباً بك في متجر النيل! 🎉',
    'Welcome to Nile Store! 🎉',
    'نحن سعداء بانضمامك إلينا. استمتع بتجربة تسوق رائعة واستكشف منتجاتنا المميزة.',
    'We are happy to have you join us. Enjoy a great shopping experience and explore our featured products.',
    jsonb_build_object('user_email', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_user_created_welcome_notification ON auth.users;

-- Trigger to send welcome notification when user signs up
CREATE TRIGGER on_user_created_welcome_notification
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_welcome_notification();

-- Function to create order status notification
CREATE OR REPLACE FUNCTION create_order_notification(
  p_user_id UUID,
  p_order_id UUID,
  p_order_number TEXT,
  p_status TEXT
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_type TEXT;
  v_title_ar TEXT;
  v_title_en TEXT;
  v_message_ar TEXT;
  v_message_en TEXT;
BEGIN
  -- Determine notification type and messages based on order status
  CASE p_status
    WHEN 'pending' THEN
      v_type := 'order_created';
      v_title_ar := 'تم إنشاء طلبك بنجاح';
      v_title_en := 'Your order has been created successfully';
      v_message_ar := 'تم استلام طلبك رقم ' || p_order_number || ' وجاري مراجعته من قبل فريقنا.';
      v_message_en := 'Your order #' || p_order_number || ' has been received and is being reviewed by our team.';
    
    WHEN 'confirmed' THEN
      v_type := 'order_confirmed';
      v_title_ar := 'تم تأكيد طلبك';
      v_title_en := 'Your order has been confirmed';
      v_message_ar := 'تم تأكيد طلبك رقم ' || p_order_number || ' وجاري تجهيزه للشحن.';
      v_message_en := 'Your order #' || p_order_number || ' has been confirmed and is being prepared for shipping.';
    
    WHEN 'processing' THEN
      v_type := 'order_processing';
      v_title_ar := 'جاري تجهيز طلبك';
      v_title_en := 'Your order is being processed';
      v_message_ar := 'طلبك رقم ' || p_order_number || ' قيد التجهيز حالياً.';
      v_message_en := 'Your order #' || p_order_number || ' is currently being processed.';
    
    WHEN 'shipped' THEN
      v_type := 'order_shipped';
      v_title_ar := 'تم شحن طلبك 📦';
      v_title_en := 'Your order has been shipped 📦';
      v_message_ar := 'طلبك رقم ' || p_order_number || ' في الطريق إليك!';
      v_message_en := 'Your order #' || p_order_number || ' is on its way to you!';
    
    WHEN 'delivered' THEN
      v_type := 'order_delivered';
      v_title_ar := 'تم توصيل طلبك ✅';
      v_title_en := 'Your order has been delivered ✅';
      v_message_ar := 'تم توصيل طلبك رقم ' || p_order_number || ' بنجاح. نتمنى أن تستمتع بمشترياتك!';
      v_message_en := 'Your order #' || p_order_number || ' has been delivered successfully. We hope you enjoy your purchase!';
    
    WHEN 'cancelled' THEN
      v_type := 'order_cancelled';
      v_title_ar := 'تم إلغاء طلبك';
      v_title_en := 'Your order has been cancelled';
      v_message_ar := 'تم إلغاء طلبك رقم ' || p_order_number || '. إذا كان لديك أي استفسار، يرجى التواصل معنا.';
      v_message_en := 'Your order #' || p_order_number || ' has been cancelled. If you have any questions, please contact us.';
    
    ELSE
      v_type := 'system';
      v_title_ar := 'تحديث على طلبك';
      v_title_en := 'Update on your order';
      v_message_ar := 'هناك تحديث على طلبك رقم ' || p_order_number;
      v_message_en := 'There is an update on your order #' || p_order_number;
  END CASE;

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
    v_type,
    v_title_ar,
    v_title_en,
    v_message_ar,
    v_message_en,
    jsonb_build_object(
      'order_id', p_order_id,
      'order_number', p_order_number,
      'status', p_status
    )
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET 
    is_read = true,
    read_at = NOW()
  WHERE id = p_notification_id
    AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all user notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET 
    is_read = true,
    read_at = NOW()
  WHERE user_id = auth.uid()
    AND is_read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notifications count
CREATE OR REPLACE FUNCTION get_unread_count()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM notifications
  WHERE user_id = auth.uid()
    AND is_read = false;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE notifications IS 'Stores user notifications for orders, promotions, and admin messages';
COMMENT ON COLUMN notifications.type IS 'Type of notification: welcome, order_*, admin_message, promotion, system';
COMMENT ON COLUMN notifications.is_read IS 'Whether the notification has been read by the user';
COMMENT ON COLUMN notifications.data IS 'Additional data in JSON format (order_id, link, etc.)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Notifications system created successfully!';
  RAISE NOTICE 'Table: notifications';
  RAISE NOTICE 'Functions: create_order_notification, mark_notification_read, mark_all_notifications_read, get_unread_count';
  RAISE NOTICE 'Trigger: Welcome notification on user signup';
END $$;
