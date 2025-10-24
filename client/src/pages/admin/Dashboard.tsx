import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Package, DollarSign, ShoppingCart, AlertCircle, CheckCircle, Clock, Loader2, XCircle, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'قيد الانتظار',
      'confirmed': 'مؤكد',
      'processing': 'قيد التجهيز',
      'shipped': 'تم الشحن',
      'delivered': 'تم التوصيل',
      'cancelled': 'ملغي'
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock className="h-3 w-3 text-yellow-600" />;
      case 'confirmed': return <CheckCircle className="h-3 w-3 text-blue-600" />;
      case 'processing': return <Package className="h-3 w-3 text-purple-600" />;
      case 'shipped': return <Truck className="h-3 w-3 text-indigo-600" />;
      case 'delivered': return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'cancelled': return <XCircle className="h-3 w-3 text-red-600" />;
      default: return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch analytics stats
      const analyticsData = await api.getAnalytics();
      setStats(analyticsData);

      // Fetch recent orders
      const ordersData = await api.getOrders({ page: 1, limit: 5 });
      setRecentOrders(ordersData.orders || []);

      // Fetch categories to calculate top selling
      const categoriesData = await api.getCategories();
      const productsData = await api.getProducts({ limit: 100 });
      
      // Calculate top categories by product count
      const categoryStats = categoriesData.categories.map((cat: any) => {
        const categoryProducts = productsData.products.filter((p: any) => p.category_id === cat.id);
        return {
          ...cat,
          productCount: categoryProducts.length
        };
      }).sort((a: any, b: any) => b.productCount - a.productCount).slice(0, 5);
      
      setTopCategories(categoryStats);

      // Get top products (featured or random)
      const topProds = productsData.products
        .sort((a: any, b: any) => (b.quantity || 0) - (a.quantity || 0))
        .slice(0, 5);
      setTopProducts(topProds);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('فشل تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
                <DollarSign className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalRevenue?.toLocaleString('ar-EG') || '0'} ج.م</div>
                <p className="text-xs opacity-80 mt-1">من الطلبات المؤكدة</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">الطلبات</CardTitle>
                <Package className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalOrders || 0}</div>
                <p className="text-xs opacity-80 mt-1">إجمالي الطلبات</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">العملاء</CardTitle>
                <Users className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalCustomers || 0}</div>
                <p className="text-xs opacity-80 mt-1">إجمالي العملاء</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">المنتجات</CardTitle>
                <ShoppingCart className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalProducts || 0}</div>
                <p className="text-xs opacity-80 mt-1">إجمالي المنتجات</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sales Chart */}
        {stats?.chartData && stats.chartData.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                المبيعات خلال آخر 7 أيام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {stats.chartData.map((day: any, index: number) => {
                  const maxAmount = Math.max(...stats.chartData.map((d: any) => d.amount));
                  const height = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all hover:opacity-80 relative group" 
                           style={{ height: `${height}%`, minHeight: day.amount > 0 ? '20px' : '0' }}>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {day.amount.toLocaleString('ar-EG')} ج.م
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground text-center">{day.date}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                الطلبات الأخيرة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد طلبات حالياً
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order: any) => (
                    <div key={order.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                      <div className="flex-1">
                        <p className="font-semibold">طلب #{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">{order.full_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(order.status)}
                          <span className="text-xs font-medium">{getStatusLabel(order.status)}</span>
                        </div>
                      </div>
                      <span className="font-bold text-lg">{order.total_amount?.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                الأقسام الأكثر مبيعاً
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد أقسام
                </div>
              ) : (
                <div className="space-y-4">
                  {topCategories.map((category: any, index: number) => (
                    <div key={category.id} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{category.name_ar || category.name}</p>
                        <div className="w-full bg-muted rounded-full h-2 mt-1">
                          <div 
                            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((category.productCount / topCategories[0].productCount) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {category.productCount} منتج
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              المنتجات الأكثر مبيعاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد منتجات
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {topProducts.map((product: any) => (
                  <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    {product.featured_image && (
                      <img 
                        src={product.featured_image} 
                        alt={product.name_ar || product.name}
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                      {product.name_ar || product.name}
                    </h3>
                    <p className="text-lg font-bold text-primary">
                      {product.price?.toLocaleString('ar-EG')} ج.م
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      المخزون: {product.quantity || 0}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
