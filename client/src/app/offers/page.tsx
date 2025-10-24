'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, TrendingDown, Percent } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock data - سيتم استبداله بـ API call
const mockOffers = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 999.99,
    compare_at_price: 1199.99,
    featured_image: 'https://via.placeholder.com/300',
    discount_percentage: 17,
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24',
    price: 799.99,
    compare_at_price: 999.99,
    featured_image: 'https://via.placeholder.com/300',
    discount_percentage: 20,
  },
  {
    id: '3',
    name: 'MacBook Air M2',
    price: 1099.99,
    compare_at_price: 1299.99,
    featured_image: 'https://via.placeholder.com/300',
    discount_percentage: 15,
  },
];

export default function OffersPage() {
  const [offers, setOffers] = useState(mockOffers);
  const [loading, setLoading] = useState(false);

  // TODO: استبدل بـ API call حقيقي
  useEffect(() => {
    // const fetchOffers = async () => {
    //   setLoading(true);
    //   try {
    //     const response = await api.getProducts({ has_discount: true });
    //     setOffers(response.products);
    //   } catch (error) {
    //     console.error('Failed to fetch offers:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchOffers();
  }, []);

  return (
    <main className="container mx-auto px-4 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <Tag className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-4xl font-bold mb-4">العروض الخاصة</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          اكتشف أفضل العروض والخصومات على منتجاتنا المميزة
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">إجمالي العروض</p>
                  <p className="text-3xl font-bold text-red-700 mt-1">{offers.length}</p>
                </div>
                <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                  <Tag className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">أعلى خصم</p>
                  <p className="text-3xl font-bold text-green-700 mt-1">
                    {Math.max(...offers.map(o => o.discount_percentage))}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">متوسط الخصم</p>
                  <p className="text-3xl font-bold text-blue-700 mt-1">
                    {Math.round(offers.reduce((sum, o) => sum + o.discount_percentage, 0) / offers.length)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                  <Percent className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">جاري تحميل العروض...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">لا توجد عروض متاحة حالياً</h3>
          <p className="text-muted-foreground">تابعنا للحصول على أحدث العروض والخصومات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {offers.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative">
                  {/* Discount Badge */}
                  <Badge 
                    variant="destructive" 
                    className="absolute top-3 right-3 z-10 text-sm font-bold px-3 py-1"
                  >
                    -{product.discount_percentage}%
                  </Badge>

                  {/* Product Image */}
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={product.featured_image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-primary">
                      {product.price.toFixed(2)} ج.م
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {product.compare_at_price.toFixed(2)} ج.م
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <TrendingDown className="h-4 w-4" />
                    <span>
                      وفر {(product.compare_at_price - product.price).toFixed(2)} ج.م
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <Link href={`/product/${product.id}`} className="w-full">
                    <Button className="w-full">
                      عرض التفاصيل
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
