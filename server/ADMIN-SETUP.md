# إعداد حساب الأدمن

## 🔐 طريقة 1: إنشاء أدمن من Supabase Dashboard (الأسهل)

### الخطوات:

#### 1. اذهب إلى Supabase Dashboard
```
https://supabase.com/dashboard/project/dmyaveumdljmodeomtff
```

#### 2. اذهب إلى Authentication → Users
```
Authentication > Users
```

#### 3. أنشئ مستخدم جديد
- اضغط **"Add user"** أو **"Invite user"**
- أدخل:
  - **Email**: `admin@nilestore.com` (أو أي إيميل تريده)
  - **Password**: كلمة مرور قوية
- اضغط **"Create user"**

#### 4. تعيين صلاحيات Admin
- ابحث عن المستخدم الذي أنشأته
- اضغط على المستخدم
- اذهب إلى **"Raw user meta data"** أو **"App metadata"**
- أضف:
```json
{
  "role": "admin"
}
```
- احفظ التغييرات ✅

#### 5. تأكيد البريد الإلكتروني (إذا لزم الأمر)
- في نفس صفحة المستخدم
- ابحث عن **"Email confirmed"**
- فعّله (Enable) ✅

---

## 🔐 طريقة 2: إنشاء أدمن من الكود

### إضافة endpoint لإنشاء أدمن (للتطوير فقط)

#### في `server/src/routes/index.ts`:
```typescript
import { supabaseAdmin } from '../config/supabase';

// إنشاء أدمن (احذف هذا في الإنتاج!)
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    
    // إنشاء المستخدم
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // تأكيد البريد تلقائياً
      user_metadata: {
        full_name,
      },
      app_metadata: {
        role: 'admin', // تعيين صلاحيات admin
      },
    });

    if (createError) throw createError;

    res.json({ 
      message: 'Admin created successfully',
      user: {
        id: user.user.id,
        email: user.user.email,
        role: 'admin',
      }
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
```

#### استخدام Endpoint:
```bash
curl -X POST http://localhost:4000/api/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nilestore.com",
    "password": "Admin@123456",
    "full_name": "Admin User"
  }'
```

**⚠️ مهم:** احذف هذا الـ endpoint قبل النشر للإنتاج!

---

## 🔐 طريقة 3: باستخدام SQL مباشرة

### في Supabase SQL Editor:

```sql
-- إنشاء مستخدم أدمن
-- ملاحظة: يجب إنشاء المستخدم أولاً من Authentication UI
-- ثم تشغيل هذا الكود لتحديث app_metadata

-- استبدل 'USER_ID_HERE' بـ ID المستخدم الفعلي
UPDATE auth.users
SET 
  raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  ),
  email_confirmed_at = NOW()
WHERE email = 'admin@nilestore.com';
```

---

## ✅ التحقق من صلاحيات Admin

### 1. من الفرونت اند:
```typescript
import { isAdmin } from '@/lib/supabase';

const checkAdmin = async () => {
  const admin = await isAdmin();
  console.log('Is admin:', admin);
};
```

### 2. من الباك اند:
```bash
# تسجيل دخول كأدمن
curl -X POST http://localhost:4000/api/users/me \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# يجب أن يرجع:
{
  "user": {
    "id": "...",
    "email": "admin@nilestore.com",
    "role": "admin"
  }
}
```

### 3. اختبار endpoints الأدمن:
```bash
# قائمة المستخدمين (admin only)
curl http://localhost:4000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Dashboard analytics (admin only)
curl http://localhost:4000/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 🎯 حسابات Admin الموصى بها

### للتطوير:
```
Email: admin@nilestore.com
Password: Admin@123456
Role: admin
```

### للإنتاج:
```
Email: your-real-email@domain.com
Password: كلمة مرور قوية جداً (20+ حرف)
Role: admin
2FA: مفعّل (إذا أمكن)
```

---

## 🔒 أمان حساب الأدمن

### 1. كلمة مرور قوية:
- ✅ 20+ حرف
- ✅ أحرف كبيرة وصغيرة
- ✅ أرقام ورموز
- ✅ لا تستخدم كلمات معروفة

### 2. Two-Factor Authentication (2FA):
```
Supabase Dashboard > Authentication > Settings > Enable 2FA
```

### 3. تقييد الوصول:
- ✅ استخدم IP whitelist إذا أمكن
- ✅ راقب محاولات تسجيل الدخول الفاشلة
- ✅ غيّر كلمة المرور بانتظام

### 4. Audit Logs:
```sql
-- تتبع نشاط الأدمن
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📋 Endpoints الأدمن المتاحة

### إدارة المستخدمين:
- `GET /api/users` - قائمة جميع المستخدمين
- `PATCH /api/users/:id/role` - تغيير صلاحيات مستخدم
- `DELETE /api/users/:id` - حذف مستخدم

### إدارة المنتجات:
- `POST /api/products` - إضافة منتج
- `PUT /api/products/:id` - تعديل منتج
- `DELETE /api/products/:id` - حذف منتج

### إدارة التصنيفات:
- `POST /api/categories` - إضافة تصنيف
- `PUT /api/categories/:id` - تعديل تصنيف
- `DELETE /api/categories/:id` - حذف تصنيف

### إدارة الطلبات:
- `PATCH /api/orders/:id/status` - تحديث حالة طلب

### التحليلات:
- `GET /api/analytics/dashboard` - إحصائيات Dashboard
- `GET /api/analytics/sales` - تقارير المبيعات
- `GET /api/analytics/top-products` - أكثر المنتجات مبيعاً

---

## ✅ الخلاصة

1. ✅ أنشئ حساب أدمن من Supabase Dashboard
2. ✅ عيّن `app_metadata.role = "admin"`
3. ✅ أكّد البريد الإلكتروني
4. ✅ سجل دخول واختبر الصلاحيات
5. ✅ استخدم كلمة مرور قوية
6. ✅ فعّل 2FA للإنتاج

**حساب الأدمن جاهز! 🎉**
