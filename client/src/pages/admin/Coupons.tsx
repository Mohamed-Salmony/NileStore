'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Pencil, Trash2, Eye, Tag, Gift, Package } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { CouponDialog } from '@/components/admin/CouponDialog';
import { PromotionDialog } from '@/components/admin/PromotionDialog';
import { CouponUsageDialog } from '@/components/admin/CouponUsageDialog';
import { PromotionProductsDialog } from '@/components/admin/PromotionProductsDialog';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount: number | null;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
}

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  promotion_type: 'featured' | 'deal' | 'flash_sale';
  discount_percentage: number | null;
  start_date: string | null;
  end_date: string | null;
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  priority: number;
  created_at: string;
}

interface CouponUsage {
  id: string;
  discount_amount: number;
  order_total: number;
  used_at: string;
  user_profiles: {
    full_name: string;
    email: string;
  };
}

export default function CouponsPage() {
  const [activeTab, setActiveTab] = useState('coupons');
  
  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [showUsageDialog, setShowUsageDialog] = useState(false);
  const [couponUsage, setCouponUsage] = useState<CouponUsage[]>([]);
  const [couponStats, setCouponStats] = useState<any>(null);
  
  // Promotions state
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [showProductsDialog, setShowProductsDialog] = useState(false);
  const [promotionProducts, setPromotionProducts] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  
  // Form state
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_purchase_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
    status: 'active' as 'active' | 'inactive' | 'expired',
  });

  const [promotionForm, setPromotionForm] = useState({
    title: '',
    description: '',
    promotion_type: 'featured' as 'featured' | 'deal' | 'flash_sale',
    discount_percentage: '',
    start_date: '',
    end_date: '',
    status: 'active' as 'active' | 'inactive' | 'scheduled' | 'expired',
    priority: '0',
  });

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCoupons();
    fetchPromotions();
    fetchProducts();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.getAllCoupons();
      setCoupons(response.coupons || []);
    } catch (error) {
      toast.error('فشل في تحميل الكوبونات');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await api.getAllPromotions();
      setPromotions(response.promotions || []);
    } catch (error) {
      toast.error('فشل في تحميل العروض');
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.getProducts();
      setAvailableProducts(response.products || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddCoupon = async () => {
    if (!couponForm.code || !couponForm.discount_value) {
      toast.error('الرجاء إدخال الكود وقيمة الخصم');
      return;
    }

    try {
      setActionLoading(true);
      const data = {
        code: couponForm.code.toUpperCase(),
        description: couponForm.description || null,
        discount_type: couponForm.discount_type,
        discount_value: parseFloat(couponForm.discount_value),
        min_purchase_amount: couponForm.min_purchase_amount ? parseFloat(couponForm.min_purchase_amount) : null,
        max_discount_amount: couponForm.max_discount_amount ? parseFloat(couponForm.max_discount_amount) : null,
        usage_limit: couponForm.usage_limit ? parseInt(couponForm.usage_limit) : null,
        valid_from: couponForm.valid_from || null,
        valid_until: couponForm.valid_until || null,
        status: couponForm.status,
      };

      const response = await api.createCoupon(data);
      setCoupons(prev => [response.coupon, ...prev]);
      toast.success('تم إضافة الكوبون بنجاح');
      setShowCouponDialog(false);
      resetCouponForm();
    } catch (error: any) {
      toast.error(error.message || 'فشل في إضافة الكوبون');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCoupon = async () => {
    if (!selectedCoupon) return;

    try {
      setActionLoading(true);
      const data = {
        code: couponForm.code.toUpperCase(),
        description: couponForm.description || null,
        discount_type: couponForm.discount_type,
        discount_value: parseFloat(couponForm.discount_value),
        min_purchase_amount: couponForm.min_purchase_amount ? parseFloat(couponForm.min_purchase_amount) : null,
        max_discount_amount: couponForm.max_discount_amount ? parseFloat(couponForm.max_discount_amount) : null,
        usage_limit: couponForm.usage_limit ? parseInt(couponForm.usage_limit) : null,
        valid_from: couponForm.valid_from || null,
        valid_until: couponForm.valid_until || null,
        status: couponForm.status,
      };

      const response = await api.updateCoupon(selectedCoupon.id, data);
      setCoupons(prev => prev.map(c => c.id === selectedCoupon.id ? response.coupon : c));
      toast.success('تم تحديث الكوبون بنجاح');
      setShowCouponDialog(false);
      setSelectedCoupon(null);
      resetCouponForm();
    } catch (error: any) {
      toast.error(error.message || 'فشل في تحديث الكوبون');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;

    try {
      await api.deleteCoupon(couponId);
      setCoupons(prev => prev.filter(c => c.id !== couponId));
      toast.success('تم حذف الكوبون بنجاح');
    } catch (error) {
      toast.error('فشل في حذف الكوبون');
      console.error(error);
    }
  };

  const handleViewUsage = async (coupon: Coupon) => {
    try {
      setActionLoading(true);
      const [usageResponse, statsResponse] = await Promise.all([
        api.getCouponUsage(coupon.id),
        api.getCouponStats(coupon.id),
      ]);
      setCouponUsage(usageResponse.usage || []);
      setCouponStats(statsResponse.stats);
      setSelectedCoupon(coupon);
      setShowUsageDialog(true);
    } catch (error) {
      toast.error('فشل في تحميل بيانات الاستخدام');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const openEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_purchase_amount: coupon.min_purchase_amount?.toString() || '',
      max_discount_amount: coupon.max_discount_amount?.toString() || '',
      usage_limit: coupon.usage_limit?.toString() || '',
      valid_from: coupon.valid_from ? new Date(coupon.valid_from).toISOString().slice(0, 16) : '',
      valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().slice(0, 16) : '',
      status: coupon.status,
    });
    setShowCouponDialog(true);
  };

  const resetCouponForm = () => {
    setCouponForm({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_purchase_amount: '',
      max_discount_amount: '',
      usage_limit: '',
      valid_from: '',
      valid_until: '',
      status: 'active',
    });
  };

  // Promotion handlers
  const handleAddPromotion = async () => {
    if (!promotionForm.title) {
      toast.error('الرجاء إدخال عنوان العرض');
      return;
    }

    try {
      setActionLoading(true);
      const data = {
        title: promotionForm.title,
        description: promotionForm.description || null,
        promotion_type: promotionForm.promotion_type,
        discount_percentage: promotionForm.discount_percentage ? parseFloat(promotionForm.discount_percentage) : null,
        start_date: promotionForm.start_date || null,
        end_date: promotionForm.end_date || null,
        status: promotionForm.status,
        priority: parseInt(promotionForm.priority),
      };

      const response = await api.createPromotion(data);
      setPromotions(prev => [response.promotion, ...prev]);
      toast.success('تم إضافة العرض بنجاح');
      setShowPromotionDialog(false);
      resetPromotionForm();
    } catch (error: any) {
      toast.error(error.message || 'فشل في إضافة العرض');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditPromotion = async () => {
    if (!selectedPromotion) return;

    try {
      setActionLoading(true);
      const data = {
        title: promotionForm.title,
        description: promotionForm.description || null,
        promotion_type: promotionForm.promotion_type,
        discount_percentage: promotionForm.discount_percentage ? parseFloat(promotionForm.discount_percentage) : null,
        start_date: promotionForm.start_date || null,
        end_date: promotionForm.end_date || null,
        status: promotionForm.status,
        priority: parseInt(promotionForm.priority),
      };

      const response = await api.updatePromotion(selectedPromotion.id, data);
      setPromotions(prev => prev.map(p => p.id === selectedPromotion.id ? response.promotion : p));
      toast.success('تم تحديث العرض بنجاح');
      setShowPromotionDialog(false);
      setSelectedPromotion(null);
      resetPromotionForm();
    } catch (error: any) {
      toast.error(error.message || 'فشل في تحديث العرض');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;

    try {
      await api.deletePromotion(promotionId);
      setPromotions(prev => prev.filter(p => p.id !== promotionId));
      toast.success('تم حذف العرض بنجاح');
    } catch (error) {
      toast.error('فشل في حذف العرض');
      console.error(error);
    }
  };

  const handleViewProducts = async (promotion: Promotion) => {
    try {
      setActionLoading(true);
      const response = await api.getPromotionProducts(promotion.id);
      setPromotionProducts(response.products || []);
      setSelectedPromotion(promotion);
      setShowProductsDialog(true);
    } catch (error) {
      toast.error('فشل في تحميل منتجات العرض');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddProductToPromotion = async (productId: string) => {
    if (!selectedPromotion) return;

    try {
      await api.addProductToPromotion(selectedPromotion.id, productId);
      const response = await api.getPromotionProducts(selectedPromotion.id);
      setPromotionProducts(response.products || []);
      toast.success('تم إضافة المنتج للعرض');
    } catch (error: any) {
      toast.error(error.message || 'فشل في إضافة المنتج');
      console.error(error);
    }
  };

  const handleRemoveProductFromPromotion = async (productId: string) => {
    if (!selectedPromotion) return;

    try {
      await api.removeProductFromPromotion(selectedPromotion.id, productId);
      setPromotionProducts(prev => prev.filter(p => p.product_id !== productId));
      toast.success('تم إزالة المنتج من العرض');
    } catch (error) {
      toast.error('فشل في إزالة المنتج');
      console.error(error);
    }
  };

  const openEditPromotion = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setPromotionForm({
      title: promotion.title,
      description: promotion.description || '',
      promotion_type: promotion.promotion_type,
      discount_percentage: promotion.discount_percentage?.toString() || '',
      start_date: promotion.start_date ? new Date(promotion.start_date).toISOString().slice(0, 16) : '',
      end_date: promotion.end_date ? new Date(promotion.end_date).toISOString().slice(0, 16) : '',
      status: promotion.status,
      priority: promotion.priority.toString(),
    });
    setShowPromotionDialog(true);
  };

  const resetPromotionForm = () => {
    setPromotionForm({
      title: '',
      description: '',
      promotion_type: 'featured',
      discount_percentage: '',
      start_date: '',
      end_date: '',
      status: 'active',
      priority: '0',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      active: 'default',
      inactive: 'secondary',
      expired: 'destructive',
      scheduled: 'outline',
    };
    const labels: any = {
      active: 'نشط',
      inactive: 'غير نشط',
      expired: 'منتهي',
      scheduled: 'مجدول',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getPromotionTypeBadge = (type: string) => {
    const labels: any = {
      featured: 'مميز',
      deal: 'عرض',
      flash_sale: 'تخفيضات سريعة',
    };
    return <Badge variant="outline">{labels[type]}</Badge>;
  };

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">إدارة الكوبونات والعروض</h1>
        <p className="text-muted-foreground">إدارة أكواد الخصم والعروض الترويجية</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="coupons" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            الكوبونات
          </TabsTrigger>
          <TabsTrigger value="promotions" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            العروض
          </TabsTrigger>
        </TabsList>

        {/* Coupons Tab */}
        <TabsContent value="coupons" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>أكواد الخصم</CardTitle>
                  <CardDescription>إدارة أكواد الخصم والبرومو كود</CardDescription>
                </div>
                <Button onClick={() => { setSelectedCoupon(null); resetCouponForm(); setShowCouponDialog(true); }}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة كوبون
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : coupons.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  لا توجد كوبونات حالياً
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الكود</TableHead>
                        <TableHead>نوع الخصم</TableHead>
                        <TableHead>قيمة الخصم</TableHead>
                        <TableHead>الاستخدام</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الصلاحية</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coupons.map((coupon) => (
                        <TableRow key={coupon.id}>
                          <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                          <TableCell>
                            {coupon.discount_type === 'percentage' ? 'نسبة مئوية' : 'قيمة ثابتة'}
                          </TableCell>
                          <TableCell>
                            {coupon.discount_type === 'percentage' 
                              ? `${coupon.discount_value}%` 
                              : `${coupon.discount_value} جنيه`}
                          </TableCell>
                          <TableCell>
                            {coupon.used_count} / {coupon.usage_limit || '∞'}
                          </TableCell>
                          <TableCell>{getStatusBadge(coupon.status)}</TableCell>
                          <TableCell className="text-sm">
                            {coupon.valid_until 
                              ? new Date(coupon.valid_until).toLocaleDateString('ar-EG')
                              : 'غير محدد'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleViewUsage(coupon)} title="عرض الإحصائيات">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => openEditCoupon(coupon)} title="تعديل">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteCoupon(coupon.id)} title="حذف">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promotions Tab */}
        <TabsContent value="promotions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>العروض الترويجية</CardTitle>
                  <CardDescription>إدارة العروض والمنتجات المميزة</CardDescription>
                </div>
                <Button onClick={() => { setSelectedPromotion(null); resetPromotionForm(); setShowPromotionDialog(true); }}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة عرض
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : promotions.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  لا توجد عروض حالياً
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>العنوان</TableHead>
                        <TableHead>النوع</TableHead>
                        <TableHead>الخصم</TableHead>
                        <TableHead>الأولوية</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>تاريخ الانتهاء</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {promotions.map((promotion) => (
                        <TableRow key={promotion.id}>
                          <TableCell className="font-semibold">{promotion.title}</TableCell>
                          <TableCell>{getPromotionTypeBadge(promotion.promotion_type)}</TableCell>
                          <TableCell>
                            {promotion.discount_percentage ? `${promotion.discount_percentage}%` : '-'}
                          </TableCell>
                          <TableCell>{promotion.priority}</TableCell>
                          <TableCell>{getStatusBadge(promotion.status)}</TableCell>
                          <TableCell className="text-sm">
                            {promotion.end_date 
                              ? new Date(promotion.end_date).toLocaleDateString('ar-EG')
                              : 'غير محدد'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleViewProducts(promotion)} title="إدارة المنتجات">
                                <Package className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => openEditPromotion(promotion)} title="تعديل">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeletePromotion(promotion.id)} title="حذف">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CouponDialog
        open={showCouponDialog}
        onOpenChange={setShowCouponDialog}
        couponForm={couponForm}
        setCouponForm={setCouponForm}
        onSubmit={selectedCoupon ? handleEditCoupon : handleAddCoupon}
        loading={actionLoading}
        isEdit={!!selectedCoupon}
      />

      <PromotionDialog
        open={showPromotionDialog}
        onOpenChange={setShowPromotionDialog}
        promotionForm={promotionForm}
        setPromotionForm={setPromotionForm}
        onSubmit={selectedPromotion ? handleEditPromotion : handleAddPromotion}
        loading={actionLoading}
        isEdit={!!selectedPromotion}
      />

      <CouponUsageDialog
        open={showUsageDialog}
        onOpenChange={setShowUsageDialog}
        coupon={selectedCoupon}
        usage={couponUsage}
        stats={couponStats}
      />

      <PromotionProductsDialog
        open={showProductsDialog}
        onOpenChange={setShowProductsDialog}
        promotion={selectedPromotion}
        products={promotionProducts}
        availableProducts={availableProducts}
        onAddProduct={handleAddProductToPromotion}
        onRemoveProduct={handleRemoveProductFromPromotion}
      />
    </div>
  );
}
