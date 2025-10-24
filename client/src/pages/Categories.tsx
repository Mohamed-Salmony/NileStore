"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Package, FolderTree } from 'lucide-react';
import { api } from '@/lib/api';

const Categories = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const capitalizeFirstLetter = (text: string) => {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.getCategories();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
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
            <FolderTree className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('allCategories')}</h1>
            <p className="text-lg text-primary-foreground/90">
              {t('browseByCategory')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="container px-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : categories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <FolderTree className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">{t('noCategories')}</h3>
              <p className="text-muted-foreground">{t('categoriesComingSoon')}</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <Link href={`/categories/${category.id}`}>
                    <Card className="overflow-hidden cursor-pointer shadow-card hover:shadow-card-hover transition-smooth h-full">
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
    </div>
  );
};

export default Categories;
