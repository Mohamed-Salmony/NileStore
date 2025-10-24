# Nile Essence Server

Production-ready Express + TypeScript e-commerce API with Supabase backend.

## Features
- ✅ **Auth**: Admin/User roles via Supabase JWT
- ✅ **E-commerce**: Products, Categories, Cart, Orders
- ✅ **Storage**: Image/video upload with signed URLs
- ✅ **Performance**: Compression, rate limiting, graceful shutdown
- ✅ **Security**: Helmet, CORS, input validation
- ✅ **Low-resource optimized**: Works on 256MB RAM servers

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase
1. Run `supabase-schema.sql` in Supabase SQL Editor
2. Create storage bucket: `NileStore-Files` (private)
3. Set user roles in Dashboard > Auth > Users > App Metadata:
   ```json
   {"role": "admin"}
   ```

### 3. Configure Environment
`.env` file already created with your credentials.

### 4. Run Development
```bash
npm run dev
```

### 5. Build & Deploy
```bash
npm run build
npm start
```
See `DEPLOYMENT.md` for production setup with PM2.

## API Endpoints

### Auth & Users
- `GET /health` - Health check
- `GET /api/me` - Current user (auth required)
- `GET /api/admin/users` - List all users (admin only)

### Categories
- `GET /api/categories` - List all
- `GET /api/categories/:id` - Get one
- `POST /api/categories` - Create (admin)
- `PUT /api/categories/:id` - Update (admin)
- `DELETE /api/categories/:id` - Delete (admin)

### Products
- `GET /api/products?category_id=&status=&search=&limit=&offset=` - List with filters
- `GET /api/products/:id` - Get one
- `POST /api/products` - Create (admin)
- `PUT /api/products/:id` - Update (admin)
- `DELETE /api/products/:id` - Delete (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item `{product_id, quantity}`
- `PUT /api/cart/:id` - Update quantity `{quantity}`
- `DELETE /api/cart/:id` - Remove item
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders?status=&limit=&offset=` - List orders
- `GET /api/orders/:id` - Get order with items
- `POST /api/orders` - Create order `{items[], shipping_address, ...}`
- `PATCH /api/orders/:id/status` - Update status (admin) `{status, payment_status}`

### Storage
- `POST /api/storage/upload` - Upload file (multipart/form-data)
- `POST /api/storage/sign-upload` - Get signed upload URL `{path?}`
- `GET /api/storage/sign-download?path=` - Get signed download URL

## Authentication
All protected routes require:
```
Authorization: Bearer <supabase_access_token>
```

## Database Schema
See `supabase-schema.sql` for complete schema with RLS policies.

## Performance
- Compression: Gzip level 6
- Rate limit: 100 req/15min (production)
- Body limit: 2MB
- Graceful shutdown with 10s timeout
- PM2 auto-restart on memory >200MB

## Project Structure
```
server/
├── src/
│   ├── config/              # Env & Supabase clients
│   ├── controllers/         # Business logic
│   │   ├── analyticsController.ts
│   │   ├── cartController.ts
│   │   ├── categoryController.ts
│   │   ├── orderController.ts
│   │   ├── productController.ts
│   │   └── userController.ts
│   ├── middleware/          # Auth, validation, errors, cache
│   │   ├── auth.ts
│   │   ├── cache.ts
│   │   ├── errorHandler.ts
│   │   └── validate.ts
│   ├── routes/              # API routes
│   │   ├── analytics.ts
│   │   ├── cart.ts
│   │   ├── categories.ts
│   │   ├── index.ts
│   │   ├── orders.ts
│   │   ├── products.ts
│   │   ├── storage.ts
│   │   └── users.ts
│   ├── schemas/             # Zod validation schemas
│   │   └── validation.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Helper functions
│   │   ├── helpers.ts
│   │   └── logger.ts
│   ├── app.ts               # Express app
│   └── index.ts             # Server entry
├── .env                     # Environment variables
├── supabase-schema.sql      # Database schema
├── ecosystem.config.js      # PM2 config
├── README.md                # This file
├── DEPLOYMENT.md            # Production guide
├── API-EXAMPLES.md          # API usage examples
└── COMPLETE-API-REFERENCE.md # Full API documentation
```

## Documentation Files
- **README.md** - Quick start guide (this file)
- **COMPLETE-API-REFERENCE.md** - Complete API documentation with all endpoints
- **API-EXAMPLES.md** - Code examples for frontend integration
- **DEPLOYMENT.md** - Production deployment guide
- **INTEGRATION-GUIDE.md** - Frontend integration guide (in project root)
