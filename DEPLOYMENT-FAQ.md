# ❓ الأسئلة الشائعة - Deployment FAQ

## 📋 عام

### س: كم يستغرق النشر؟
**ج:** حوالي 15 دقيقة إذا اتبعت `QUICK-DEPLOY.md`.

### س: هل النشر مجاني؟
**ج:** نعم! جميع الخدمات المستخدمة لها خطط مجانية:
- **Supabase**: مجاني (500MB database, 1GB storage)
- **Railway**: $5 credit شهرياً مجاني
- **Vercel**: مجاني تماماً (100GB bandwidth)

### س: هل أحتاج بطاقة ائتمان؟
**ج:** 
- **Supabase**: لا
- **Railway**: لا (للخطة المجانية)
- **Vercel**: لا

### س: ما هي المتطلبات؟
**ج:**
- حساب GitHub
- حساب Supabase
- حساب Railway
- حساب Vercel
- المشروع مرفوع على GitHub

---

## 🗄️ Supabase

### س: كيف أحصل على مفاتيح Supabase؟
**ج:**
1. اذهب إلى https://supabase.com/dashboard
2. اختر مشروعك
3. **Settings** > **API**
4. انسخ المفاتيح من هناك

### س: ما الفرق بين anon key و service_role key؟
**ج:**
- **anon key**: للاستخدام العام (Frontend)، محدود الصلاحيات
- **service_role key**: للاستخدام الخاص (Backend)، صلاحيات كاملة ⚠️

### س: لماذا الصور لا تظهر؟
**ج:**
1. تأكد من أن Bucket عام (Public)
2. تحقق من Storage Policies
3. تأكد من `SUPABASE_BUCKET=NileStore-Files`

### س: كيف أنشئ مستخدم Admin؟
**ج:**
1. **Authentication** > **Users** > **Add User**
2. أدخل البريد وكلمة المرور
3. في **App Metadata** أضف: `{"role": "admin"}`

### س: نسيت تنفيذ SQL schema، ماذا أفعل؟
**ج:**
1. اذهب إلى **SQL Editor**
2. نفذ الملف الناقص
3. لا مشكلة في تنفيذها بأي ترتيب (لكن الترتيب الموصى به أفضل)

---

## 🚂 Railway

### س: لماذا Build فشل؟
**ج:** الأسباب الشائعة:
1. Root Directory غير صحيح (يجب أن يكون `server`)
2. ملفات `railway.json` أو `nixpacks.toml` غير موجودة
3. TypeScript errors
4. Dependencies ناقصة

**الحل**: تحقق من Build Logs

### س: لماذا Deploy فشل؟
**ج:** الأسباب الشائعة:
1. Environment Variables ناقصة
2. Supabase credentials خاطئة
3. PORT غير صحيح

**الحل**: تحقق من Deploy Logs

### س: كيف أحصل على رابط Backend؟
**ج:**
1. **Settings** > **Networking**
2. **Generate Domain**
3. انسخ الرابط

### س: هل يمكنني استخدام Custom Domain؟
**ج:** نعم، في الخطط المدفوعة.

### س: كيف أراقب الأداء؟
**ج:** اذهب إلى **Metrics** في Railway Dashboard.

### س: كيف أعيد النشر؟
**ج:**
- **تلقائياً**: اعمل push إلى GitHub
- **يدوياً**: **Deployments** > **Redeploy**

---

## ⚡ Vercel

### س: لماذا Build فشل؟
**ج:** الأسباب الشائعة:
1. Root Directory غير صحيح (يجب أن يكون `client`)
2. TypeScript errors
3. Environment Variables ناقصة
4. Next.js configuration خاطئة

**الحل**: تحقق من Build Logs

### س: لماذا Frontend لا يتصل بـ Backend؟
**ج:**
1. تحقق من `NEXT_PUBLIC_API_URL`
2. تأكد من إضافة `/api` في النهاية
3. تحقق من CORS في Backend
4. تأكد من أن Backend يعمل

### س: كيف أضيف Custom Domain؟
**ج:**
1. **Settings** > **Domains** > **Add**
2. أدخل domain الخاص بك
3. اتبع تعليمات DNS

### س: ما هو NEXT_PUBLIC_؟
**ج:** أي متغير يبدأ بـ `NEXT_PUBLIC_` يكون متاحاً في المتصفح (Client-side).

### س: كيف أحدث Environment Variables؟
**ج:**
1. **Settings** > **Environment Variables**
2. عدّل المتغير
3. **Save**
4. **Deployments** > **Redeploy**

---

## 🔗 الربط والتكامل

### س: ما هو CORS Error؟
**ج:** خطأ يحدث عندما Frontend يحاول الاتصال بـ Backend من domain مختلف.

**الحل**:
```typescript
// في server/src/app.ts
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app'
  ],
  credentials: true
}));
```

### س: كيف أتأكد من أن Frontend يتصل بـ Backend؟
**ج:**
1. افتح Developer Tools (F12)
2. **Network** tab
3. تصفح المنتجات
4. تحقق من أن الطلبات تذهب إلى Railway URL

### س: لماذا تظهر رسالة "Failed to fetch"؟
**ج:**
1. Backend لا يعمل
2. CORS error
3. `NEXT_PUBLIC_API_URL` خاطئ
4. Network issue

---

## 🔐 الأمان

### س: هل Environment Variables آمنة؟
**ج:** نعم، Railway و Vercel يشفرونها ولا تظهر في Logs.

### س: أين أحفظ المفاتيح؟
**ج:**
- **محلياً**: في ملف `.env` (لا ترفعه على GitHub)
- **Production**: في Environment Variables على Railway/Vercel

### س: ماذا لو تسربت المفاتيح؟
**ج:**
1. اذهب إلى Supabase Dashboard
2. **Settings** > **API**
3. **Reset** المفاتيح
4. حدّث Environment Variables في Railway و Vercel

### س: هل يجب استخدام HTTPS؟
**ج:** نعم، Railway و Vercel يوفرون HTTPS تلقائياً.

---

## 💰 التكلفة

### س: ما هي حدود الخطة المجانية؟

**Supabase**:
- 500MB Database
- 1GB Storage
- 2GB Bandwidth

**Railway**:
- $5 credit شهرياً
- ~500 ساعة تشغيل
- 100GB Bandwidth

**Vercel**:
- Unlimited deployments
- 100GB Bandwidth
- 100 Build Hours

### س: ماذا يحدث إذا تجاوزت الحدود؟
**ج:**
- **Supabase**: المشروع يتوقف حتى الشهر القادم
- **Railway**: يتوقف حتى تضيف رصيد
- **Vercel**: يتوقف حتى الشهر القادم

### س: كم تكلفة الخطط المدفوعة؟
**ج:**
- **Supabase Pro**: $25/شهر
- **Railway Hobby**: $5/شهر
- **Vercel Pro**: $20/شهر

---

## 🔧 المشاكل الشائعة

### س: "Module not found" error
**ج:**
```bash
# حذف node_modules وإعادة التثبيت
rm -rf node_modules package-lock.json
npm install
```

### س: "Port already in use"
**ج:**
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID [PID] /F

# Linux/Mac
lsof -i :4000
kill -9 [PID]
```

### س: TypeScript errors
**ج:**
```bash
# إعادة بناء TypeScript
npm run build
```

### س: "Cannot read property of undefined"
**ج:**
1. تحقق من Environment Variables
2. تأكد من أن Backend يعمل
3. راجع الكود للتأكد من وجود البيانات

---

## 📊 الأداء

### س: كيف أحسّن الأداء؟
**ج:**
1. استخدم Image Optimization في Next.js
2. فعّل Caching
3. استخدم CDN للصور
4. قلل حجم Bundle

### س: الموقع بطيء، ماذا أفعل؟
**ج:**
1. تحقق من **Speed Insights** في Vercel
2. راجع **Metrics** في Railway
3. حسّن الصور
4. قلل API calls

### س: كيف أراقب الأداء؟
**ج:**
- **Vercel**: Analytics & Speed Insights
- **Railway**: Metrics
- **Supabase**: Database Reports

---

## 🔄 التحديثات

### س: كيف أحدّث المشروع؟
**ج:**
```bash
git add .
git commit -m "Update"
git push origin main
```
Railway و Vercel سيعيدان النشر تلقائياً.

### س: كيف أعمل Rollback؟
**ج:**
- **Railway**: **Deployments** > اختر deployment سابق > **Redeploy**
- **Vercel**: **Deployments** > اختر deployment سابق > **Promote to Production**

### س: هل يمكنني اختبار قبل النشر؟
**ج:** نعم:
```bash
# محلياً
npm run build
npm start

# Preview deployment في Vercel
vercel
```

---

## 📱 Mobile & Testing

### س: كيف أختبر على الموبايل؟
**ج:**
1. احصل على IP المحلي
2. افتح `http://[your-ip]:3000` على الموبايل
3. تأكد من أنكما على نفس الشبكة

### س: كيف أختبر API؟
**ج:**
```bash
# استخدم cURL
curl https://your-railway-app.railway.app/api/products

# أو Postman
# أو Thunder Client في VS Code
```

---

## 🎯 Best Practices

### س: ما هي أفضل الممارسات؟
**ج:**
1. ✅ استخدم Environment Variables دائماً
2. ✅ لا تشارك Service Role Key
3. ✅ فعّل HTTPS
4. ✅ استخدم CORS بشكل صحيح
5. ✅ راجع Logs بانتظام
6. ✅ اعمل Backup للبيانات
7. ✅ اختبر قبل النشر

### س: كيف أحافظ على الأمان؟
**ج:**
1. لا تضع secrets في الكود
2. استخدم `.gitignore` بشكل صحيح
3. حدّث Dependencies بانتظام
4. استخدم `npm audit`
5. فعّل Row Level Security في Supabase

---

## 📞 الدعم

### س: أين أجد المساعدة؟
**ج:**
- **Railway**: https://discord.gg/railway
- **Vercel**: https://vercel.com/support
- **Supabase**: https://supabase.com/docs

### س: كيف أبلغ عن مشكلة؟
**ج:**
1. تحقق من Logs
2. راجع Documentation
3. ابحث في GitHub Issues
4. اتصل بالدعم

---

<div align="center">

### 💡 لم تجد إجابتك؟

راجع الأدلة المفصلة:
- [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)
- [RAILWAY-DEPLOY.md](./server/RAILWAY-DEPLOY.md)
- [VERCEL-DEPLOY.md](./client/VERCEL-DEPLOY.md)

Made with ❤️ by Mohamed Salmony

</div>
