'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Ticket, Clock, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { subscribeToTickets, unsubscribeFromChannel } from '@/lib/realtime';
import { RealtimeChannel } from '@supabase/supabase-js';

const SupportTickets = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime updates
    const channel = subscribeToTickets(
      // On new ticket
      (payload) => {
        setTickets((prev) => [payload.new, ...prev]);
        // Update stats
        setStats((prev: any) => {
          if (!prev) return prev;
          const status = payload.new.status;
          return {
            ...prev,
            [status]: (prev[status] || 0) + 1,
            total: prev.total + 1
          };
        });
        toast.success(i18n.language === 'ar' ? 'تذكرة جديدة!' : 'New ticket!');
      },
      // On ticket update
      (payload) => {
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === payload.new.id ? { ...ticket, ...payload.new } : ticket
          )
        );
        // Refresh stats when status changes
        if (payload.old.status !== payload.new.status) {
          fetchStats();
        }
      },
      // On ticket delete
      (payload) => {
        setTickets((prev) => prev.filter((ticket) => ticket.id !== payload.old.id));
        fetchStats();
      }
    );

    // Cleanup subscription on unmount
    return () => {
      unsubscribeFromChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketsData, statsData] = await Promise.all([
        api.getAllSupportTickets({ page: 1, limit: 20 }),
        api.getTicketStats()
      ]);
      setTickets(ticketsData.tickets);
      setStats(statsData.stats);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error(i18n.language === 'ar' ? 'فشل تحميل التذاكر' : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await api.getTicketStats();
      setStats(statsData.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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
              <div className="text-2xl font-bold text-red-600">{stats.open}</div>
              <div className="text-sm text-muted-foreground">
                {i18n.language === 'ar' ? 'مفتوح' : 'Open'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.in_progress}</div>
              <div className="text-sm text-muted-foreground">
                {i18n.language === 'ar' ? 'قيد المعالجة' : 'In Progress'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <div className="text-sm text-muted-foreground">
                {i18n.language === 'ar' ? 'محلول' : 'Resolved'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
              <div className="text-sm text-muted-foreground">
                {i18n.language === 'ar' ? 'مغلق' : 'Closed'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            {i18n.language === 'ar' ? 'التذاكر' : 'Support Tickets'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {i18n.language === 'ar' ? 'لا توجد تذاكر' : 'No tickets found'}
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/support/${ticket.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{ticket.ticket_number}</Badge>
                        <Badge variant={
                          ticket.status === 'open' ? 'destructive' :
                          ticket.status === 'in_progress' ? 'default' :
                          ticket.status === 'resolved' ? 'secondary' : 'outline'
                        }>
                          {ticket.status}
                        </Badge>
                        {ticket.priority === 'urgent' && (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <h3 className="font-semibold mb-1">{ticket.subject}</h3>
                      <p className="text-sm text-muted-foreground">
                        {ticket.user?.email || 'Unknown user'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.created_at).toLocaleDateString(
                          i18n.language === 'ar' ? 'ar-EG' : 'en-US'
                        )}
                      </div>
                    </div>
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

export default SupportTickets;
