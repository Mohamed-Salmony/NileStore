# ⚡ دليل النشر السريع - Quick Deploy Guide

## 🎯 الخطوات الأساسية

### 1️⃣ Supabase Setup (5 دقائق)
```bash
1. إنشاء مشروع جديد على supabase.com
2. تنفيذ جميع ملفات SQL من مجلد server/
3. إنشاء Bucket: "NileStore-Files" (Public)
4. إنشاء مستخدم Admin مع role: "admin"
5. نسخ المفاتيح من Settings > API
```

### 2️⃣ Railway Setup - Backend (3 دقائق)
```bash
1. ربط GitHub repo على railway.app
2. Root Directory: server
3. إضافة Environment Variables:
   - PORT=4000
   - NODE_ENV=production
   - SUPABASE_URL=...
   - SUPABASE_ANON_KEY=...
   - SUPABASE_SERVICE_ROLE_KEY=...
   - SUPABASE_JWT_SECRET=...
   - SUPABASE_BUCKET=NileStore-Files
4. Generate Domain
5. نسخ الرابط: https://xxx.railway.app
```

### 3️⃣ Vercel Setup - Frontend (3 دقائق)
```bash
1. Import GitHub repo على vercel.com
2. Root Directory: client
3. Framework: Next.js
4. إضافة Environment Variables:
   - NEXT_PUBLIC_SUPABASE_URL=...
   - NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   - NEXT_PUBLIC_API_URL=https://xxx.railway.app/api
5. Deploy
```

---

## 📋 Checklist

### Supabase
- [ ] مشروع جديد تم إنشاؤه
- [ ] جميع SQL schemas تم تنفيذها (11 ملف)
- [ ] Bucket "NileStore-Files" تم إنشاؤه (Public)
- [ ] مستخدم Admin تم إنشاؤه
- [ ] المفاتيح تم نسخها (URL, ANON_KEY, SERVICE_KEY, JWT_SECRET)

### Railway (Backend)
- [ ] Repository تم ربطه
- [ ] Root Directory = server
- [ ] Environment Variables تم إضافتها (6 متغيرات)
- [ ] Domain تم إنشاؤه
- [ ] Backend يعمل: https://xxx.railway.app/api/health

### Vercel (Frontend)
- [ ] Repository تم ربطه
- [ ] Root Directory = client
- [ ] Environment Variables تم إضافتها (3 متغيرات)
- [ ] Frontend يعمل: https://xxx.vercel.app
- [ ] الاتصال بـ Backend يعمل

---

## 🔗 الروابط المهمة

| الخدمة | الرابط |
|--------|--------|
| **Supabase Dashboard** | https://supabase.com/dashboard |
| **Railway Dashboard** | https://railway.app/dashboard |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **GitHub Repo** | https://github.com/Mohamed-Salmony/NileStore |

---

## 🚨 المتغيرات المطلوبة

### Railway (Backend)
```env
PORT=4000
NODE_ENV=production
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=xxx
SUPABASE_BUCKET=NileStore-Files
```

### Vercel (Frontend)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://xxx.railway.app/api
```

---

## ✅ اختبار سريع

```bash
# 1. Backend Health Check
curl https://your-app.railway.app/api/health

# 2. Get Products
curl https://your-app.railway.app/api/products

# 3. Frontend
افتح: https://your-app.vercel.app
```

---

## 🔧 حل المشاكل السريع

| المشكلة | الحل |
|---------|------|
| Backend لا يعمل | تحقق من Logs في Railway + Environment Variables |
| Frontend لا يتصل | تحقق من NEXT_PUBLIC_API_URL (يجب أن ينتهي بـ /api) |
| CORS Error | أضف رابط Vercel في server/src/app.ts |
| الصور لا تظهر | تأكد من أن Bucket عام (Public) |

---

## 📖 للتفاصيل الكاملة

راجع: [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

---

<div align="center">

### 🎉 وقت النشر الإجمالي: ~15 دقيقة

</div>
