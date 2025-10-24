"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import AdminLayout from './AdminLayout';

const PaymentSettings = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [vodafoneData, setVodafoneData] = useState({
    is_active: true,
    vodafone_number: '',
    instructions_ar: '',
    instructions_en: '',
  });

  const [instapayData, setInstapayData] = useState({
    is_active: true,
    instapay_email: '',
    instructions_ar: '',
    instructions_en: '',
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const [vodafone, instapay] = await Promise.all([
        api.getPaymentMethodByType('vodafone_cash').catch(() => null),
        api.getPaymentMethodByType('instapay').catch(() => null),
      ]);

      if (vodafone?.payment_method) {
        setVodafoneData({
          is_active: vodafone.payment_method.is_active,
          vodafone_number: vodafone.payment_method.vodafone_number || '',
          instructions_ar: vodafone.payment_method.instructions_ar || '',
          instructions_en: vodafone.payment_method.instructions_en || '',
        });
      }

      if (instapay?.payment_method) {
        setInstapayData({
          is_active: instapay.payment_method.is_active,
          instapay_email: instapay.payment_method.instapay_email || '',
          instructions_ar: instapay.payment_method.instructions_ar || '',
          instructions_en: instapay.payment_method.instructions_en || '',
        });
      }
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVodafone = async () => {
    if (!vodafoneData.vodafone_number.trim()) {
      toast.error('Please enter Vodafone Cash number');
      return;
    }

    setSubmitting(true);
    try {
      await api.updatePaymentMethod('vodafone_cash', vodafoneData);
      toast.success('Vodafone Cash settings updated successfully');
    } catch (error: any) {
      console.error('Error updating Vodafone Cash:', error);
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveInstapay = async () => {
    if (!instapayData.instapay_email.trim()) {
      toast.error('Please enter InstaPay email');
      return;
    }

    setSubmitting(true);
    try {
      await api.updatePaymentMethod('instapay', instapayData);
      toast.success('InstaPay settings updated successfully');
    } catch (error: any) {
      console.error('Error updating InstaPay:', error);
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">إعدادات الدفع</h1>
          <p className="text-muted-foreground mt-1">تكوين طرق الدفع للمتجر</p>
        </div>

        <Tabs defaultValue="vodafone" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="vodafone">
              <Smartphone className="h-4 w-4 mr-2" />
              فودافون كاش
            </TabsTrigger>
            <TabsTrigger value="instapay">
              <CreditCard className="h-4 w-4 mr-2" />
              إنستاباي
            </TabsTrigger>
          </TabsList>

          {/* Vodafone Cash Settings */}
          <TabsContent value="vodafone">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-secondary" />
                  إعدادات فودافون كاش
                </CardTitle>
                <CardDescription>
                  قم بتكوين تفاصيل طريقة الدفع بفودافون كاش
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>تفعيل فودافون كاش</Label>
                    <p className="text-sm text-muted-foreground">
                      السماح للعملاء بالدفع باستخدام فودافون كاش
                    </p>
                  </div>
                  <Switch
                    checked={vodafoneData.is_active}
                    onCheckedChange={(checked) => setVodafoneData({ ...vodafoneData, is_active: checked })}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="vodafone_number">رقم فودافون كاش *</Label>
                  <Input
                    id="vodafone_number"
                    placeholder="01012345678"
                    value={vodafoneData.vodafone_number}
                    onChange={(e) => setVodafoneData({ ...vodafoneData, vodafone_number: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    سيتم عرض هذا الرقم للعملاء للدفع
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vodafone_instructions_ar">التعليمات (بالعربية)</Label>
                  <Textarea
                    id="vodafone_instructions_ar"
                    placeholder="قم بتحويل المبلغ إلى رقم فودافون كاش الموضح أدناه"
                    value={vodafoneData.instructions_ar}
                    onChange={(e) => setVodafoneData({ ...vodafoneData, instructions_ar: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vodafone_instructions_en">التعليمات (بالإنجليزية)</Label>
                  <Textarea
                    id="vodafone_instructions_en"
                    placeholder="Transfer the amount to the Vodafone Cash number shown below"
                    value={vodafoneData.instructions_en}
                    onChange={(e) => setVodafoneData({ ...vodafoneData, instructions_en: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button onClick={handleSaveVodafone} disabled={submitting} className="w-full">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      حفظ إعدادات فودافون كاش
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* InstaPay Settings */}
          <TabsContent value="instapay">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-secondary" />
                  إعدادات إنستاباي
                </CardTitle>
                <CardDescription>
                  قم بتكوين تفاصيل طريقة الدفع بإنستاباي
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>تفعيل إنستاباي</Label>
                    <p className="text-sm text-muted-foreground">
                      السماح للعملاء بالدفع باستخدام إنستاباي
                    </p>
                  </div>
                  <Switch
                    checked={instapayData.is_active}
                    onCheckedChange={(checked) => setInstapayData({ ...instapayData, is_active: checked })}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="instapay_email">بريد إنستاباي الإلكتروني *</Label>
                  <Input
                    id="instapay_email"
                    type="email"
                    placeholder="payment@example.com"
                    value={instapayData.instapay_email}
                    onChange={(e) => setInstapayData({ ...instapayData, instapay_email: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    سيتم عرض هذا البريد للعملاء للدفع
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instapay_instructions_ar">التعليمات (بالعربية)</Label>
                  <Textarea
                    id="instapay_instructions_ar"
                    placeholder="قم بتحويل المبلغ إلى البريد الإلكتروني الموضح أدناه"
                    value={instapayData.instructions_ar}
                    onChange={(e) => setInstapayData({ ...instapayData, instructions_ar: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instapay_instructions_en">التعليمات (بالإنجليزية)</Label>
                  <Textarea
                    id="instapay_instructions_en"
                    placeholder="Transfer the amount to the InstaPay email shown below"
                    value={instapayData.instructions_en}
                    onChange={(e) => setInstapayData({ ...instapayData, instructions_en: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button onClick={handleSaveInstapay} disabled={submitting} className="w-full">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      حفظ إعدادات إنستاباي
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>معاينة طرق الدفع</CardTitle>
            <CardDescription>
              هكذا سيرى العملاء خيارات الدفع
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vodafone Cash Preview */}
              <div className={`border rounded-lg p-4 ${vodafoneData.is_active ? '' : 'opacity-50'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <Smartphone className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="font-semibold">Vodafone Cash</p>
                    <p className="text-xs text-muted-foreground">
                      {vodafoneData.instructions_en || 'No instructions set'}
                    </p>
                  </div>
                </div>
                {vodafoneData.vodafone_number && (
                  <div className="bg-muted p-3 rounded">
                    <p className="text-xs text-muted-foreground mb-1">الرقم</p>
                    <code className="text-sm font-mono">{vodafoneData.vodafone_number}</code>
                  </div>
                )}
                {!vodafoneData.is_active && (
                  <p className="text-xs text-destructive mt-2">معطل</p>
                )}
              </div>

              {/* InstaPay Preview */}
              <div className={`border rounded-lg p-4 ${instapayData.is_active ? '' : 'opacity-50'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="font-semibold">InstaPay</p>
                    <p className="text-xs text-muted-foreground">
                      {instapayData.instructions_en || 'No instructions set'}
                    </p>
                  </div>
                </div>
                {instapayData.instapay_email && (
                  <div className="bg-muted p-3 rounded">
                    <p className="text-xs text-muted-foreground mb-1">البريد الإلكتروني</p>
                    <code className="text-sm font-mono">{instapayData.instapay_email}</code>
                  </div>
                )}
                {!instapayData.is_active && (
                  <p className="text-xs text-destructive mt-2">معطل</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSettings;
