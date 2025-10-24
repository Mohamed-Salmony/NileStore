'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { signIn } from '@/lib/supabase';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      
      // Merge guest cart with user cart
      try {
        await api.mergeGuestCart();
      } catch (error) {
        console.error('Failed to merge cart:', error);
      }
      
      // Try to create welcome notification (for users who didn't get it during registration)
      try {
        await api.createUserWelcomeNotification();
      } catch (error) {
        // Silently fail - notification might already exist
        console.log('Welcome notification already exists or failed to create');
      }
      
      toast.success(t('loginSuccess'));
      router.push(redirect);
      router.refresh();
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex flex-col justify-center space-y-6 px-8"
        >
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-40 h-40 rounded-3xl bg-white border-4 border-primary/30 shadow-2xl p-3 ring-4 ring-primary/10 mb-4">
              <img 
                src="/NileStore-Logo.jpg" 
                alt="Nile Store Logo" 
                className="w-full h-full rounded-2xl object-cover"
              />
            </div>
            <h1 className="text-4xl font-bold">{t('nileStore')}</h1>
          </div>
          <h2 className="text-4xl font-bold leading-tight">
            {t('welcomeBack')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('loginWelcomeMessage')}
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('securePayments')}</h3>
                <p className="text-sm text-muted-foreground">{t('securePaymentsDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('fastDelivery')}</h3>
                <p className="text-sm text-muted-foreground">{t('fastDeliveryDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('easyReturns')}</h3>
                <p className="text-sm text-muted-foreground">{t('easyReturnsDesc')}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="w-full shadow-2xl border-2">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex justify-center mb-6 lg:hidden">
                <div className="w-28 h-28 rounded-2xl bg-white border-4 border-primary/30 shadow-2xl p-2 ring-4 ring-primary/10">
                  <img 
                    src="/NileStore-Logo.jpg" 
                    alt="Nile Store Logo" 
                    className="w-full h-full rounded-xl object-cover"
                  />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-center">{t('loginTitle')}</CardTitle>
              <CardDescription className="text-center text-base">
                {t('loginDescription')}
              </CardDescription>
            </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  className="pr-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('password')}</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pr-10 pl-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  {t('loggingIn')}
                </>
              ) : (
                t('loginTitle')
              )}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t('or')}
                </span>
              </div>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              {t('noAccount')}{' '}
              <Link href="/register" className="text-primary hover:underline font-semibold">
                {t('createAccount')}
              </Link>
            </p>
          </CardFooter>
        </form>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
