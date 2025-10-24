'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, ArrowLeft, User, Clock, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { subscribeToTicketMessages, unsubscribeFromChannel } from '@/lib/realtime';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Message {
  id: string;
  message: string;
  sender_type: 'user' | 'admin' | 'bot';
  sender_id: string;
  is_internal: boolean;
  created_at: string;
}

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  user: {
    email: string;
    raw_user_meta_data: any;
  };
  messages: Message[];
}

const TicketDetails = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    // Subscribe to new messages
    const channel = subscribeToTicketMessages(
      id,
      (payload) => {
        const newMessage = payload.new as Message;
        
        setTicket((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, newMessage]
          };
        });

        // Show toast for new messages
        if (newMessage.sender_type === 'user') {
          toast.info(
            i18n.language === 'ar' 
              ? '💬 رسالة جديدة من المستخدم' 
              : '💬 New message from user'
          );
        }

        // Scroll to bottom
        scrollToBottom();
      }
    );

    return () => {
      unsubscribeFromChannel(channel);
    };
  }, [id, i18n.language]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTicket = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await api.adminGetTicketDetails(id);
      setTicket(data.ticket);
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
      toast.error(i18n.language === 'ar' ? 'فشل تحميل التذكرة' : 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !id) return;

    setSending(true);
    const messageText = message.trim();
    const isInternalNote = isInternal;
    
    try {
      const response = await api.adminReplyToTicket(id, {
        message: messageText,
        is_internal: isInternalNote
      });

      // Add message to UI immediately
      const newMessage: Message = {
        id: Date.now().toString(),
        message: messageText,
        sender_type: 'admin',
        sender_id: '', // Will be set by backend
        is_internal: isInternalNote,
        created_at: new Date().toISOString(),
      };

      setTicket((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, newMessage]
        };
      });

      setMessage('');
      setIsInternal(false);
      
      // Scroll to bottom
      scrollToBottom();
      
      toast.success(
        i18n.language === 'ar' 
          ? '✅ تم إرسال الرد' 
          : '✅ Reply sent'
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(i18n.language === 'ar' ? 'فشل إرسال الرد' : 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;

    try {
      await api.updateSupportTicket(id, { status: newStatus });
      setTicket((prev) => prev ? { ...prev, status: newStatus } : null);
      
      toast.success(
        i18n.language === 'ar' 
          ? '✅ تم تحديث الحالة' 
          : '✅ Status updated'
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(i18n.language === 'ar' ? 'فشل تحديث الحالة' : 'Failed to update status');
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!id) return;

    try {
      await api.updateSupportTicket(id, { priority: newPriority });
      setTicket((prev) => prev ? { ...prev, priority: newPriority } : null);
      
      toast.success(
        i18n.language === 'ar' 
          ? '✅ تم تحديث الأولوية' 
          : '✅ Priority updated'
      );
    } catch (error) {
      console.error('Failed to update priority:', error);
      toast.error(i18n.language === 'ar' ? 'فشل تحديث الأولوية' : 'Failed to update priority');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {i18n.language === 'ar' ? 'التذكرة غير موجودة' : 'Ticket not found'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/support')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{ticket.subject}</h1>
            <p className="text-sm text-muted-foreground">
              {ticket.ticket_number}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {i18n.language === 'ar' ? 'المحادثة' : 'Conversation'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Messages List */}
              <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
                {ticket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender_type === 'admin'
                          ? msg.is_internal
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300'
                            : 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3" />
                        <span className="text-xs font-semibold">
                          {msg.sender_type === 'admin'
                            ? i18n.language === 'ar'
                              ? 'الأدمن'
                              : 'Admin'
                            : i18n.language === 'ar'
                            ? 'المستخدم'
                            : 'User'}
                        </span>
                        {msg.is_internal && (
                          <Badge variant="outline" className="text-xs">
                            {i18n.language === 'ar' ? 'داخلي' : 'Internal'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.created_at).toLocaleString(
                          i18n.language === 'ar' ? 'ar-EG' : 'en-US'
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing Indicator */}
              {adminTyping && (
                <div className="text-sm text-muted-foreground mb-2">
                  <span className="animate-pulse">
                    {i18n.language === 'ar' ? 'يكتب...' : 'Typing...'}
                  </span>
                </div>
              )}

              {/* Reply Form */}
              <div className="space-y-3 border-t pt-4">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    i18n.language === 'ar'
                      ? 'اكتب ردك هنا...'
                      : 'Type your reply here...'
                  }
                  rows={3}
                  disabled={sending}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="internal"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="internal" className="text-sm">
                      {i18n.language === 'ar' ? 'ملاحظة داخلية' : 'Internal note'}
                    </label>
                  </div>
                  <Button onClick={handleSendMessage} disabled={sending || !message.trim()}>
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {i18n.language === 'ar' ? 'إرسال' : 'Send'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {i18n.language === 'ar' ? 'معلومات المستخدم' : 'User Info'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-semibold">
                  {i18n.language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </p>
                <p className="text-sm text-muted-foreground">{ticket.user.email}</p>
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {i18n.language === 'ar' ? 'الاسم' : 'Name'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {ticket.user.raw_user_meta_data?.full_name || 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {i18n.language === 'ar' ? 'معلومات التذكرة' : 'Ticket Info'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  {i18n.language === 'ar' ? 'الحالة' : 'Status'}
                </label>
                <Select value={ticket.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">
                      {i18n.language === 'ar' ? 'مفتوح' : 'Open'}
                    </SelectItem>
                    <SelectItem value="in_progress">
                      {i18n.language === 'ar' ? 'قيد المعالجة' : 'In Progress'}
                    </SelectItem>
                    <SelectItem value="waiting_user">
                      {i18n.language === 'ar' ? 'بانتظار المستخدم' : 'Waiting User'}
                    </SelectItem>
                    <SelectItem value="resolved">
                      {i18n.language === 'ar' ? 'محلول' : 'Resolved'}
                    </SelectItem>
                    <SelectItem value="closed">
                      {i18n.language === 'ar' ? 'مغلق' : 'Closed'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  {i18n.language === 'ar' ? 'الأولوية' : 'Priority'}
                </label>
                <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      {i18n.language === 'ar' ? 'منخفض' : 'Low'}
                    </SelectItem>
                    <SelectItem value="normal">
                      {i18n.language === 'ar' ? 'عادي' : 'Normal'}
                    </SelectItem>
                    <SelectItem value="high">
                      {i18n.language === 'ar' ? 'عالي' : 'High'}
                    </SelectItem>
                    <SelectItem value="urgent">
                      {i18n.language === 'ar' ? 'عاجل' : 'Urgent'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div>
                <p className="text-sm font-semibold">
                  {i18n.language === 'ar' ? 'الفئة' : 'Category'}
                </p>
                <Badge variant="outline" className="mt-1">
                  {ticket.category}
                </Badge>
              </div>

              {/* Created At */}
              <div>
                <p className="text-sm font-semibold">
                  {i18n.language === 'ar' ? 'تاريخ الإنشاء' : 'Created At'}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {new Date(ticket.created_at).toLocaleString(
                    i18n.language === 'ar' ? 'ar-EG' : 'en-US'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
