"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Edit, Trash2, Save, X, Loader2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const Governorates = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [governorates, setGovernorates] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [editingGovernorate, setEditingGovernorate] = useState<any>(null);
  const [selectedGovernorates, setSelectedGovernorates] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isFreeShippingEnabled, setIsFreeShippingEnabled] = useState(false);
  const [minOrderForFreeShipping, setMinOrderForFreeShipping] = useState<number>(0);
  const [isMinOrderEnabled, setIsMinOrderEnabled] = useState(false);

  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    shipping_cost: 0,
    is_free_shipping: false,
    is_active: true,
  });

  const [bulkFormData, setBulkFormData] = useState({
    shipping_cost: 0,
    is_free_shipping: false,
  });

  useEffect(() => {
    fetchGovernorates();
  }, []);

  const fetchGovernorates = async () => {
    try {
      setLoading(true);
      const data = await api.getGovernorates();
      setGovernorates(data.governorates || []);
    } catch (error: any) {
      console.error('Error fetching governorates:', error);
      toast.error(error.message || 'Failed to load governorates');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (governorate?: any) => {
    if (governorate) {
      setEditingGovernorate(governorate);
      setFormData({
        name_ar: governorate.name_ar,
        name_en: governorate.name_en,
        shipping_cost: governorate.shipping_cost,
        is_free_shipping: governorate.is_free_shipping,
        is_active: governorate.is_active,
      });
    } else {
      setEditingGovernorate(null);
      setFormData({
        name_ar: '',
        name_en: '',
        shipping_cost: 0,
        is_free_shipping: false,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingGovernorate(null);
  };

  const handleSubmit = async () => {
    if (!formData.name_ar.trim() || !formData.name_en.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      if (editingGovernorate) {
        await api.updateGovernorate(editingGovernorate.id, formData);
        toast.success('Governorate updated successfully');
      } else {
        await api.createGovernorate(formData);
        toast.success('Governorate created successfully');
      }
      handleCloseDialog();
      fetchGovernorates();
    } catch (error: any) {
      console.error('Error saving governorate:', error);
      toast.error(error.message || 'Failed to save governorate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this governorate?')) return;

    try {
      await api.deleteGovernorate(id);
      toast.success('Governorate deleted successfully');
      fetchGovernorates();
    } catch (error: any) {
      console.error('Error deleting governorate:', error);
      toast.error(error.message || 'Failed to delete governorate');
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedGovernorates.length === 0) {
      toast.error('Please select at least one governorate');
      return;
    }

    setSubmitting(true);
    try {
      await api.bulkUpdateShippingCost({
        governorate_ids: selectedGovernorates,
        shipping_cost: bulkFormData.shipping_cost,
        is_free_shipping: bulkFormData.is_free_shipping,
      });
      toast.success(`Updated ${selectedGovernorates.length} governorates successfully`);
      setIsBulkDialogOpen(false);
      setSelectedGovernorates([]);
      fetchGovernorates();
    } catch (error: any) {
      console.error('Error bulk updating:', error);
      toast.error(error.message || 'Failed to update governorates');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelectGovernorate = (id: string) => {
    setSelectedGovernorates(prev =>
      prev.includes(id) ? prev.filter(gId => gId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedGovernorates.length === governorates.length) {
      setSelectedGovernorates([]);
    } else {
      setSelectedGovernorates(governorates.map(g => g.id));
    }
  };

  const handleToggleFreeShippingForAll = async () => {
    const newState = !isFreeShippingEnabled;
    setSubmitting(true);
    try {
      const allGovernorateIds = governorates.map(g => g.id);
      await api.bulkUpdateShippingCost({
        governorate_ids: allGovernorateIds,
        shipping_cost: 0,
        is_free_shipping: newState,
      });
      setIsFreeShippingEnabled(newState);
      toast.success(newState ? 'تم تفعيل الشحن المجاني لجميع المحافظات' : 'تم إلغاء الشحن المجاني');
      fetchGovernorates();
    } catch (error: any) {
      console.error('Error toggling free shipping:', error);
      toast.error(error.message || 'فشل تحديث الشحن المجاني');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveMinOrderSettings = () => {
    if (isMinOrderEnabled && minOrderForFreeShipping > 0) {
      localStorage.setItem('minOrderForFreeShipping', minOrderForFreeShipping.toString());
      localStorage.setItem('isMinOrderEnabled', 'true');
      toast.success(`تم تفعيل الشحن المجاني للطلبات أكثر من ${minOrderForFreeShipping} جنيه`);
    } else {
      localStorage.removeItem('minOrderForFreeShipping');
      localStorage.removeItem('isMinOrderEnabled');
      toast.success('تم إلغاء تفعيل الشحن المجاني حسب قيمة الطلب');
    }
  };

  useEffect(() => {
    const savedMinOrder = localStorage.getItem('minOrderForFreeShipping');
    const savedEnabled = localStorage.getItem('isMinOrderEnabled');
    if (savedMinOrder) setMinOrderForFreeShipping(parseFloat(savedMinOrder));
    if (savedEnabled === 'true') setIsMinOrderEnabled(true);
  }, []);

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إدارة المحافظات</h1>
            <p className="text-muted-foreground mt-1">إدارة تكاليف الشحن للمحافظات المصرية</p>
          </div>
          <div className="flex gap-2">
            {selectedGovernorates.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setIsBulkDialogOpen(true)}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                تحديث جماعي ({selectedGovernorates.length})
              </Button>
            )}
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة محافظة
            </Button>
          </div>
        </div>

        {/* Free Shipping Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">شحن مجاني لجميع المحافظات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                تفعيل الشحن المجاني لجميع المحافظات لفترة محدودة (عروض خاصة)
              </p>
              <Button 
                onClick={handleToggleFreeShippingForAll}
                disabled={submitting}
                variant={isFreeShippingEnabled ? "destructive" : "default"}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    جاري التحديث...
                  </>
                ) : isFreeShippingEnabled ? (
                  'إلغاء الشحن المجاني'
                ) : (
                  'تفعيل الشحن المجاني لجميع المحافظات'
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">شحن مجاني حسب قيمة الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>تفعيل الشحن المجاني حسب قيمة الطلب</Label>
                <Switch
                  checked={isMinOrderEnabled}
                  onCheckedChange={setIsMinOrderEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_order">الحد الأدنى لقيمة الطلب (جنيه)</Label>
                <Input
                  id="min_order"
                  type="number"
                  min="0"
                  step="0.01"
                  value={minOrderForFreeShipping}
                  onChange={(e) => setMinOrderForFreeShipping(parseFloat(e.target.value) || 0)}
                  disabled={!isMinOrderEnabled}
                  placeholder="مثال: 500"
                />
                <p className="text-xs text-muted-foreground">
                  سيحصل العملاء على شحن مجاني إذا كانت قيمة الطلب أكبر من أو تساوي هذا المبلغ
                </p>
              </div>
              <Button 
                onClick={handleSaveMinOrderSettings}
                className="w-full"
              >
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedGovernorates.length === governorates.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>الاسم بالعربية</TableHead>
                    <TableHead>الاسم بالإنجليزية</TableHead>
                    <TableHead>تكلفة الشحن</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {governorates.map((governorate) => (
                    <TableRow key={governorate.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedGovernorates.includes(governorate.id)}
                          onCheckedChange={() => toggleSelectGovernorate(governorate.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{governorate.name_ar}</TableCell>
                      <TableCell>{governorate.name_en}</TableCell>
                      <TableCell>
                        {governorate.is_free_shipping ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            شحن مجاني
                          </Badge>
                        ) : (
                          <span className="font-semibold">{governorate.shipping_cost} جنيه</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {governorate.is_active ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            نشط
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            غير نشط
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(governorate)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(governorate.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGovernorate ? 'تعديل المحافظة' : 'إضافة محافظة جديدة'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name_ar">الاسم بالعربية</Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder="القاهرة"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_en">الاسم بالإنجليزية</Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Cairo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping_cost">تكلفة الشحن (جنيه)</Label>
                <Input
                  id="shipping_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.shipping_cost}
                  onChange={(e) => setFormData({ ...formData, shipping_cost: parseFloat(e.target.value) || 0 })}
                  disabled={formData.is_free_shipping}
                />
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="is_free_shipping"
                  checked={formData.is_free_shipping}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_free_shipping: checked })}
                />
                <Label htmlFor="is_free_shipping">شحن مجاني</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">نشط</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                إلغاء
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    حفظ
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Update Dialog */}
        <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تحديث جماعي لتكلفة الشحن</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
تحديث تكلفة الشحن لـ {selectedGovernorates.length} محافظة محددة
              </p>
              <div className="space-y-2">
                <Label htmlFor="bulk_shipping_cost">تكلفة الشحن (جنيه)</Label>
                <Input
                  id="bulk_shipping_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={bulkFormData.shipping_cost}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, shipping_cost: parseFloat(e.target.value) || 0 })}
                  disabled={bulkFormData.is_free_shipping}
                />
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="bulk_is_free_shipping"
                  checked={bulkFormData.is_free_shipping}
                  onCheckedChange={(checked) => setBulkFormData({ ...bulkFormData, is_free_shipping: checked })}
                />
                <Label htmlFor="bulk_is_free_shipping">شحن مجاني</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleBulkUpdate} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    جاري التحديث...
                  </>
                ) : (
                  'تحديث المحدد'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Governorates;
