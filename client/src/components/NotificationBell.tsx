'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Check, Trash2, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: string;
  title_ar: string;
  title_en: string;
  message_ar: string;
  message_en: string;
  is_read: boolean;
  data: any;
  created_at: string;
}

const NotificationBell = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const { count } = await api.getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async (pageNum = 1) => {
    setLoading(true);
    try {
      const { notifications: data, pagination } = await api.getMyNotifications({
        page: pageNum,
        limit: 10
      });
      
      if (pageNum === 1) {
        setNotifications(data);
      } else {
        setNotifications(prev => [...prev, ...data]);
      }
      
      setHasMore(pagination.page < pagination.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error(i18n.language === 'ar' ? 'فشل تحديث الإشعار' : 'Failed to update notification');
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success(i18n.language === 'ar' ? 'تم تحديد الكل كمقروء' : 'All marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error(i18n.language === 'ar' ? 'فشل التحديث' : 'Failed to update');
    }
  };

  // Delete notification
  const handleDelete = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success(i18n.language === 'ar' ? 'تم حذف الإشعار' : 'Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error(i18n.language === 'ar' ? 'فشل الحذف' : 'Failed to delete');
    }
  };

  // Load more
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Load notifications when opened
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications(1);
    }
  }, [isOpen]);

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      welcome: '🎉',
      order_created: '📦',
      order_confirmed: '✅',
      order_processing: '⚙️',
      order_shipped: '🚚',
      order_delivered: '✅',
      order_cancelled: '❌',
      admin_message: '📢',
      promotion: '🎁',
      system: 'ℹ️',
      support_reply: '💬'
    };
    return icons[type] || '🔔';
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Handle support_reply type - open chatbot
    if (notification.type === 'support_reply' && notification.data?.ticket_id) {
      // Store ticket ID and message preview in localStorage
      localStorage.setItem('chatbot_active_ticket', notification.data.ticket_id);
      localStorage.setItem('chatbot_open', 'true');
      localStorage.setItem('chatbot_highlight_last', 'true');
      localStorage.setItem('chatbot_scroll_to_unread', 'true');
      
      // Store message preview to identify unread message
      if (notification.data.message_preview) {
        localStorage.setItem('chatbot_unread_message', notification.data.message_preview);
      }
      
      // Close notification panel
      setIsOpen(false);
      
      // Dispatch custom event to open chatbot
      window.dispatchEvent(new CustomEvent('openChatbot', {
        detail: { 
          ticketId: notification.data.ticket_id,
          scrollToUnread: true
        }
      }));
      
      toast.info(
        i18n.language === 'ar' 
          ? '💬 جاري فتح المحادثة...' 
          : '💬 Opening chat...'
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    const isArabic = i18n.language === 'ar';

    if (diffSecs < 60) {
      return isArabic ? 'الآن' : 'just now';
    } else if (diffMins < 60) {
      return isArabic 
        ? `منذ ${diffMins} ${diffMins === 1 ? 'دقيقة' : diffMins === 2 ? 'دقيقتين' : 'دقائق'}`
        : `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return isArabic
        ? `منذ ${diffHours} ${diffHours === 1 ? 'ساعة' : diffHours === 2 ? 'ساعتين' : 'ساعات'}`
        : `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return isArabic
        ? `منذ ${diffDays} ${diffDays === 1 ? 'يوم' : diffDays === 2 ? 'يومين' : 'أيام'}`
        : `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-96 bg-background border rounded-lg shadow-lg z-50"
            >
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  {i18n.language === 'ar' ? 'الإشعارات' : 'Notifications'}
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {i18n.language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              <ScrollArea className="h-[400px]">
                {loading && notifications.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mb-2 opacity-50" />
                    <p>{i18n.language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                          !notification.is_read ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-3">
                          <div className="text-2xl flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-sm">
                                {i18n.language === 'ar' ? notification.title_ar : notification.title_en}
                              </h4>
                              {!notification.is_read && (
                                <Badge variant="secondary" className="text-xs flex-shrink-0">
                                  {i18n.language === 'ar' ? 'جديد' : 'New'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {i18n.language === 'ar' ? notification.message_ar : notification.message_en}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(notification.created_at)}
                              </span>
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                {!notification.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notification.id);
                                    }}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(notification.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Load More */}
                    {hasMore && (
                      <div className="p-4 text-center">
                        <Button
                          variant="ghost"
                          onClick={loadMore}
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            i18n.language === 'ar' ? 'تحميل المزيد' : 'Load more'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
