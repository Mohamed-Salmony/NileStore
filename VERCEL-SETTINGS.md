# ⚙️ إعدادات Vercel - نسخ ولصق مباشر

## 📍 Root Directory
```
client
```

## 🎨 Framework Preset
```
Next.js
```

## 🔧 Environment Variables

انسخ والصق في Vercel Environment Variables:

### المتغير الأول
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co
```

### المتغير الثاني
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: your-anon-key-here
```

### المتغير الثالث
```
Name: NEXT_PUBLIC_API_URL
Value: https://your-railway-app.railway.app/api
```

⚠️ **مهم جداً**: لا تنسى `/api` في نهاية `NEXT_PUBLIC_API_URL`

---

## 📝 كيفية الحصول على القيم:

### NEXT_PUBLIC_SUPABASE_URL
```
من Supabase Dashboard:
Settings > API > Project URL
مثال: https://abcdefghijklmnop.supabase.co
```

### NEXT_PUBLIC_SUPABASE_ANON_KEY
```
من Supabase Dashboard:
Settings > API > Project API keys > anon public
مثال: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### NEXT_PUBLIC_API_URL
```
من Railway Dashboard:
Settings > Networking > Domain
ثم أضف /api في النهاية
مثال: https://nilestore-production.up.railway.app/api
```

---

## 🏗️ Build Settings

اترك الإعدادات الافتراضية:

```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

---

## ✅ بعد الإعداد

1. انقر على **Deploy**
2. انتظر حتى ينتهي البناء (2-5 دقائق)
3. افتح الرابط الذي يظهر
4. تحقق من أن الموقع يعمل

---

## 🔍 اختبار

### 1. افتح الموقع
```
https://your-app.vercel.app
```

### 2. افتح Developer Tools (F12)
```
Console > تحقق من عدم وجود أخطاء
Network > تحقق من أن الطلبات تذهب إلى Railway
```

### 3. جرب المميزات
- [ ] تصفح المنتجات
- [ ] تسجيل الدخول
- [ ] إضافة منتج للسلة

---

## 🚨 ملاحظات مهمة

- ✅ جميع المتغيرات يجب أن تبدأ بـ `NEXT_PUBLIC_`
- ✅ لا تنسى `/api` في نهاية `NEXT_PUBLIC_API_URL`
- ✅ تأكد من أن Backend يعمل على Railway أولاً
- ✅ إذا عدلت Environment Variables، اعمل **Redeploy**

---

## 🔧 إذا واجهت مشكلة CORS

عدّل في `server/src/app.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app'  // أضف رابط Vercel هنا
  ],
  credentials: true
}));
```

ثم اعمل commit و push:
```bash
git add .
git commit -m "Update CORS for Vercel"
git push origin main
```

Railway سيعيد النشر تلقائياً.
