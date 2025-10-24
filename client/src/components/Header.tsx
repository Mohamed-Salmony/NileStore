"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, User, Search, Menu, X, Layers, LogIn, UserPlus, LogOut, Tag, LayoutDashboard, Package, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from './NotificationBell';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { guestCart } from '@/lib/cart';
import { cartEvents } from '@/lib/cartEvents';

const Portal = ({ children }: { children: ReactNode }) => {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
};

const Header = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, isAdmin, signOut: authSignOut } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      if (user) {
        const { cart } = await api.getCart();
        const count = cart?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;
        setCartCount(count);
      } else {
        // Get guest cart count from localStorage
        const count = guestCart.getCartCount();
        setCartCount(count);
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  };

  useEffect(() => {
    fetchCartCount();
    
    // Listen to cart events for instant updates
    const unsubscribe = cartEvents.subscribe(() => {
      fetchCartCount();
    });
    
    // Also update cart count every 2 seconds as fallback
    const interval = setInterval(fetchCartCount, 2000);
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = isMenuOpen ? 'hidden' : original || '';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    try {
      await authSignOut();
      toast.success('تم تسجيل الخروج بنجاح');
      router.push('/');
    } catch (error) {
      toast.error('فشل تسجيل الخروج');
    }
  };

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('search')}
              className="pl-10 transition-smooth focus:shadow-card"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          {!isAdmin && (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden lg:block">
                <Link href="/products">
                  <Button variant="ghost" className="hidden lg:flex gap-2 hover:text-blue-800 hover:bg-blue-100">
                    <Package className="h-5 w-5" />
                    {t('products')}
                  </Button>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden lg:block">
                <Link href="/categories">
                  <Button variant="ghost" className="hidden lg:flex gap-2 hover:text-blue-800 hover:bg-blue-100">
                    <Layers className="h-5 w-5" />
                    {t('categories')}
                  </Button>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden lg:block">
                <Link href="/promotions">
                  <Button variant="ghost" className="hidden lg:flex gap-2 hover:text-blue-800 hover:bg-blue-100">
                    <Tag className="h-5 w-5" />
                    {t('offers')}
                  </Button>
                </Link>
              </motion.div>
            </>
          )}

          <div className="hidden lg:block">
            <LanguageSwitcher />
          </div>

          {/* Notification Bell - Only for logged-in users */}
          {user && (
            <div className="hidden lg:block">
              <NotificationBell />
            </div>
          )}

          {/* Cart - For all users except admin */}
          {!isAdmin && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden lg:block">
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className="hover:text-blue-800 hover:bg-blue-100">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </motion.div>
          )}

          {/* Admin Dashboard Link */}
          {isAdmin && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden lg:block">
              <Link href="/admin">
                <Button variant="ghost" className="gap-2 hover:text-blue-800 hover:bg-blue-100">
                  <LayoutDashboard className="h-5 w-5" />
                  {t('admin')}
                </Button>
              </Link>
            </motion.div>
          )}

          {/* Profile - Only when logged in */}
          {user && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden lg:block">
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="hover:text-blue-800 hover:bg-blue-100">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          )}

          {/* Auth Buttons - Only when NOT logged in */}
          {!user && (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden lg:block">
                <Link href="/login">
                  <Button variant="outline" className="gap-2 hover:text-blue-800 hover:bg-blue-100">
                    <LogIn className="h-5 w-5" />
                    {t('login')}
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden lg:block">
                <Link href="/register">
                  <Button className="gap-2 bg-secondary text-white hover:bg-secondary/90">
                    <UserPlus className="h-5 w-5" />
                    {t('signup')}
                  </Button>
                </Link>
              </motion.div>
            </>
          )}

          {/* Logout Button - Only when logged in */}
          {user && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden lg:block">
              <Button 
                variant="outline" 
                className="gap-2 hover:text-red-600 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                {t('logout')}
              </Button>
            </motion.div>
          )}

          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:text-blue-800 hover:bg-blue-100"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
      </nav>
      </div>

      {/* Mobile Slide-over Menu (re-built via Portal) */}
      {isMenuOpen && (
        <Portal>
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="absolute right-0 top-0 h-full w-[75vw] sm:w-[18rem] bg-gray-900 text-white shadow-2xl border-l border-white/10 overflow-y-auto no-scrollbar [-webkit-tap-highlight-color:transparent]"
            role="dialog"
            aria-modal="true"
          >
            <nav className="mt-4 p-4 flex flex-col gap-2 ">
              {!isAdmin && (
                <>
                  <Link href="/products" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-lg py-3 text-white hover:bg-white/10">
                      <Package className="h-5 w-5" />
                      {t('products')}
                    </Button>
                  </Link>
                  <Link href="/categories" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-lg py-3 text-white hover:bg-white/10">
                      <Layers className="h-5 w-5" />
                      {t('categories')}
                    </Button>
                  </Link>
                  <Link href="/promotions" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-lg py-3 text-white hover:bg-white/10">
                      <Tag className="h-5 w-5" />
                      {t('offers')}
                    </Button>
                  </Link>
                </>
              )}
              
              {!isAdmin && (
                <Link href="/cart" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 relative text-lg py-3 text-white hover:bg-white/10">
                    <ShoppingCart className="h-5 w-5" />
                    {t('cart')}
                    {cartCount > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 px-2 text-xs">{cartCount}</Badge>
                    )}
                  </Button>
                </Link>
              )}

              {isAdmin && (
                <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-lg py-3 text-white hover:bg-white/10">
                    <LayoutDashboard className="h-5 w-5" />
                    {t('admin')}
                  </Button>
                </Link>
              )}

              {user && (
                <>
                  <Link href="/notifications" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-lg py-3 text-white hover:bg-white/10">
                      <Bell className="h-5 w-5" />
                      {t('notifications') || (i18n.language === 'ar' ? 'الإشعارات' : 'Notifications')}
                    </Button>
                  </Link>
                  <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-lg py-3 text-white hover:bg-white/10">
                      <User className="h-5 w-5" />
                      {t('profile')}
                    </Button>
                  </Link>
                </>
              )}

              {!user && (
                <>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-lg py-3 text-white hover:bg-white/10">
                      <LogIn className="h-5 w-5" />
                      {t('login')}
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="secondary" className="w-full justify-start gap-2 text-lg py-3">
                      <UserPlus className="h-5 w-5" />
                      {t('signup')}
                    </Button>
                  </Link>
                </>
              )}

              {user && (
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2 text-lg py-3 text-white hover:bg-red-500/20"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  {t('logout')}
                </Button>
              )}

              <div className="mt-4 pt-4 border-t border-white/10">
                <LanguageSwitcher />
              </div>
            </nav>
          </motion.aside>
        </div>
        </Portal>
      )}
    </motion.header>
  );
};

export default Header;
