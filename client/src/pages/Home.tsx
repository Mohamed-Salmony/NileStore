'use client';

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Truck, Shield, CreditCard, Loader2, Package, RefreshCcw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const Home = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Helper function to capitalize first letter of each word
  const capitalizeFirstLetter = (text: string) => {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, productsRes] = await Promise.all([
        api.getCategories(),
        api.getProducts({ limit: 8 })
      ]);
      
      setCategories(categoriesRes.categories || []);
      // Filter only active products
      const activeProducts = (productsRes.products || []).filter((p: any) => p.status === 'active');
      setProducts(activeProducts);

      // Fetch wishlist status if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user && activeProducts.length > 0) {
        try {
          const productIds = activeProducts.map((p: any) => p.id);
          const wishlistRes = await api.checkWishlistStatus(productIds);
          setWishlistProductIds(wishlistRes.wishlist_product_ids || []);
        } catch (error) {
          console.error('Error fetching wishlist:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Truck,
      titleKey: 'fastShipping',
      descKey: 'fastShippingDesc',
    },
    {
      icon: Shield,
      titleKey: 'qualityGuarantee',
      descKey: 'qualityGuaranteeDesc',
    },
    {
      icon: CreditCard,
      titleKey: 'securePayment',
      descKey: 'securePaymentDesc',
    },
    {
      icon: RefreshCcw,
      titleKey: 'returnGuarantee',
      descKey: 'returnGuaranteeDesc',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground py-20 md:py-32 overflow-hidden">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.8,
                ease: "easeOut"
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6,
                  delay: 0.2,
                  ease: "easeOut"
                }}
              >
                <Badge className="mb-4 bg-secondary text-secondary-foreground">
                  {t('exclusiveOffers')}
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.7,
                  delay: 0.4,
                  ease: "easeOut"
                }}
              >
                {t('heroTitle')}
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl mb-8 text-primary-foreground/90"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6,
                  delay: 0.6,
                  ease: "easeOut"
                }}
              >
                {t('heroSubtitle')}
              </motion.p>
              
              <motion.div 
                className="flex gap-4 justify-center flex-wrap"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6,
                  delay: 0.8,
                  ease: "easeOut"
                }}
              >
                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }} 
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button size="lg" variant="secondary" className="gap-2 shadow-lg">
                    {t('shopNow')}
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </Button>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }} 
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button size="lg" className="bg-blue-900 hover:bg-blue-700 text-white shadow-lg border-2 border-blue-800">
                    {t('exploreMore')}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('shopByCategory')}</h2>
            <p className="text-muted-foreground">{t('discoverOurProducts')}</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('noCategories')}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <Link href={`/categories/${category.id}`} className="block">
                    <Card className="overflow-hidden cursor-pointer shadow-card hover:shadow-card-hover transition-smooth">
                      <div className="aspect-square overflow-hidden bg-muted">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="w-full h-full object-cover transition-smooth hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Package className="h-16 w-16" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 text-center">
                        <h3 className="font-semibold mb-1">
                          {i18n.language === 'en' ? capitalizeFirstLetter(category.slug) : category.name}
                        </h3>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('featuredProducts')}</h2>
            <p className="text-muted-foreground">{t('bestDeals')}</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('noProducts')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  isInWishlist={wishlistProductIds.includes(product.id)}
                  onWishlistChange={fetchData}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features (moved below, just before CTA) */}
      <section className="py-12 border-b">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-none shadow-card hover:shadow-card-hover transition-smooth">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="bg-secondary/10 p-3 rounded-full">
                      <feature.icon className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{t(feature.titleKey)}</h3>
                      <p className="text-sm text-muted-foreground">{t(feature.descKey)}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-gradient text-primary-foreground">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('getExclusiveOffers')}
            </h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              {t('newsletterDesc')}
            </p>
            <form className="flex gap-4 max-w-md mx-auto" onSubmit={async (e) => {
              e.preventDefault();
              if (!newsletterEmail) {
                toast.error(i18n.language === 'ar' ? 'يرجى إدخال بريدك الإلكتروني' : 'Please enter your email');
                return;
              }
              setIsSubscribing(true);
              try {
                await api.subscribeToNewsletter(newsletterEmail);
                toast.success(i18n.language === 'ar' ? 'تم الاشتراك بنجاح! شكراً لانضمامك' : 'Successfully subscribed! Thank you for joining');
                setNewsletterEmail('');
              } catch (error: any) {
                console.error('Newsletter subscription error:', error);
                toast.error(error.message || (i18n.language === 'ar' ? 'فشل الاشتراك' : 'Failed to subscribe'));
              } finally {
                setIsSubscribing(false);
              }
            }}>
              <input
                type="email"
                placeholder={t('enterEmail')}
                className="flex-1 px-4 py-3 rounded-lg text-foreground"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={isSubscribing}
                required
              />
              <Button variant="secondary" size="lg" type="submit" disabled={isSubscribing}>
                {isSubscribing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Mail className="h-5 w-5 mr-2" />
                    {t('subscribeNow')}
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
