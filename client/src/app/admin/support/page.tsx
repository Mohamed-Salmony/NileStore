'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, Ticket, Bell } from 'lucide-react';
import NewsletterSubscribers from '@/components/admin/support/NewsletterSubscribers';
import ContactMessages from '@/components/admin/support/ContactMessages';
import SupportTickets from '@/components/admin/support/SupportTickets';
import SendNotifications from '@/components/admin/support/SendNotifications';

const AdminSupportPage = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('tickets');

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {i18n.language === 'ar' ? 'مركز الدعم' : 'Support Center'}
          </h1>
          <p className="text-muted-foreground">
            {i18n.language === 'ar' 
              ? 'إدارة التذاكر، الرسائل، الاشتراكات والإشعارات'
              : 'Manage tickets, messages, subscriptions and notifications'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="tickets" className="gap-2">
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">
                {i18n.language === 'ar' ? 'التذاكر' : 'Tickets'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">
                {i18n.language === 'ar' ? 'الرسائل' : 'Messages'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">
                {i18n.language === 'ar' ? 'النشرة' : 'Newsletter'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">
                {i18n.language === 'ar' ? 'إشعارات' : 'Notifications'}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets">
            <SupportTickets />
          </TabsContent>

          <TabsContent value="contact">
            <ContactMessages />
          </TabsContent>

          <TabsContent value="newsletter">
            <NewsletterSubscribers />
          </TabsContent>

          <TabsContent value="notifications">
            <SendNotifications />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSupportPage;
