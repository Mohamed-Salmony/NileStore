'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ContactMessages = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [messagesData, statsData] = await Promise.all([
        api.getAllContactMessages({ page: 1, limit: 20 }),
        api.getContactMessageStats()
      ]);
      setMessages(messagesData.messages);
      setStats(statsData.stats);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error(i18n.language === 'ar' ? 'فشل تحميل الرسائل' : 'Failed to load messages');
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
              <div className="text-sm text-muted-foreground">
                {i18n.language === 'ar' ? 'جديد' : 'New'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.read}</div>
              <div className="text-sm text-muted-foreground">
                {i18n.language === 'ar' ? 'مقروء' : 'Read'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
              <div className="text-sm text-muted-foreground">
                {i18n.language === 'ar' ? 'تم الرد' : 'Replied'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
              <div className="text-sm text-muted-foreground">
                {i18n.language === 'ar' ? 'مؤرشف' : 'Archived'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {i18n.language === 'ar' ? 'رسائل التواصل' : 'Contact Messages'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {i18n.language === 'ar' ? 'لا توجد رسائل' : 'No messages found'}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold">{message.subject}</h3>
                      <p className="text-sm text-muted-foreground">
                        {message.name} • {message.email}
                      </p>
                    </div>
                    <Badge variant={
                      message.status === 'new' ? 'default' :
                      message.status === 'read' ? 'secondary' :
                      message.status === 'replied' ? 'outline' : 'secondary'
                    }>
                      {message.status}
                    </Badge>
                  </div>
                  <p className="text-sm line-clamp-2">{message.message}</p>
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(message.created_at).toLocaleString(
                      i18n.language === 'ar' ? 'ar-EG' : 'en-US'
                    )}
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

export default ContactMessages;
