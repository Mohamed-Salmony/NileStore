import { supabaseAdmin } from '../config/supabase';

interface NotificationData {
  user_id: string;
  type: string;
  title_ar: string;
  title_en: string;
  message_ar: string;
  message_en: string;
  data?: any;
}

/**
 * Create a notification for a user
 */
export async function createNotification(notificationData: NotificationData): Promise<void> {
  try {
    await supabaseAdmin.from('notifications').insert({
      user_id: notificationData.user_id,
      type: notificationData.type,
      title_ar: notificationData.title_ar,
      title_en: notificationData.title_en,
      message_ar: notificationData.message_ar,
      message_en: notificationData.message_en,
      data: notificationData.data || {}
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

/**
 * Create a welcome notification for new users
 */
export async function createWelcomeNotification(userId: string, userName?: string): Promise<void> {
  // Get user info if name not provided
  let displayName = userName;
  if (!displayName) {
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
      displayName = authUser?.user?.user_metadata?.full_name || 
                    authUser?.user?.email?.split('@')[0] || 
                    'عزيزي العميل';
    } catch (error) {
      displayName = 'عزيزي العميل';
    }
  }

  await createNotification({
    user_id: userId,
    type: 'welcome',
    title_ar: `مرحباً بك ${displayName} في متجر النيل! 🎉`,
    title_en: `Welcome ${displayName} to Nile Store! 🎉`,
    message_ar: `${displayName}، نحن سعداء بانضمامك إلينا! الجودة من أرض النيل. استمتع بتجربة تسوق رائعة مع أفضل المنتجات بأسعار تنافسية.`,
    message_en: `${displayName}, we're happy to have you! Quality from the land of the Nile. Enjoy a great shopping experience with the best products at competitive prices.`,
    data: { is_welcome: true, user_name: displayName }
  });
}

/**
 * Create order notification
 */
export async function createOrderNotification(
  userId: string,
  orderId: string,
  orderNumber: string,
  type: 'created' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
): Promise<void> {
  const messages: Record<typeof type, { title_ar: string; title_en: string; message_ar: string; message_en: string }> = {
    created: {
      title_ar: 'تم إنشاء طلبك بنجاح',
      title_en: 'Your Order Has Been Created',
      message_ar: `تم إنشاء طلبك رقم ${orderNumber} بنجاح. سنقوم بمراجعته والتواصل معك قريباً.`,
      message_en: `Your order #${orderNumber} has been created successfully. We will review it and contact you soon.`
    },
    confirmed: {
      title_ar: 'تم تأكيد طلبك',
      title_en: 'Your Order is Confirmed',
      message_ar: `تم تأكيد طلبك رقم ${orderNumber}. جاري تجهيزه للشحن.`,
      message_en: `Your order #${orderNumber} has been confirmed. It's being prepared for shipping.`
    },
    processing: {
      title_ar: 'طلبك قيد التجهيز',
      title_en: 'Your Order is Being Processed',
      message_ar: `طلبك رقم ${orderNumber} قيد التجهيز حالياً.`,
      message_en: `Your order #${orderNumber} is currently being processed.`
    },
    shipped: {
      title_ar: 'تم شحن طلبك',
      title_en: 'Your Order Has Been Shipped',
      message_ar: `تم شحن طلبك رقم ${orderNumber}. سيصلك قريباً!`,
      message_en: `Your order #${orderNumber} has been shipped. It will arrive soon!`
    },
    delivered: {
      title_ar: 'تم توصيل طلبك',
      title_en: 'Your Order Has Been Delivered',
      message_ar: `تم توصيل طلبك رقم ${orderNumber} بنجاح. نتمنى أن تستمتع بمشترياتك!`,
      message_en: `Your order #${orderNumber} has been delivered successfully. Enjoy your purchase!`
    },
    cancelled: {
      title_ar: 'تم إلغاء طلبك',
      title_en: 'Your Order Has Been Cancelled',
      message_ar: `تم إلغاء طلبك رقم ${orderNumber}. للاستفسار، يرجى التواصل معنا.`,
      message_en: `Your order #${orderNumber} has been cancelled. Please contact us for inquiries.`
    }
  };

  const messageData = messages[type];
  await createNotification({
    user_id: userId,
    type: `order_${type}`,
    title_ar: messageData.title_ar,
    title_en: messageData.title_en,
    message_ar: messageData.message_ar,
    message_en: messageData.message_en,
    data: { order_id: orderId, order_number: orderNumber, status: type }
  });
}

/**
 * Create promotion notification
 */
export async function createPromotionNotification(
  userId: string,
  title_ar: string,
  title_en: string,
  message_ar: string,
  message_en: string,
  data?: any
): Promise<void> {
  await createNotification({
    user_id: userId,
    type: 'promotion',
    title_ar,
    title_en,
    message_ar,
    message_en,
    data
  });
}

/**
 * Create admin message notification
 */
export async function createAdminMessageNotification(
  userId: string,
  title_ar: string,
  title_en: string,
  message_ar: string,
  message_en: string,
  data?: any
): Promise<void> {
  await createNotification({
    user_id: userId,
    type: 'admin_message',
    title_ar,
    title_en,
    message_ar,
    message_en,
    data
  });
}
