import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const Contact = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const contactInfo = [
    { icon: Mail, titleKey: 'email', value: 'info@nilestore.com' },
    { icon: Phone, titleKey: 'phone', value: '+20 123 456 7890' },
    { icon: MapPin, titleKey: 'address', value: i18n.language === 'en' ? 'Cairo, Egypt' : 'القاهرة، مصر' },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">{t('contactUsTitle')}</h1>
          <p className="text-muted-foreground">{t('contactUsSubtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {contactInfo.map((info, index) => (
            <motion.div
              key={info.titleKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center shadow-card hover:shadow-card-hover transition-smooth">
                <CardContent className="p-6">
                  <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <info.icon className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-semibold mb-2">{t(info.titleKey)}</h3>
                  <p className="text-muted-foreground">{info.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">{t('sendMessage')}</h2>
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-green-600">
                    {i18n.language === 'ar' ? 'تم إرسال الرسالة بنجاح!' : 'Message sent successfully!'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {i18n.language === 'ar' 
                      ? 'شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.'
                      : 'Thank you for contacting us. We will reply as soon as possible.'}
                  </p>
                  <Button onClick={() => {
                    setIsSuccess(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}>
                    {i18n.language === 'ar' ? 'إرسال رسالة أخرى' : 'Send another message'}
                  </Button>
                </motion.div>
              ) : (
                <form className="space-y-6" onSubmit={async (e) => {
                  e.preventDefault();
                  
                  if (!formData.name || !formData.email || !formData.subject || !formData.message) {
                    toast.error(i18n.language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
                    return;
                  }

                  setIsSubmitting(true);
                  try {
                    await api.submitContactMessage(formData);
                    setIsSuccess(true);
                    toast.success(i18n.language === 'ar' ? 'تم إرسال رسالتك بنجاح' : 'Your message has been sent successfully');
                  } catch (error: any) {
                    console.error('Contact form error:', error);
                    toast.error(error.message || (i18n.language === 'ar' ? 'فشل إرسال الرسالة' : 'Failed to send message'));
                  } finally {
                    setIsSubmitting(false);
                  }
                }}>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('name')}</label>
                    <Input 
                      placeholder={t('enterName')} 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('email')}</label>
                    <Input 
                      type="email" 
                      placeholder="email@example.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('subject')}</label>
                    <Input 
                      placeholder={t('messageSubject')} 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('message')}</label>
                    <Textarea 
                      rows={5} 
                      placeholder={t('writeMessage')} 
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      required
                      disabled={isSubmitting}
                      minLength={10}
                      maxLength={5000}
                    />
                  </div>
                  <Button className="w-full gap-2" size="lg" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {i18n.language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        {t('sendMessageBtn')}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-6 bg-secondary/10 rounded-lg text-center"
          >
            <h3 className="font-semibold mb-2">{t('instantHelp')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('liveChatDesc')}
            </p>
            <Button variant="secondary">{t('startChat')}</Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
