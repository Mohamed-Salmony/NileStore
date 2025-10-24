# How to Create Admin User in Supabase

## Method 1: Using Supabase Dashboard (Recommended)

### Step 1: Create User
1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add User** → **Create new user**
3. Enter:
   - Email: `admin@nilestore.com`
   - Password: (your secure password)
   - Auto Confirm User: ✅ **Yes**

### Step 2: Set Admin Role
1. After creating the user, click on the user in the list
2. Scroll to **User Metadata** section
3. Click **Edit** on **App Metadata**
4. Add this JSON:
```json
{
  "role": "admin"
}
```
5. Click **Save**

---

## Method 2: Using SQL (Alternative)

Run this in **Supabase SQL Editor**:

```sql
-- Create admin user with email and password
-- Replace with your actual email and password
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@nilestore.com', -- Change this
  crypt('YourSecurePassword123!', gen_salt('bf')), -- Change this
  NOW(),
  NOW(),
  NOW(),
  '{"role": "admin"}'::jsonb, -- This sets the admin role
  '{"full_name": "Admin User"}'::jsonb,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

**Note**: This method requires the `pgcrypto` extension:
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

---

## Method 3: Using API Endpoint (For Development)

Your server already has an endpoint for creating admin users:

```bash
POST http://localhost:4000/api/create-admin
Content-Type: application/json

{
  "email": "admin@nilestore.com",
  "password": "YourSecurePassword123!",
  "full_name": "Admin User"
}
```

Using curl:
```bash
curl -X POST http://localhost:4000/api/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nilestore.com",
    "password": "YourSecurePassword123!",
    "full_name": "Admin User"
  }'
```

**⚠️ IMPORTANT**: Delete or protect this endpoint in production!

---

## Verify Admin User

### Check in Supabase Dashboard:
1. Go to **Authentication** → **Users**
2. Click on your admin user
3. Check **App Metadata** → should show `{"role": "admin"}`

### Check via SQL:
```sql
SELECT 
  id,
  email,
  raw_app_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE email = 'admin@nilestore.com';
```

---

## Test Admin Access

### 1. Login as Admin
```bash
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "admin@nilestore.com",
  "password": "YourSecurePassword123!"
}
```

### 2. Get Access Token
Save the `access_token` from the response.

### 3. Test Admin Endpoints
```bash
# Get newsletter subscriptions (admin only)
GET http://localhost:4000/api/newsletter
Authorization: Bearer YOUR_ACCESS_TOKEN

# Get contact messages (admin only)
GET http://localhost:4000/api/contact
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Troubleshooting

### Error: "Admin only"
- Check that `app_metadata.role` is set to `"admin"`
- Verify the JWT token contains the role
- Try logging out and logging in again

### Error: "Invalid token"
- Token may have expired (default: 1 hour)
- Login again to get a new token

### Can't see newsletter/contact data
- Verify RLS policies are created correctly
- Check that you're using the correct access token
- Ensure the server is using `supabaseAdmin` for these operations

---

## Security Best Practices

1. **Use Strong Passwords**: At least 12 characters with mix of letters, numbers, symbols
2. **Limit Admin Users**: Only create admin accounts for trusted team members
3. **Remove Dev Endpoints**: Delete `/api/create-admin` endpoint in production
4. **Enable 2FA**: Consider enabling two-factor authentication for admin accounts
5. **Audit Logs**: Monitor admin actions in production
6. **Rotate Credentials**: Change admin passwords regularly

---

## Next Steps

After creating your admin user:

1. ✅ Test login with admin credentials
2. ✅ Verify access to admin-only endpoints
3. ✅ Test newsletter subscription management
4. ✅ Test contact message management
5. ✅ Build admin dashboard UI (optional)
