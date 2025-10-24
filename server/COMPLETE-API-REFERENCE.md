# Complete API Reference - Nile Essence Backend

## Base URL
```
Development: http://localhost:4000
Production: https://your-domain.com
```

## Authentication
All protected endpoints require Bearer token:
```
Authorization: Bearer <supabase_access_token>
```

---

## 📊 Analytics (Admin Only)

### Get Dashboard Stats
```http
GET /api/analytics/dashboard
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "stats": {
    "totalProducts": 150,
    "totalOrders": 45,
    "totalRevenue": "125000.50",
    "pendingOrders": 5
  },
  "lowStockProducts": [
    {
      "id": "uuid",
      "name": "Product Name",
      "quantity": 3
    }
  ],
  "recentOrders": [...]
}
```

### Get Sales Report
```http
GET /api/analytics/sales?start_date=2025-01-01&end_date=2025-12-31
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "sales": [...],
  "summary": {
    "totalSales": "125000.50",
    "orderCount": 45,
    "averageOrderValue": "2777.79"
  }
}
```

### Get Top Products
```http
GET /api/analytics/top-products
Authorization: Bearer <admin_token>
```

---

## 👥 Users

### Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user",
    "profile": {
      "full_name": "Ahmed Mohamed",
      "phone": "+201234567890",
      "avatar_url": "https://..."
    }
  }
}
```

### Update User Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Ahmed Mohamed",
  "phone": "+201234567890",
  "avatar_url": "https://..."
}
```

### Get All Users (Admin)
```http
GET /api/users?limit=50&offset=0
Authorization: Bearer <admin_token>
```

### Update User Role (Admin)
```http
PATCH /api/users/:id/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "admin"
}
```

### Delete User (Admin)
```http
DELETE /api/users/:id
Authorization: Bearer <admin_token>
```

---

## 📁 Categories

### List All Categories
```http
GET /api/categories
```
**Cached for 10 minutes**

**Response:**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices",
      "image_url": "https://...",
      "parent_id": null,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Get Category by ID
```http
GET /api/categories/:id
```
**Cached for 10 minutes**

### Create Category (Admin)
```http
POST /api/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Electronics",
  "slug": "electronics",
  "description": "Electronic devices and accessories",
  "image_url": "https://...",
  "parent_id": "uuid" // optional
}
```

**Validation:**
- `name`: required, min 1 char
- `slug`: required, min 1 char, unique
- `description`: optional
- `image_url`: optional, must be valid URL
- `parent_id`: optional, must be valid UUID

### Update Category (Admin)
```http
PUT /api/categories/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

### Delete Category (Admin)
```http
DELETE /api/categories/:id
Authorization: Bearer <admin_token>
```

---

## 🛍️ Products

### List Products
```http
GET /api/products?category_id=uuid&status=active&search=phone&limit=20&offset=0
```
**Cached for 5 minutes**

**Query Parameters:**
- `category_id`: Filter by category UUID
- `status`: Filter by status (active, draft, archived)
- `search`: Search in product name
- `limit`: Results per page (default: 50, max: 100)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "description": "Latest iPhone",
      "price": 999.99,
      "compare_at_price": 1099.99,
      "cost_per_item": 700.00,
      "sku": "IPH15PRO",
      "barcode": "123456789",
      "quantity": 50,
      "track_quantity": true,
      "category_id": "uuid",
      "images": ["https://...", "https://..."],
      "featured_image": "https://...",
      "status": "active",
      "tags": ["smartphone", "apple"],
      "weight": 0.2,
      "dimensions": {
        "length": 15,
        "width": 7,
        "height": 0.8
      },
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z",
      "created_by": "uuid",
      "categories": {
        "name": "Electronics"
      }
    }
  ],
  "total": 150
}
```

### Get Product by ID
```http
GET /api/products/:id
```
**Cached for 5 minutes**

### Create Product (Admin)
```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "slug": "iphone-15-pro",
  "description": "Latest iPhone model",
  "price": 999.99,
  "compare_at_price": 1099.99,
  "cost_per_item": 700.00,
  "sku": "IPH15PRO",
  "barcode": "123456789",
  "quantity": 50,
  "track_quantity": true,
  "category_id": "uuid",
  "images": ["https://...", "https://..."],
  "featured_image": "https://...",
  "status": "active",
  "tags": ["smartphone", "apple", "5g"],
  "weight": 0.2,
  "dimensions": {
    "length": 15,
    "width": 7,
    "height": 0.8
  }
}
```

**Validation:**
- `name`: required, min 1 char
- `slug`: required, min 1 char, unique
- `price`: required, must be positive number
- `quantity`: integer, min 0, default 0
- `status`: enum (active, draft, archived), default draft
- All other fields optional

**Clears cache on success**

### Update Product (Admin)
```http
PUT /api/products/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "price": 899.99,
  "quantity": 45,
  "status": "active"
}
```

**Clears cache on success**

### Delete Product (Admin)
```http
DELETE /api/products/:id
Authorization: Bearer <admin_token>
```

**Clears cache on success**

---

## 🛒 Cart

### Get User's Cart
```http
GET /api/cart
Authorization: Bearer <token>
```

**Response:**
```json
{
  "cart": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "product_id": "uuid",
      "quantity": 2,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z",
      "products": {
        "id": "uuid",
        "name": "iPhone 15 Pro",
        "price": 999.99,
        "featured_image": "https://...",
        "quantity": 50
      }
    }
  ]
}
```

### Add to Cart
```http
POST /api/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": "uuid",
  "quantity": 2
}
```

**Validation:**
- `product_id`: required, must be valid UUID
- `quantity`: required, must be positive integer

**Note:** If product already in cart, quantity will be added to existing quantity.

### Update Cart Item
```http
PUT /api/cart/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

**Validation:**
- `quantity`: required, must be positive integer

### Remove from Cart
```http
DELETE /api/cart/:id
Authorization: Bearer <token>
```

### Clear Cart
```http
DELETE /api/cart
Authorization: Bearer <token>
```

---

## 📦 Orders

### List Orders
```http
GET /api/orders?status=pending&limit=20&offset=0
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Filter by status (pending, confirmed, processing, shipped, delivered, cancelled)
- `limit`: Results per page (default: 50)
- `offset`: Pagination offset (default: 0)

**Note:** Users see only their orders, admins see all orders.

**Response:**
```json
{
  "orders": [
    {
      "id": "uuid",
      "order_number": "ORD-1735987200000-1234",
      "user_id": "uuid",
      "status": "pending",
      "payment_status": "pending",
      "total_amount": 2149.98,
      "subtotal": 1999.98,
      "tax": 100.00,
      "shipping_cost": 50.00,
      "discount": 0.00,
      "shipping_address": {
        "full_name": "Ahmed Mohamed",
        "phone": "+201234567890",
        "address_line1": "123 Main St",
        "city": "Cairo",
        "country": "Egypt"
      },
      "billing_address": null,
      "notes": "Please deliver in the morning",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 45
}
```

### Get Order by ID
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

**Response includes order items:**
```json
{
  "order": {
    "id": "uuid",
    "order_number": "ORD-1735987200000-1234",
    "...": "...",
    "order_items": [
      {
        "id": "uuid",
        "order_id": "uuid",
        "product_id": "uuid",
        "product_name": "iPhone 15 Pro",
        "product_image": "https://...",
        "quantity": 2,
        "price": 999.99,
        "total": 1999.98
      }
    ]
  }
}
```

### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2
    },
    {
      "product_id": "uuid",
      "quantity": 1
    }
  ],
  "shipping_address": {
    "full_name": "Ahmed Mohamed",
    "phone": "+201234567890",
    "address_line1": "123 Main St",
    "address_line2": "Apt 4B",
    "city": "Cairo",
    "state": "Cairo Governorate",
    "postal_code": "11511",
    "country": "Egypt"
  },
  "billing_address": {
    "full_name": "Ahmed Mohamed",
    "phone": "+201234567890",
    "address_line1": "123 Main St",
    "city": "Cairo",
    "country": "Egypt"
  },
  "notes": "Please deliver in the morning",
  "shipping_cost": 50.00,
  "tax": 100.00,
  "discount": 0.00
}
```

**Validation:**
- `items`: required, array with at least 1 item
  - `product_id`: required, valid UUID
  - `quantity`: required, positive integer
- `shipping_address`: required object
  - `full_name`: required
  - `phone`: required
  - `address_line1`: required
  - `city`: required
  - `country`: required
- `billing_address`: optional, same structure as shipping_address
- `notes`: optional
- `shipping_cost`, `tax`, `discount`: optional, non-negative numbers

**Process:**
1. Validates all products exist and calculates totals
2. Creates order with status "pending" and payment_status "pending"
3. Creates order_items records
4. Clears user's cart
5. Returns created order

### Update Order Status (Admin)
```http
PATCH /api/orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped",
  "payment_status": "paid"
}
```

**Validation:**
- `status`: optional, enum (pending, confirmed, processing, shipped, delivered, cancelled)
- `payment_status`: optional, enum (pending, paid, failed, refunded)

---

## 📤 Storage

### Upload File
```http
POST /api/storage/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>
path: "products/image.jpg" (optional)
```

**Limits:**
- Max file size: 50MB
- File name is sanitized automatically

**Response:**
```json
{
  "path": "user-uuid/1735987200000_image.jpg",
  "signedUrl": "https://...?token=..."
}
```

**Signed URL expires in 1 hour**

### Get Signed Upload URL
```http
POST /api/storage/sign-upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "path": "products/my-image.jpg"
}
```

**Response:**
```json
{
  "path": "products/my-image.jpg",
  "signedUrl": "https://...?token=...",
  "token": "..."
}
```

**Usage:**
```bash
# Upload file directly to Supabase using signed URL
curl -X PUT "<signedUrl>" \
  -H "Content-Type: image/jpeg" \
  --data-binary @image.jpg
```

### Get Signed Download URL
```http
GET /api/storage/sign-download?path=products/image.jpg
Authorization: Bearer <token>
```

**Response:**
```json
{
  "path": "products/image.jpg",
  "signedUrl": "https://...?token=..."
}
```

**Signed URL expires in 1 hour**

---

## ⚡ Performance Features

### Caching
- **Categories**: Cached for 10 minutes
- **Products**: Cached for 5 minutes
- Cache automatically cleared on create/update/delete operations
- In-memory cache (no Redis needed for low-resource servers)

### Rate Limiting (Production Only)
- 100 requests per 15 minutes per IP
- Applied to all `/api/*` routes
- Returns 429 status when limit exceeded

### Compression
- Gzip compression for responses >1KB
- Level 6 compression (balanced speed/size)

### Security
- Helmet.js security headers
- CORS enabled
- Body size limited to 2MB
- File uploads limited to 50MB

---

## 🚨 Error Responses

### Validation Error (400)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": "body.price",
      "message": "Price must be positive"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "error": "Missing Bearer token"
}
```

### Forbidden (403)
```json
{
  "error": "Admin only"
}
```

### Not Found (404)
```json
{
  "error": "Not found"
}
```

### Server Error (500)
```json
{
  "error": "Internal server error",
  "message": "Detailed error message (dev only)",
  "stack": "Stack trace (dev only)"
}
```

---

## 📝 Notes

1. **All timestamps** are in ISO 8601 format (UTC)
2. **All prices** are in decimal format (e.g., 999.99)
3. **UUIDs** are version 4 UUIDs
4. **Pagination** uses limit/offset pattern
5. **Caching** is automatic for GET requests
6. **File uploads** sanitize filenames automatically
7. **Order numbers** are auto-generated: `ORD-{timestamp}-{random}`
