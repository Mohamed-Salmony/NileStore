"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, Plus, Minus, Tag, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { cartEvents } from '@/lib/cartEvents';
import { toast } from 'sonner';
import Link from 'next/link';

const Cart = () => {
  const { t, i18n } = useTranslation();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    fetchCart();
    
    // Listen to cart events for real-time updates
    const unsubscribe = cartEvents.subscribe(() => {
      fetchCart();
    });
    
    return () => {
      unsubscribe();
    };
    // Don't auto-load coupon - user must apply it each time
    // This prevents reusing the same coupon multiple times
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await api.getCart();
      setCartItems(data.cart || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdating(true);
    try {
      await api.updateCartItem(itemId, newQuantity);
      await fetchCart();
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast.error(error.message || t('updateFailed'));
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdating(true);
    try {
      await api.removeFromCart(itemId);
      toast.success(t('removedFromCart') || 'Item removed from cart');
      await fetchCart();
    } catch (error: any) {
      console.error('Error removing item:', error);
      toast.error(error.message || t('updateFailed'));
    } finally {
      setUpdating(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error(t('enterCouponCode') || 'Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    try {
      const currentSubtotal = cartItems.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0);
      const result = await api.validateCoupon(couponCode, currentSubtotal);
      setAppliedCoupon(result.coupon);
      // Store coupon in sessionStorage for checkout page (will be cleared after order)
      sessionStorage.setItem('appliedCoupon', JSON.stringify(result.coupon));
      toast.success(t('couponApplied') || 'تم تطبيق كود الخصم بنجاح');
    } catch (error: any) {
      console.error('Error applying coupon:', error);
      toast.error(error.message || t('invalidCoupon') || 'كود خصم غير صحيح');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    sessionStorage.removeItem('appliedCoupon');
    toast.success(t('couponRemoved') || 'Coupon removed');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0);
  
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
  
  const total = subtotal - discount;

  if (loading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-8">{t('cart')}</h1>

          {cartItems.length === 0 ? (
            <Card className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">{t('cartEmpty') || 'Your cart is empty'}</h2>
              <p className="text-muted-foreground mb-6">{t('startShopping')}</p>
              <Link href="/products">
                <Button>{t('browseProducts') || 'Browse Products'}</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  const product = item.products;
                  if (!product) return null;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <Link href={`/product/${product.id}`}>
                              <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {product.featured_image || product.images?.[0] ? (
                                  <img
                                    src={product.featured_image || product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover hover:scale-110 transition-transform"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </Link>
                            <div className="flex-1">
                              <Link href={`/product/${product.id}`}>
                                <h3 className="font-semibold mb-2 hover:text-primary transition-colors">
                                  {i18n.language === 'en' && product.slug ? product.slug : product.name}
                                </h3>
                              </Link>
                              <p className="text-lg font-bold text-secondary mb-3">
                                {product.price} {t('egp')}
                              </p>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center border rounded-lg">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                    disabled={updating || item.quantity <= 1}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="px-3 font-semibold">{item.quantity}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                    disabled={updating}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-destructive hover:bg-destructive/10 transition-colors"
                                  onClick={() => handleRemoveItem(item.id)}
                                  disabled={updating}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-20">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">{t('orderSummary') || 'Order Summary'}</h2>
                    
                    {/* Coupon Section */}
                    <div className="mb-6">
                      <label className="text-sm font-medium mb-2 block">
                        <Tag className="h-4 w-4 inline ml-1" />
                        {t('couponCode') || 'Coupon Code'}
                      </label>
                      {appliedCoupon ? (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <Tag className="h-4 w-4 text-green-600" />
                          <span className="flex-1 text-sm font-medium text-green-700">
                            {appliedCoupon.code}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveCoupon}
                            className="h-6 px-2 text-xs hover:bg-green-100"
                          >
                            {t('remove') || 'Remove'}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder={t('enterCouponCode') || 'Enter code'}
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            onClick={handleApplyCoupon}
                            disabled={applyingCoupon || !couponCode.trim()}
                            className="hover:bg-primary/10 hover:border-primary hover:text-primary"
                          >
                            {applyingCoupon ? t('applying') || 'Applying...' : t('apply') || 'Apply'}
                          </Button>
                        </div>
                      )}
                    </div>

                    <Separator className="mb-4" />

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('subtotal') || 'Subtotal'}</span>
                        <span className="font-semibold">{subtotal.toFixed(2)} {t('egp')}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>{t('discount') || 'Discount'}</span>
                          <span className="font-semibold">-{discount.toFixed(2)} {t('egp')}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg">
                        <span className="font-bold">{t('total') || 'Total'}</span>
                        <span className="font-bold text-secondary">{total.toFixed(2)} {t('egp')}</span>
                      </div>
                    </div>
                    <Link href="/checkout" className="block">
                      <Button className="w-full" size="lg">
                        {t('checkout') || 'Proceed to Checkout'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;
