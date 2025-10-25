# 🚂 Railway Deployment Guide - دليل النشر على Railway

## 📋 نظرة عامة

هذا الدليل يشرح كيفية نشر Backend على Railway بالتفصيل.

---

## ✅ المتطلبات الأساسية

- [x] حساب GitHub
- [x] حساب Railway (مجاني)
- [x] مشروع Supabase جاهز
- [x] Repository على GitHub

---

## 🚀 خطوات النشر

### 1. إنشاء مشروع على Railway

1. اذهب إلى [Railway Dashboard](https://railway.app/dashboard)
2. انقر على **New Project**
3. اختر **Deploy from GitHub repo**
4. ابحث عن `Mohamed-Salmony/NileStore`
5. اختر الـ repository

### 2. تكوين الإعدادات الأساسية

#### في صفحة Settings:

**Root Directory**:
```
server
```

هذا مهم جداً لأن الـ Backend في مجلد `server` وليس في الجذر.

**Watch Paths** (اختياري):
```
server/**
```

هذا يضمن أن Railway يعيد النشر فقط عند تغيير ملفات الـ Backend.

### 3. إضافة متغيرات البيئة

اذهب إلى **Variables** وأضف المتغيرات التالية:

```env
# Server Configuration
PORT=4000
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-here

# Storage
SUPABASE_BUCKET=NileStore-Files
```

#### كيفية الحصول على المفاتيح:

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **Settings** > **API**
4. انسخ:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`
5. اذهب إلى **Settings** > **API** > **JWT Settings**
6. انسخ **JWT Secret** → `SUPABASE_JWT_SECRET`

### 4. إنشاء Domain

1. اذهب إلى **Settings** > **Networking**
2. في قسم **Public Networking**
3. انقر على **Generate Domain**
4. سيظهر لك رابط مثل:
   ```
   https://nilestore-production.up.railway.app
   ```
5. **احفظ هذا الرابط** - ستحتاجه للفرونت إند

### 5. النشر

Railway سيبدأ النشر تلقائياً. يمكنك متابعة التقدم في:
- **Deployments** tab
- **Build Logs**
- **Deploy Logs**

---

## 🔍 التحقق من النشر

### 1. Health Check

افتح المتصفح واذهب إلى:
```
https://your-app.railway.app/health
```

يجب أن ترى:
```json
{
  "ok": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. API Health Check

```
https://your-app.railway.app/api/health
```

يجب أن ترى:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

### 3. اختبار Products API

```bash
curl https://your-app.railway.app/api/products
```

---

## 📊 مراقبة الأداء

### Metrics

اذهب إلى **Metrics** في Railway Dashboard لمراقبة:
- **CPU Usage**
- **Memory Usage**
- **Network Traffic**
- **Request Count**

### Logs

اذهب إلى **Deployments** > **View Logs** لرؤية:
- Application Logs
- Error Logs
- Request Logs

---

## 🔧 استكشاف الأخطاء

### المشكلة: Build Failed

**الأسباب المحتملة**:
1. ملفات `railway.json` أو `nixpacks.toml` غير موجودة
2. `package.json` غير صحيح
3. TypeScript errors

**الحل**:
1. تحقق من Build Logs
2. تأكد من وجود الملفات:
   - `server/railway.json`
   - `server/nixpacks.toml`
   - `server/package.json`
3. جرب Build محلياً:
   ```bash
   cd server
   npm install
   npm run build
   ```

### المشكلة: Deploy Failed

**الأسباب المحتملة**:
1. متغيرات البيئة ناقصة
2. PORT غير صحيح
3. Supabase credentials خاطئة

**الحل**:
1. تحقق من Deploy Logs
2. راجع جميع Environment Variables
3. تأكد من صحة Supabase credentials

### المشكلة: Application Crashes

**الأسباب المحتملة**:
1. Database connection failed
2. Missing environment variables
3. Runtime errors

**الحل**:
1. افتح **Logs** وابحث عن الأخطاء
2. تحقق من Supabase connection
3. تأكد من أن جميع المتغيرات موجودة

### المشكلة: 502 Bad Gateway

**الأسباب المحتملة**:
1. Application لم يبدأ بشكل صحيح
2. PORT غير صحيح
3. Health check failed

**الحل**:
1. تحقق من أن `PORT=4000` في Environment Variables
2. تأكد من أن Application يستمع على `process.env.PORT`
3. راجع Deploy Logs

---

## 🔄 التحديثات

### تحديث تلقائي

Railway يراقب GitHub repository. عند عمل push:
```bash
git add .
git commit -m "Update backend"
git push origin main
```

Railway سيعيد النشر تلقائياً.

### تحديث يدوي

1. اذهب إلى **Deployments**
2. انقر على **Redeploy**

### Rollback

إذا حدثت مشكلة:
1. اذهب إلى **Deployments**
2. اختر deployment سابق
3. انقر على **Redeploy**

---

## 🔐 الأمان

### Best Practices

1. **لا تشارك Service Role Key أبداً**
2. **استخدم Environment Variables فقط**
3. **فعّل Rate Limiting** (موجود بالفعل في الكود)
4. **راجع Logs بانتظام**
5. **استخدم HTTPS فقط**

### Environment Variables Security

- ✅ Railway يشفر Environment Variables
- ✅ لا تظهر في Logs
- ✅ لا يمكن الوصول إليها من الخارج

---

## 💰 التكلفة

### Free Plan

Railway يوفر:
- **$5 credit** شهرياً (مجاني)
- **500 ساعة تشغيل**
- **100 GB Bandwidth**
- **1 GB RAM**
- **1 vCPU**

هذا كافٍ لمشروع صغير أو متوسط.

### Paid Plans

إذا احتجت أكثر:
- **Hobby Plan**: $5/شهر
- **Pro Plan**: $20/شهر

---

## 📁 الملفات المهمة

### `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### `nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

### `package.json` (scripts)
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc -p .",
    "start": "node dist/index.js"
  }
}
```

---

## 🔗 الربط مع Frontend

بعد نشر Backend على Railway، احصل على الرابط:
```
https://your-app.railway.app
```

ثم في Vercel (Frontend)، أضف Environment Variable:
```env
NEXT_PUBLIC_API_URL=https://your-app.railway.app/api
```

⚠️ **مهم**: لا تنسى `/api` في النهاية!

---

## 📞 الدعم

### Railway Documentation
- [Railway Docs](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)

### مشاكل شائعة
- [Troubleshooting Guide](https://docs.railway.app/troubleshoot/fixing-common-errors)
- [Build & Deploy](https://docs.railway.app/deploy/builds)

---

## ✅ Checklist النشر

- [ ] Repository على GitHub
- [ ] Supabase project جاهز
- [ ] Railway account تم إنشاؤه
- [ ] Repository تم ربطه بـ Railway
- [ ] Root Directory = `server`
- [ ] Environment Variables تم إضافتها (6 متغيرات)
- [ ] Domain تم إنشاؤه
- [ ] Health check يعمل
- [ ] API endpoints تعمل
- [ ] Logs لا تحتوي على أخطاء

---

<div align="center">

### 🎉 مبروك! Backend الآن على الإنترنت!

**Next Step**: [نشر Frontend على Vercel](../DEPLOYMENT-GUIDE.md#-الخطوة-3-نشر-frontend-على-vercel)

</div>
