'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Loader2, Package, Search, Filter, Grid3x3, List } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';

const Products = () => {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);

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
      const [productsRes, categoriesRes] = await Promise.all([
        api.getProducts({}),
        api.getCategories()
      ]);
      
      const activeProducts = (productsRes.products || []).filter((p: any) => p.status === 'active');
      setProducts(activeProducts);
      setCategories(categoriesRes.categories || []);

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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('allProducts')}</h1>
            <p className="text-lg text-primary-foreground/90">
              {t('browseAllProducts')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 border-b bg-background">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('searchProducts')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            <div className="flex gap-4 items-center w-full md:w-auto">
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder={t('allCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allCategories')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {i18n.language === 'en' ? capitalizeFirstLetter(category.slug) : category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-muted-foreground">
            {t('showing')} {filteredProducts.length} {t('of')} {products.length} {t('products')}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="container px-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <Package className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">{t('noProducts')}</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedCategory !== 'all' 
                  ? t('tryChangingFilters')
                  : t('noProductsAvailable')}
              </p>
              {(searchQuery || selectedCategory !== 'all') && (
                <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                  {t('resetFilters')}
                </Button>
              )}
            </motion.div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  isInWishlist={wishlistProductIds.includes(product.id)}
                  onWishlistChange={fetchData}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/product/${product.id}`}>
                    <Card className="overflow-hidden shadow-card hover:shadow-card-hover transition-smooth group">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-48 h-48 overflow-hidden relative bg-muted flex-shrink-0">
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
                            <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                              {t('save')} {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-6 flex-1">
                          <h3 className="text-xl font-semibold mb-2">
                            {i18n.language === 'en' ? capitalizeFirstLetter(product.slug) : product.name}
                          </h3>
                          {(i18n.language === 'en' ? product.description_en : product.description) && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                              {i18n.language === 'en' ? product.description_en : product.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-primary">{product.price} {t('egp')}</span>
                              {product.compare_at_price && product.compare_at_price > product.price && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {product.compare_at_price} {t('egp')}
                                </span>
                              )}
                            </div>
                            <Button size="sm">
                              {t('addToCart')}
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;
