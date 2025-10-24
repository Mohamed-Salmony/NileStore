'use client';
import { motion } from 'framer-motion';
import { Search, MoreVertical, Eye, Shield, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  app_metadata?: {
    role?: string;
  };
  user_metadata?: {
    full_name?: string;
  };
  orders_count?: number;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getAllUsers();
      setUsers(response.users || []);
    } catch (error) {
      toast.error('فشل في تحميل المستخدمين');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowDetailsDialog(true);
  };

  const handleToggleRole = async (user: User) => {
    const currentRole = user.app_metadata?.role || 'user';
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    try {
      setActionLoading(true);
      await api.updateUserRole(user.id, newRole);
      toast.success(`تم تغيير الدور إلى ${newRole === 'admin' ? 'أدمن' : 'مستخدم'}`);
      await fetchUsers();
    } catch (error) {
      toast.error('فشل في تغيير الدور');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setActionLoading(true);
      await api.deleteUser(userToDelete.id);
      toast.success('تم حذف المستخدم بنجاح');
      setShowDeleteDialog(false);
      setUserToDelete(null);
      await fetchUsers();
    } catch (error) {
      toast.error('فشل في حذف المستخدم');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.user_metadata?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>المستخدمين ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="البحث عن مستخدم..." 
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
            <div className="space-y-4">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold">
                      {user.user_metadata?.full_name || 'لا يوجد اسم'}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>📦 {user.orders_count || 0} طلب</span>
                      {user.last_sign_in_at && (
                        <>
                          <span>•</span>
                          <span>🕐 آخر دخول: {new Date(user.last_sign_in_at).toLocaleDateString('ar-EG')}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          user.last_sign_in_at && 
                          (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) < 5 * 60 * 1000
                            ? 'bg-green-500'
                            : 'bg-gray-400'
                        }`} />
                        {user.last_sign_in_at && 
                        (new Date().getTime() - new Date(user.last_sign_in_at).getTime()) < 5 * 60 * 1000
                          ? 'متصل الآن'
                          : 'غير متصل'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={user.app_metadata?.role === 'admin' ? 'default' : 'secondary'}>
                      {user.app_metadata?.role === 'admin' ? 'أدمن' : 'مستخدم'}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={actionLoading}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                          <Eye className="h-4 w-4 ml-2" />
                          عرض التفاصيل
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleRole(user)}>
                          <Shield className="h-4 w-4 ml-2" />
                          {user.app_metadata?.role === 'admin' ? 'تحويل لمستخدم' : 'تحويل لأدمن'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف الحساب
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  لا توجد نتائج للبحث
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تفاصيل المستخدم</DialogTitle>
            <DialogDescription>معلومات تفصيلية عن المستخدم</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الاسم</p>
                <p className="text-base">{selectedUser.user_metadata?.full_name || 'غير محدد'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</p>
                <p className="text-base">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">الدور</p>
                <Badge variant={selectedUser.app_metadata?.role === 'admin' ? 'default' : 'secondary'}>
                  {selectedUser.app_metadata?.role === 'admin' ? 'أدمن' : 'مستخدم'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">تاريخ التسجيل</p>
                <p className="text-base">{new Date(selectedUser.created_at).toLocaleString('ar-EG')}</p>
              </div>
              {selectedUser.last_sign_in_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">آخر تسجيل دخول</p>
                  <p className="text-base">{new Date(selectedUser.last_sign_in_at).toLocaleString('ar-EG')}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">حالة الاتصال</p>
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    selectedUser.last_sign_in_at && 
                    (new Date().getTime() - new Date(selectedUser.last_sign_in_at).getTime()) < 5 * 60 * 1000
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  }`} />
                  <span className="text-base">
                    {selectedUser.last_sign_in_at && 
                    (new Date().getTime() - new Date(selectedUser.last_sign_in_at).getTime()) < 5 * 60 * 1000
                      ? 'متصل الآن'
                      : 'غير متصل'
                    }
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">عدد الطلبات</p>
                <p className="text-base font-semibold">{selectedUser.orders_count || 0} طلب</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">معرف المستخدم</p>
                <p className="text-xs font-mono bg-muted p-2 rounded">{selectedUser.id}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا المستخدم؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف حساب المستخدم{' '}
              <span className="font-semibold">{userToDelete?.email}</span> بشكل نهائي.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
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

export default Users;
