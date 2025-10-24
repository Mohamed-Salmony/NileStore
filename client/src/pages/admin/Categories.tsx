'use client';
import { motion } from 'framer-motion';
import { Plus, Search, MoreVertical, Edit, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  slug: string;
  description?: string;
  description_en?: string;
  image_url?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    description_en: '',
    image_url: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.getCategories();
      setCategories(response.categories || []);
    } catch (error) {
      toast.error('فشل في تحميل الفئات');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);
      
      // Create local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);

      // Upload file
      const response = await api.uploadFile(file, 'categories');
      console.log('Upload response:', response);
      
      // Update with actual uploaded URL
      const imageUrl = response.url || response.publicUrl;
      console.log('Image URL:', imageUrl);
      
      if (imageUrl) {
        setFormData(prev => ({ ...prev, image_url: imageUrl }));
        toast.success('تم رفع الصورة بنجاح');
      } else {
        throw new Error('No URL returned from upload');
      }
    } catch (error) {
      toast.error('فشل في رفع الصورة');
      console.error('Upload error:', error);
      // Keep the preview on error
    } finally {
      setImageUploading(false);
    }
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
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleAddCategory = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('الرجاء إدخال اسم القسم');
      return;
    }

    if (!formData.description || !formData.description_en) {
      toast.error('الرجاء إدخال الوصف بالعربي والإنجليزي');
      return;
    }

    try {
      setActionLoading(true);
      
      // Clean the image_url if it's a data URL (base64)
      const dataToSend = {
        ...formData,
        image_url: formData.image_url?.startsWith('data:') ? '' : formData.image_url
      };
      
      console.log('Creating category with data:', dataToSend);
      const response = await api.createCategory(dataToSend);
      console.log('Category created:', response);
      
      // Add the new category to the list immediately
      if (response.category) {
        setCategories(prev => [...prev, response.category]);
      }
      
      toast.success('تم إضافة القسم بنجاح');
      setShowAddDialog(false);
      resetForm();
      // Refresh to ensure sync with backend
      await fetchCategories();
    } catch (error) {
      toast.error('فشل في إضافة القسم');
      console.error('Create category error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory || !formData.name || !formData.slug) {
      toast.error('الرجاء إدخال اسم القسم');
      return;
    }

    if (!formData.description || !formData.description_en) {
      toast.error('الرجاء إدخال الوصف بالعربي والإنجليزي');
      return;
    }

    try {
      setActionLoading(true);
      
      // Clean the image_url if it's a data URL (base64)
      const dataToSend = {
        ...formData,
        image_url: formData.image_url?.startsWith('data:') ? selectedCategory.image_url : formData.image_url
      };
      
      const response = await api.updateCategory(selectedCategory.id, dataToSend);
      
      // Update the category in the list immediately
      if (response.category) {
        setCategories(prev => prev.map(cat => 
          cat.id === selectedCategory.id ? response.category : cat
        ));
      }
      
      toast.success('تم تحديث القسم بنجاح');
      setShowEditDialog(false);
      resetForm();
      // Refresh to ensure sync with backend
      await fetchCategories();
    } catch (error) {
      toast.error('فشل في تحديث القسم');
      console.error('Update category error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setActionLoading(true);
      await api.deleteCategory(categoryToDelete.id);
      
      // Remove the category from the list immediately
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
      
      toast.success('تم حذف القسم بنجاح');
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
    } catch (error) {
      toast.error('فشل في حذف القسم');
      console.error(error);
      // Refresh on error to sync with backend
      await fetchCategories();
    } finally {
      setActionLoading(false);
    }
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      description_en: category.description_en || '',
      image_url: category.image_url || '',
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      description_en: '',
      image_url: '',
    });
    setSelectedCategory(null);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">إدارة الفئات</h1>
        <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          إضافة قسم جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الفئات ({filteredCategories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن قسم..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image load error:', category.image_url);
                          console.log('Make sure Supabase Storage Bucket is PUBLIC');
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center gap-2 p-4"><svg class="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="text-xs text-muted-foreground text-center">فشل تحميل الصورة<br/>تأكد من إعدادات Storage</p></div>';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(category)}>
                            <Edit className="h-4 w-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setCategoryToDelete(category);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {category.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      تم الإنشاء: {new Date(category.created_at).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </motion.div>
              ))}
              {filteredCategories.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  لا توجد فئات
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة قسم جديد</DialogTitle>
            <DialogDescription>أضف قسم جديد للمنتجات</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">اسم القسم *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="مثال: إلكترونيات"
              />
            </div>
            <div>
              <Label htmlFor="slug">الرابط (Slug) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="electronics"
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="description">الوصف بالعربي *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف القسم بالعربي..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="description_en">الوصف بالإنجليزي *</Label>
              <Textarea
                id="description_en"
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                placeholder="Category description in English..."
                rows={3}
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="image">صورة القسم</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageUploading}
                />
                {imageUploading && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {formData.image_url && (
                <div className="mt-2">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border"
                    onError={(e) => {
                      console.error('Add dialog preview error:', formData.image_url);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
              إلغاء
            </Button>
            <Button onClick={handleAddCategory} disabled={actionLoading || imageUploading}>
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                'إضافة القسم'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل القسم</DialogTitle>
            <DialogDescription>تعديل بيانات القسم</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">اسم القسم *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="مثال: إلكترونيات"
              />
            </div>
            <div>
              <Label htmlFor="edit-slug">الرابط (Slug) *</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="electronics"
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">الوصف بالعربي *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف القسم بالعربي..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-description_en">الوصف بالإنجليزي *</Label>
              <Textarea
                id="edit-description_en"
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                placeholder="Category description in English..."
                rows={3}
                dir="ltr"
              />
            </div>
            <div>
              <Label htmlFor="edit-image">صورة القسم</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageUploading}
                />
                {imageUploading && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {formData.image_url && (
                <div className="mt-2">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border"
                    onError={(e) => {
                      console.error('Edit dialog preview error:', formData.image_url);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>
              إلغاء
            </Button>
            <Button onClick={handleEditCategory} disabled={actionLoading || imageUploading}>
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري التحديث...
                </>
              ) : (
                'حفظ التغييرات'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا القسم؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف القسم{' '}
              <span className="font-semibold">{categoryToDelete?.name}</span> بشكل نهائي.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'حذف'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Categories;
