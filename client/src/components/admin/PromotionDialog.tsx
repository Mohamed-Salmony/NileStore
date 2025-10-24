'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface PromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotionForm: any;
  setPromotionForm: (form: any) => void;
  onSubmit: () => void;
  loading: boolean;
  isEdit: boolean;
}

export function PromotionDialog({ open, onOpenChange, promotionForm, setPromotionForm, onSubmit, loading, isEdit }: PromotionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل العرض' : 'إضافة عرض جديد'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'تعديل بيانات العرض الترويجي' : 'إضافة عرض ترويجي جديد'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان العرض *</Label>
            <Input
              id="title"
              value={promotionForm.title}
              onChange={(e) => setPromotionForm({ ...promotionForm, title: e.target.value })}
              placeholder="عرض الصيف الكبير"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={promotionForm.description}
              onChange={(e) => setPromotionForm({ ...promotionForm, description: e.target.value })}
              placeholder="وصف العرض..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promotion_type">نوع العرض</Label>
              <Select value={promotionForm.promotion_type} onValueChange={(value: any) => setPromotionForm({ ...promotionForm, promotion_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">مميز</SelectItem>
                  <SelectItem value="deal">عرض</SelectItem>
                  <SelectItem value="flash_sale">تخفيضات سريعة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">الحالة</Label>
              <Select value={promotionForm.status} onValueChange={(value: any) => setPromotionForm({ ...promotionForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="scheduled">مجدول</SelectItem>
                  <SelectItem value="expired">منتهي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount_percentage">نسبة الخصم (%)</Label>
              <Input
                id="discount_percentage"
                type="number"
                min="0"
                max="100"
                value={promotionForm.discount_percentage}
                onChange={(e) => setPromotionForm({ ...promotionForm, discount_percentage: e.target.value })}
                placeholder="20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">الأولوية (رقم أعلى = أولوية أعلى)</Label>
              <Input
                id="priority"
                type="number"
                value={promotionForm.priority}
                onChange={(e) => setPromotionForm({ ...promotionForm, priority: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">تاريخ البداية</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={promotionForm.start_date}
                onChange={(e) => setPromotionForm({ ...promotionForm, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">تاريخ الانتهاء</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={promotionForm.end_date}
                onChange={(e) => setPromotionForm({ ...promotionForm, end_date: e.target.value })}
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
