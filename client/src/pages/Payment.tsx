"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Upload, Loader2, CheckCircle, ArrowRight, Copy, Check, MapPin, Phone } from 'lucide-react';
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

const Payment = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [copiedField, setCopiedField] = useState<string>('');

  useEffect(() => {
    loadCheckoutData();
    fetchPaymentMethods();
  }, []);

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
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t('pleaseSelectImage') || 'الرجاء اختيار صورة');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('fileTooLarge') || 'حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)');
        return;
      }
      setPaymentProofFile(file);
    }
  };

  const uploadPaymentProof = async (): Promise<string | null> => {
    if (!paymentProofFile) return null;

    try {
      setUploadingProof(true);
      const result = await api.uploadFile(paymentProofFile, 'payment-proofs');
      return result.url;
    } catch (error: any) {
      console.error('Error uploading payment proof:', error);
      toast.error(error.message || t('failedToUploadProof') || 'فشل رفع إثبات الدفع');
      return null;
    } finally {
      setUploadingProof(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMethod) {
      toast.error(t('selectPaymentMethod') || 'الرجاء اختيار طريقة الدفع');
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
      const paymentProofUrl = await uploadPaymentProof();
      if (!paymentProofUrl) {
        setSubmitting(false);
        return;
      }

      // Prepare order items
      const items = checkoutData.cartItems.map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      // Create order
      const orderData = {
        items,
        full_name: checkoutData.full_name,
        phone: checkoutData.phone,
        governorate_id: checkoutData.governorate_id,
        shipping_address: {
          address: checkoutData.address,
          city: checkoutData.city,
          governorate_id: checkoutData.governorate_id,
        },
        billing_address: {
          address: checkoutData.address,
          city: checkoutData.city,
          governorate_id: checkoutData.governorate_id,
        },
        notes: checkoutData.notes || '',
        payment_method: selectedMethod,
        payment_proof_url: paymentProofUrl,
      };

      const result = await api.createOrder(orderData);
      
      // Clear checkout data
      sessionStorage.removeItem('checkoutData');
      
      toast.success(t('orderCreatedSuccessfully') || 'تم إنشاء الطلب بنجاح');
      
      // Redirect to order confirmation or orders page
      router.push(`/profile?tab=orders`);
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.message || t('failedToCreateOrder') || 'فشل إنشاء الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(t('copiedToClipboard') || 'تم النسخ');
    setTimeout(() => setCopiedField(''), 2000);
  };

  const selectedPaymentMethod = paymentMethods.find(pm => pm.method_type === selectedMethod);

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

  return (
    <>
      <Header />
      <div className="min-h-screen py-12 bg-muted/30">
      <div className="container px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/checkout" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowRight className="h-4 w-4" />
              {t('backToCheckout') || 'العودة إلى معلومات الشحن'}
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-8">{t('paymentMethod') || 'طريقة الدفع'}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Method Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Select Payment Method */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>{t('selectPaymentMethod') || 'اختر طريقة الدفع'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="space-y-4">
                    {paymentMethods.map((method) => (
                      <motion.div
                        key={method.method_type}
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center space-x-2 space-x-reverse border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 ${
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
                </CardContent>
              </Card>

              {/* Payment Instructions */}
              {selectedPaymentMethod && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="shadow-lg border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 to-transparent">
                    <CardHeader className="bg-secondary/10 border-b border-secondary/20">
                      <CardTitle className="flex items-center gap-2 text-secondary">
                        <CheckCircle className="h-6 w-6" />
                        {t('paymentInstructions') || 'تعليمات الدفع'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertDescription className="text-base">
                          {i18n.language === 'ar' 
                            ? selectedPaymentMethod.instructions_ar
                            : selectedPaymentMethod.instructions_en}
                        </AlertDescription>
                      </Alert>

                      {selectedPaymentMethod.method_type === 'vodafone_cash' && selectedPaymentMethod.vodafone_number && (
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-5 rounded-xl border-2 border-red-200">
                          <Label className="text-sm font-bold mb-3 block text-red-700 flex items-center gap-2">
                            <Smartphone className="h-5 w-5" />
                            {t('vodafoneNumber')}
                          </Label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-white px-4 py-3 rounded-lg text-xl font-bold text-red-600 border-2 border-red-300">
                              {selectedPaymentMethod.vodafone_number}
                            </code>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-12 w-12 border-2 border-red-300 hover:bg-red-50"
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

                      {selectedPaymentMethod.method_type === 'instapay' && selectedPaymentMethod.instapay_email && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-xl border-2 border-blue-200">
                          <Label className="text-sm font-bold mb-3 block text-blue-700 flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            {t('instapayEmail')}
                          </Label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-white px-4 py-3 rounded-lg text-xl font-bold text-blue-600 border-2 border-blue-300">
                              {selectedPaymentMethod.instapay_email}
                            </code>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-12 w-12 border-2 border-blue-300 hover:bg-blue-50"
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

                      <div className="bg-gradient-to-r from-secondary/20 to-secondary/10 p-6 rounded-xl border-2 border-secondary/30">
                        <Label className="text-sm font-semibold mb-3 block text-secondary">
                          {t('amountToPay') || 'المبلغ المطلوب'}
                        </Label>
                        <div className="text-3xl font-bold text-secondary flex items-baseline gap-2">
                          {checkoutData.total.toFixed(2)} 
                          <span className="text-lg">{t('egp')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Upload Payment Proof */}
                  <Card className="shadow-lg border-2 border-primary/30 mt-6">
                    <CardHeader className="bg-primary/5 border-b border-primary/20">
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <Upload className="h-6 w-6" />
                        {t('uploadPaymentProof') || 'رفع إثبات الدفع'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <p className="text-base text-muted-foreground font-medium">
                        {t('uploadPaymentProofDescription')}
                      </p>

                      <div className="border-3 border-dashed border-primary/40 rounded-xl p-8 text-center bg-primary/5 hover:bg-primary/10 transition-colors">
                        <input
                          type="file"
                          id="payment-proof"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label htmlFor="payment-proof" className="cursor-pointer block">
                          <div className="w-20 h-20 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                            <Upload className="h-10 w-10 text-primary" />
                          </div>
                          {paymentProofFile ? (
                            <div className="space-y-2">
                              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-semibold">{i18n.language === 'ar' ? 'تم اختيار الملف' : 'File Selected'}</span>
                              </div>
                              <p className="font-medium text-foreground">{paymentProofFile.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(paymentProofFile.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="font-semibold text-lg text-primary">{t('clickToUpload') || 'اضغط لرفع الصورة'}</p>
                              <p className="text-sm text-muted-foreground">
                                {t('maxFileSize') || 'الحد الأقصى 5 ميجابايت'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {i18n.language === 'ar' ? 'PNG, JPG, JPEG' : 'PNG, JPG, JPEG'}
                              </p>
                            </div>
                          )}
                        </label>
                      </div>

                      <Alert>
                        <AlertDescription className="text-xs">
                          {t('paymentProofNote') || 'سيتم مراجعة إثبات الدفع من قبل الإدارة وسيتم تأكيد طلبك في أقرب وقت'}
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="shadow-xl border-2 border-primary/20 sticky top-20">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20">
                  <CardTitle className="text-xl">{t('orderSummary') || 'ملخص الطلب'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('subtotal')}</span>
                      <span className="font-semibold">{checkoutData.subtotal.toFixed(2)} {t('egp')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('shipping')}</span>
                      <span className="font-semibold">
                        {checkoutData.shippingCost === 0 ? (
                          <span className="text-green-600">{t('free')}</span>
                        ) : (
                          `${checkoutData.shippingCost.toFixed(2)} ${t('egp')}`
                        )}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span className="font-bold">{t('total')}</span>
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
                      onClick={handleSubmit}
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg cursor-pointer"
                      size="lg"
                      disabled={submitting || uploadingProof}
                    >
                      {submitting || uploadingProof ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin ml-2" />
                          {uploadingProof ? (t('uploading') || 'جاري الرفع...') : (t('processing') || 'جاري المعالجة...')}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 ml-2" />
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
