'use client';
import { motion } from 'framer-motion';
import { Plus, Search, MoreVertical, Edit, Trash2, Loader2, Image as ImageIcon, X, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  description_en?: string;
  specifications?: Record<string, string>;
  specifications_en?: Record<string, string>;
  price: number;
  compare_at_price?: number;
  category_id?: string;
  images: string[];
  featured_image?: string;
  video_url?: string;
  status: 'active' | 'draft' | 'archived';
  quantity: number;
  created_at: string;
  categories?: { name: string };
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    description_en: '',
    price: '',
    compare_at_price: '',
    category_id: '',
    images: [] as string[],
    featured_image: '',
    video_url: '',
    status: 'draft' as 'active' | 'draft' | 'archived',
    quantity: '0',
    specifications: {} as Record<string, string>,
    specifications_en: {} as Record<string, string>,
  });

  const [newSpec, setNewSpec] = useState({ key: '', value: '' });
  const [newSpecEn, setNewSpecEn] = useState({ key: '', value: '' });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getProducts();
      setProducts(response.products || []);
    } catch (error) {
      toast.error('فشل في تحميل المنتجات');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setImageUploading(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const response = await api.uploadFile(file, 'products');
        const imageUrl = response.url || response.publicUrl;
        if (imageUrl) {
          uploadedUrls.push(imageUrl);
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
        featured_image: prev.featured_image || uploadedUrls[0] || '',
      }));

      toast.success(`تم رفع ${uploadedUrls.length} صورة بنجاح`);
    } catch (error) {
      toast.error('فشل في رفع الصور');
      console.error(error);
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        featured_image: prev.featured_image === prev.images[index] 
          ? (newImages[0] || '') 
          : prev.featured_image,
      };
    });
  };

  const setFeaturedImage = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, featured_image: imageUrl }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const addSpecification = () => {
    if (newSpec.key && newSpec.value) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpec.key]: newSpec.value,
        },
      }));
      setNewSpec({ key: '', value: '' });
    }
  };

  const addSpecificationEn = () => {
    if (newSpecEn.key && newSpecEn.value) {
      setFormData(prev => ({
        ...prev,
        specifications_en: {
          ...prev.specifications_en,
          [newSpecEn.key]: newSpecEn.value,
        },
      }));
      setNewSpecEn({ key: '', value: '' });
    }
  };

  const removeSpecification = (key: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const removeSpecificationEn = (key: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications_en };
      delete newSpecs[key];
      return { ...prev, specifications_en: newSpecs };
    });
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.slug || !formData.price) {
      toast.error('الرجاء إدخال الاسم والسعر');
      return;
    }

    if (!formData.category_id) {
      toast.error('يجب اختيار قسم للمنتج');
      return;
    }

    if (!formData.description || !formData.description_en) {
      toast.error('الرجاء إدخال الوصف بالعربي والإنجليزي');
      return;
    }

    try {
      setActionLoading(true);

      const productData: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        description_en: formData.description_en,
        specifications: formData.specifications || {},
        specifications_en: formData.specifications_en || {},
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        category_id: formData.category_id,
        images: formData.images || [],
        featured_image: formData.featured_image || null,
        status: formData.status || 'draft',
        quantity: parseInt(formData.quantity) || 0,
        track_quantity: true,
      };

      // Add video_url if provided
      if (formData.video_url && formData.video_url.trim()) {
        productData.video_url = formData.video_url;
      }
      
      console.log('Sending product data:', productData);

      const response = await api.createProduct(productData);

      if (response.product) {
        setProducts(prev => [response.product, ...prev]);
      }

      toast.success('تم إضافة المنتج بنجاح');
      setShowAddDialog(false);
      resetForm();
      await fetchProducts();
    } catch (error: any) {
      const errorMessage = error?.message || 'فشل في إضافة المنتج';
      toast.error(errorMessage);
      console.error('Add product error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProduct = async () => {
    if (!selectedProduct || !formData.name || !formData.slug || !formData.price) {
      toast.error('الرجاء إدخال الاسم والسعر');
      return;
    }

    if (!formData.category_id) {
      toast.error('يجب اختيار قسم للمنتج');
      return;
    }

    if (!formData.description || !formData.description_en) {
      toast.error('الرجاء إدخال الوصف بالعربي والإنجليزي');
      return;
    }

    try {
      setActionLoading(true);

      const productData: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        description_en: formData.description_en,
        specifications: formData.specifications || {},
        specifications_en: formData.specifications_en || {},
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        category_id: formData.category_id,
        images: formData.images,
        featured_image: formData.featured_image,
        status: formData.status,
        quantity: parseInt(formData.quantity) || 0,
      };

      // Add video_url only if provided
      if (formData.video_url) {
        productData.video_url = formData.video_url;
      }

      const response = await api.updateProduct(selectedProduct.id, productData);

      if (response.product) {
        setProducts(prev => prev.map(p => p.id === selectedProduct.id ? response.product : p));
      }

      toast.success('تم تحديث المنتج بنجاح');
      setShowEditDialog(false);
      resetForm();
      await fetchProducts();
    } catch (error) {
      toast.error('فشل في تحديث المنتج');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setActionLoading(true);
      await api.deleteProduct(productToDelete.id);

      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));

      toast.success('تم حذف المنتج بنجاح');
      setShowDeleteDialog(false);
      setProductToDelete(null);
    } catch (error) {
      toast.error('فشل في حذف المنتج');
      console.error(error);
      await fetchProducts();
    } finally {
      setActionLoading(false);
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      description_en: product.description_en || '',
      price: product.price.toString(),
      compare_at_price: product.compare_at_price?.toString() || '',
      category_id: product.category_id || '',
      images: product.images || [],
      featured_image: product.featured_image || '',
      video_url: product.video_url || '',
      status: product.status,
      quantity: product.quantity.toString(),
      specifications: product.specifications || {},
      specifications_en: product.specifications_en || {},
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      description_en: '',
      price: '',
      compare_at_price: '',
      category_id: '',
      images: [],
      featured_image: '',
      video_url: '',
      status: 'draft',
      quantity: '0',
      specifications: {},
      specifications_en: {},
    });
    setSelectedProduct(null);
  };

  const calculateDiscount = () => {
    if (formData.price && formData.compare_at_price) {
      const price = parseFloat(formData.price);
      const comparePrice = parseFloat(formData.compare_at_price);
      if (comparePrice > price) {
        return Math.round(((comparePrice - price) / comparePrice) * 100);
      }
    }
    return 0;
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'default',
      draft: 'secondary',
      archived: 'destructive',
    };
    const labels: Record<string, string> = {
      active: 'نشط',
      draft: 'مسودة',
      archived: 'مؤرشف',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
        <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          إضافة منتج جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>المنتجات ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن منتج..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square w-full overflow-hidden bg-muted relative">
                    {product.featured_image || product.images?.[0] ? (
                      <img
                        src={product.featured_image || product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <Badge className="absolute top-2 right-2 bg-red-500">
                        -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                      </Badge>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">{product.categories?.name}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(product)}>
                            <Edit className="h-4 w-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setProductToDelete(product);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-primary">{product.price} ج.م</span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {product.compare_at_price} ج.م
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(product.status)}
                      <span className="text-xs text-muted-foreground">الكمية: {product.quantity}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  لا توجد منتجات
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة منتج جديد</DialogTitle>
            <DialogDescription>أضف منتج جديد للمتجر</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم المنتج *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="مثال: هاتف آيفون 15"
                />
              </div>
              <div>
                <Label htmlFor="slug">الرابط (Slug) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="iphone-15"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">الوصف بالعربي *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="وصف المنتج بالعربي..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="description_en">الوصف بالإنجليزي *</Label>
              <Textarea
                id="description_en"
                value={formData.description_en}
                onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                placeholder="Product description in English..."
                rows={3}
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">السعر الحالي * (ج.م)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="1000"
                />
              </div>
              <div>
                <Label htmlFor="compare_price">السعر الأصلي (ج.م)</Label>
                <Input
                  id="compare_price"
                  type="number"
                  value={formData.compare_at_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, compare_at_price: e.target.value }))}
                  placeholder="1500"
                />
                {calculateDiscount() > 0 && (
                  <p className="text-xs text-green-600 mt-1">خصم {calculateDiscount()}%</p>
                )}
              </div>
              <div>
                <Label htmlFor="quantity">الكمية المتاحة</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">القسم *</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">الحالة</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="archived">مؤرشف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>صور المنتج</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={imageUploading}
              />
              {imageUploading && <p className="text-sm text-muted-foreground mt-1">جاري رفع الصور...</p>}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt="" className="w-full h-24 object-cover rounded border" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {formData.featured_image === img && (
                        <Badge className="absolute bottom-1 left-1 text-xs">رئيسية</Badge>
                      )}
                      {formData.featured_image !== img && (
                        <button
                          onClick={() => setFeaturedImage(img)}
                          className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                        >
                          رئيسية
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="video">رابط الفيديو (اختياري)</Label>
              <Input
                id="video"
                value={formData.video_url}
                onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                placeholder="https://youtube.com/..."
              />
            </div>

            <div>
              <Label>المواصفات بالعربي</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="المفتاح (مثال: اللون)"
                    value={newSpec.key}
                    onChange={(e) => setNewSpec({ ...newSpec, key: e.target.value })}
                  />
                  <Input
                    placeholder="القيمة (مثال: أسود)"
                    value={newSpec.value}
                    onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                  />
                  <Button type="button" onClick={addSpecification} size="sm">
                    إضافة
                  </Button>
                </div>
                {Object.entries(formData.specifications).length > 0 && (
                  <div className="border rounded p-2 space-y-1">
                    {Object.entries(formData.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center text-sm">
                        <span><strong>{key}:</strong> {value}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSpecification(key)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>المواصفات بالإنجليزي</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Key (e.g., Color)"
                    value={newSpecEn.key}
                    onChange={(e) => setNewSpecEn({ ...newSpecEn, key: e.target.value })}
                    dir="ltr"
                  />
                  <Input
                    placeholder="Value (e.g., Black)"
                    value={newSpecEn.value}
                    onChange={(e) => setNewSpecEn({ ...newSpecEn, value: e.target.value })}
                    dir="ltr"
                  />
                  <Button type="button" onClick={addSpecificationEn} size="sm">
                    Add
                  </Button>
                </div>
                {Object.entries(formData.specifications_en).length > 0 && (
                  <div className="border rounded p-2 space-y-1">
                    {Object.entries(formData.specifications_en).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center text-sm" dir="ltr">
                        <span><strong>{key}:</strong> {value}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSpecificationEn(key)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
              إلغاء
            </Button>
            <Button onClick={handleAddProduct} disabled={actionLoading || imageUploading}>
              {actionLoading ? <><Loader2 className="h-4 w-4 ml-2 animate-spin" />جاري الإضافة...</> : 'إضافة المنتج'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل المنتج</DialogTitle>
            <DialogDescription>تعديل بيانات المنتج</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>اسم المنتج *</Label>
                <Input value={formData.name} onChange={(e) => handleNameChange(e.target.value)} />
              </div>
              <div>
                <Label>الرابط (Slug) *</Label>
                <Input value={formData.slug} onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} dir="ltr" />
              </div>
            </div>
            <div>
              <Label>الوصف بالعربي *</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} placeholder="وصف المنتج بالعربي..." />
            </div>
            <div>
              <Label>الوصف بالإنجليزي *</Label>
              <Textarea value={formData.description_en} onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))} rows={3} placeholder="Product description in English..." dir="ltr" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>السعر الحالي * (ج.م)</Label>
                <Input type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} />
              </div>
              <div>
                <Label>السعر الأصلي (ج.م)</Label>
                <Input type="number" value={formData.compare_at_price} onChange={(e) => setFormData(prev => ({ ...prev, compare_at_price: e.target.value }))} />
                {calculateDiscount() > 0 && <p className="text-xs text-green-600 mt-1">خصم {calculateDiscount()}%</p>}
              </div>
              <div>
                <Label>الكمية المتاحة</Label>
                <Input type="number" value={formData.quantity} onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>القسم *</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                  <SelectTrigger><SelectValue placeholder="اختر القسم" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الحالة</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="archived">مؤرشف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>صور المنتج</Label>
              <Input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={imageUploading} />
              {imageUploading && <p className="text-sm text-muted-foreground mt-1">جاري رفع الصور...</p>}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt="" className="w-full h-24 object-cover rounded border" />
                      <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                        <X className="h-3 w-3" />
                      </button>
                      {formData.featured_image === img && <Badge className="absolute bottom-1 left-1 text-xs">رئيسية</Badge>}
                      {formData.featured_image !== img && (
                        <button onClick={() => setFeaturedImage(img)} className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">رئيسية</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label>رابط الفيديو (اختياري)</Label>
              <Input value={formData.video_url} onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))} placeholder="https://youtube.com/..." />
            </div>

            <div>
              <Label>المواصفات بالعربي</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="المفتاح (مثال: اللون)"
                    value={newSpec.key}
                    onChange={(e) => setNewSpec({ ...newSpec, key: e.target.value })}
                  />
                  <Input
                    placeholder="القيمة (مثال: أسود)"
                    value={newSpec.value}
                    onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                  />
                  <Button type="button" onClick={addSpecification} size="sm">
                    إضافة
                  </Button>
                </div>
                {Object.entries(formData.specifications).length > 0 && (
                  <div className="border rounded p-2 space-y-1">
                    {Object.entries(formData.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center text-sm">
                        <span><strong>{key}:</strong> {value}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSpecification(key)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>المواصفات بالإنجليزي</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Key (e.g., Color)"
                    value={newSpecEn.key}
                    onChange={(e) => setNewSpecEn({ ...newSpecEn, key: e.target.value })}
                    dir="ltr"
                  />
                  <Input
                    placeholder="Value (e.g., Black)"
                    value={newSpecEn.value}
                    onChange={(e) => setNewSpecEn({ ...newSpecEn, value: e.target.value })}
                    dir="ltr"
                  />
                  <Button type="button" onClick={addSpecificationEn} size="sm">
                    Add
                  </Button>
                </div>
                {Object.entries(formData.specifications_en).length > 0 && (
                  <div className="border rounded p-2 space-y-1">
                    {Object.entries(formData.specifications_en).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center text-sm" dir="ltr">
                        <span><strong>{key}:</strong> {value}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSpecificationEn(key)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>إلغاء</Button>
            <Button onClick={handleEditProduct} disabled={actionLoading || imageUploading}>
              {actionLoading ? <><Loader2 className="h-4 w-4 ml-2 animate-spin" />جاري التحديث...</> : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا المنتج؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المنتج <span className="font-semibold">{productToDelete?.name}</span> بشكل نهائي.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} disabled={actionLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {actionLoading ? <><Loader2 className="h-4 w-4 ml-2 animate-spin" />جاري الحذف...</> : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;
