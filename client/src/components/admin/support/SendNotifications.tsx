'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Send, Loader2, Users, User } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const SendNotifications = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  
  // Single user form
  const [singleForm, setSingleForm] = useState({
    user_id: '',
    type: 'admin_message',
    title_ar: '',
    title_en: '',
    message_ar: '',
    message_en: ''
  });

  // All users form
  const [allForm, setAllForm] = useState({
    type: 'promotion',
    title_ar: '',
    title_en: '',
    message_ar: '',
    message_en: ''
  });

  const notificationTypes = [
    { value: 'admin_message', label: i18n.language === 'ar' ? 'رسالة من الإدارة' : 'Admin Message' },
    { value: 'promotion', label: i18n.language === 'ar' ? 'عرض خاص' : 'Promotion' },
    { value: 'system', label: i18n.language === 'ar' ? 'إشعار نظام' : 'System Notification' }
  ];

  const handleSendToUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!singleForm.user_id || !singleForm.title_ar || !singleForm.title_en || 
        !singleForm.message_ar || !singleForm.message_en) {
      toast.error(i18n.language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await api.createNotification(singleForm);
      toast.success(i18n.language === 'ar' ? 'تم إرسال الإشعار بنجاح' : 'Notification sent successfully');
      setSingleForm({
        user_id: '',
        type: 'admin_message',
        title_ar: '',
        title_en: '',
        message_ar: '',
        message_en: ''
      });
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      toast.error(error.message || (i18n.language === 'ar' ? 'فشل إرسال الإشعار' : 'Failed to send notification'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendToAll = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allForm.title_ar || !allForm.title_en || !allForm.message_ar || !allForm.message_en) {
      toast.error(i18n.language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    const confirmed = window.confirm(
      i18n.language === 'ar' 
        ? 'هل أنت متأكد من إرسال الإشعار لجميع المستخدمين؟'
        : 'Are you sure you want to send notification to all users?'
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      await api.sendNotificationToAll(allForm);
      toast.success(i18n.language === 'ar' ? 'تم إرسال الإشعار لجميع المستخدمين' : 'Notification sent to all users');
      setAllForm({
        type: 'promotion',
        title_ar: '',
        title_en: '',
        message_ar: '',
        message_en: ''
      });
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      toast.error(error.message || (i18n.language === 'ar' ? 'فشل إرسال الإشعار' : 'Failed to send notification'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {i18n.language === 'ar' ? 'إرسال الإشعارات' : 'Send Notifications'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="single" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single" className="gap-2">
                <User className="h-4 w-4" />
                {i18n.language === 'ar' ? 'مستخدم واحد' : 'Single User'}
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2">
                <Users className="h-4 w-4" />
                {i18n.language === 'ar' ? 'جميع المستخدمين' : 'All Users'}
              </TabsTrigger>
            </TabsList>

            {/* Single User */}
            <TabsContent value="single">
              <form onSubmit={handleSendToUser} className="space-y-4">
                <div className="space-y-2">
                  <Label>{i18n.language === 'ar' ? 'معرف المستخدم (UUID)' : 'User ID (UUID)'}</Label>
                  <Input
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={singleForm.user_id}
                    onChange={(e) => setSingleForm({ ...singleForm, user_id: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{i18n.language === 'ar' ? 'نوع الإشعار' : 'Notification Type'}</Label>
                  <Select
                    value={singleForm.type}
                    onValueChange={(value) => setSingleForm({ ...singleForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{i18n.language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                    <Input
                      placeholder="العنوان بالعربية"
                      value={singleForm.title_ar}
                      onChange={(e) => setSingleForm({ ...singleForm, title_ar: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{i18n.language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
                    <Input
                      placeholder="Title in English"
                      value={singleForm.title_en}
                      onChange={(e) => setSingleForm({ ...singleForm, title_en: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{i18n.language === 'ar' ? 'الرسالة (عربي)' : 'Message (Arabic)'}</Label>
                    <Textarea
                      placeholder="الرسالة بالعربية"
                      rows={4}
                      value={singleForm.message_ar}
                      onChange={(e) => setSingleForm({ ...singleForm, message_ar: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{i18n.language === 'ar' ? 'الرسالة (إنجليزي)' : 'Message (English)'}</Label>
                    <Textarea
                      placeholder="Message in English"
                      rows={4}
                      value={singleForm.message_en}
                      onChange={(e) => setSingleForm({ ...singleForm, message_en: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full gap-2">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {i18n.language === 'ar' ? 'إرسال الإشعار' : 'Send Notification'}
                </Button>
              </form>
            </TabsContent>

            {/* All Users */}
            <TabsContent value="all">
              <form onSubmit={handleSendToAll} className="space-y-4">
                <div className="space-y-2">
                  <Label>{i18n.language === 'ar' ? 'نوع الإشعار' : 'Notification Type'}</Label>
                  <Select
                    value={allForm.type}
                    onValueChange={(value) => setAllForm({ ...allForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{i18n.language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                    <Input
                      placeholder="العنوان بالعربية"
                      value={allForm.title_ar}
                      onChange={(e) => setAllForm({ ...allForm, title_ar: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{i18n.language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
                    <Input
                      placeholder="Title in English"
                      value={allForm.title_en}
                      onChange={(e) => setAllForm({ ...allForm, title_en: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{i18n.language === 'ar' ? 'الرسالة (عربي)' : 'Message (Arabic)'}</Label>
                    <Textarea
                      placeholder="الرسالة بالعربية"
                      rows={4}
                      value={allForm.message_ar}
                      onChange={(e) => setAllForm({ ...allForm, message_ar: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{i18n.language === 'ar' ? 'الرسالة (إنجليزي)' : 'Message (English)'}</Label>
                    <Textarea
                      placeholder="Message in English"
                      rows={4}
                      value={allForm.message_en}
                      onChange={(e) => setAllForm({ ...allForm, message_en: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full gap-2 bg-gradient-to-r from-primary to-secondary">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {i18n.language === 'ar' ? 'إرسال لجميع المستخدمين' : 'Send to All Users'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SendNotifications;
