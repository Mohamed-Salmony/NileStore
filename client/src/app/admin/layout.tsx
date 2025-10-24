"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Package, FolderTree, Tag, ShoppingCart, MessageSquare, Menu, X, LogOut, MapPin, CreditCard } from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/admin" },
  { icon: Users, label: "المستخدمين", path: "/admin/users" },
  { icon: FolderTree, label: "الفئات", path: "/admin/categories" },
  { icon: Package, label: "المنتجات", path: "/admin/products" },
  { icon: Tag, label: "الكوبونات", path: "/admin/coupons" },
  { icon: ShoppingCart, label: "الطلبات", path: "/admin/orders" },
  { icon: MapPin, label: "المحافظات", path: "/admin/governorates" },
  { icon: CreditCard, label: "إعدادات الدفع", path: "/admin/payment-settings" },
  { icon: MessageSquare, label: "الدعم", path: "/admin/support" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("تم تسجيل الخروج بنجاح");
      router.push("/");
    } catch (error) {
      toast.error("فشل تسجيل الخروج");
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-64 bg-primary text-primary-foreground p-6 sticky top-0 h-screen overflow-y-auto"
          >
            {/* Logo in Circle - Centered */}
            <div className="flex flex-col items-center mb-8">
              <Link href="/admin" className="relative group">
                <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center p-5 hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <Logo className="w-full h-full" animated={false} />
                </div>
              </Link>
              <h2 className="mt-4 text-lg font-bold text-center">لوحة التحكم</h2>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link key={item.path} href={item.path}>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth",
                        isActive
                          ? "bg-secondary text-secondary-foreground"
                          : "hover:bg-primary-foreground/10"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-8 pt-4 border-t border-white/10 space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-3 text-primary-foreground hover:bg-red-500/20 hover:text-red-100"
              >
                <LogOut className="h-5 w-5" />
                <span>تسجيل الخروج</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(false)}
                className="w-full justify-start gap-3 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <X className="h-5 w-5" />
                <span>إخفاء القائمة</span>
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 bg-muted/30 relative">
        {/* Toggle Button - Fixed */}
        {!isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed top-4 left-4 z-50"
          >
            <Button
              onClick={() => setIsMenuOpen(true)}
              size="icon"
              className="rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
        {children}
      </main>
    </div>
  );
}
