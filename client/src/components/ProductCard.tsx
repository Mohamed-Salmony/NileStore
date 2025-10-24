'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ProductCardProps {
  product: any;
  index?: number;
  isInWishlist?: boolean;
  onWishlistChange?: () => void;
  onAddToCart?: () => void;
}

export const ProductCard = ({ product, index = 0, isInWishlist = false, onWishlistChange, onAddToCart }: ProductCardProps) => {
  const { t, i18n } = useTranslation();
  const [inWishlist, setInWishlist] = useState(isInWishlist);
  const [isUpdating, setIsUpdating] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const capitalizeFirstLetter = (text: string) => {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error(t('loginRequired') || 'Please login to add to wishlist');
      return;
    }

    setIsUpdating(true);
    try {
      if (inWishlist) {
        await api.removeFromWishlist(product.id);
        setInWishlist(false);
        toast.success(t('removedFromWishlist') || 'Removed from wishlist');
      } else {
        await api.addToWishlist(product.id);
        setInWishlist(true);
        toast.success(t('addedToWishlist') || 'Added to wishlist');
      }
      onWishlistChange?.();
    } catch (error: any) {
      console.error('Wishlist error:', error);
      toast.error(error.message || t('updateFailed'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setAddingToCart(true);
    try {
      await api.addToCart(product.id, 1);
      toast.success(t('addedToCart') || (i18n.language === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart'));
      onAddToCart?.();
    } catch (error: any) {
      console.error('Add to cart error:', error);
      toast.error(error.message || t('failedToAddToCart'));
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/product/${product.id}`} className="block">
        <Card className="overflow-hidden shadow-card hover:shadow-card-hover transition-smooth group relative">
          {/* Wishlist Button */}
          <motion.button
            onClick={handleWishlistToggle}
            disabled={isUpdating}
            className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                inWishlist 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-gray-600 hover:text-red-500'
              }`}
            />
          </motion.button>

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
              <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
                {t('save')} {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
              </Badge>
            )}
            {product.status === 'draft' && (
              <Badge className="absolute top-3 left-3 bg-yellow-500">
                {t('draft')}
              </Badge>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 line-clamp-2">
              {i18n.language === 'en' ? capitalizeFirstLetter(product.slug) : product.name}
            </h3>
            {(i18n.language === 'en' ? product.description_en : product.description) && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {i18n.language === 'en' ? product.description_en : product.description}
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
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                className="w-full" 
                onClick={handleAddToCart}
                disabled={addingToCart || product.quantity === 0}
              >
                {addingToCart ? t('adding') : t('addToCart')}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};
