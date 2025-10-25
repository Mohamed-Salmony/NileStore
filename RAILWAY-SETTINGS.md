# ⚙️ إعدادات Railway - نسخ ولصق مباشر

## 📍 Root Directory
```
server
```

## 🔧 Environment Variables

انسخ والصق في Railway Variables:

```env
PORT=4000
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_JWT_SECRET=your-jwt-secret-here
SUPABASE_BUCKET=NileStore-Files
```

## 📝 كيفية الحصول على القيم من Supabase:

1. اذهب إلى: https://supabase.com/dashboard
2. اختر مشروعك
3. **Settings** > **API**

### SUPABASE_URL
```
انسخ: Project URL
مثال: https://abcdefghijklmnop.supabase.co
```

### SUPABASE_ANON_KEY
```
انسخ: Project API keys > anon public
مثال: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### SUPABASE_SERVICE_ROLE_KEY
```
انسخ: Project API keys > service_role
⚠️ احفظه في مكان آمن - لا تشاركه أبداً
مثال: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### SUPABASE_JWT_SECRET
```
انسخ: JWT Settings > JWT Secret
مثال: your-super-secret-jwt-token-with-at-least-32-characters-long
```

### SUPABASE_BUCKET
```
اسم Bucket الذي أنشأته في Supabase Storage
القيمة: NileStore-Files
```

## 🎯 Watch Paths (اختياري)

```
server/**
```

## ✅ بعد الإعداد

1. انقر على **Deploy**
2. انتظر حتى ينتهي البناء
3. اذهب إلى **Settings** > **Networking**
4. انقر على **Generate Domain**
5. احفظ الرابط لاستخدامه في Vercel

## 🔍 اختبار

افتح في المتصفح:
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

---

## 🚨 ملاحظات مهمة

- ✅ تأكد من نسخ جميع المتغيرات بشكل صحيح
- ✅ لا تترك مسافات زائدة
- ✅ لا تضع علامات اقتباس حول القيم
- ✅ `SUPABASE_SERVICE_ROLE_KEY` حساس جداً - لا تشاركه
- ✅ `SUPABASE_BUCKET` يجب أن يطابق اسم Bucket في Supabase تماماً
