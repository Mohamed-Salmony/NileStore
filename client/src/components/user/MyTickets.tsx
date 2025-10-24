'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Ticket, Plus, Clock, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { subscribeToTickets, unsubscribeFromChannel } from '@/lib/realtime';

interface TicketItem {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
}

const MyTickets = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<TicketItem[]>([]);

  useEffect(() => {
    fetchTickets();

    // Subscribe to realtime updates for user's tickets
    const channel = subscribeToTickets(
      undefined, // No need for insert callback (user creates tickets themselves)
      // On ticket update
      (payload) => {
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === payload.new.id ? { ...ticket, ...payload.new } : ticket
          )
        );

        // Show notification if status changed
        if (payload.old.status !== payload.new.status) {
          toast.info(
            i18n.language === 'ar'
              ? `📝 تم تحديث حالة التذكرة إلى: ${getStatusLabel(payload.new.status)}`
              : `📝 Ticket status updated to: ${getStatusLabel(payload.new.status)}`
          );
        }
      }
    );

    return () => {
      unsubscribeFromChannel(channel);
    };
  }, [i18n.language]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await api.getUserTickets({ page: 1, limit: 50 });
      setTickets(data.tickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error(i18n.language === 'ar' ? 'فشل تحميل التذاكر' : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      open: { ar: 'مفتوح', en: 'Open' },
      in_progress: { ar: 'قيد المعالجة', en: 'In Progress' },
      waiting_user: { ar: 'بانتظار ردك', en: 'Waiting for you' },
      resolved: { ar: 'محلول', en: 'Resolved' },
      closed: { ar: 'مغلق', en: 'Closed' }
    };
    return i18n.language === 'ar' ? labels[status]?.ar : labels[status]?.en;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'destructive',
      in_progress: 'default',
      waiting_user: 'secondary',
      resolved: 'outline',
      closed: 'outline'
    };
    return colors[status] || 'default';
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      low: { ar: 'منخفض', en: 'Low' },
      normal: { ar: 'عادي', en: 'Normal' },
      high: { ar: 'عالي', en: 'High' },
      urgent: { ar: 'عاجل', en: 'Urgent' }
    };
    return i18n.language === 'ar' ? labels[priority]?.ar : labels[priority]?.en;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {i18n.language === 'ar' ? 'تذاكر الدعم' : 'Support Tickets'}
          </h1>
          <p className="text-muted-foreground">
            {i18n.language === 'ar'
              ? 'تابع حالة تذاكرك وتواصل مع فريق الدعم'
              : 'Track your tickets and communicate with support'}
          </p>
        </div>
        <Button onClick={() => router.push('/support/new')}>
          <Plus className="h-4 w-4 mr-2" />
          {i18n.language === 'ar' ? 'تذكرة جديدة' : 'New Ticket'}
        </Button>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              {i18n.language === 'ar'
                ? 'لا توجد تذاكر حتى الآن'
                : 'No tickets yet'}
            </p>
            <Button onClick={() => router.push('/support/new')}>
              <Plus className="h-4 w-4 mr-2" />
              {i18n.language === 'ar' ? 'إنشاء تذكرة' : 'Create Ticket'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/support/ticket/${ticket.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{ticket.ticket_number}</Badge>
                      <Badge variant={getStatusColor(ticket.status) as any}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                      {ticket.priority === 'urgent' && (
                        <Badge variant="destructive">
                          {i18n.language === 'ar' ? '🔥 عاجل' : '🔥 Urgent'}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{ticket.subject}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.created_at).toLocaleDateString(
                          i18n.language === 'ar' ? 'ar-EG' : 'en-US'
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {i18n.language === 'ar' ? 'الفئة:' : 'Category:'} {ticket.category}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    {i18n.language === 'ar' ? 'عرض' : 'View'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
