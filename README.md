<div align="center">

# 🛍️ NileStore

### متجر إلكتروني متكامل | Full-Featured E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.58-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[العربية](#ar) | [English](#en)

</div>

---

<a name="ar"></a>

## 📋 نظرة عامة

**NileStore** هو منصة تجارة إلكترونية حديثة ومتكاملة مبنية بأحدث التقنيات. يوفر تجربة تسوق سلسة للمستخدمين ولوحة تحكم شاملة للإدارة.

### ✨ المميزات الرئيسية

#### 🛒 للمستخدمين
- **تصفح ذكي**: استعراض المنتجات بواجهة عصرية وسريعة
- **نظام سلة متقدم**: إدارة المشتريات بسهولة مع حفظ تلقائي
- **عروض خاصة**: صفحة مخصصة لعرض المنتجات المخفضة
- **تتبع الطلبات**: متابعة حالة الطلبات لحظياً
- **قائمة الأمنيات**: حفظ المنتجات المفضلة
- **دعم فني**: نظام تذاكر الدعم المتكامل
- **إشعارات فورية**: تنبيهات للعروض والطلبات
- **دعم لغتين**: العربية والإنجليزية مع تبديل سلس

#### 👨‍💼 للإدارة
- **لوحة تحكم شاملة**: إدارة كاملة للمتجر
- **إدارة المنتجات**: إضافة، تعديل، وحذف المنتجات
- **إدارة الطلبات**: متابعة ومعالجة الطلبات
- **إدارة المستخدمين**: عرض وإدارة حسابات العملاء
- **التحليلات**: إحصائيات مفصلة عن المبيعات والأداء
- **الكوبونات**: إنشاء وإدارة رموز الخصم
- **المحافظات**: إدارة مناطق الشحن والأسعار
- **النشرة البريدية**: إدارة المشتركين
- **الدعم الفني**: الرد على استفسارات العملاء

### 🏗️ البنية التقنية

#### Frontend (Client)
```
Next.js 14.2 + TypeScript + TailwindCSS
├── React 18.3
├── Radix UI Components
├── Framer Motion (Animations)
├── React Query (State Management)
├── i18next (Internationalization)
├── Zod (Validation)
└── Lucide Icons
```

#### Backend (Server)
```
Express.js + TypeScript + Supabase
├── JWT Authentication
├── Role-Based Access Control
├── Rate Limiting
├── File Upload (Multer)
├── Compression & Security (Helmet)
└── RESTful API
```

#### Database & Storage
```
Supabase (PostgreSQL)
├── Row Level Security (RLS)
├── Real-time Subscriptions
├── Storage Buckets
└── Auth Management
```

---

## 🚀 البدء السريع

### المتطلبات الأساسية

- **Node.js** 18+ و **npm**
- حساب **Supabase** (مجاني)
- **Git**

### 1️⃣ استنساخ المشروع

```bash
git clone https://github.com/yourusername/NileStore.git
cd NileStore
```

### 2️⃣ إعداد قاعدة البيانات (Supabase)

1. أنشئ مشروع جديد في [Supabase](https://supabase.com)
2. افتح **SQL Editor** ونفذ الملفات التالية بالترتيب:

```bash
server/supabase-schema.sql                    # الجداول الأساسية
server/governorates-payment-schema.sql        # المحافظات والشحن
server/coupons-promotions-schema.sql          # الكوبونات والعروض
server/wishlist-schema.sql                    # قائمة الأمنيات
server/support-tickets-schema.sql             # الدعم الفني
server/newsletter-contact-schema.sql          # النشرة البريدية
server/notifications-schema.sql               # الإشعارات
server/add-bilingual-support.sql              # دعم اللغتين
server/add-video-url-column.sql               # فيديوهات المنتجات
server/add-coupon-code-to-orders.sql          # ربط الكوبونات بالطلبات
server/add-support-notifications.sql          # إشعارات الدعم
```

3. أنشئ Storage Bucket:
   - اسم الـ Bucket: `NileStore-Files`
   - الوضع: **Private**
   - السماحيات: حسب الملف `supabase-schema.sql`

4. أنشئ مستخدم Admin:
   - اذهب إلى **Authentication > Users**
   - أنشئ مستخدم جديد
   - في **App Metadata** أضف:
   ```json
   {"role": "admin"}
   ```

### 3️⃣ إعداد Backend

```bash
cd server
npm install

# أنشئ ملف .env
cp .env.example .env
```

عدّل ملف `.env`:
```env
PORT=5000
NODE_ENV=development

# من Supabase Dashboard > Settings > API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

شغّل السيرفر:
```bash
npm run dev        # Development
# أو
npm run build      # Build
npm start          # Production
```

### 4️⃣ إعداد Frontend

```bash
cd client
npm install

# أنشئ ملف .env.local
cp .env.example .env.local
```

عدّل ملف `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

شغّل التطبيق:
```bash
npm run dev        # Development على http://localhost:3000
# أو
npm run build      # Build
npm start          # Production
```

---

## 📁 هيكل المشروع

```
NileStore/
├── client/                          # Frontend (Next.js)
│   ├── public/                      # الملفات الثابتة
│   ├── src/
│   │   ├── app/                     # صفحات Next.js 14 (App Router)
│   │   │   ├── admin/              # لوحة التحكم
│   │   │   ├── cart/               # السلة
│   │   │   ├── checkout/           # إتمام الطلب
│   │   │   ├── product/            # تفاصيل المنتج
│   │   │   ├── offers/             # العروض الخاصة
│   │   │   └── ...
│   │   ├── components/             # المكونات المشتركة
│   │   │   ├── ui/                 # مكونات Radix UI
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ...
│   │   ├── contexts/               # React Contexts
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/                  # Custom Hooks
│   │   ├── lib/                    # المكتبات والأدوات
│   │   │   ├── supabase.ts
│   │   │   └── api.ts
│   │   └── middleware.ts           # Next.js Middleware (حماية الصفحات)
│   ├── package.json
│   └── tailwind.config.ts
│
├── server/                          # Backend (Express)
│   ├── src/
│   │   ├── config/                 # الإعدادات
│   │   ├── controllers/            # Business Logic
│   │   ├── middleware/             # Auth, Validation, Errors
│   │   ├── routes/                 # API Routes
│   │   ├── schemas/                # Zod Schemas
│   │   ├── types/                  # TypeScript Types
│   │   ├── utils/                  # Helper Functions
│   │   ├── app.ts                  # Express App
│   │   └── index.ts                # Entry Point
│   ├── *.sql                       # Database Schemas
│   ├── package.json
│   └── ecosystem.config.js         # PM2 Config
│
└── README.md                        # هذا الملف
```

---

## 🔐 المصادقة والصلاحيات

### نظام الأدوار

| الدور | الصلاحيات |
|------|-----------|
| **Guest** | تصفح المنتجات، التسجيل |
| **User** | الشراء، السلة، قائمة الأمنيات، الطلبات، الدعم |
| **Admin** | كل صلاحيات User + إدارة المتجر الكاملة |

### حماية الصفحات (Middleware)

```typescript
// الصفحات المحمية
/admin/*          → Admin فقط
/cart/*           → Users مسجلين
/checkout/*       → Users مسجلين
/profile/*        → Users مسجلين

// الصفحات العامة
/, /product/*, /categories, /offers  → الجميع
```

---

## 🎨 الواجهة والتصميم

### المكونات الرئيسية

- **shadcn/ui**: مكتبة مكونات حديثة
- **Radix UI**: مكونات accessible
- **TailwindCSS**: تصميم responsive
- **Framer Motion**: حركات سلسة
- **Lucide Icons**: أيقونات عصرية

### الثيمات

- **Light Mode**: وضع النهار
- **Dark Mode**: وضع الليل (قريباً)
- **RTL Support**: دعم كامل للعربية

---

## 🔌 API Reference

### نقاط النهاية الرئيسية

#### المصادقة
```
GET  /api/me                    # بيانات المستخدم الحالي
GET  /api/admin/users           # قائمة المستخدمين (Admin)
```

#### المنتجات
```
GET    /api/products            # قائمة المنتجات (مع فلاتر)
GET    /api/products/:id        # تفاصيل منتج
POST   /api/products            # إضافة منتج (Admin)
PUT    /api/products/:id        # تعديل منتج (Admin)
DELETE /api/products/:id        # حذف منتج (Admin)
```

#### السلة
```
GET    /api/cart                # عرض السلة
POST   /api/cart                # إضافة للسلة
PUT    /api/cart/:id            # تحديث الكمية
DELETE /api/cart/:id            # حذف من السلة
DELETE /api/cart                # إفراغ السلة
```

#### الطلبات
```
GET    /api/orders              # قائمة الطلبات
GET    /api/orders/:id          # تفاصيل طلب
POST   /api/orders              # إنشاء طلب
PATCH  /api/orders/:id/status   # تحديث حالة (Admin)
```

📖 **للتوثيق الكامل**: راجع `server/COMPLETE-API-REFERENCE.md`

---

## 🧪 الاختبار

### اختبار المميزات الأساسية

```bash
# 1. تسجيل دخول كمستخدم عادي
# 2. أضف منتجات للسلة
# 3. أتمم عملية شراء
# 4. تتبع الطلب

# 5. سجل دخول كـ Admin
# 6. أضف منتج جديد
# 7. عدّل حالة طلب
# 8. راجع الإحصائيات
```

---

## 🚢 النشر (Deployment)

### Backend (Server)

#### Vercel / Railway / Render
```bash
cd server
npm run build

# متغيرات البيئة المطلوبة:
# PORT, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
```

#### VPS (مع PM2)
```bash
npm install -g pm2
cd server
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

📖 **للتفاصيل**: راجع `server/DEPLOYMENT.md`

### Frontend (Client)

#### Vercel (موصى به)
```bash
cd client
vercel deploy --prod

# متغيرات البيئة:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# NEXT_PUBLIC_API_URL
```

#### Netlify
```bash
cd client
npm run build
netlify deploy --prod --dir=.next
```

---

## 📚 الوثائق الإضافية

| الملف | الوصف |
|------|-------|
| `server/README.md` | دليل Backend |
| `server/COMPLETE-API-REFERENCE.md` | توثيق API الكامل |
| `server/API-EXAMPLES.md` | أمثلة استخدام API |
| `server/DEPLOYMENT.md` | دليل النشر |
| `server/ADMIN-SETUP.md` | إعداد Admin |
| `server/CREATE-ADMIN-USER.md` | إنشاء مستخدم Admin |
| `client/AUTH-SETUP.md` | إعداد المصادقة |
| `client/FEATURES-SUMMARY.md` | ملخص المميزات |

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **Next.js 14** - React Framework
- **TypeScript** - Type Safety
- **TailwindCSS** - Styling
- **Radix UI** - UI Components
- **React Query** - Data Fetching
- **Framer Motion** - Animations
- **i18next** - Internationalization
- **Zod** - Validation

### Backend
- **Express.js** - Web Framework
- **TypeScript** - Type Safety
- **Supabase** - Database & Auth
- **Multer** - File Upload
- **Helmet** - Security
- **Morgan** - Logging
- **Rate Limit** - API Protection

### Database
- **PostgreSQL** (via Supabase)
- **Row Level Security**
- **Real-time Subscriptions**

### DevOps
- **PM2** - Process Manager
- **Git** - Version Control
- **ESLint** - Code Quality

---

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. أنشئ branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للـ branch (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

---

## 📄 الترخيص

هذا المشروع مرخص تحت **MIT License** - راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

## 👨‍💻 المطور

**Mohamed Salmony**

- GitHub: [@Mohamed-Salmony](https://github.com/Mohamed-Salmony)
- Email: your.email@example.com

---

## 🙏 شكر وتقدير

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [TailwindCSS](https://tailwindcss.com/)

---

<div align="center">

### ⭐ إذا أعجبك المشروع، لا تنسى إعطائه نجمة!

Made with ❤️ in Egypt

</div>

---

<a name="en"></a>

## 📋 Overview (English)

**NileStore** is a modern, full-featured e-commerce platform built with cutting-edge technologies. It provides a seamless shopping experience for users and a comprehensive admin dashboard.

### ✨ Key Features

#### 🛒 For Users
- **Smart Browsing**: Modern and fast product browsing
- **Advanced Cart**: Easy shopping management with auto-save
- **Special Offers**: Dedicated page for discounted products
- **Order Tracking**: Real-time order status updates
- **Wishlist**: Save favorite products
- **Support System**: Integrated ticket support
- **Real-time Notifications**: Alerts for offers and orders
- **Bilingual**: Arabic and English with smooth switching

#### 👨‍💼 For Admins
- **Comprehensive Dashboard**: Full store management
- **Product Management**: Add, edit, and delete products
- **Order Management**: Track and process orders
- **User Management**: View and manage customer accounts
- **Analytics**: Detailed sales and performance statistics
- **Coupons**: Create and manage discount codes
- **Governorates**: Manage shipping areas and prices
- **Newsletter**: Manage subscribers
- **Support**: Respond to customer inquiries

### 🚀 Quick Start

See the Arabic section above for detailed setup instructions.

### 📖 Documentation

All documentation files are available in the project:
- Backend: `server/README.md`
- API Reference: `server/COMPLETE-API-REFERENCE.md`
- Deployment: `server/DEPLOYMENT.md`
- Features: `client/FEATURES-SUMMARY.md`

---

<div align="center">

**[⬆ Back to Top](#top)**

</div>