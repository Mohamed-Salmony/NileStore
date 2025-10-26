'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyOTP, resendOTP } from '@/lib/supabase';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, ShieldCheck } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get('email') || null;
  
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('البريد الإلكتروني مفقود');
      return;
    }

    if (otp.length !== 6) {
      toast.error('الرمز يجب أن يكون 6 أرقام');
      return;
    }

    setLoading(true);

    try {
      await verifyOTP(email, otp);
      toast.success('تم تأكيد الحساب بنجاح!');
      
      // Create welcome notification
      try {
        await api.createUserWelcomeNotification();
      } catch (notifError) {
        console.error('Failed to create welcome notification:', notifError);
        // Don't block the user flow if notification fails
      }
      
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: any) {
      console.error('Verify error:', error);
      
      let errorMessage = 'فشل التحقق من الرمز';
      
      if (error.message?.includes('Token has expired')) {
        errorMessage = 'انتهت صلاحية الرمز. يرجى طلب رمز جديد';
      } else if (error.message?.includes('Invalid token')) {
        errorMessage = 'الرمز غير صحيح. يرجى التحقق والمحاولة مرة أخرى';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    
    if (countdown > 0) {
      toast.error(`يرجى الانتظار ${countdown} ثانية قبل إعادة الإرسال`);
      return;
    }

    setResending(true);

    try {
      await resendOTP(email);
      toast.success('تم إرسال رمز جديد إلى بريدك الإلكتروني');
      setCountdown(60); // 60 ثانية قبل السماح بإعادة الإرسال
      setOtp(''); // مسح الرمز القديم
    } catch (error: any) {
      console.error('Resend error:', error);
      toast.error(error.message || 'فشل إعادة إرسال الرمز');
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-10 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">تأكيد البريد الإلكتروني</CardTitle>
          <CardDescription>
            تم إرسال رمز التحقق المكون من 6 أرقام إلى
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleVerify}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">رمز التحقق</Label>
              <div className="relative">
                <ShieldCheck className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  className="pr-10 text-center text-2xl tracking-widest font-mono"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                  }}
                  maxLength={6}
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                أدخل الرمز المكون من 6 أرقام
              </p>
            </div>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={handleResend}
                disabled={resending || countdown > 0}
                className="text-sm"
              >
                {resending ? (
                  <>
                    <Loader2 className="ml-2 h-3 w-3 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : countdown > 0 ? (
                  `إعادة الإرسال بعد ${countdown}ث`
                ) : (
                  'إعادة إرسال الرمز'
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                'تأكيد الحساب'
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              <Link href="/register" className="text-primary hover:underline font-medium">
                العودة إلى التسجيل
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
