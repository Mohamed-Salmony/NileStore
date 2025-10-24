'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';
import { useState } from 'react';

interface PromotionProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion: any;
  products: any[];
  availableProducts: any[];
  onAddProduct: (productId: string) => void;
  onRemoveProduct: (productId: string) => void;
}

export function PromotionProductsDialog({ 
  open, 
  onOpenChange, 
  promotion, 
  products, 
  availableProducts,
  onAddProduct,
  onRemoveProduct 
}: PromotionProductsDialogProps) {
  const [selectedProductId, setSelectedProductId] = useState('');

  const handleAddProduct = () => {
    if (selectedProductId) {
      onAddProduct(selectedProductId);
      setSelectedProductId('');
    }
  };

  const availableToAdd = availableProducts.filter(
    p => !products.some(pp => pp.product_id === p.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>منتجات العرض: {promotion?.title}</DialogTitle>
          <DialogDescription>إدارة المنتجات المرتبطة بهذا العرض</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="اختر منتج لإضافته" />
              </SelectTrigger>
              <SelectContent>
                {availableToAdd.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddProduct} disabled={!selectedProductId}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              لا توجد منتجات في هذا العرض
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الصورة</TableHead>
                  <TableHead>اسم المنتج</TableHead>
                  <TableHead>السعر الأصلي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.products.featured_image ? (
                        <img 
                          src={item.products.featured_image} 
                          alt={item.products.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-400">لا صورة</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.products.name}</TableCell>
                    <TableCell>{item.products.price} جنيه</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.products.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.products.status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onRemoveProduct(item.product_id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
