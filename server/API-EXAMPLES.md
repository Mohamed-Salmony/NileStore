# API Usage Examples

## Authentication

### Get Access Token (Frontend)
```javascript
// Using Supabase client in your Next.js app
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

const accessToken = data.session?.access_token
```

### Make Authenticated Request
```javascript
const response = await fetch('http://localhost:4000/api/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
```

## Categories

### List All Categories
```bash
curl http://localhost:4000/api/categories
```

### Create Category (Admin)
```bash
curl -X POST http://localhost:4000/api/categories \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "slug": "electronics",
    "description": "Electronic devices and accessories"
  }'
```

## Products

### List Products with Filters
```bash
# All products
curl http://localhost:4000/api/products

# Filter by category
curl "http://localhost:4000/api/products?category_id=uuid-here"

# Search
curl "http://localhost:4000/api/products?search=phone"

# Pagination
curl "http://localhost:4000/api/products?limit=20&offset=0"
```

### Create Product (Admin)
```bash
curl -X POST http://localhost:4000/api/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "description": "Latest iPhone model",
    "price": 999.99,
    "compare_at_price": 1099.99,
    "quantity": 50,
    "track_quantity": true,
    "category_id": "category-uuid",
    "images": ["https://...", "https://..."],
    "featured_image": "https://...",
    "status": "active",
    "tags": ["smartphone", "apple", "5g"]
  }'
```

### Update Product (Admin)
```bash
curl -X PUT http://localhost:4000/api/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 899.99,
    "quantity": 45
  }'
```

## Cart

### Get User's Cart
```bash
curl http://localhost:4000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Add to Cart
```bash
curl -X POST http://localhost:4000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "product-uuid",
    "quantity": 2
  }'
```

### Update Cart Item
```bash
curl -X PUT http://localhost:4000/api/cart/CART_ITEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 3
  }'
```

### Remove from Cart
```bash
curl -X DELETE http://localhost:4000/api/cart/CART_ITEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Clear Cart
```bash
curl -X DELETE http://localhost:4000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Orders

### Create Order
```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product_id": "product-uuid-1",
        "quantity": 2
      },
      {
        "product_id": "product-uuid-2",
        "quantity": 1
      }
    ],
    "shipping_address": {
      "full_name": "Ahmed Mohamed",
      "phone": "+201234567890",
      "address_line1": "123 Main St",
      "city": "Cairo",
      "country": "Egypt"
    },
    "shipping_cost": 50,
    "tax": 15,
    "discount": 0
  }'
```

### Get User Orders
```bash
curl http://localhost:4000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Order by ID
```bash
curl http://localhost:4000/api/orders/ORDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Order Status (Admin)
```bash
curl -X PATCH http://localhost:4000/api/orders/ORDER_ID/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "payment_status": "paid"
  }'
```

## Storage

### Upload File
```bash
curl -X POST http://localhost:4000/api/storage/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "path=products/image.jpg"
```

### Get Signed Upload URL (Client Direct Upload)
```bash
# 1. Get signed URL
curl -X POST http://localhost:4000/api/storage/sign-upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "path": "products/my-image.jpg"
  }'

# Response: { "path": "...", "signedUrl": "...", "token": "..." }

# 2. Upload directly to Supabase
curl -X PUT "SIGNED_URL" \
  -H "Content-Type: image/jpeg" \
  --data-binary @/path/to/image.jpg
```

### Get Signed Download URL
```bash
curl "http://localhost:4000/api/storage/sign-download?path=products/image.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend Integration (Next.js Example)

### Create Product with Image Upload
```typescript
// components/admin/CreateProduct.tsx
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function CreateProduct() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const file = formData.get('image') as File
    
    // Get access token
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    // Upload image
    const uploadForm = new FormData()
    uploadForm.append('file', file)
    
    const uploadRes = await fetch('http://localhost:4000/api/storage/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: uploadForm
    })
    const { signedUrl } = await uploadRes.json()

    // Create product
    const productRes = await fetch('http://localhost:4000/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formData.get('name'),
        slug: formData.get('slug'),
        price: parseFloat(formData.get('price') as string),
        quantity: parseInt(formData.get('quantity') as string),
        featured_image: signedUrl,
        images: [signedUrl],
        status: 'active'
      })
    })

    const product = await productRes.json()
    console.log('Product created:', product)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Product Name" required />
      <input name="slug" placeholder="product-slug" required />
      <input name="price" type="number" step="0.01" required />
      <input name="quantity" type="number" required />
      <input name="image" type="file" accept="image/*" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  )
}
```

### Add to Cart
```typescript
// components/ProductCard.tsx
const addToCart = async (productId: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  const res = await fetch('http://localhost:4000/api/cart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      product_id: productId,
      quantity: 1
    })
  })
  
  if (res.ok) {
    alert('Added to cart!')
  }
}
```

### Checkout Flow
```typescript
// components/Checkout.tsx
const checkout = async (cartItems: any[], shippingAddress: any) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  const items = cartItems.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity
  }))
  
  const res = await fetch('http://localhost:4000/api/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items,
      shipping_address: shippingAddress,
      shipping_cost: 50,
      tax: 15
    })
  })
  
  const order = await res.json()
  console.log('Order created:', order)
  // Redirect to order confirmation page
}
```
