# 🚀 دليل النشر الكامل - NileStore Deployment Guide

## 📋 نظرة عامة

هذا الدليل يشرح كيفية نشر مشروع NileStore على:
- **Backend**: Railway
- **Frontend**: Vercel
- **Database**: Supabase

---

## 🎯 الخطوة 1: إعداد قاعدة البيانات (Supabase)

### 1.1 إنشاء المشروع
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. انقر على **New Project**
3. اختر اسم المشروع والمنطقة وكلمة المرور

### 1.2 تنفيذ SQL Schemas
افتح **SQL Editor** في Supabase ونفذ الملفات التالية **بالترتيب**:

```bash
1. server/supabase-schema.sql                    # الجداول الأساسية
2. server/governorates-payment-schema.sql        # المحافظات والشحن
3. server/coupons-promotions-schema.sql          # الكوبونات والعروض
4. server/wishlist-schema.sql                    # قائمة الأمنيات
5. server/support-tickets-schema.sql             # الدعم الفني
6. server/newsletter-contact-schema.sql          # النشرة البريدية
7. server/notifications-schema.sql               # الإشعارات
8. server/add-bilingual-support.sql              # دعم اللغتين
9. server/add-video-url-column.sql               # فيديوهات المنتجات
10. server/add-coupon-code-to-orders.sql         # ربط الكوبونات بالطلبات
11. server/add-support-notifications.sql         # إشعارات الدعم
```

### 1.3 إنشاء Storage Bucket
1. اذهب إلى **Storage** في Supabase Dashboard
2. انقر على **New Bucket**
3. الإعدادات:
   - **Name**: `NileStore-Files`
   - **Public**: ✅ (اجعله عام)
   - **File size limit**: 50MB
   - **Allowed MIME types**: `image/*`

### 1.4 الحصول على المفاتيح
اذهب إلى **Settings > API** واحفظ:
- ✅ **Project URL** (SUPABASE_URL)
- ✅ **anon/public key** (SUPABASE_ANON_KEY)
- ✅ **service_role key** (SUPABASE_SERVICE_ROLE_KEY)
- ✅ **JWT Secret** (من Settings > API > JWT Settings)

### 1.5 إنشاء مستخدم Admin
1. اذهب إلى **Authentication > Users**
2. انقر على **Add User**
3. أدخل البريد الإلكتروني وكلمة المرور
4. بعد الإنشاء، انقر على المستخدم
5. في **App Metadata** أضف:
```json
{
  "role": "admin"
}
```
6. احفظ التغييرات

---

## 🚂 الخطوة 2: نشر Backend على Railway

### 2.1 إعداد المشروع على Railway

1. اذهب إلى [Railway Dashboard](https://railway.app)
2. انقر على **New Project**
3. اختر **Deploy from GitHub repo**
4. اختر repository: `Mohamed-Salmony/NileStore`
5. Railway سيكتشف المشروع تلقائياً

### 2.2 تكوين الإعدادات

#### في صفحة Settings:

**Root Directory**:
```
server
```

**Build Command** (اتركه فارغ - سيستخدم railway.json):
```
(اتركه فارغ)
```

**Start Command** (اتركه فارغ - سيستخدم railway.json):
```
(اتركه فارغ)
```

**Watch Paths** (اختياري):
```
server/**
```

### 2.3 إضافة متغيرات البيئة (Environment Variables)

اذهب إلى **Variables** وأضف:

```env
PORT=4000
NODE_ENV=production

# من Supabase Dashboard > Settings > API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-here

# اسم Bucket
SUPABASE_BUCKET=NileStore-Files
```

### 2.4 الحصول على رابط Backend

بعد النشر الناجح:
1. اذهب إلى **Settings > Networking**
2. انقر على **Generate Domain**
3. سيظهر لك رابط مثل: `https://nilestore-production.up.railway.app`
4. **احفظ هذا الرابط** - ستحتاجه للفرونت إند

### 2.5 التحقق من النشر

افتح المتصفح واذهب إلى:
```
https://your-railway-app.railway.app/api/health
```

يجب أن ترى:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## ⚡ الخطوة 3: نشر Frontend على Vercel

### 3.1 إعداد المشروع على Vercel

1. اذهب إلى [Vercel Dashboard](https://vercel.com)
2. انقر على **Add New Project**
3. اختر **Import Git Repository**
4. اختر repository: `Mohamed-Salmony/NileStore`

### 3.2 تكوين الإعدادات

في صفحة Import:

**Framework Preset**:
```
Next.js
```

**Root Directory**:
```
client
```

**Build Command** (اتركه كما هو):
```
npm run build
```

**Output Directory** (اتركه كما هو):
```
.next
```

**Install Command** (اتركه كما هو):
```
npm install
```

### 3.3 إضافة متغيرات البيئة (Environment Variables)

في قسم **Environment Variables** أضف:

```env
# من Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# رابط Backend من Railway (مع /api في النهاية)
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app/api
```

⚠️ **مهم جداً**: تأكد من إضافة `/api` في نهاية رابط Backend

### 3.4 النشر

1. انقر على **Deploy**
2. انتظر حتى ينتهي البناء (2-5 دقائق)
3. بعد النشر الناجح، سيظهر لك رابط مثل: `https://nile-store.vercel.app`

---

## 🔗 الخطوة 4: ربط Frontend و Backend

### 4.1 تحديث CORS في Backend

إذا واجهت مشاكل CORS، تحقق من ملف `server/src/app.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app',  // أضف رابط Vercel هنا
    'https://nile-store.vercel.app'        // مثال
  ],
  credentials: true
}));
```

### 4.2 تحديث متغيرات البيئة في Vercel

إذا قمت بتغيير رابط Railway:
1. اذهب إلى Vercel Dashboard > Project > Settings > Environment Variables
2. عدّل `NEXT_PUBLIC_API_URL` بالرابط الجديد
3. انقر على **Save**
4. اذهب إلى **Deployments** وانقر على **Redeploy**

---

## ✅ الخطوة 5: الاختبار النهائي

### 5.1 اختبار Backend
```bash
# Health Check
curl https://your-railway-app.railway.app/api/health

# Get Products
curl https://your-railway-app.railway.app/api/products
```

### 5.2 اختبار Frontend
1. افتح `https://your-vercel-app.vercel.app`
2. تصفح المنتجات
3. سجل دخول بحساب Admin
4. جرب إضافة منتج جديد

### 5.3 اختبار الربط
1. افتح Developer Tools (F12)
2. اذهب إلى **Network** tab
3. تصفح المنتجات
4. تحقق من أن الطلبات تذهب إلى Railway URL

---

## 🔧 استكشاف الأخطاء (Troubleshooting)

### مشكلة: Backend لا يعمل على Railway

**الحل**:
1. تحقق من Logs في Railway Dashboard
2. تأكد من أن جميع متغيرات البيئة موجودة
3. تحقق من أن `railway.json` و `nixpacks.toml` موجودان في مجلد `server`

### مشكلة: Frontend لا يتصل بـ Backend

**الحل**:
1. تحقق من `NEXT_PUBLIC_API_URL` في Vercel
2. تأكد من إضافة `/api` في النهاية
3. تحقق من CORS في Backend
4. افتح Developer Tools وشاهد الأخطاء

### مشكلة: CORS Error

**الحل**:
```typescript
// في server/src/app.ts
app.use(cors({
  origin: '*',  // للاختبار فقط
  credentials: true
}));
```

بعد التأكد من عمل كل شيء، عدّل إلى:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-vercel-app.vercel.app',
  credentials: true
}));
```

### مشكلة: الصور لا تظهر

**الحل**:
1. تحقق من أن Bucket في Supabase عام (Public)
2. تحقق من Storage Policies في Supabase
3. تأكد من أن `SUPABASE_BUCKET=NileStore-Files` في Railway

---

## 📊 مراقبة الأداء

### Railway Metrics
- اذهب إلى **Metrics** في Railway Dashboard
- راقب CPU, Memory, Network

### Vercel Analytics
- اذهب إلى **Analytics** في Vercel Dashboard
- راقب Page Views, Performance

### Supabase Monitoring
- اذهب إلى **Database** > **Reports**
- راقب Queries, Connections

---

## 🔄 التحديثات المستقبلية

### تحديث Backend
```bash
# في مجلد server
git add .
git commit -m "Update backend"
git push origin main
```
Railway سيعيد النشر تلقائياً

### تحديث Frontend
```bash
# في مجلد client
git add .
git commit -m "Update frontend"
git push origin main
```
Vercel سيعيد النشر تلقائياً

---

## 🎉 النشر الناجح!

الآن لديك:
- ✅ Backend يعمل على Railway
- ✅ Frontend يعمل على Vercel
- ✅ Database على Supabase
- ✅ كل شيء مربوط ويعمل بشكل صحيح

### الروابط النهائية:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-app.railway.app/api`
- **Supabase Dashboard**: `https://supabase.com/dashboard/project/your-project-id`

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من Logs في Railway و Vercel
2. راجع قسم Troubleshooting أعلاه
3. تحقق من متغيرات البيئة
4. تأكد من تنفيذ جميع SQL Schemas في Supabase

---

## 🔐 الأمان

### نصائح مهمة:
- ✅ لا تشارك `SUPABASE_SERVICE_ROLE_KEY` أبداً
- ✅ لا تضع المفاتيح في الكود
- ✅ استخدم Environment Variables دائماً
- ✅ فعّل Row Level Security في Supabase
- ✅ استخدم HTTPS فقط في Production

---

<div align="center">

### 🎊 مبروك! مشروعك الآن على الإنترنت!

Made with ❤️ by Mohamed Salmony

</div>
