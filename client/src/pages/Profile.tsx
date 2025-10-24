'use client';

import { motion } from 'framer-motion';
import { User, Package, Settings, Heart, Eye, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
}

const Profile = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  
  // Settings form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchOrders();
    fetchWishlist();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        try {
          const userData = await api.getCurrentUser();
          
          // Check multiple sources for full_name and phone
          const fullName = userData.user.profile?.full_name || 
                          authUser.user_metadata?.full_name || 
                          '';
          const phone = userData.user.profile?.phone || 
                       authUser.user_metadata?.phone || 
                       '';
          
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            full_name: fullName,
            phone: phone,
          });
          setFullName(fullName);
          setPhone(phone);
        } catch (apiError) {
          // If API fails, use auth user metadata directly
          console.log('Using auth user metadata:', authUser.user_metadata);
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || '',
            phone: authUser.user_metadata?.phone || '',
          });
          setFullName(authUser.user_metadata?.full_name || '');
          setPhone(authUser.user_metadata?.phone || '');
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error(t('updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const ordersData = await api.getOrders();
      setOrders(ordersData.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const wishlistData = await api.getWishlist();
      setWishlist(wishlistData.wishlist || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await api.removeFromWishlist(productId);
      toast.success(t('removedFromWishlist'));
      fetchWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error(t('updateFailed'));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.updateProfile({
        full_name: fullName,
        phone: phone,
      });
      toast.success(t('updateSuccess'));
      await fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('updateFailed'));
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error(t('passwordsNotMatch'));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t('passwordMinLength'));
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success(t('passwordChangeSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || t('passwordChangeFailed'));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <p className="text-lg">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-8 text-center">{t('myAccount')}</h1>

          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 ml-2" />
                {t('profile')}
              </TabsTrigger>
              <TabsTrigger value="orders">
                <Package className="h-4 w-4 ml-2" />
                {t('myOrders')}
              </TabsTrigger>
              <TabsTrigger value="wishlist">
                <Heart className="h-4 w-4 ml-2" />
                {t('wishlist')}
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 ml-2" />
                {t('settings')}
              </TabsTrigger>
            </TabsList>

            {/* Personal Information - Read Only */}
            <TabsContent value="profile">
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      {t('personalInfo')}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {t('editInSettings')}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        {t('fullName')}
                      </label>
                      <div className="w-full px-4 py-3 border rounded-lg bg-muted/30">
                        {user?.full_name || '-'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        {t('email')}
                      </label>
                      <div className="w-full px-4 py-3 border rounded-lg bg-muted/30">
                        {user?.email}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        {t('phoneNumber')}
                      </label>
                      <div className="w-full px-4 py-3 border rounded-lg bg-muted/30">
                        {user?.phone || '-'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Orders */}
            <TabsContent value="orders">
              <div className="max-w-4xl mx-auto">
                {orders.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h2 className="text-xl font-semibold mb-2">{t('noOrdersYet')}</h2>
                      <p className="text-muted-foreground mb-4">{t('startShopping')}</p>
                      <Button onClick={() => window.location.href = '/products'}>
                        {t('shopNow')}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const getStatusBadge = (status: string) => {
                        const statusConfig: any = {
                          pending: { label: t('pending') || 'قيد الانتظار', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
                          confirmed: { label: t('confirmed') || 'مؤكد', className: 'bg-blue-100 text-blue-800 border-blue-300' },
                          processing: { label: t('processing') || 'قيد المعالجة', className: 'bg-purple-100 text-purple-800 border-purple-300' },
                          shipped: { label: t('shipped') || 'تم الشحن', className: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
                          delivered: { label: t('delivered') || 'تم التوصيل', className: 'bg-green-100 text-green-800 border-green-300' },
                          cancelled: { label: t('cancelled') || 'ملغي', className: 'bg-red-100 text-red-800 border-red-300' },
                        };
                        const config = statusConfig[status] || statusConfig.pending;
                        return <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}>{config.label}</span>;
                      };

                      const getPaymentStatusBadge = (status: string) => {
                        const statusConfig: any = {
                          pending: { label: t('paymentPending') || 'قيد المراجعة', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                          paid: { label: t('paid') || 'مدفوع', className: 'bg-green-50 text-green-700 border-green-200' },
                          failed: { label: t('paymentFailed') || 'فشل', className: 'bg-red-50 text-red-700 border-red-200' },
                          refunded: { label: t('refunded') || 'مسترد', className: 'bg-gray-50 text-gray-700 border-gray-200' },
                        };
                        const config = statusConfig[status] || statusConfig.pending;
                        return <span className={`px-2 py-1 rounded text-xs font-medium border ${config.className}`}>{config.label}</span>;
                      };

                      return (
                        <Card key={order.id}>
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-lg">{t('order')} #{order.order_number}</p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.created_at).toLocaleDateString('ar-EG', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {getStatusBadge(order.status)}
                                  {getPaymentStatusBadge(order.payment_status)}
                                </div>
                              </div>
                              <div className="text-left md:text-right">
                                <p className="text-sm text-muted-foreground mb-1">{t('total')}</p>
                                <p className="text-2xl font-bold text-secondary">
                                  {order.total_amount} {t('egp')}
                                </p>
                              </div>
                            </div>

                            <div className="border-t pt-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('subtotal')}:</span>
                                <span className="font-medium">{order.subtotal} {t('egp')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('shipping')}:</span>
                                <span className="font-medium">{order.shipping_cost} {t('egp')}</span>
                              </div>
                              {order.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>{t('discount')}:</span>
                                  <span className="font-medium">-{order.discount} {t('egp')}</span>
                                </div>
                              )}
                            </div>

                            {order.shipping_address && (
                              <div className="border-t mt-4 pt-4">
                                <p className="text-sm font-medium mb-2">{t('shippingAddress')}:</p>
                                <p className="text-sm text-muted-foreground">
                                  {order.shipping_address.address}, {order.shipping_address.city}
                                </p>
                                {order.phone && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {t('phone')}: {order.phone}
                                  </p>
                                )}
                              </div>
                            )}

                            {order.notes && (
                              <div className="border-t mt-4 pt-4">
                                <p className="text-sm font-medium mb-1">{t('notes')}:</p>
                                <p className="text-sm text-muted-foreground">{order.notes}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Wishlist */}
            <TabsContent value="wishlist">
              <div className="max-w-6xl mx-auto">
                {wishlist.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h2 className="text-xl font-semibold mb-2">{t('wishlistEmpty')}</h2>
                      <p className="text-muted-foreground mb-4">{t('startAddingToWishlist')}</p>
                      <Button onClick={() => window.location.href = '/products'}>
                        {t('shopNow')}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlist.map((item: any) => {
                      const product = item.products;
                      if (!product) return null;
                      
                      return (
                        <Card key={item.id} className="overflow-hidden shadow-card hover:shadow-card-hover transition-smooth group relative">
                          {/* Remove Button */}
                          <motion.button
                            onClick={() => handleRemoveFromWishlist(product.id)}
                            className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                          </motion.button>

                          <a href={`/product/${product.id}`}>
                            <div className="aspect-square overflow-hidden relative bg-muted">
                              {product.featured_image || product.images?.[0] ? (
                                <img
                                  src={product.featured_image || product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover transition-smooth group-hover:scale-110"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <Package className="h-16 w-16" />
                                </div>
                              )}
                              {product.compare_at_price && product.compare_at_price > product.price && (
                                <span className="absolute top-3 right-3 bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-semibold">
                                  {t('save')} {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                                </span>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold mb-2 line-clamp-2">
                                {product.name}
                              </h3>
                              {product.description && (
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                  {product.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mb-4">
                                <span className="text-xl font-bold text-secondary">{product.price} {t('egp')}</span>
                                {product.compare_at_price && product.compare_at_price > product.price && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    {product.compare_at_price} {t('egp')}
                                  </span>
                                )}
                              </div>
                              <Button className="w-full" onClick={(e) => {
                                e.preventDefault();
                                // Add to cart functionality here
                              }}>
                                {t('addToCart')}
                              </Button>
                            </CardContent>
                          </a>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Settings - Edit Profile and Change Password */}
            <TabsContent value="settings">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Edit Profile Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('editProfile')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {t('fullName')}
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={t('fullName')}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {t('phoneNumber')}
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+20 123 456 7890"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <Button type="submit" disabled={updating}>
                        {updating ? t('updating') : t('saveChanges')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Change Password Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('changePassword')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {t('newPassword')}
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={t('newPassword')}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {t('confirmNewPassword')}
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder={t('confirmNewPassword')}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <Button type="submit" disabled={updating}>
                        {updating ? t('updating') : t('changePassword')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
