import { motion } from 'framer-motion';
import { Bell, Lock, Globe, Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Settings = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-8">الإعدادات</h1>

          <div className="space-y-6">
            {/* Notifications */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-secondary" />
                  الإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">إشعارات البريد الإلكتروني</Label>
                    <p className="text-sm text-muted-foreground">
                      تلقي تحديثات عن الطلبات والعروض
                    </p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">إشعارات الهاتف</Label>
                    <p className="text-sm text-muted-foreground">
                      تلقي إشعارات فورية على هاتفك
                    </p>
                  </div>
                  <Switch id="push-notifications" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notifications">رسائل SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      تلقي رسائل نصية حول الطلبات
                    </p>
                  </div>
                  <Switch id="sms-notifications" />
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-secondary" />
                  الخصوصية والأمان
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">المصادقة الثنائية</Label>
                    <p className="text-sm text-muted-foreground">
                      حماية إضافية لحسابك
                    </p>
                  </div>
                  <Switch id="two-factor" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="save-payment">حفظ معلومات الدفع</Label>
                    <p className="text-sm text-muted-foreground">
                      حفظ بيانات البطاقة للدفع السريع
                    </p>
                  </div>
                  <Switch id="save-payment" />
                </div>
                <Separator />
                <Button variant="outline" className="w-full">
                  تغيير كلمة المرور
                </Button>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-secondary" />
                  المظهر واللغة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">الوضع الليلي</Label>
                    <p className="text-sm text-muted-foreground">
                      تفعيل المظهر الداكن
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                    <Switch id="dark-mode" />
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>اللغة</Label>
                  <Button variant="outline" className="w-full justify-between">
                    العربية
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="w-full" size="lg">
                حفظ التغييرات
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
