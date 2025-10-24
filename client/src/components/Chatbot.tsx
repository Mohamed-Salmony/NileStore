'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, AlertCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { subscribeToTicketMessages, unsubscribeFromChannel } from '@/lib/realtime';
import { useRouter } from 'next/navigation';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTicketCreated?: boolean;
  ticketId?: string;
  ticketNumber?: string;
}

const STORAGE_KEY = 'chatbot_messages';
const OPEN_STATE_KEY = 'chatbot_open';
const ACTIVE_TICKET_KEY = 'chatbot_active_ticket';

const Chatbot = () => {
  const { isAdmin, user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'مرحباً! كيف يمكنني مساعدتك اليوم؟ 👋',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [highlightLastMessage, setHighlightLastMessage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      // Load open state
      const savedOpen = localStorage.getItem(OPEN_STATE_KEY);
      if (savedOpen === 'true') {
        setIsOpen(true);
      }
      
      // Load messages
      const savedMessages = localStorage.getItem(STORAGE_KEY);
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(parsed);
        } catch (error) {
          console.error('Failed to parse saved messages:', error);
        }
      }
      
      // Load active ticket
      const savedTicket = localStorage.getItem(ACTIVE_TICKET_KEY);
      if (savedTicket) {
        setActiveTicketId(savedTicket);
      }
      
      // Check if we need to highlight last message (from notification)
      const shouldHighlight = localStorage.getItem('chatbot_highlight_last');
      if (shouldHighlight === 'true') {
        localStorage.removeItem('chatbot_highlight_last');
        setHighlightLastMessage(true);
        setIsOpen(true); // Open chatbot
        // Scroll to bottom after a short delay
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightLastMessage(false);
          }, 3000);
        }, 500);
      }
      
      // Listen for custom event to open chatbot
      const handleOpenChatbot = (event: any) => {
        const ticketId = event.detail?.ticketId;
        const scrollToUnread = event.detail?.scrollToUnread;
        
        if (ticketId) {
          setActiveTicketId(ticketId);
          setIsOpen(true);
          
          if (scrollToUnread) {
            setHighlightLastMessage(true);
          }
          
          // Scroll to bottom after a short delay
          setTimeout(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
            // Remove highlight after 3 seconds
            setTimeout(() => {
              setHighlightLastMessage(false);
              localStorage.removeItem('chatbot_scroll_to_unread');
              localStorage.removeItem('chatbot_unread_message');
            }, 3000);
          }, 500);
        }
      };
      
      window.addEventListener('openChatbot', handleOpenChatbot);
      
      return () => {
        window.removeEventListener('openChatbot', handleOpenChatbot);
      };
    }
  }, []);

  const quickReplies = [
    'تتبع طلبي',
    'سياسة الإرجاع',
    'طرق الدفع',
    'أوقات التوصيل',
    'التحدث مع الدعم',
  ];

  // Save messages to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Save open state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(OPEN_STATE_KEY, isOpen.toString());
      if (isOpen) {
        setUnreadCount(0);
      }
    }
  }, [isOpen]);

  // Save active ticket to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && activeTicketId) {
      localStorage.setItem(ACTIVE_TICKET_KEY, activeTicketId);
    }
  }, [activeTicketId]);

  // Load ticket messages when active ticket changes
  useEffect(() => {
    if (!activeTicketId || !user) return;

    const loadTicketMessages = async () => {
      try {
        const response = await api.getTicketDetails(activeTicketId);
        
        // Check if response has ticket data
        const ticket = response.ticket || response;
        
        // Check if messages exist and is an array
        if (!ticket || !ticket.messages || !Array.isArray(ticket.messages)) {
          console.log('No messages found in ticket');
          return;
        }
        
        // Convert ticket messages to chat messages
        const ticketMessages: Message[] = ticket.messages
          .filter((msg: any) => !msg.is_internal) // Exclude internal notes
          .map((msg: any, index: number) => ({
            id: index + 100, // Offset to avoid conflicts
            text: msg.message,
            sender: msg.sender_type === 'user' ? 'user' : 'bot',
            timestamp: new Date(msg.created_at),
          }));
        
        // Add ticket messages to existing messages
        if (ticketMessages.length > 0) {
          setMessages((prev) => {
            // Remove duplicates and merge
            const existingTexts = new Set(prev.map(m => m.text));
            const newMessages = ticketMessages.filter(m => !existingTexts.has(m.text));
            return [...prev, ...newMessages];
          });
        }
      } catch (error) {
        console.error('Failed to load ticket messages:', error);
      }
    };

    loadTicketMessages();
  }, [activeTicketId, user]);

  // Subscribe to realtime messages if there's an active ticket
  useEffect(() => {
    if (!activeTicketId) return;

    const channel = subscribeToTicketMessages(
      activeTicketId,
      (payload) => {
        const newMessage = payload.new;
        
        // Only show admin replies
        if (newMessage.sender_type === 'admin' && !newMessage.is_internal) {
          const botMessage: Message = {
            id: messages.length + 1,
            text: newMessage.message,
            sender: 'bot',
            timestamp: new Date(newMessage.created_at),
          };
          
          setMessages((prev) => [...prev, botMessage]);
          
          // Show notification if chat is closed
          if (!isOpen) {
            setUnreadCount((prev) => prev + 1);
            toast.info('💬 رد جديد من فريق الدعم!');
          }
        }
      }
    );

    return () => {
      unsubscribeFromChannel(channel);
    };
  }, [activeTicketId, isOpen, messages.length]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsTyping(true);

    // If there's an active ticket, send message to it
    if (activeTicketId) {
      try {
        await api.addTicketMessage(activeTicketId, userInput);
        setIsTyping(false);
        return;
      } catch (error) {
        console.error('Failed to send message:', error);
        toast.error('فشل إرسال الرسالة');
        setIsTyping(false);
        return;
      }
    }

    // Otherwise, get bot response
    setTimeout(async () => {
      const response = await getBotResponse(userInput);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = async (userInput: string): Promise<Message> => {
    const input = userInput.toLowerCase();
    
    let responseText = '';
    let shouldCreateTicket = false;

    if (input.includes('تتبع') || input.includes('طلب')) {
      responseText = '📦 يمكنك متابعة طلباتك من صفحة "طلباتي" في الملف الشخصي.\n\nهل تحتاج مساعدة في أي شيء آخر؟';
    } else if (input.includes('إرجاع') || input.includes('استبدال')) {
      responseText = '🔄 يمكنك إرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام. المنتج يجب أن يكون في حالته الأصلية.\n\nهل تريد التحدث مع فريق الدعم لبدء عملية الإرجاع؟';
    } else if (input.includes('دفع') || input.includes('سداد')) {
      responseText = '💳 نقبل الدفع عن طريق:\n• بطاقات الائتمان (Visa, Mastercard)\n• الدفع عند الاستلام\n• المحافظ الإلكترونية\n\nهل لديك أي استفسار آخر؟';
    } else if (input.includes('توصيل') || input.includes('شحن')) {
      responseText = '🚚 نوفر توصيل مجاني للطلبات فوق 500 جنيه.\nعادة ما يستغرق التوصيل من 2-5 أيام عمل حسب موقعك.\n\nهل تحتاج مساعدة أخرى؟';
    } else if (input.includes('شكرا') || input.includes('شكراً')) {
      responseText = 'العفو! أنا هنا دائماً لمساعدتك. 😊\n\nهل هناك أي شيء آخر تود معرفته؟';
    } else if (input.includes('دعم') || input.includes('مساعدة') || input.includes('مشكلة')) {
      shouldCreateTicket = true;
      responseText = '📝 سأقوم بتحويلك إلى فريق الدعم الفني.\nجاري إنشاء تذكرة دعم...';
    } else {
      // Unknown question - create ticket
      shouldCreateTicket = true;
      responseText = '🤔 عذراً، لم أتمكن من فهم سؤالك بشكل كامل.\n\n📝 سأقوم بتحويلك إلى فريق الدعم الفني للحصول على مساعدة مخصصة.\nجاري إنشاء تذكرة دعم...';
    }

    // Create ticket if needed
    if (shouldCreateTicket && user) {
      try {
        const ticketData = await api.createSupportTicket({
          subject: userInput.substring(0, 100),
          message: userInput,
          category: 'general',
          priority: 'normal'
        });

        setActiveTicketId(ticketData.ticket.id);

        return {
          id: messages.length + 2,
          text: `✅ تم إنشاء تذكرة دعم بنجاح!\n\n🎫 رقم التذكرة: ${ticketData.ticket.ticket_number}\n\n💬 سيقوم فريق الدعم بالرد عليك قريباً. يمكنك متابعة التذكرة من هنا أو من صفحة "تذاكر الدعم" في الملف الشخصي.`,
          sender: 'bot',
          timestamp: new Date(),
          isTicketCreated: true,
          ticketId: ticketData.ticket.id,
          ticketNumber: ticketData.ticket.ticket_number
        };
      } catch (error) {
        console.error('Failed to create ticket:', error);
        return {
          id: messages.length + 2,
          text: '❌ عذراً، حدث خطأ أثناء إنشاء التذكرة.\nيرجى المحاولة مرة أخرى أو التواصل معنا على:\n📞 +20 123 456 7890\n📧 info@nilestore.com',
          sender: 'bot',
          timestamp: new Date(),
        };
      }
    }

    return {
      id: messages.length + 2,
      text: responseText,
      sender: 'bot',
      timestamp: new Date(),
    };
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
  };

  // Don't show chatbot for admin users or until mounted
  if (isAdmin || !mounted) {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 left-6 z-50"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative"
        >
          <Button
            size="lg"
            onClick={() => setIsOpen(!isOpen)}
            className="h-14 w-14 rounded-full shadow-card-hover bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MessageCircle className="h-6 w-6" />
            )}
          </Button>
          
          {/* Unread Count Badge */}
          {!isOpen && unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </motion.div>
        
        {!isOpen && unreadCount === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-16 left-0 bg-secondary text-white px-4 py-2 rounded-lg shadow-lg whitespace-nowrap"
          >
            كيف يمكنني مساعدتك؟
          </motion.div>
        )}
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] max-h-[60vh]"
          >
            <Card className="shadow-card-hover overflow-hidden flex flex-col max-h-[60vh]">
              <CardHeader className="bg-gradient-to-r from-secondary to-secondary/90 text-white p-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Bot className="h-6 w-6" />
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                    </div>
                    مساعد متجر النيل
                  </div>
                  {activeTicketId && (
                    <Badge variant="secondary" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      متصل بالدعم
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-xs text-white/80 mt-1">
                  {activeTicketId 
                    ? 'أنت الآن متصل مع فريق الدعم الفني' 
                    : 'متاح الآن للإجابة على أسئلتك'}
                </p>
              </CardHeader>

              <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                {/* Messages */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <ScrollArea className="h-[45vh] sm:h-[50vh]">
                    <div className="space-y-4 p-4">
                    {messages.map((message, index) => {
                      const isLastMessage = index === messages.length - 1;
                      const shouldHighlight = isLastMessage && highlightLastMessage;
                      
                      return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          scale: shouldHighlight ? [1, 1.05, 1] : 1
                        }}
                        transition={{
                          scale: {
                            repeat: shouldHighlight ? 2 : 0,
                            duration: 0.5
                          }
                        }}
                        className={`flex gap-2 ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.sender === 'bot' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-secondary" />
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 transition-all ${
                            message.sender === 'user'
                              ? 'bg-secondary text-white rounded-br-sm'
                              : 'bg-muted rounded-bl-sm'
                          } ${
                            shouldHighlight 
                              ? 'ring-2 ring-secondary ring-offset-2 shadow-lg' 
                              : ''
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                          
                          {/* Ticket Action Button */}
                          {message.isTicketCreated && message.ticketId && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2 w-full text-xs"
                              onClick={() => router.push(`/support/ticket/${message.ticketId}`)}
                            >
                              <Package className="h-3 w-3 mr-1" />
                              عرض التذكرة
                            </Button>
                          )}
                          
                          <p className={`text-xs mt-1 ${
                            message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                          }`}>
                            {message.timestamp.toLocaleTimeString('ar-EG', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>

                        {message.sender === 'user' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-accent" />
                          </div>
                        )}
                      </motion.div>
                      );
                    })}

                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-2 items-center"
                      >
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-secondary" />
                        </div>
                        <div className="bg-muted rounded-2xl px-4 py-3 rounded-bl-sm">
                          <div className="flex gap-1">
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                              className="w-2 h-2 bg-secondary/60 rounded-full"
                            />
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                              className="w-2 h-2 bg-secondary/60 rounded-full"
                            />
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                              className="w-2 h-2 bg-secondary/60 rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  </ScrollArea>
                </div>

                {/* Quick Replies */}
                {messages.length <= 1 && (
                  <div className="px-4 pb-3 flex flex-wrap gap-2">
                    {quickReplies.map((reply, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickReply(reply)}
                          className="text-xs hover:bg-secondary/10 hover:text-secondary hover:border-secondary"
                        >
                          {reply}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="اكتب رسالتك..."
                      className="flex-1"
                      dir="rtl"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="bg-secondary hover:bg-secondary/90"
                      disabled={!input.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
