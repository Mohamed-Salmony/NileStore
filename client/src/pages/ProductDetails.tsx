"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Minus, Plus, Loader2, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ShareDialog } from '@/components/ShareDialog';
import { supabase } from '@/lib/supabase';

interface ProductDetailsProps {
  slug: string;
}

const ProductDetails = ({ slug }: ProductDetailsProps) => {
  const { t, i18n } = useTranslation();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const capitalizeFirstLetter = (text: string) => {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleWishlistToggle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error(t('loginRequired'));
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await api.removeFromWishlist(product.id);
        setIsInWishlist(false);
        toast.success(t('removedFromWishlist'));
      } else {
        await api.addToWishlist(product.id);
        setIsInWishlist(true);
        toast.success(t('addedToWishlist'));
      }
    } catch (error: any) {
      console.error('Wishlist error:', error);
      toast.error(error.message || t('updateFailed'));
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = () => {
    setIsShareDialogOpen(true);
  };

  const getProductUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await api.addToCart(product.id, quantity);
      toast.success(t('addedToCart') || (i18n.language === 'ar' ? 'تمت الإضافة للسلة بنجاح' : 'Added to cart successfully'));
      setQuantity(1); // Reset quantity after adding
    } catch (error: any) {
      console.error('Add to cart error:', error);
      toast.error(error.message || t('failedToAddToCart') || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // Get all products to find the one with this slug/id
      const productsRes = await api.getProducts({});
      const foundProduct = productsRes.products?.find((p: any) => 
        p.id === slug || 
        p.slug === slug ||
        p.name?.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
      );
      
      if (foundProduct) {
        setProduct(foundProduct);
        
        // Get related products from same category
        if (foundProduct.category_id) {
          const categoryProducts = productsRes.products?.filter(
            (p: any) => p.category_id === foundProduct.category_id && p.id !== foundProduct.id && p.status === 'active'
          ).slice(0, 4);
          setRelatedProducts(categoryProducts || []);
        }

        // Check if product is in wishlist
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            const wishlistRes = await api.checkWishlistStatus([foundProduct.id]);
            setIsInWishlist(wishlistRes.wishlist_product_ids?.includes(foundProduct.id) || false);
          } catch (error) {
            console.error('Error checking wishlist:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error(t('failedToLoadProduct'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-muted/30">
        <section className="py-20">
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Package className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">{t('productNotFound')}</h2>
              <p className="text-muted-foreground mb-6">{t('couldNotFindProduct')}</p>
              <Link href="/products">
                <Button>
                  <ArrowRight className="h-4 w-4 ml-2" />
                  {t('backToProducts')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  // Prepare images and video for gallery
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : product.featured_image 
    ? [product.featured_image] 
    : [];
  
  // Add video as a special item in the gallery
  const galleryItems = [...productImages];
  const hasVideo = product.video_url && product.video_url.trim() !== '';
  if (hasVideo) {
    galleryItems.push('VIDEO'); // Special marker for video
  }
  
  // Helper to get YouTube embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('watch?v=')[1]?.split('&')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtube.com/shorts/')) {
        // YouTube Shorts support
        const videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtube.com/embed/')) {
        return url;
      }
    } catch (e) {
      console.error('Error parsing YouTube URL:', e);
    }
    return null; // Return null if not a valid YouTube URL
  };

  return (
    <>
      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        productName={product?.name || ''}
        productNameEn={product?.slug ? capitalizeFirstLetter(product.slug) : ''}
        productUrl={getProductUrl()}
      />
      
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowRight className="h-4 w-4" />
            {t('backToProducts')}
          </Link>
        </div>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Card className="overflow-hidden shadow-card">
              <div className="w-full aspect-square relative bg-muted">
                {galleryItems.length > 0 ? (
                  galleryItems[selectedImage] === 'VIDEO' ? (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      {(() => {
                        const embedUrl = getYouTubeEmbedUrl(product.video_url);
                        if (embedUrl) {
                          return (
                            <iframe
                              src={embedUrl}
                              title={product.name}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              frameBorder="0"
                            />
                          );
                        } else if (product.video_url && product.video_url.trim()) {
                          return (
                            <video
                              src={product.video_url}
                              controls
                              className="w-full h-full"
                              preload="metadata"
                            >
                              متصفحك لا يدعم عرض الفيديو
                            </video>
                          );
                        } else {
                          return (
                            <div className="w-full h-full flex items-center justify-center text-white">
                              <div className="text-center">
                                <Package className="h-16 w-16 mx-auto mb-2 opacity-50" />
                                <p>رابط الفيديو غير صالح</p>
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  ) : (
                    <img
                      key={selectedImage}
                      src={galleryItems[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Package className="h-24 w-24" />
                  </div>
                )}
              </div>
            </Card>
            {galleryItems.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {galleryItems.map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedImage(index)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-smooth ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <div className="w-full aspect-square relative bg-muted flex items-center justify-center">
                      {item === 'VIDEO' ? (
                        <div className="w-full h-full bg-black/80 flex items-center justify-center">
                          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                          </svg>
                        </div>
                      ) : (
                        <img src={item} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <Badge className="mb-3 bg-red-500 text-white">
                  {t('save')} {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                </Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {i18n.language === 'en' ? capitalizeFirstLetter(product.slug) : product.name}
              </h1>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-primary">{product.price} {t('egp')}</span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="text-xl text-muted-foreground line-through">{product.compare_at_price} {t('egp')}</span>
                )}
              </div>
              {product.quantity > 0 ? (
                <Badge variant="outline" className="border-green-500 text-green-500">{t('inStock')}</Badge>
              ) : (
                <Badge variant="outline" className="border-destructive text-destructive">{t('outOfStock')}</Badge>
              )}
            </div>

            <Separator />

            {(i18n.language === 'en' ? product.description_en : product.description) && (
              <p className="text-muted-foreground leading-relaxed">
                {i18n.language === 'en' ? product.description_en : product.description}
              </p>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold">{t('quantity')}:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-6 font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                  <Button 
                    size="lg" 
                    className="w-full gap-2"
                    onClick={handleAddToCart}
                    disabled={addingToCart || product.quantity === 0}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {addingToCart ? t('adding') || 'Adding...' : t('addToCart')}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className="hover:bg-primary/10 hover:border-primary transition-colors"
                  >
                    <Heart className={`h-5 w-5 transition-colors ${
                      isInWishlist 
                        ? 'fill-red-500 text-red-500' 
                        : 'hover:text-primary'
                    }`} />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={handleShare}
                    className="hover:bg-primary/10 hover:border-primary transition-colors"
                  >
                    <Share2 className="h-5 w-5 hover:text-primary" />
                  </Button>
                </motion.div>
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <Truck className="h-6 w-6 text-secondary" />
                  <div>
                    <p className="font-semibold text-sm">{t('freeShipping')}</p>
                    <p className="text-xs text-muted-foreground">{t('ordersOver')} 500 {t('egp')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <Shield className="h-6 w-6 text-secondary" />
                  <div>
                    <p className="font-semibold text-sm">{t('yearWarranty')}</p>
                    <p className="text-xs text-muted-foreground">{t('companyWarranty')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <RotateCcw className="h-6 w-6 text-secondary" />
                  <div>
                    <p className="font-semibold text-sm">{t('freeReturn')}</p>
                    <p className="text-xs text-muted-foreground">{t('within14Days')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="shadow-card">
            <CardContent className="p-6">
              <Tabs defaultValue="description" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">{t('description')}</TabsTrigger>
                  <TabsTrigger value="features">{t('specifications')}</TabsTrigger>
                  <TabsTrigger value="reviews">{t('reviews')}</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-6">
                  <div className="prose max-w-none">
                    {(i18n.language === 'en' ? product.description_en : product.description) && (
                      <p className="text-muted-foreground leading-relaxed">
                        {i18n.language === 'en' ? product.description_en : product.description}
                      </p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="features" className="mt-6">
                  {(() => {
                    const specs = i18n.language === 'en' && product.specifications_en && Object.keys(product.specifications_en).length > 0
                      ? product.specifications_en
                      : product.specifications;
                    return specs && Object.keys(specs).length > 0 ? (
                      <ul className="space-y-3">
                        {Object.entries(specs).map(([key, value], index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                          <div>
                            <span className="font-semibold">{key}:</span> <span className="text-muted-foreground">{String(value)}</span>
                          </div>
                        </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">{t('noSpecsAvailable')}</p>
                    );
                  })()}
                </TabsContent>
                <TabsContent value="reviews" className="mt-6">
                  <div className="space-y-6">
                    {[1, 2, 3].map((review) => (
                      <div key={review} className="border-b pb-6 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                          ))}
                        </div>
                        <p className="font-semibold mb-2">عميل راضٍ</p>
                        <p className="text-muted-foreground">منتج ممتاز وجودة عالية. أنصح بالشراء بشدة!</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold mb-6">{t('relatedProducts')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/product/${item.id}`}>
                    <Card className="overflow-hidden shadow-card hover:shadow-card-hover transition-smooth group h-full">
                      <div className="aspect-square overflow-hidden relative bg-muted">
                        {item.featured_image || item.images?.[0] ? (
                          <img
                            src={item.featured_image || item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover transition-smooth group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Package className="h-16 w-16" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          {i18n.language === 'en' ? capitalizeFirstLetter(item.slug) : item.name}
                        </h3>
                        <p className="text-xl font-bold text-primary mb-3">{item.price} {t('egp')}</p>
                        <Button className="w-full" size="sm">{t('addToCart')}</Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
