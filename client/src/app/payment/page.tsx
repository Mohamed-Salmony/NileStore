"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Upload, Loader2, CheckCircle, ArrowRight, Copy, Check, Package2, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const Payment = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [copiedField, setCopiedField] = useState<string>('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');

  useEffect(() => {
    // Check if user is logged in
    if (!authLoading && !user) {
      toast.error(i18n.language === 'ar' ? 'يجب تسجيل الدخول أولاً لإتمام عملية الدفع' : 'Please login first to complete payment');
      router.push('/login?redirect=/payment');
      return;
    }
    
    if (user) {
      loadCheckoutData();
      fetchPaymentMethods();
    }
  }, [user, authLoading]);

  const loadCheckoutData = () => {
    const data = sessionStorage.getItem('checkoutData');
    if (!data) {
      toast.error(t('noCheckoutData') || 'لا توجد بيانات طلب');
      router.push('/cart');
      return;
    }
    setCheckoutData(JSON.parse(data));
    setLoading(false);
  };

  const fetchPaymentMethods = async () => {
    try {
      const data = await api.getPaymentMethods();
      setPaymentMethods(data.payment_methods || []);
      if (data.payment_methods?.length > 0) {
        setSelectedMethod(data.payment_methods[0].method_type);
      }
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
      toast.error(t('failedToLoadPaymentMethods') || 'فشل تحميل طرق الدفع');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProofFile(e.target.files[0]);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(t('copiedToClipboard') || 'تم النسخ');
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleSubmitOrder = async () => {
    if (!selectedMethod) {
      toast.error(t('selectPaymentMethod') || 'يرجى اختيار طريقة الدفع');
      return;
    }

    if (!paymentProofFile) {
      toast.error(
        i18n.language === 'ar' 
          ? 'يرجى رفع صورة إثبات الدفع أولاً لتأكيد الطلب' 
          : 'Please upload payment proof first to confirm the order'
      );
      return;
    }

    setSubmitting(true);

    try {
      // Upload payment proof
      setUploadingProof(true);
      const formData = new FormData();
      formData.append('file', paymentProofFile);
      const uploadResponse = await api.uploadPaymentProof(formData);
      setUploadingProof(false);

      // Create order
      const orderData = {
        full_name: checkoutData.full_name,
        phone: checkoutData.phone,
        governorate_id: checkoutData.governorate_id,
        address: checkoutData.address,
        city: checkoutData.city,
        notes: checkoutData.notes || '',
        payment_method: selectedMethod,
        payment_proof_url: uploadResponse.url,
        subtotal: checkoutData.subtotal,
        shipping_cost: checkoutData.shippingCost,
        discount: checkoutData.discount || 0,
        coupon_code: checkoutData.appliedCoupon?.code || null,
        total_amount: checkoutData.total,
      };

      const response = await api.createOrder(orderData);
      
      // Clear cart and checkout data
      sessionStorage.removeItem('checkoutData');
      sessionStorage.removeItem('appliedCoupon');
      
      // Show success with order number
      setOrderNumber(response.order.order_number);
      setOrderSuccess(true);
      toast.success(t('orderPlacedSuccessfully') || 'تم إنشاء الطلب بنجاح');
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.message || t('failedToCreateOrder') || 'فشل إنشاء الطلب');
    } finally {
      setSubmitting(false);
      setUploadingProof(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!checkoutData) {
    return null;
  }

  const selectedPaymentMethod = paymentMethods.find(m => m.method_type === selectedMethod);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopiedField('order_number');
    toast.success('تم نسخ رقم الطلب');
    setTimeout(() => setCopiedField(''), 2000);
  };

  // Show success screen if order was created
  if (orderSuccess) {
    return (
      <div className="min-h-screen py-12 bg-muted/30 flex items-center justify-center">
        <div className="container px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="border-2 border-green-200 shadow-lg">
              <CardContent className="pt-12 pb-8 space-y-6">
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex justify-center"
                >
                  <div className="rounded-full bg-green-100 p-6">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                  </div>
                </motion.div>

                {/* Success Message */}
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-green-700">
                    تم إنشاء طلبك بنجاح! 🎉
                  </h1>
                  <p className="text-muted-foreground">
                    شكراً لك! سيتم مراجعة طلبك والتواصل معك قريباً
                  </p>
                </div>

                <Separator />

                {/* Order Number */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Package2 className="h-5 w-5" />
                    <span className="text-sm font-medium">رقم الطلب</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <div className="bg-muted px-6 py-3 rounded-lg">
                      <span className="text-2xl font-bold font-mono text-primary">
                        {orderNumber}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={copyOrderNumber}
                      className="gap-2"
                    >
                      {copiedField === 'order_number' ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          تم النسخ
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          نسخ
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button
                    size="lg"
                    onClick={() => router.push('/')}
                    className="gap-2"
                  >
                    العودة للرئيسية
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push('/products')}
                    className="gap-2"
                  >
                    تصفح المنتجات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen py-12 bg-muted/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/cart" className="hover:text-primary transition-colors">
              {t('cart') || 'السلة'}
            </Link>
            <ArrowRight className="h-4 w-4" />
            <Link href="/checkout" className="hover:text-primary transition-colors">
              {t('checkout') || 'الدفع'}
            </Link>
            <ArrowRight className="h-4 w-4" />
            <span className="text-primary font-medium">{t('payment') || 'طريقة الدفع'}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('selectPaymentMethod') || 'اختر طريقة الدفع'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="space-y-4">
                    {paymentMethods.map((method) => (
                      <motion.div
                        key={method.id}
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center space-x-3 space-x-reverse border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 ${
                          selectedMethod === method.method_type 
                            ? 'border-secondary bg-secondary/10 shadow-lg' 
                            : 'border-border hover:border-secondary/50 hover:shadow-md'
                        }`}
                        onClick={() => setSelectedMethod(method.method_type)}
                      >
                        <RadioGroupItem value={method.method_type} id={method.method_type} className="mt-1" />
                        <Label htmlFor={method.method_type} className="flex-1 cursor-pointer flex items-center gap-4">
                          {/* Logo */}
                          <div className="w-24 h-24 flex items-center justify-center bg-white rounded-xl border-2 border-gray-300 p-3 flex-shrink-0 shadow-sm">
                            {method.method_type === 'vodafone_cash' ? (
                              <img 
                                src="/vodafone.jpg" 
                                alt="Vodafone Cash" 
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <img 
                                src="/instapay.png" 
                                alt="InstaPay" 
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>
                          {/* Text */}
                          <div className="flex-1">
                            <p className="font-bold text-lg mb-1">
                              {method.method_type === 'vodafone_cash' 
                                ? (i18n.language === 'ar' ? 'فودافون كاش' : 'Vodafone Cash')
                                : (i18n.language === 'ar' ? 'إنستا باي' : 'InstaPay')}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {i18n.language === 'ar' ? method.instructions_ar : method.instructions_en}
                            </p>
                          </div>
                        </Label>
                      </motion.div>
                    ))}
                  </RadioGroup>

                  {selectedPaymentMethod && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      <Separator />
                      
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-secondary/10 to-primary/10 p-4 rounded-xl border-2 border-secondary/30">
                          <p className="font-bold text-lg mb-4 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-secondary" />
                            {t('paymentDetails')}
                          </p>
                          {selectedPaymentMethod.method_type === 'vodafone_cash' && (
                            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border-2 border-red-200 mb-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                                    <Smartphone className="h-4 w-4" />
                                    {t('vodafoneNumber')}
                                  </p>
                                  <code className="text-xl font-mono font-bold text-red-600 bg-white px-3 py-2 rounded-lg inline-block">
                                    {selectedPaymentMethod.vodafone_number}
                                  </code>
                                </div>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-10 w-10 border-2 border-red-300 hover:bg-red-50 ml-3"
                                  onClick={() => copyToClipboard(selectedPaymentMethod.vodafone_number, 'vodafone')}
                                >
                                  {copiedField === 'vodafone' ? (
                                    <Check className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <Copy className="h-5 w-5 text-red-600" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                          {selectedPaymentMethod.method_type === 'instapay' && (
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200 mb-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    {t('instapayEmail')}
                                  </p>
                                  <code className="text-xl font-mono font-bold text-blue-600 bg-white px-3 py-2 rounded-lg inline-block">
                                    {selectedPaymentMethod.instapay_email}
                                  </code>
                                </div>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-10 w-10 border-2 border-blue-300 hover:bg-blue-50 ml-3"
                                  onClick={() => copyToClipboard(selectedPaymentMethod.instapay_email, 'instapay')}
                                >
                                  {copiedField === 'instapay' ? (
                                    <Check className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <Copy className="h-5 w-5 text-blue-600" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                          <div className="bg-white p-4 rounded-xl border-2 border-secondary/30">
                            <p className="text-sm font-semibold text-muted-foreground mb-2">
                              {t('transferAmount')}
                            </p>
                            <p className="text-3xl font-bold text-secondary">
                              {checkoutData.total.toFixed(2)} <span className="text-lg">{t('egp')}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 bg-primary/5 p-4 rounded-xl border-2 border-primary/30">
                        <Label htmlFor="payment-proof" className="text-base font-bold flex items-center gap-2">
                          <Upload className="h-5 w-5 text-primary" />
                          {t('uploadPaymentProof')} *
                        </Label>
                        <div className="flex items-center gap-4">
                          <input
                            id="payment-proof"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('payment-proof')?.click()}
                            className="w-full h-12 text-base border-2 hover:bg-primary/10 hover:border-primary"
                          >
                            <Upload className="h-5 w-5 mr-2" />
                            {paymentProofFile ? (
                              <span className="truncate">{paymentProofFile.name}</span>
                            ) : (
                              t('chooseFile')
                            )}
                          </Button>
                        </div>
                        {paymentProofFile && (
                          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-medium">
                              {i18n.language === 'ar' ? 'تم اختيار الملف بنجاح' : 'File selected successfully'}
                            </span>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {t('uploadScreenshot')}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-20 shadow-xl border-2 border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20">
                  <CardTitle className="text-xl">{t('orderSummary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('subtotal') || 'المجموع الفرعي'}</span>
                      <span className="font-semibold">{checkoutData.subtotal.toFixed(2)} {t('egp')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('shipping') || 'الشحن'}</span>
                      <span className="font-semibold">
                        {checkoutData.shippingCost === 0 ? (
                          <span className="text-green-600">{t('free') || 'مجاني'}</span>
                        ) : (
                          `${checkoutData.shippingCost.toFixed(2)} ${t('egp')}`
                        )}
                      </span>
                    </div>
                    {checkoutData.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span className="flex items-center gap-1">
                          <span>{t('discount')} {checkoutData.appliedCoupon?.code && `(${checkoutData.appliedCoupon.code})`}</span>
                        </span>
                        <span className="font-semibold">-{checkoutData.discount.toFixed(2)} {t('egp')}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span className="font-bold">{t('total') || 'الإجمالي'}</span>
                      <span className="font-bold text-secondary">{checkoutData.total.toFixed(2)} {t('egp')}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                    <p className="font-bold text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {t('deliveryAddress')}
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-foreground">{checkoutData.full_name}</p>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {checkoutData.phone}
                      </p>
                      <p className="text-muted-foreground">{checkoutData.address}, {checkoutData.city}</p>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleSubmitOrder}
                      disabled={submitting || uploadingProof}
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg cursor-pointer"
                      size="lg"
                    >
                      {submitting || uploadingProof ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin ml-2" />
                          {uploadingProof ? (t('uploadingProof') || 'جاري رفع الإثبات...') : (t('processing') || 'جاري المعالجة...')}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 ml-2" />
                          {t('confirmOrder') || 'تأكيد الطلب'}
                        </>
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Payment;
