'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Check, Trash2, Loader2, Filter, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

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

const Notifications = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Fetch notifications
  const fetchNotifications = async (pageNum = 1, reset = false) => {
    setLoading(true);
    try {
      const { notifications: data, pagination } = await api.getMyNotifications({
        page: pageNum,
        limit: 20
      });
      
      if (reset || pageNum === 1) {
        setNotifications(data);
      } else {
        setNotifications(prev => [...prev, ...data]);
      }
      
      setHasMore(pagination.page < pagination.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error(i18n.language === 'ar' ? 'فشل تحميل الإشعارات' : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Filter notifications
  useEffect(() => {
    if (filter === 'all') {
      setFilteredNotifications(notifications);
    } else if (filter === 'unread') {
      setFilteredNotifications(notifications.filter(n => !n.is_read));
    } else {
      setFilteredNotifications(notifications.filter(n => n.is_read));
    }
  }, [notifications, filter]);

  // Mark as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      toast.success(i18n.language === 'ar' ? 'تم تحديد الإشعار كمقروء' : 'Marked as read');
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
    if (user) {
      fetchNotifications(1);
    }
  }, [user]);

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
      system: 'ℹ️'
    };
    return icons[type] || '🔔';
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">
                  {i18n.language === 'ar' ? 'الإشعارات' : 'Notifications'}
                </CardTitle>
                <CardDescription>
                  {i18n.language === 'ar' 
                    ? `لديك ${unreadCount} إشعار غير مقروء`
                    : `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                  }
                </CardDescription>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                {i18n.language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                {i18n.language === 'ar' ? 'الكل' : 'All'}
                <Badge variant="secondary" className="ml-2">
                  {notifications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread">
                {i18n.language === 'ar' ? 'غير مقروء' : 'Unread'}
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="read">
                {i18n.language === 'ar' ? 'مقروء' : 'Read'}
                <Badge variant="secondary" className="ml-2">
                  {notifications.length - unreadCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Notifications List */}
          <ScrollArea className="h-[600px] pr-4">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg">
                  {i18n.language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className={`p-4 rounded-lg border transition-colors ${
                        !notification.is_read 
                          ? 'bg-primary/5 border-primary/20' 
                          : 'bg-background hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className="text-3xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-base">
                              {i18n.language === 'ar' ? notification.title_ar : notification.title_en}
                            </h4>
                            {!notification.is_read && (
                              <Badge variant="default" className="text-xs flex-shrink-0">
                                {i18n.language === 'ar' ? 'جديد' : 'New'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {i18n.language === 'ar' ? notification.message_ar : notification.message_en}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(notification.created_at)}
                            </span>
                            <div className="flex gap-2">
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  <Check className="h-4 w-4" />
                                  <span className="text-xs">
                                    {i18n.language === 'ar' ? 'تحديد كمقروء' : 'Mark read'}
                                  </span>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(notification.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="text-xs">
                                  {i18n.language === 'ar' ? 'حذف' : 'Delete'}
                                </span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loading}
                      className="gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {i18n.language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                        </>
                      ) : (
                        i18n.language === 'ar' ? 'تحميل المزيد' : 'Load more'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
