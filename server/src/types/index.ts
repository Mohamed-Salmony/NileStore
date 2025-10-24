// Database types for e-commerce
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  description_en?: string;
  image_url?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  description_en?: string;
  specifications?: Record<string, string>;
  specifications_en?: Record<string, string>;
  price: number;
  compare_at_price?: number;
  cost_per_item?: number;
  sku?: string;
  barcode?: string;
  quantity: number;
  track_quantity: boolean;
  category_id?: string;
  images: string[];
  featured_image?: string;
  status: 'active' | 'draft' | 'archived';
  tags?: string[];
  weight?: number;
  dimensions?: { length?: number; width?: number; height?: number };
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  total_amount: number;
  subtotal: number;
  tax?: number;
  shipping_cost?: number;
  discount?: number;
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}
