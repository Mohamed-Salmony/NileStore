"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Eye, Loader2, Search, Filter, Download, CheckCircle, XCircle, Clock, Truck, MapPin, Phone, User, CreditCard, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const Orders = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  const [updateData, setUpdateData] = useState({
    status: '',
    payment_status: '',
  });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentStatusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const data = await api.getOrders();
      let filteredOrders = data.orders || [];
      
      // Filter by payment status
      if (paymentStatusFilter !== 'all') {
        filteredOrders = filteredOrders.filter((order: any) => order.payment_status === paymentStatusFilter);
      }
      
      setOrders(filteredOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      const data = await api.getOrder(orderId);
      setSelectedOrder(data.order);
      setUpdateData({
        status: data.order.status,
        payment_status: data.order.payment_status,
      });
      setIsDialogOpen(true);
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      await api.updateOrderStatus(selectedOrder.id, updateData);
      toast.success('Order updated successfully');
      setIsDialogOpen(false);
      fetchOrders();
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error(error.message || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800 border-blue-300' },
      processing: { label: 'Processing', className: 'bg-purple-100 text-purple-800 border-purple-300' },
      shipped: { label: 'Shipped', className: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
      delivered: { label: 'Delivered', className: 'bg-green-100 text-green-800 border-green-300' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-300' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800 border-green-300' },
      failed: { label: 'Failed', className: 'bg-red-100 text-red-800 border-red-300' },
      refunded: { label: 'Refunded', className: 'bg-gray-100 text-gray-800 border-gray-300' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.order_number?.toLowerCase().includes(query) ||
      order.full_name?.toLowerCase().includes(query) ||
      order.phone?.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const exportToExcel = () => {
    const statusMap: any = {
      pending: 'قيد الانتظار',
      confirmed: 'مؤكد',
      processing: 'قيد المعالجة',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي',
    };

    const paymentStatusMap: any = {
      pending: 'قيد المراجعة',
      paid: 'مدفوع',
      failed: 'فشل',
      refunded: 'مسترد',
    };

    const csvData = filteredOrders.map(order => ({
      'رقم الطلب': order.order_number,
      'اسم العميل': order.full_name,
      'رقم الهاتف': order.phone,
      'حالة الطلب': statusMap[order.status] || order.status,
      'حالة الدفع': paymentStatusMap[order.payment_status] || order.payment_status,
      'طريقة الدفع': order.payment_method === 'vodafone_cash' ? 'Vodafone Cash' : 'InstaPay',
      'المبلغ الإجمالي': order.total_amount,
      'المجموع الفرعي': order.subtotal,
      'تكلفة الشحن': order.shipping_cost,
      'الخصم': order.discount || 0,
      'كود الخصم': order.coupon_code || '-',
      'العنوان': order.shipping_address?.address || '',
      'المدينة': order.shipping_address?.city || '',
      'التاريخ': new Date(order.created_at).toLocaleDateString('ar-EG'),
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      '\uFEFF' + headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم تصدير الطلبات بنجاح');
  };

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
            <p className="text-muted-foreground mt-1">إدارة ومتابعة جميع طلبات العملاء</p>
          </div>
          <Button onClick={exportToExcel} variant="outline" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            تصدير إلى Excel
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">قيد الانتظار</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">مؤكد</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">تم الشحن</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.shipped}</p>
                </div>
                <Truck className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">تم التوصيل</p>
                  <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث برقم الطلب، الاسم، أو رقم الهاتف..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="حالة الطلب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="processing">قيد المعالجة</SelectItem>
                  <SelectItem value="shipped">تم الشحن</SelectItem>
                  <SelectItem value="delivered">تم التوصيل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="حالة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع حالات الدفع</SelectItem>
                  <SelectItem value="pending">قيد المراجعة</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                  <SelectItem value="failed">فشل</SelectItem>
                  <SelectItem value="refunded">مسترد</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد طلبات</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>طريقة الدفع</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>الخصم</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الدفع</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.full_name}</p>
                          <p className="text-sm text-muted-foreground">{order.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.payment_method === 'vodafone_cash' ? (
                          <Badge variant="outline" className="gap-1">
                            <Phone className="h-3 w-3" />
                            Vodafone Cash
                          </Badge>
                        ) : order.payment_method === 'instapay' ? (
                          <Badge variant="outline" className="gap-1">
                            <CreditCard className="h-3 w-3" />
                            InstaPay
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">{order.total_amount} جنيه</TableCell>
                      <TableCell>
                        {order.discount > 0 ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-green-600 font-medium">-{order.discount} جنيه</span>
                            {order.coupon_code && (
                              <Badge variant="secondary" className="text-xs font-mono w-fit">
                                {order.coupon_code}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          عرض
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تفاصيل الطلب - {selectedOrder?.order_number}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">معلومات الطلب</TabsTrigger>
                  <TabsTrigger value="items">المنتجات</TabsTrigger>
                  <TabsTrigger value="payment">إثبات الدفع</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  {/* Customer Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        معلومات العميل
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الاسم:</span>
                        <span className="font-medium">{selectedOrder.full_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الهاتف:</span>
                        <span className="font-medium">{selectedOrder.phone}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Shipping Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        معلومات الشحن
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">العنوان:</span>
                        <span className="font-medium text-right">{selectedOrder.shipping_address?.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">المدينة:</span>
                        <span className="font-medium">{selectedOrder.shipping_address?.city}</span>
                      </div>
                      {selectedOrder.notes && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ملاحظات:</span>
                          <span className="font-medium text-right">{selectedOrder.notes}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Order Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">ملخص الطلب</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">المجموع الفرعي:</span>
                        <span className="font-medium">{selectedOrder.subtotal} جنيه</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الشحن:</span>
                        <span className="font-medium">{selectedOrder.shipping_cost} جنيه</span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200 space-y-2">
                          <div className="flex justify-between text-green-700">
                            <span className="font-medium">الخصم:</span>
                            <span className="font-bold">-{selectedOrder.discount} جنيه</span>
                          </div>
                          {selectedOrder.coupon_code && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-green-600">تم استخدام كوبون:</span>
                              <Badge variant="default" className="font-mono bg-green-600 hover:bg-green-700">
                                {selectedOrder.coupon_code}
                              </Badge>
                            </div>
                          )}
                          {!selectedOrder.coupon_code && (
                            <div className="text-xs text-green-600">
                              💰 خصم تلقائي من العروض
                            </div>
                          )}
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg">
                        <span className="font-bold">الإجمالي:</span>
                        <span className="font-bold text-secondary">{selectedOrder.total_amount} جنيه</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Update Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">تحديث حالة الطلب</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>حالة الطلب</Label>
                        <Select value={updateData.status} onValueChange={(value) => setUpdateData({ ...updateData, status: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">قيد الانتظار</SelectItem>
                            <SelectItem value="confirmed">مؤكد</SelectItem>
                            <SelectItem value="processing">قيد المعالجة</SelectItem>
                            <SelectItem value="shipped">تم الشحن</SelectItem>
                            <SelectItem value="delivered">تم التوصيل</SelectItem>
                            <SelectItem value="cancelled">ملغي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>حالة الدفع</Label>
                        <Select value={updateData.payment_status} onValueChange={(value) => setUpdateData({ ...updateData, payment_status: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">قيد المراجعة</SelectItem>
                            <SelectItem value="paid">مدفوع</SelectItem>
                            <SelectItem value="failed">فشل</SelectItem>
                            <SelectItem value="refunded">مسترد</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="items" className="space-y-4">
                  {selectedOrder.order_items?.map((item: any) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {item.product_image ? (
                              <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.product_name}</h4>
                            <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
                            <p className="text-sm text-muted-foreground">السعر: {item.price} جنيه</p>
                            <p className="text-lg font-bold text-secondary mt-2">{item.total} جنيه</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="payment" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        إثبات الدفع
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedOrder.payment_proof_url ? (
                        <div className="space-y-4">
                          <div className="border rounded-lg overflow-hidden">
                            <img 
                              src={selectedOrder.payment_proof_url} 
                              alt="Payment Proof" 
                              className="w-full h-auto"
                            />
                          </div>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => window.open(selectedOrder.payment_proof_url, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            تحميل الصورة
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">لم يتم رفع إثبات الدفع</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                إغلاق
              </Button>
              <Button onClick={handleUpdateOrder} disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    جاري التحديث...
                  </>
                ) : (
                  'تحديث الطلب'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Orders;
