'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Loader2, Package, Tag, Clock, TrendingUp, Zap, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

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

interface PromotionProduct {
  id: string;
  promotion_id: string;
  product_id: string;
  custom_price: number | null;
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price: number | null;
    featured_image: string | null;
    images: string[];
    description: string | null;
    status: string;
  };
}

const Promotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [promotionProducts, setPromotionProducts] = useState<PromotionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await api.getActivePromotions();
      const activePromotions = response.promotions || [];
      setPromotions(activePromotions);
      
      // Auto-select first promotion
      if (activePromotions.length > 0) {
        handleSelectPromotion(activePromotions[0]);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPromotion = async (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    try {
      setProductsLoading(true);
      const response = await api.getPromotionProducts(promotion.id);
      setPromotionProducts(response.products || []);
    } catch (error) {
      console.error('Error fetching promotion products:', error);
      setPromotionProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case 'featured':
        return Star;
      case 'deal':
        return Tag;
      case 'flash_sale':
        return Zap;
      default:
        return TrendingUp;
    }
  };

  const getPromotionTypeLabel = (type: string) => {
    switch (type) {
      case 'featured':
        return 'مميز';
      case 'deal':
        return 'عرض خاص';
      case 'flash_sale':
        return 'تخفيضات سريعة';
      default:
        return type;
    }
  };

  const getPromotionTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'featured':
        return 'bg-blue-500';
      case 'deal':
        return 'bg-green-500';
      case 'flash_sale':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const calculateFinalPrice = (product: PromotionProduct, promotion: Promotion) => {
    if (product.custom_price) return product.custom_price;
    if (promotion.discount_percentage) {
      return product.products.price * (1 - promotion.discount_percentage / 100);
    }
    return product.products.price;
  };

  const calculateDiscount = (product: PromotionProduct, promotion: Promotion) => {
    const finalPrice = calculateFinalPrice(product, promotion);
    const originalPrice = product.products.compare_at_price || product.products.price;
    return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground py-16">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">العروض والتخفيضات</h1>
            <p className="text-lg text-primary-foreground/90">
              اكتشف أفضل العروض والخصومات الحصرية على منتجاتنا المميزة
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container px-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : promotions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <Package className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">لا توجد عروض متاحة حالياً</h3>
              <p className="text-muted-foreground mb-6">تابعنا للحصول على أحدث العروض والخصومات</p>
              <Link href="/">
                <Button>العودة للرئيسية</Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Promotions Sidebar */}
              <div className="lg:col-span-4">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>العروض المتاحة</CardTitle>
                    <CardDescription>اختر عرض لمشاهدة المنتجات</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {promotions.map((promotion, index) => {
                      const Icon = getPromotionIcon(promotion.promotion_type);
                      const isSelected = selectedPromotion?.id === promotion.id;
                      
                      return (
                        <motion.div
                          key={promotion.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card
                            className={`cursor-pointer transition-all hover:shadow-lg ${
                              isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                            }`}
                            onClick={() => handleSelectPromotion(promotion)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${getPromotionTypeBadgeColor(promotion.promotion_type)} text-white`}>
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold mb-1 line-clamp-1">{promotion.title}</h3>
                                  {promotion.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                      {promotion.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                      {getPromotionTypeLabel(promotion.promotion_type)}
                                    </Badge>
                                    {promotion.discount_percentage && (
                                      <Badge className="bg-red-500 text-xs">
                                        خصم {promotion.discount_percentage}%
                                      </Badge>
                                    )}
                                  </div>
                                  {promotion.end_date && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        ينتهي في {new Date(promotion.end_date).toLocaleDateString('ar-EG')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Products Grid */}
              <div className="lg:col-span-8">
                {selectedPromotion && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="text-2xl font-bold mb-2">{selectedPromotion.title}</h2>
                            {selectedPromotion.description && (
                              <p className="text-primary-foreground/90 mb-3">{selectedPromotion.description}</p>
                            )}
                            <div className="flex items-center gap-2">
                              <Badge className="bg-white/20 backdrop-blur-sm">
                                {getPromotionTypeLabel(selectedPromotion.promotion_type)}
                              </Badge>
                              {selectedPromotion.discount_percentage && (
                                <Badge className="bg-red-500">
                                  خصم {selectedPromotion.discount_percentage}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {productsLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : promotionProducts.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">لا توجد منتجات في هذا العرض</h3>
                      <p className="text-muted-foreground">جاري إضافة المنتجات قريباً</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {promotionProducts.map((item, index) => {
                      const product = item.products;
                      const finalPrice = calculateFinalPrice(item, selectedPromotion!);
                      const discountPercent = calculateDiscount(item, selectedPromotion!);

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link href={`/product/${product.id}`}>
                            <Card className="overflow-hidden shadow-card hover:shadow-card-hover transition-smooth group h-full">
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
                                {discountPercent > 0 && (
                                  <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                                    وفر {discountPercent}%
                                  </Badge>
                                )}
                              </div>
                              <CardContent className="p-4">
                                <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                                {product.description && (
                                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                    {product.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mb-4">
                                  <span className="text-2xl font-bold text-red-600">
                                    {finalPrice.toFixed(2)} ج.م
                                  </span>
                                  {(product.compare_at_price || product.price !== finalPrice) && (
                                    <span className="text-sm text-muted-foreground line-through">
                                      {(product.compare_at_price || product.price).toFixed(2)} ج.م
                                    </span>
                                  )}
                                </div>
                                <Button className="w-full" size="sm">
                                  أضف للسلة
                                </Button>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Promotions;
