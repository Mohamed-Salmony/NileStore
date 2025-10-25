# 💻 أوامر النشر السريعة - Quick Deployment Commands

## 🔗 الروابط المهمة

```
Supabase Dashboard: https://supabase.com/dashboard
Railway Dashboard:  https://railway.app/dashboard
Vercel Dashboard:   https://vercel.com/dashboard
GitHub Repo:        https://github.com/Mohamed-Salmony/NileStore
```

---

## 📋 Environment Variables - نسخ ولصق

### Railway (Backend)
```env
PORT=4000
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-here
SUPABASE_BUCKET=NileStore-Files
```

### Vercel (Frontend)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app/api
```

---

## 🧪 أوامر الاختبار

### اختبار Backend (Railway)
```bash
# Health Check
curl https://your-app.railway.app/health

# API Health Check
curl https://your-app.railway.app/api/health

# Get Products
curl https://your-app.railway.app/api/products

# Get Categories
curl https://your-app.railway.app/api/categories
```

### اختبار Frontend (Vercel)
```bash
# افتح في المتصفح
https://your-app.vercel.app

# اختبار صفحات محددة
https://your-app.vercel.app/products
https://your-app.vercel.app/categories
https://your-app.vercel.app/offers
```

---

## 🔧 أوامر Git

### Push للنشر التلقائي
```bash
# إضافة جميع التغييرات
git add .

# Commit مع رسالة
git commit -m "Update: description of changes"

# Push إلى GitHub
git push origin main

# Railway و Vercel سيعيدان النشر تلقائياً
```

### إنشاء Branch جديد
```bash
# إنشاء branch للتطوير
git checkout -b feature/new-feature

# Push الـ branch
git push origin feature/new-feature

# Merge بعد الانتهاء
git checkout main
git merge feature/new-feature
git push origin main
```

---

## 🏗️ أوامر Build المحلية

### Backend (Server)
```bash
# الانتقال لمجلد server
cd server

# تثبيت Dependencies
npm install

# Build TypeScript
npm run build

# تشغيل في Development
npm run dev

# تشغيل في Production
npm start
```

### Frontend (Client)
```bash
# الانتقال لمجلد client
cd client

# تثبيت Dependencies
npm install

# Build للإنتاج
npm run build

# تشغيل في Development
npm run dev

# تشغيل Production build
npm start

# Preview
npm run preview
```

---

## 🔍 أوامر التحقق

### التحقق من TypeScript
```bash
# Backend
cd server
npx tsc --noEmit

# Frontend
cd client
npx tsc --noEmit
```

### التحقق من ESLint
```bash
# Frontend
cd client
npm run lint
```

### التحقق من Dependencies
```bash
# Backend
cd server
npm outdated

# Frontend
cd client
npm outdated
```

---

## 📊 أوامر المراقبة

### Railway Logs
```bash
# في Railway Dashboard:
# Deployments > View Logs

# أو استخدم Railway CLI:
railway logs
```

### Vercel Logs
```bash
# في Vercel Dashboard:
# Deployments > View Function Logs

# أو استخدم Vercel CLI:
vercel logs
```

---

## 🔄 أوامر إعادة النشر

### Railway
```bash
# في Railway Dashboard:
# Deployments > Redeploy

# أو استخدم Railway CLI:
railway up
```

### Vercel
```bash
# في Vercel Dashboard:
# Deployments > Redeploy

# أو استخدم Vercel CLI:
vercel --prod
```

---

## 🗄️ أوامر قاعدة البيانات (Supabase)

### الاتصال بـ Database
```bash
# في Supabase Dashboard:
# Database > Connection String

# مثال باستخدام psql:
psql "postgresql://postgres:[password]@[host]:5432/postgres"
```

### تنفيذ SQL
```bash
# في Supabase Dashboard:
# SQL Editor > New Query

# أو استخدم Supabase CLI:
supabase db push
```

---

## 🧹 أوامر التنظيف

### تنظيف node_modules
```bash
# Backend
cd server
rm -rf node_modules
npm install

# Frontend
cd client
rm -rf node_modules
npm install
```

### تنظيف Build Files
```bash
# Backend
cd server
rm -rf dist

# Frontend
cd client
rm -rf .next
rm -rf out
```

---

## 🔐 أوامر الأمان

### فحص الثغرات
```bash
# Backend
cd server
npm audit

# إصلاح تلقائي
npm audit fix

# Frontend
cd client
npm audit
npm audit fix
```

### تحديث Dependencies
```bash
# Backend
cd server
npm update

# Frontend
cd client
npm update
```

---

## 📦 أوامر Package Management

### إضافة Package جديد
```bash
# Backend
cd server
npm install package-name

# Frontend
cd client
npm install package-name
```

### إزالة Package
```bash
# Backend
cd server
npm uninstall package-name

# Frontend
cd client
npm uninstall package-name
```

---

## 🎯 أوامر سريعة للمشاكل الشائعة

### مشكلة: Port مستخدم
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID [PID] /F

# Linux/Mac
lsof -i :4000
kill -9 [PID]
```

### مشكلة: Cache مشاكل
```bash
# Backend
cd server
rm -rf node_modules package-lock.json
npm install

# Frontend
cd client
rm -rf node_modules .next package-lock.json
npm install
```

### مشكلة: TypeScript Errors
```bash
# إعادة بناء TypeScript
cd server
npm run build

cd client
npm run build
```

---

## 🌐 أوامر CORS Testing

### اختبار CORS من المتصفح
```javascript
// افتح Console في المتصفح (F12)
fetch('https://your-railway-app.railway.app/api/products')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### اختبار CORS من cURL
```bash
curl -H "Origin: https://your-vercel-app.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-railway-app.railway.app/api/products
```

---

## 📱 أوامر Mobile Testing

### اختبار على الشبكة المحلية
```bash
# احصل على IP المحلي
# Windows
ipconfig

# Linux/Mac
ifconfig

# ثم افتح على الموبايل:
http://[your-local-ip]:3000
```

---

## 🎉 أوامر النشر الكامل

### نشر كل شيء دفعة واحدة
```bash
# 1. Commit التغييرات
git add .
git commit -m "Deploy: full update"
git push origin main

# 2. Railway سيعيد النشر تلقائياً
# 3. Vercel سيعيد النشر تلقائياً

# 4. تحقق من النشر
curl https://your-railway-app.railway.app/api/health
curl https://your-vercel-app.vercel.app
```

---

## 📞 أوامر المساعدة

### Railway CLI Help
```bash
railway help
railway login
railway link
railway status
```

### Vercel CLI Help
```bash
vercel help
vercel login
vercel link
vercel ls
```

### npm Help
```bash
npm help
npm docs [package-name]
npm repo [package-name]
```

---

<div align="center">

### 💡 نصيحة

احفظ هذا الملف في مكان سهل الوصول للرجوع إليه بسرعة!

Made with ❤️ by Mohamed Salmony

</div>
