'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  couponForm: any;
  setCouponForm: (form: any) => void;
  onSubmit: () => void;
  loading: boolean;
  isEdit: boolean;
}

export function CouponDialog({ open, onOpenChange, couponForm, setCouponForm, onSubmit, loading, isEdit }: CouponDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'تعديل بيانات الكوبون' : 'إضافة كود خصم جديد'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">كود الخصم *</Label>
              <Input
                id="code"
                value={couponForm.code}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER2024"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">الحالة</Label>
              <Select value={couponForm.status} onValueChange={(value: any) => setCouponForm({ ...couponForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="expired">منتهي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={couponForm.description}
              onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
              placeholder="وصف الكوبون..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount_type">نوع الخصم *</Label>
              <Select value={couponForm.discount_type} onValueChange={(value: any) => setCouponForm({ ...couponForm, discount_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">نسبة مئوية</SelectItem>
                  <SelectItem value="fixed">قيمة ثابتة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount_value">قيمة الخصم *</Label>
              <Input
                id="discount_value"
                type="number"
                value={couponForm.discount_value}
                onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                placeholder={couponForm.discount_type === 'percentage' ? '10' : '50'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_purchase">الحد الأدنى للطلب (جنيه)</Label>
              <Input
                id="min_purchase"
                type="number"
                value={couponForm.min_purchase_amount}
                onChange={(e) => setCouponForm({ ...couponForm, min_purchase_amount: e.target.value })}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_discount">الحد الأقصى للخصم (جنيه)</Label>
              <Input
                id="max_discount"
                type="number"
                value={couponForm.max_discount_amount}
                onChange={(e) => setCouponForm({ ...couponForm, max_discount_amount: e.target.value })}
                placeholder="200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="usage_limit">عدد مرات الاستخدام (اتركه فارغاً لعدد غير محدود)</Label>
            <Input
              id="usage_limit"
              type="number"
              value={couponForm.usage_limit}
              onChange={(e) => setCouponForm({ ...couponForm, usage_limit: e.target.value })}
              placeholder="100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valid_from">تاريخ البداية</Label>
              <Input
                id="valid_from"
                type="datetime-local"
                value={couponForm.valid_from}
                onChange={(e) => setCouponForm({ ...couponForm, valid_from: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valid_until">تاريخ الانتهاء</Label>
              <Input
                id="valid_until"
                type="datetime-local"
                value={couponForm.valid_until}
                onChange={(e) => setCouponForm({ ...couponForm, valid_until: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            إلغاء
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
