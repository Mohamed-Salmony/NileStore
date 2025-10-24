'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const NewsletterSubscribers = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subscribersData, statsData] = await Promise.all([
        api.getAllNewsletterSubscriptions({ page: 1, limit: 50 }),
        api.getNewsletterStats()
      ]);
      setSubscribers(subscribersData.subscriptions);
      setStats(statsData.stats);
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
      toast.error(i18n.language === 'ar' ? 'فشل تحميل المشتركين' : 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-muted-foreground">
                {i18n.language === 'ar' ? 'نشط' : 'Active'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.unsubscribed}</div>
              <div className="text-sm text-muted-foreground">
                {i18n.language === 'ar' ? 'ملغي' : 'Unsubscribed'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">
                {i18n.language === 'ar' ? 'الإجمالي' : 'Total'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subscribers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {i18n.language === 'ar' ? 'المشتركون في النشرة' : 'Newsletter Subscribers'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {i18n.language === 'ar' ? 'لا يوجد مشتركون' : 'No subscribers found'}
            </div>
          ) : (
            <div className="space-y-2">
              {subscribers.map((subscriber) => (
                <div
                  key={subscriber.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{subscriber.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={subscriber.status === 'active' ? 'default' : 'secondary'}>
                      {subscriber.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(subscriber.subscribed_at).toLocaleDateString(
                        i18n.language === 'ar' ? 'ar-EG' : 'en-US'
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterSubscribers;
