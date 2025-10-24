# إعداد نظام المصادقة

## ✅ تم إنشاء الملفات التالية:

### 1. ملفات المصادقة
- ✅ `src/lib/supabase.ts` - Supabase client و auth functions
- ✅ `src/lib/api.ts` - API client للتواصل مع الباك اند
- ✅ `src/app/login/page.tsx` - صفحة تسجيل الدخول
- ✅ `src/app/register/page.tsx` - صفحة إنشاء الحساب
- ✅ `.env.example` - مثال لملف البيئة

---

## 📝 خطوات الإعداد

### 1. تثبيت Supabase Client
```bash
cd client
npm install @supabase/supabase-js
```

### 2. إنشاء ملف `.env.local`
أنشئ ملف `.env.local` في مجلد `client/` وأضف:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dmyaveumdljmodeomtff.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRteWF2ZXVtZGxqbW9kZW9tdGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1Njc2MDMsImV4cCI6MjA3NTE0MzYwM30.A_zxw_rtRv2fF3iEJqWWXtG2IRuXyZ1ere-9EcXHcYg
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. تشغيل الباك اند
```bash
cd server
npm run dev
# يعمل على http://localhost:4000
```

### 4. تشغيل الفرونت اند
```bash
cd client
npm run dev
# يعمل على http://localhost:3000
```

---

## 🎯 المميزات المتاحة

### صفحة تسجيل الدخول (`/login`)
- ✅ تسجيل دخول بالبريد وكلمة المرور
- ✅ رسائل خطأ واضحة
- ✅ Loading state
- ✅ رابط لنسيان كلمة المرور
- ✅ رابط لإنشاء حساب جديد
- ✅ تصميم responsive

### صفحة إنشاء الحساب (`/register`)
- ✅ حقول: الاسم الكامل، البريد، كلمة المرور، تأكيد كلمة المرور
- ✅ Validation للبيانات
- ✅ التحقق من تطابق كلمات المرور
- ✅ حد أدنى 6 أحرف لكلمة المرور
- ✅ رسائل نجاح/خطأ
- ✅ Loading state
- ✅ رابط لتسجيل الدخول
- ✅ تصميم responsive

---

## 🔧 الدوال المتاحة

### في `src/lib/supabase.ts`:
```typescript
// تسجيل دخول
await signIn(email, password)

// إنشاء حساب
await signUp(email, password, fullName)

// تسجيل خروج
await signOut()

// الحصول على المستخدم الحالي
const user = await getCurrentUser()

// الحصول على الجلسة
const session = await getSession()

// إعادة تعيين كلمة المرور
await resetPassword(email)
```

### في `src/lib/api.ts`:
```typescript
// المستخدم
await api.getCurrentUser()
await api.updateProfile({ full_name, phone, avatar_url })

// المنتجات
await api.getProducts({ category_id, search, limit, offset })
await api.getProduct(id)

// التصنيفات
await api.getCategories()

// السلة
await api.getCart()
await api.addToCart(product_id, quantity)
await api.updateCartItem(id, quantity)
await api.removeFromCart(id)
await api.clearCart()

// الطلبات
await api.createOrder(orderData)
await api.getOrders()
await api.getOrder(id)

// رفع الملفات
await api.uploadFile(file, path)
```

---

## 🎨 مكونات UI المستخدمة

الصفحات تستخدم مكونات shadcn/ui الموجودة:
- ✅ `Card` - للبطاقات
- ✅ `Input` - حقول الإدخال
- ✅ `Label` - تسميات الحقول
- ✅ `Button` - الأزرار
- ✅ `toast` (sonner) - الإشعارات
- ✅ Icons من `lucide-react`

---

## 🔐 تدفق المصادقة

### 1. إنشاء حساب:
```
المستخدم يملأ النموذج
  ↓
Validation في الفرونت اند
  ↓
signUp() → Supabase Auth
  ↓
إرسال email تأكيد
  ↓
التوجيه إلى صفحة Login
```

### 2. تسجيل الدخول:
```
المستخدم يدخل البيانات
  ↓
signIn() → Supabase Auth
  ↓
الحصول على access_token
  ↓
تخزين الجلسة
  ↓
التوجيه إلى الصفحة الرئيسية
```

### 3. استخدام API:
```
طلب API
  ↓
getAuthHeaders() → يحصل على access_token
  ↓
إضافة Authorization: Bearer <token>
  ↓
إرسال الطلب للباك اند
  ↓
الباك اند يتحقق من الـ token
  ↓
إرجاع البيانات
```

---

## 🧪 اختبار النظام

### 1. إنشاء حساب جديد:
1. اذهب إلى `http://localhost:3000/register`
2. املأ النموذج
3. اضغط "إنشاء حساب"
4. تحقق من بريدك الإلكتروني (إذا كان Supabase مفعّل email confirmation)

### 2. تسجيل الدخول:
1. اذهب إلى `http://localhost:3000/login`
2. أدخل البريد وكلمة المرور
3. اضغط "تسجيل الدخول"
4. يجب أن يتم توجيهك للصفحة الرئيسية

### 3. اختبار API:
افتح Console في المتصفح وجرب:
```javascript
// الحصول على المستخدم الحالي
const user = await api.getCurrentUser()
console.log(user)

// الحصول على المنتجات
const products = await api.getProducts()
console.log(products)
```

---

## 🚨 استكشاف الأخطاء

### خطأ: "Failed to fetch"
- ✅ تأكد أن الباك اند يعمل على `http://localhost:4000`
- ✅ تحقق من ملف `.env.local`

### خطأ: "Invalid token"
- ✅ تأكد أن Supabase credentials صحيحة
- ✅ تحقق من أن المستخدم مسجل دخول

### خطأ: "User already registered"
- ✅ استخدم بريد إلكتروني مختلف
- ✅ أو سجل دخول بالحساب الموجود

### خطأ: "Email not confirmed"
- ✅ في Supabase Dashboard → Authentication → Settings
- ✅ أوقف "Enable email confirmations" للتطوير

---

## 📱 الخطوات التالية

### 1. إضافة Context للمصادقة:
أنشئ `src/contexts/AuthContext.tsx` لإدارة حالة المستخدم عالمياً

### 2. حماية الصفحات:
أنشئ middleware أو HOC لحماية الصفحات التي تحتاج مصادقة

### 3. صفحة Profile:
استخدم `api.getCurrentUser()` و `api.updateProfile()` لإنشاء صفحة الملف الشخصي

### 4. نسيان كلمة المرور:
أنشئ صفحة `/forgot-password` تستخدم `resetPassword()`

---

## ✅ الملخص

تم إنشاء نظام مصادقة كامل مع:
- ✅ تسجيل دخول وإنشاء حساب
- ✅ ربط كامل مع Supabase Auth
- ✅ ربط كامل مع الباك اند API
- ✅ تصميم احترافي responsive
- ✅ Validation و error handling
- ✅ Loading states
- ✅ Toast notifications

**كل شيء جاهز للاستخدام! 🚀**
