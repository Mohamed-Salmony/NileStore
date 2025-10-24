"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Phone, User, Loader2, ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const Checkout = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [governorates, setGovernorates] = useState<any[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    governorate_id: '',
    address: '',
    city: '',
    notes: '',
  });

  useEffect(() => {
    // Check if user is logged in
    if (!authLoading && !user) {
      toast.error(i18n.language === 'ar' ? 'يجب تسجيل الدخول أولاً لإتمام عملية الشراء' : 'Please login first to complete your purchase');
      router.push('/login?redirect=/checkout');
      return;
    }
    
    if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cartData, governoratesData] = await Promise.all([
        api.getCart(),
        api.getGovernorates(),
      ]);
      
      setCartItems(cartData.cart || []);
      setGovernorates(governoratesData.governorates || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error(t('failedToLoadData') || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.governorate_id && governorates.length > 0) {
      const selectedGov = governorates.find(g => g.id === formData.governorate_id);
      if (selectedGov) {
        // Check if free shipping based on minimum order value
        const minOrderForFreeShipping = localStorage.getItem('minOrderForFreeShipping');
        const isMinOrderEnabled = localStorage.getItem('isMinOrderEnabled');
        
        let calculatedShippingCost = selectedGov.is_free_shipping ? 0 : selectedGov.shipping_cost;
        
        // Apply free shipping if order value meets minimum
        if (isMinOrderEnabled === 'true' && minOrderForFreeShipping) {
          const minOrder = parseFloat(minOrderForFreeShipping);
          const subtotal = cartItems.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0);
          if (subtotal >= minOrder) {
            calculatedShippingCost = 0;
          }
        }
        
        setShippingCost(calculatedShippingCost);
      }
    }
  }, [formData.governorate_id, governorates, cartItems]);

  const selectedGovernorate = governorates.find(g => g.id === formData.governorate_id);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0);
  const total = subtotal + shippingCost;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      toast.error(t('fullNameRequired') || 'Full name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error(t('phoneRequired') || 'Phone number is required');
      return false;
    }
    if (!formData.governorate_id) {
      toast.error(t('governorateRequired') || 'Governorate is required');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error(t('addressRequired') || 'Address is required');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error(t('cityRequired') || 'City is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (cartItems.length === 0) {
      toast.error(t('cartEmpty') || 'Your cart is empty');
      return;
    }

    // Get applied coupon from sessionStorage if exists
    const appliedCouponData = sessionStorage.getItem('appliedCoupon');
    const appliedCoupon = appliedCouponData ? JSON.parse(appliedCouponData) : null;
    
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discount_type === 'percentage') {
        discount = (subtotal * appliedCoupon.discount_value) / 100;
        if (appliedCoupon.max_discount && discount > appliedCoupon.max_discount) {
          discount = appliedCoupon.max_discount;
        }
      } else {
        discount = appliedCoupon.discount_value;
      }
    }

    // Store checkout data in sessionStorage and navigate to payment page
    sessionStorage.setItem('checkoutData', JSON.stringify({
      ...formData,
      cartItems,
      subtotal,
      shippingCost,
      discount,
      appliedCoupon,
      total: subtotal + shippingCost - discount,
    }));
    
    router.push('/payment');
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-muted/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowRight className="h-4 w-4" />
              {t('backToCart') || 'العودة إلى السلة'}
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-8">{t('checkout') || 'إتمام الطلب'}</h1>

          {cartItems.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">{t('cartEmpty') || 'السلة فارغة'}</h2>
              <p className="text-muted-foreground mb-6">{t('startShopping') || 'ابدأ التسوق الآن'}</p>
              <Link href="/products">
                <Button>{t('browseProducts') || 'تصفح المنتجات'}</Button>
              </Link>
            </Card>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Shipping Information */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-secondary" />
                        {t('shippingInformation') || 'معلومات الشحن'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">
                          <User className="h-4 w-4 inline ml-2" />
                          {t('fullName') || 'الاسم الكامل'}
                        </Label>
                        <Input 
                          id="full_name" 
                          placeholder={t('enterFullName') || 'أدخل الاسم الكامل'}
                          value={formData.full_name}
                          onChange={(e) => handleInputChange('full_name', e.target.value)}
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          <Phone className="h-4 w-4 inline ml-2" />
                          {t('phoneNumber') || 'رقم الهاتف'}
                        </Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          placeholder="+20 123 456 7890"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="governorate">
                          <MapPin className="h-4 w-4 inline ml-2" />
                          {t('governorate') || 'المحافظة'}
                        </Label>
                        <Select 
                          value={formData.governorate_id} 
                          onValueChange={(value) => handleInputChange('governorate_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectGovernorate') || 'اختر المحافظة'} />
                          </SelectTrigger>
                          <SelectContent>
                            {governorates.map((gov) => (
                              <SelectItem key={gov.id} value={gov.id}>
                                {i18n.language === 'en' ? gov.name_en : gov.name_ar}
                                {gov.is_free_shipping ? (
                                  <span className="text-green-600 mr-2">({t('freeShipping') || 'شحن مجاني'})</span>
                                ) : (
                                  <span className="text-muted-foreground mr-2">({gov.shipping_cost} {t('egp')})</span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">{t('city') || 'المدينة'}</Label>
                        <Input 
                          id="city" 
                          placeholder={t('enterCity') || 'أدخل المدينة'}
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">{t('fullAddress') || 'العنوان الكامل'}</Label>
                        <Textarea 
                          id="address" 
                          placeholder={t('enterFullAddress') || 'الشارع، الحي، رقم المبنى'}
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          rows={3}
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">{t('orderNotes') || 'ملاحظات الطلب'} ({t('optional') || 'اختياري'})</Label>
                        <Textarea 
                          id="notes" 
                          placeholder={t('addNotes') || 'أضف أي ملاحظات إضافية'}
                          value={formData.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Summary */}
                <div>
                  <Card className="shadow-card sticky top-20">
                    <CardHeader>
                      <CardTitle>{t('orderSummary') || 'ملخص الطلب'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Cart Items */}
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {cartItems.map((item) => {
                          const product = item.products;
                          if (!product) return null;
                          
                          return (
                            <div key={item.id} className="flex gap-3">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {product.featured_image || product.images?.[0] ? (
                                  <img
                                    src={product.featured_image || product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {i18n.language === 'en' && product.slug ? product.slug : product.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {t('quantity')}: {item.quantity}
                                </p>
                                <p className="text-sm font-semibold text-secondary">
                                  {product.price * item.quantity} {t('egp')}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <Separator />

                      {/* Pricing */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('subtotal') || 'المجموع الفرعي'}</span>
                          <span className="font-semibold">{subtotal.toFixed(2)} {t('egp')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('shipping') || 'الشحن'}</span>
                          <span className="font-semibold">
                            {shippingCost === 0 ? (
                              <span className="text-green-600">{t('free') || 'مجاني'}</span>
                            ) : (
                              `${shippingCost.toFixed(2)} ${t('egp')}`
                            )}
                          </span>
                        </div>
                        {shippingCost === 0 && selectedGovernorate && !selectedGovernorate.is_free_shipping && (() => {
                          const minOrderForFreeShipping = localStorage.getItem('minOrderForFreeShipping');
                          const isMinOrderEnabled = localStorage.getItem('isMinOrderEnabled');
                          if (isMinOrderEnabled === 'true' && minOrderForFreeShipping) {
                            const minOrder = parseFloat(minOrderForFreeShipping);
                            if (subtotal >= minOrder) {
                              return (
                                <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                                  🎉 {i18n.language === 'ar' 
                                    ? `تم تطبيق الشحن المجاني! طلبك يتجاوز ${minOrder} جنيه`
                                    : `Free shipping applied! Your order exceeds ${minOrder} EGP`}
                                </div>
                              );
                            }
                          }
                          return null;
                        })()}
                        {(() => {
                          const appliedCouponData = sessionStorage.getItem('appliedCoupon');
                          const appliedCoupon = appliedCouponData ? JSON.parse(appliedCouponData) : null;
                          if (appliedCoupon) {
                            let discount = 0;
                            if (appliedCoupon.discount_type === 'percentage') {
                              discount = (subtotal * appliedCoupon.discount_value) / 100;
                              if (appliedCoupon.max_discount && discount > appliedCoupon.max_discount) {
                                discount = appliedCoupon.max_discount;
                              }
                            } else {
                              discount = appliedCoupon.discount_value;
                            }
                            return (
                              <>
                                <div className="flex justify-between text-sm text-green-600">
                                  <span className="flex items-center gap-1">
                                    <span>{t('discount')} ({appliedCoupon.code})</span>
                                  </span>
                                  <span className="font-semibold">-{discount.toFixed(2)} {t('egp')}</span>
                                </div>
                              </>
                            );
                          }
                          return null;
                        })()}
                        <Separator />
                        <div className="flex justify-between text-lg">
                          <span className="font-bold">{t('total') || 'الإجمالي'}</span>
                          <span className="font-bold text-secondary">{(() => {
                            const appliedCouponData = sessionStorage.getItem('appliedCoupon');
                            const appliedCoupon = appliedCouponData ? JSON.parse(appliedCouponData) : null;
                            let discount = 0;
                            if (appliedCoupon) {
                              if (appliedCoupon.discount_type === 'percentage') {
                                discount = (subtotal * appliedCoupon.discount_value) / 100;
                                if (appliedCoupon.max_discount && discount > appliedCoupon.max_discount) {
                                  discount = appliedCoupon.max_discount;
                                }
                              } else {
                                discount = appliedCoupon.discount_value;
                              }
                            }
                            return (subtotal + shippingCost - discount).toFixed(2);
                          })()} {t('egp')}</span>
                        </div>
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          type="submit" 
                          className="w-full" 
                          size="lg"
                          disabled={submitting || cartItems.length === 0}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              {t('processing') || 'جاري المعالجة...'}
                            </>
                          ) : (
                            t('continueToPayment') || 'متابعة إلى الدفع'
                          )}
                        </Button>
                      </motion.div>

                      <p className="text-xs text-center text-muted-foreground">
                        {t('byClickingContinue') || 'بالمتابعة، أنت توافق على'}{' '}
                        <Link href="/terms" className="text-secondary underline">
                          {t('termsAndConditions') || 'الشروط والأحكام'}
                        </Link>
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;
