'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success(t('resetEmailSent'));
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(t('resetEmailFailed'));
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
            {t('forgotPasswordTitle')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('forgotPasswordMessage')}
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('enterEmail')}</h3>
                <p className="text-sm text-muted-foreground">{t('enterEmailDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('checkEmail')}</h3>
                <p className="text-sm text-muted-foreground">{t('checkEmailDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('resetPassword')}</h3>
                <p className="text-sm text-muted-foreground">{t('resetPasswordDesc')}</p>
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
              <CardTitle className="text-3xl font-bold text-center">{t('forgotPassword')}</CardTitle>
              <CardDescription className="text-center text-base">
                {t('forgotPasswordDescription')}
              </CardDescription>
            </CardHeader>

            {!emailSent ? (
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-6">
                  <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                        {t('sending')}
                      </>
                    ) : (
                      <>
                        <Mail className="ml-2 h-5 w-5" />
                        {t('sendResetLink')}
                      </>
                    )}
                  </Button>
                  <Link 
                    href="/login" 
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t('backToLogin')}
                  </Link>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="space-y-6 pb-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{t('emailSentSuccess')}</h3>
                    <p className="text-muted-foreground">
                      {t('emailSentSuccessMessage')}
                    </p>
                    <p className="text-sm font-medium text-primary">{email}</p>
                  </div>
                  <div className="w-full p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                    <p className="mb-2 font-medium">{t('didntReceiveEmail')}</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>{t('checkSpamFolder')}</li>
                      <li>{t('checkEmailCorrect')}</li>
                      <li>{t('waitFewMinutes')}</li>
                    </ul>
                  </div>
                  <div className="flex flex-col gap-3 w-full pt-4">
                    <Button
                      onClick={() => setEmailSent(false)}
                      variant="outline"
                      className="w-full"
                    >
                      {t('tryAnotherEmail')}
                    </Button>
                    <Link href="/login" className="w-full">
                      <Button variant="default" className="w-full">
                        <ArrowLeft className="ml-2 h-4 w-4" />
                        {t('backToLogin')}
                      </Button>
                    </Link>
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
