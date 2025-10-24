'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

interface CouponUsage {
  id: string;
  discount_amount: number;
  order_total: number;
  used_at: string;
  user_profiles: {
    full_name: string;
    email: string;
  };
}

interface CouponUsageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: any;
  usage: CouponUsage[];
  stats: any;
}

export function CouponUsageDialog({ open, onOpenChange, coupon, usage, stats }: CouponUsageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>إحصائيات الكوبون: {coupon?.code}</DialogTitle>
          <DialogDescription>عرض تفاصيل استخدام الكوبون</DialogDescription>
        </DialogHeader>
        
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  عدد الاستخدامات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.used_count}</div>
                {stats.remaining !== null && (
                  <p className="text-xs text-muted-foreground">
                    المتبقي: {stats.remaining}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  إجمالي الخصم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_discount?.toFixed(2)} جنيه</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  إجمالي الطلبات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_orders?.toFixed(2)} جنيه</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">سجل الاستخدام</h3>
          {usage.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              لم يتم استخدام هذا الكوبون بعد
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-right font-semibold">الاسم</TableHead>
                    <TableHead className="text-right font-semibold">البريد الإلكتروني</TableHead>
                    <TableHead className="text-right font-semibold">قيمة الخصم</TableHead>
                    <TableHead className="text-right font-semibold">إجمالي الطلب</TableHead>
                    <TableHead className="text-right font-semibold">التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usage.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-right">{item.user_profiles?.full_name || 'مستخدم'}</TableCell>
                      <TableCell className="text-right">{item.user_profiles?.email || 'غير متوفر'}</TableCell>
                      <TableCell className="text-green-600 font-semibold text-right">
                        {item.discount_amount.toFixed(2)} جنيه
                      </TableCell>
                      <TableCell className="text-right">{item.order_total.toFixed(2)} جنيه</TableCell>
                      <TableCell className="text-sm text-right">
                        {new Date(item.used_at).toLocaleString('ar-EG')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
