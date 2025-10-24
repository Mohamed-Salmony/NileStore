'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, KeyRound } from 'lucide-react';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Check if user came from reset password email
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(t('invalidResetLink'));
        router.push('/forgot-password');
      }
    };
    checkSession();
  }, [router, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('passwordsNotMatch'));
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t('passwordMinLength'));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) throw error;

      setPasswordReset(true);
      toast.success(t('passwordResetSuccess'));
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(t('passwordResetFailed'));
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
          <h2 className="text-4xl font-bold leading-tight text-center">
            {t('createNewPassword')}
          </h2>
          <p className="text-lg text-muted-foreground text-center">
            {t('createNewPasswordMessage')}
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('strongPassword')}</h3>
                <p className="text-sm text-muted-foreground">{t('strongPasswordDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('secureAccount')}</h3>
                <p className="text-sm text-muted-foreground">{t('secureAccountDesc')}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Form */}
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
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <KeyRound className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-center">{t('resetPassword')}</CardTitle>
              <CardDescription className="text-center text-base">
                {t('resetPasswordDescription')}
              </CardDescription>
            </CardHeader>

            {!passwordReset ? (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('newPassword')}</Label>
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
                        minLength={6}
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
                    <p className="text-xs text-muted-foreground">
                      {t('passwordMinLength')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('confirmNewPassword')}</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pr-10 pl-10"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        disabled={loading}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
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
                        {t('resetting')}
                      </>
                    ) : (
                      <>
                        <Lock className="ml-2 h-5 w-5" />
                        {t('resetPasswordButton')}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="space-y-6 pb-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{t('passwordResetSuccessTitle')}</h3>
                    <p className="text-muted-foreground">
                      {t('passwordResetSuccessMessage')}
                    </p>
                  </div>
                  <div className="w-full pt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('redirectingToLogin')}
                    </p>
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
