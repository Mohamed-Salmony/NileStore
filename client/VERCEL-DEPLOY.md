# ⚡ Vercel Deployment Guide - دليل النشر على Vercel

## 📋 نظرة عامة

هذا الدليل يشرح كيفية نشر Frontend (Next.js) على Vercel بالتفصيل.

---

## ✅ المتطلبات الأساسية

- [x] حساب GitHub
- [x] حساب Vercel (مجاني)
- [x] Backend منشور على Railway
- [x] مشروع Supabase جاهز
- [x] Repository على GitHub

---

## 🚀 خطوات النشر

### 1. إنشاء مشروع على Vercel

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. انقر على **Add New Project**
3. اختر **Import Git Repository**
4. ابحث عن `Mohamed-Salmony/NileStore`
5. انقر على **Import**

### 2. تكوين الإعدادات الأساسية

في صفحة **Configure Project**:

#### Framework Preset
```
Next.js
```
Vercel سيكتشف هذا تلقائياً.

#### Root Directory
```
client
```
⚠️ **مهم جداً**: لأن Frontend في مجلد `client` وليس في الجذر.

#### Build and Output Settings

اترك الإعدادات الافتراضية:
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. إضافة متغيرات البيئة

في قسم **Environment Variables**:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API URL (من Railway)
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app/api
```

#### كيفية الحصول على القيم:

**Supabase**:
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. **Settings** > **API**
4. انسخ:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Backend API**:
1. اذهب إلى [Railway Dashboard](https://railway.app/dashboard)
2. اختر مشروع Backend
3. **Settings** > **Networking**
4. انسخ الـ Domain
5. أضف `/api` في النهاية
6. مثال: `https://nilestore-production.up.railway.app/api`

⚠️ **مهم**: لا تنسى `/api` في نهاية `NEXT_PUBLIC_API_URL`

### 4. النشر

1. انقر على **Deploy**
2. انتظر حتى ينتهي البناء (2-5 دقائق)
3. بعد النشر الناجح، سيظهر لك رابط مثل:
   ```
   https://nile-store.vercel.app
   ```

---

## 🔍 التحقق من النشر

### 1. افتح الموقع

اذهب إلى الرابط الذي حصلت عليه:
```
https://your-app.vercel.app
```

### 2. تحقق من الاتصال بـ Backend

1. افتح **Developer Tools** (F12)
2. اذهب إلى **Network** tab
3. تصفح المنتجات
4. تحقق من أن الطلبات تذهب إلى Railway URL

### 3. اختبار المميزات

- [ ] تصفح المنتجات
- [ ] تسجيل الدخول
- [ ] إضافة منتج للسلة
- [ ] الدخول إلى لوحة التحكم (Admin)

---

## 🔧 استكشاف الأخطاء

### المشكلة: Build Failed

**الأسباب المحتملة**:
1. TypeScript errors
2. Missing dependencies
3. Environment variables غير صحيحة

**الحل**:
1. افتح **Build Logs** في Vercel
2. ابحث عن الأخطاء
3. جرب Build محلياً:
   ```bash
   cd client
   npm install
   npm run build
   ```

### المشكلة: Frontend لا يتصل بـ Backend

**الأسباب المحتملة**:
1. `NEXT_PUBLIC_API_URL` غير صحيح
2. CORS error
3. Backend لا يعمل

**الحل**:
1. تحقق من `NEXT_PUBLIC_API_URL` في Vercel
2. تأكد من إضافة `/api` في النهاية
3. افتح Developer Tools وشاهد الأخطاء
4. تحقق من أن Backend يعمل:
   ```bash
   curl https://your-railway-app.railway.app/api/health
   ```

### المشكلة: CORS Error

**الأسباب**:
Backend لا يسمح بطلبات من Vercel domain.

**الحل**:
1. افتح `server/src/app.ts`
2. عدّل CORS settings:
   ```typescript
   app.use(cors({ 
     origin: [
       'http://localhost:3000',
       'https://your-vercel-app.vercel.app'
     ],
     credentials: true 
   }));
   ```
3. اعمل commit و push:
   ```bash
   git add .
   git commit -m "Update CORS settings"
   git push origin main
   ```

### المشكلة: الصور لا تظهر

**الأسباب المحتملة**:
1. Supabase Storage غير عام
2. Bucket name غير صحيح

**الحل**:
1. اذهب إلى Supabase Dashboard
2. **Storage** > **NileStore-Files**
3. تأكد من أن Bucket عام (Public)
4. تحقق من Storage Policies

### المشكلة: Environment Variables لا تعمل

**الحل**:
1. تأكد من أن جميع المتغيرات تبدأ بـ `NEXT_PUBLIC_`
2. بعد تعديل Environment Variables:
   - اذهب إلى **Deployments**
   - انقر على **Redeploy**

---

## 🔄 التحديثات

### تحديث تلقائي

Vercel يراقب GitHub repository. عند عمل push:
```bash
git add .
git commit -m "Update frontend"
git push origin main
```

Vercel سيعيد النشر تلقائياً.

### تحديث Environment Variables

1. اذهب إلى **Settings** > **Environment Variables**
2. عدّل المتغير
3. انقر على **Save**
4. اذهب إلى **Deployments**
5. انقر على **Redeploy**

### Rollback

إذا حدثت مشكلة:
1. اذهب إلى **Deployments**
2. اختر deployment سابق
3. انقر على **Promote to Production**

---

## 🌍 Custom Domain (اختياري)

### إضافة Domain خاص

1. اذهب إلى **Settings** > **Domains**
2. انقر على **Add**
3. أدخل domain الخاص بك (مثل: `nilestore.com`)
4. اتبع التعليمات لتحديث DNS records

### DNS Configuration

أضف CNAME record في DNS provider:
```
Type: CNAME
Name: www (أو @)
Value: cname.vercel-dns.com
```

---

## 📊 مراقبة الأداء

### Analytics

Vercel يوفر Analytics مجاني:
1. اذهب إلى **Analytics** tab
2. راقب:
   - **Page Views**
   - **Visitors**
   - **Top Pages**
   - **Performance Metrics**

### Speed Insights

1. اذهب إلى **Speed Insights**
2. راقب:
   - **Core Web Vitals**
   - **Performance Score**
   - **Loading Times**

### Logs

1. اذهب إلى **Deployments**
2. اختر deployment
3. انقر على **View Function Logs**

---

## 🔐 الأمان

### Environment Variables

- ✅ Vercel يشفر Environment Variables
- ✅ لا تظهر في Build Logs
- ✅ متاحة فقط في Runtime

### Best Practices

1. **لا تضع secrets في الكود**
2. **استخدم `NEXT_PUBLIC_` للمتغيرات العامة فقط**
3. **راجع Logs بانتظام**
4. **فعّل Vercel Firewall** (في Paid plans)

---

## 💰 التكلفة

### Free Plan (Hobby)

Vercel يوفر:
- **Unlimited deployments**
- **100 GB Bandwidth** شهرياً
- **100 Build Hours** شهرياً
- **Serverless Functions**
- **Analytics**
- **SSL Certificate** مجاني

هذا كافٍ لمعظم المشاريع الصغيرة والمتوسطة.

### Paid Plans

إذا احتجت أكثر:
- **Pro Plan**: $20/شهر
- **Enterprise**: Custom pricing

---

## 📁 الملفات المهمة

### `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "regions": ["iad1"]
}
```

### `package.json` (scripts)
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint ."
  }
}
```

### `.env.example`
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 🔗 الربط مع Backend

### تحديث CORS في Backend

بعد نشر Frontend على Vercel، عدّل `server/src/app.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app',
    'https://nile-store.vercel.app'  // أضف domain الخاص بك
  ],
  credentials: true
}));
```

ثم اعمل commit و push:
```bash
cd server
git add .
git commit -m "Update CORS for Vercel"
git push origin main
```

Railway سيعيد النشر تلقائياً.

---

## 📞 الدعم

### Vercel Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)

### مشاكل شائعة
- [Troubleshooting](https://vercel.com/docs/troubleshooting)
- [Build Errors](https://vercel.com/docs/errors)

---

## ✅ Checklist النشر

- [ ] Repository على GitHub
- [ ] Backend منشور على Railway
- [ ] Supabase project جاهز
- [ ] Vercel account تم إنشاؤه
- [ ] Repository تم ربطه بـ Vercel
- [ ] Root Directory = `client`
- [ ] Environment Variables تم إضافتها (3 متغيرات)
- [ ] Build نجح
- [ ] الموقع يعمل
- [ ] الاتصال بـ Backend يعمل
- [ ] الصور تظهر
- [ ] تسجيل الدخول يعمل

---

<div align="center">

### 🎉 مبروك! Frontend الآن على الإنترنت!

**الخطوة التالية**: [ربط Frontend مع Backend](../DEPLOYMENT-GUIDE.md#-الخطوة-4-ربط-frontend-و-backend)

</div>
