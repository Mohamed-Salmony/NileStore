"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Package,
  FolderTree,
  Tag,
  ShoppingCart,
  MessageSquare,
  Settings,
  MapPin,
  CreditCard,
} from 'lucide-react';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';

const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/admin' },
    { icon: Users, label: 'المستخدمين', path: '/admin/users' },
    { icon: FolderTree, label: 'الفئات', path: '/admin/categories' },
    { icon: Package, label: 'المنتجات', path: '/admin/products' },
    { icon: Tag, label: 'الكوبونات', path: '/admin/coupons' },
    { icon: ShoppingCart, label: 'الطلبات', path: '/admin/orders' },
    { icon: MapPin, label: 'المحافظات', path: '/admin/governorates' },
    { icon: CreditCard, label: 'إعدادات الدفع', path: '/admin/payment-settings' },
    { icon: MessageSquare, label: 'الدعم', path: '/admin/support' },
    { icon: Settings, label: 'الإعدادات', path: '/admin/settings' },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 bg-primary text-primary-foreground p-6 sticky top-0 h-screen"
      >
        <Link href="/admin" className="flex items-center mb-8">
          <Logo className="brightness-0 invert" animated={false} />
        </Link>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  whileHover={{ x: 5 }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth',
                    isActive
                      ? 'bg-secondary text-secondary-foreground'
                      : 'hover:bg-primary-foreground/10'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 bg-muted/30">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
