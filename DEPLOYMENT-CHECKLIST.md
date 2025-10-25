# ✅ Deployment Checklist - قائمة التحقق من النشر

## 📋 قبل البدء

- [ ] لديك حساب GitHub
- [ ] لديك حساب Supabase (مجاني)
- [ ] لديك حساب Railway (مجاني)
- [ ] لديك حساب Vercel (مجاني)
- [ ] المشروع مرفوع على GitHub

---

## 1️⃣ Supabase Setup

### إنشاء المشروع
- [ ] مشروع جديد تم إنشاؤه على supabase.com
- [ ] اسم المشروع: NileStore (أو أي اسم تريده)
- [ ] المنطقة: اختر الأقرب لك

### تنفيذ SQL Schemas
افتح SQL Editor ونفذ الملفات بالترتيب:

- [ ] 1. `server/supabase-schema.sql`
- [ ] 2. `server/governorates-payment-schema.sql`
- [ ] 3. `server/coupons-promotions-schema.sql`
- [ ] 4. `server/wishlist-schema.sql`
- [ ] 5. `server/support-tickets-schema.sql`
- [ ] 6. `server/newsletter-contact-schema.sql`
- [ ] 7. `server/notifications-schema.sql`
- [ ] 8. `server/add-bilingual-support.sql`
- [ ] 9. `server/add-video-url-column.sql`
- [ ] 10. `server/add-coupon-code-to-orders.sql`
- [ ] 11. `server/add-support-notifications.sql`

### Storage Bucket
- [ ] Bucket تم إنشاؤه: `NileStore-Files`
- [ ] الوضع: **Public** ✅
- [ ] File size limit: 50MB
- [ ] Allowed MIME types: `image/*`

### مستخدم Admin
- [ ] مستخدم Admin تم إنشاؤه
- [ ] البريد الإلكتروني: _______________
- [ ] كلمة المرور: _______________
- [ ] App Metadata: `{"role": "admin"}` ✅

### المفاتيح
- [ ] `SUPABASE_URL` تم نسخه
- [ ] `SUPABASE_ANON_KEY` تم نسخه
- [ ] `SUPABASE_SERVICE_ROLE_KEY` تم نسخه
- [ ] `SUPABASE_JWT_SECRET` تم نسخه

---

## 2️⃣ Railway Setup (Backend)

### ربط Repository
- [ ] Repository تم ربطه: `Mohamed-Salmony/NileStore`
- [ ] Root Directory: `server` ✅

### Environment Variables
- [ ] `PORT=4000`
- [ ] `NODE_ENV=production`
- [ ] `SUPABASE_URL` تم إضافته
- [ ] `SUPABASE_ANON_KEY` تم إضافته
- [ ] `SUPABASE_SERVICE_ROLE_KEY` تم إضافته
- [ ] `SUPABASE_JWT_SECRET` تم إضافته
- [ ] `SUPABASE_BUCKET=NileStore-Files`

### النشر
- [ ] Build نجح ✅
- [ ] Deploy نجح ✅
- [ ] Domain تم إنشاؤه
- [ ] الرابط: _______________

### الاختبار
- [ ] `/health` يعمل
- [ ] `/api/health` يعمل
- [ ] `/api/products` يعمل
- [ ] لا توجد أخطاء في Logs

---

## 3️⃣ Vercel Setup (Frontend)

### ربط Repository
- [ ] Repository تم ربطه: `Mohamed-Salmony/NileStore`
- [ ] Root Directory: `client` ✅
- [ ] Framework: Next.js ✅

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` تم إضافته
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` تم إضافته
- [ ] `NEXT_PUBLIC_API_URL` تم إضافته (مع `/api` في النهاية)

### النشر
- [ ] Build نجح ✅
- [ ] Deploy نجح ✅
- [ ] الرابط: _______________

### الاختبار
- [ ] الموقع يفتح بدون أخطاء
- [ ] المنتجات تظهر
- [ ] الصور تظهر
- [ ] تسجيل الدخول يعمل
- [ ] السلة تعمل

---

## 4️⃣ الربط والتكامل

### CORS Settings
- [ ] رابط Vercel تم إضافته في `server/src/app.ts`
- [ ] Commit & Push تم
- [ ] Railway أعاد النشر تلقائياً

### اختبار الاتصال
- [ ] Frontend يتصل بـ Backend بنجاح
- [ ] لا توجد CORS errors
- [ ] API calls تعمل في Network tab

---

## 5️⃣ الاختبار النهائي

### كمستخدم عادي
- [ ] تصفح المنتجات
- [ ] البحث عن منتج
- [ ] إضافة منتج للسلة
- [ ] تعديل الكمية في السلة
- [ ] إتمام عملية شراء
- [ ] تتبع الطلب
- [ ] إضافة منتج لقائمة الأمنيات

### كـ Admin
- [ ] تسجيل دخول Admin
- [ ] الدخول إلى لوحة التحكم
- [ ] إضافة منتج جديد
- [ ] رفع صورة للمنتج
- [ ] تعديل منتج
- [ ] حذف منتج
- [ ] عرض الطلبات
- [ ] تحديث حالة طلب
- [ ] عرض الإحصائيات

---

## 6️⃣ الأمان والأداء

### الأمان
- [ ] `.env` files غير مرفوعة على GitHub
- [ ] `SUPABASE_SERVICE_ROLE_KEY` آمن
- [ ] CORS محدد بشكل صحيح
- [ ] Rate Limiting مفعّل
- [ ] HTTPS مفعّل على كل شيء

### الأداء
- [ ] الصور محسّنة
- [ ] Build size معقول
- [ ] Loading times سريعة
- [ ] لا توجد memory leaks

---

## 7️⃣ المراقبة

### Railway
- [ ] Metrics تعمل
- [ ] Logs واضحة
- [ ] لا توجد أخطاء متكررة

### Vercel
- [ ] Analytics تعمل
- [ ] Speed Insights جيدة
- [ ] لا توجد Build warnings

### Supabase
- [ ] Database Reports تعمل
- [ ] Storage Usage معقول
- [ ] API Usage ضمن الحدود

---

## 🎉 النشر الناجح!

إذا كانت جميع النقاط محددة ✅، فمبروك! مشروعك الآن على الإنترنت!

### الروابط النهائية:

**Frontend (Vercel)**:
```
https://_______________
```

**Backend (Railway)**:
```
https://_______________
```

**Supabase Dashboard**:
```
https://supabase.com/dashboard/project/_______________
```

---

## 📞 إذا واجهت مشاكل

راجع الأدلة التفصيلية:
- [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) - الدليل الكامل
- [QUICK-DEPLOY.md](./QUICK-DEPLOY.md) - الدليل السريع
- [RAILWAY-DEPLOY.md](./server/RAILWAY-DEPLOY.md) - Railway فقط
- [VERCEL-DEPLOY.md](./client/VERCEL-DEPLOY.md) - Vercel فقط

---

## 🔄 الخطوات التالية

- [ ] إضافة Custom Domain (اختياري)
- [ ] تفعيل Analytics
- [ ] إعداد Monitoring
- [ ] إضافة المزيد من المنتجات
- [ ] اختبار مع مستخدمين حقيقيين
- [ ] جمع Feedback
- [ ] التحسين المستمر

---

<div align="center">

### 🎊 مبروك على نشر مشروعك!

Made with ❤️ by Mohamed Salmony

</div>
