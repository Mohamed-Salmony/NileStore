'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Loader2, Package, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';

interface CategoryProductsProps {
  slug: string;
}

const CategoryProducts = ({ slug }: CategoryProductsProps) => {
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);

  const capitalizeFirstLetter = (text: string) => {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    fetchCategoryProducts();
  }, [slug]);

  const fetchCategoryProducts = async () => {
    try {
      setLoading(true);
      // Get all categories to find the one with this slug or id
      const categoriesRes = await api.getCategories();
      const foundCategory = categoriesRes.categories?.find((c: any) => 
        c.id === slug || 
        c.slug === slug || 
        c.name?.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
      );
      
      if (foundCategory) {
        setCategory(foundCategory);
        // Get products for this category
        const productsRes = await api.getProducts({ category_id: foundCategory.id });
        const activeProducts = (productsRes.products || []).filter((p: any) => p.status === 'active');

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
        setProducts(activeProducts);
      }
    } catch (error) {
      console.error('Error fetching category products:', error);
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

  if (!category) {
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
              <h2 className="text-2xl font-semibold mb-2">{t('categoryNotFound')}</h2>
              <p className="text-muted-foreground mb-6">{t('couldNotFindCategory')}</p>
              <Link href="/categories">
                <Button>
                  <ArrowRight className="h-4 w-4 ml-2" />
                  {t('backToCategories')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground py-16">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <Link href="/categories" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4">
              <ArrowRight className="h-4 w-4" />
              {t('backToCategories')}
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {i18n.language === 'en' ? capitalizeFirstLetter(category.slug) : category.name}
            </h1>
            {(i18n.language === 'en' ? category.description_en : category.description) && (
              <p className="text-lg text-primary-foreground/90">
                {i18n.language === 'en' ? category.description_en : category.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="container px-4">
          <div className="mb-6">
            <p className="text-muted-foreground">
              {t('showing')} {products.length} {products.length === 1 ? t('product') : t('products')}
            </p>
          </div>

          {products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <Package className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">{t('noProductsInCategory')}</h3>
              <p className="text-muted-foreground mb-6">{t('productsComingSoon')}</p>
              <Link href="/products">
                <Button>{t('browseAllProducts')}</Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  isInWishlist={wishlistProductIds.includes(product.id)}
                  onWishlistChange={fetchCategoryProducts}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CategoryProducts;
