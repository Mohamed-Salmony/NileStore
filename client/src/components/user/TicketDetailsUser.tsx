'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, ArrowLeft, User, Clock, CheckCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { subscribeToTicketMessages, unsubscribeFromChannel } from '@/lib/realtime';

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
  messages: Message[];
}

const TicketDetailsUser = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [message, setMessage] = useState('');
  const [adminTyping, setAdminTyping] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    // Subscribe to new messages with realtime
    const channel = subscribeToTicketMessages(
      id,
      (payload) => {
        const newMessage = payload.new as Message;
        
        // Don't show internal messages to users
        if (newMessage.is_internal) return;

        setTicket((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, newMessage]
          };
        });

        // Show notification for admin replies
        if (newMessage.sender_type === 'admin') {
          setNewMessageCount((prev) => prev + 1);
          
          // Play notification sound (optional)
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => {}); // Ignore errors if sound file doesn't exist

          toast.success(
            i18n.language === 'ar' 
              ? '💬 رد جديد من فريق الدعم!' 
              : '💬 New reply from support team!',
            {
              duration: 5000,
            }
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

  // Reset new message count when user scrolls to bottom
  useEffect(() => {
    const handleScroll = () => {
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
      if (isAtBottom) {
        setNewMessageCount(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTicket = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await api.getTicketDetails(id);
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
    try {
      await api.addTicketMessage(id, message.trim());
      setMessage('');
      
      toast.success(
        i18n.language === 'ar' 
          ? '✅ تم إرسال الرسالة' 
          : '✅ Message sent'
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(i18n.language === 'ar' ? 'فشل إرسال الرسالة' : 'Failed to send message');
    } finally {
      setSending(false);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/support')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{ticket.subject}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{ticket.ticket_number}</Badge>
              <Badge variant={getStatusColor(ticket.status) as any}>
                {getStatusLabel(ticket.status)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* New Messages Indicator */}
      {newMessageCount > 0 && (
        <div className="bg-primary/10 border border-primary rounded-lg p-3 text-center">
          <p className="text-sm font-semibold text-primary">
            {i18n.language === 'ar'
              ? `📬 لديك ${newMessageCount} رسالة جديدة`
              : `📬 You have ${newMessageCount} new message${newMessageCount > 1 ? 's' : ''}`}
          </p>
        </div>
      )}

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{i18n.language === 'ar' ? 'المحادثة' : 'Conversation'}</span>
            {ticket.status === 'waiting_user' && (
              <Badge variant="secondary" className="animate-pulse">
                {i18n.language === 'ar' ? '⏳ بانتظار ردك' : '⏳ Waiting for your reply'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Messages List */}
          <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
            {ticket.messages
              .filter((msg) => !msg.is_internal) // Hide internal notes from users
              .map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender_type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.sender_type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-3 w-3" />
                      <span className="text-xs font-semibold">
                        {msg.sender_type === 'user'
                          ? i18n.language === 'ar'
                            ? 'أنت'
                            : 'You'
                          : i18n.language === 'ar'
                          ? 'فريق الدعم'
                          : 'Support Team'}
                      </span>
                      {msg.sender_type === 'admin' && index === ticket.messages.length - 1 && (
                        <CheckCheck className="h-3 w-3 text-green-500" />
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
            <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span>{i18n.language === 'ar' ? 'فريق الدعم يكتب...' : 'Support team is typing...'}</span>
            </div>
          )}

          {/* Reply Form */}
          {ticket.status !== 'closed' && (
            <div className="space-y-3 border-t pt-4">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  i18n.language === 'ar'
                    ? 'اكتب رسالتك هنا...'
                    : 'Type your message here...'
                }
                rows={3}
                disabled={sending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {i18n.language === 'ar'
                    ? 'اضغط Enter للإرسال، Shift+Enter لسطر جديد'
                    : 'Press Enter to send, Shift+Enter for new line'}
                </p>
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
          )}

          {ticket.status === 'closed' && (
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {i18n.language === 'ar'
                  ? '🔒 هذه التذكرة مغلقة. لا يمكن إضافة رسائل جديدة.'
                  : '🔒 This ticket is closed. No new messages can be added.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {i18n.language === 'ar' ? 'معلومات التذكرة' : 'Ticket Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">
              {i18n.language === 'ar' ? 'الفئة' : 'Category'}
            </p>
            <p className="text-sm">{ticket.category}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">
              {i18n.language === 'ar' ? 'الأولوية' : 'Priority'}
            </p>
            <p className="text-sm">{ticket.priority}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">
              {i18n.language === 'ar' ? 'تاريخ الإنشاء' : 'Created At'}
            </p>
            <p className="text-sm flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(ticket.created_at).toLocaleString(
                i18n.language === 'ar' ? 'ar-EG' : 'en-US'
              )}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">
              {i18n.language === 'ar' ? 'عدد الرسائل' : 'Messages'}
            </p>
            <p className="text-sm">{ticket.messages.filter((m) => !m.is_internal).length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketDetailsUser;
