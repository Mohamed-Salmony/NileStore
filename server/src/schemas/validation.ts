import { z } from 'zod';

// Category schemas
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().min(1, 'Arabic description is required'),
    description_en: z.string().min(1, 'English description is required'),
    image_url: z.string().optional().or(z.literal('')),
    parent_id: z.string().uuid().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    description: z.string().optional(),
    description_en: z.string().optional(),
    image_url: z.string().optional().or(z.literal('')),
    parent_id: z.string().uuid().optional(),
  }),
});

// Product schemas
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().min(1, 'Arabic description is required'),
    description_en: z.string().min(1, 'English description is required'),
    specifications: z.record(z.string()).optional().default({}),
    specifications_en: z.record(z.string()).optional().default({}),
    price: z.number().positive('Price must be positive'),
    compare_at_price: z.number().positive().nullable().optional(),
    cost_per_item: z.number().positive().nullable().optional(),
    sku: z.string().nullable().optional(),
    barcode: z.string().nullable().optional(),
    quantity: z.number().int().min(0).default(0),
    track_quantity: z.boolean().default(true),
    category_id: z.string().uuid().nullable().optional(),
    images: z.array(z.string().url()).nullable().optional().default([]),
    featured_image: z.string().url().nullable().optional(),
    status: z.enum(['active', 'draft', 'archived']).default('draft'),
    tags: z.array(z.string()).nullable().optional(),
    weight: z.number().positive().nullable().optional(),
    dimensions: z.object({
      length: z.number().positive().optional(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
    }).nullable().optional(),
    video_url: z.string().url().nullable().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    description_en: z.string().nullable().optional(),
    specifications: z.record(z.string()).optional(),
    specifications_en: z.record(z.string()).optional(),
    price: z.number().positive().optional(),
    compare_at_price: z.number().positive().nullable().optional(),
    cost_per_item: z.number().positive().nullable().optional(),
    sku: z.string().nullable().optional(),
    barcode: z.string().nullable().optional(),
    quantity: z.number().int().min(0).optional(),
    track_quantity: z.boolean().optional(),
    category_id: z.string().uuid().nullable().optional(),
    images: z.array(z.string().url()).nullable().optional(),
    featured_image: z.string().url().nullable().optional(),
    status: z.enum(['active', 'draft', 'archived']).optional(),
    tags: z.array(z.string()).nullable().optional(),
    weight: z.number().positive().nullable().optional(),
    dimensions: z.object({
      length: z.number().positive().optional(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
    }).nullable().optional(),
    video_url: z.string().url().nullable().optional(),
  }),
});

// Cart schemas
export const addToCartSchema = z.object({
  body: z.object({
    product_id: z.string().uuid('Invalid product ID'),
    quantity: z.number().int().positive('Quantity must be positive'),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    quantity: z.number().int().positive('Quantity must be positive'),
  }),
});

// Order schemas
export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    ).optional(), // Make items optional since we get from cart
    full_name: z.string().min(1, 'Full name is required'),
    phone: z.string().min(1, 'Phone is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    governorate_id: z.string().uuid('Invalid governorate ID'),
    shipping_address: z.any().optional(),
    billing_address: z.any().optional(),
    notes: z.string().optional(),
    payment_method: z.string().optional(),
    payment_proof_url: z.string().optional().nullable(),
    subtotal: z.number().min(0).optional(),
    shipping_cost: z.number().min(0).optional(),
    tax: z.number().min(0).optional(),
    discount: z.number().min(0).optional(),
    coupon_code: z.string().optional().nullable(),
    total_amount: z.number().min(0).optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
    payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  }),
});

// Storage schemas
export const signUploadSchema = z.object({
  body: z.object({
    path: z.string().optional(),
  }),
});

// Coupon schemas
export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Code is required'),
    description: z.string().nullable().optional(),
    discount_type: z.enum(['percentage', 'fixed']),
    discount_value: z.number().positive('Discount value must be positive'),
    min_purchase_amount: z.number().min(0).nullable().optional(),
    max_discount_amount: z.number().positive().nullable().optional(),
    usage_limit: z.number().int().positive().nullable().optional(),
    valid_from: z.string().nullable().optional(),
    valid_until: z.string().nullable().optional(),
    status: z.enum(['active', 'inactive', 'expired']).default('active'),
  }),
});

export const updateCouponSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    code: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    discount_type: z.enum(['percentage', 'fixed']).optional(),
    discount_value: z.number().positive().optional(),
    min_purchase_amount: z.number().min(0).nullable().optional(),
    max_discount_amount: z.number().positive().nullable().optional(),
    usage_limit: z.number().int().positive().nullable().optional(),
    valid_from: z.string().nullable().optional(),
    valid_until: z.string().nullable().optional(),
    status: z.enum(['active', 'inactive', 'expired']).optional(),
  }),
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Code is required'),
    orderTotal: z.number().positive('Order total must be positive'),
  }),
});

// Promotion schemas
export const createPromotionSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().nullable().optional(),
    promotion_type: z.enum(['featured', 'deal', 'flash_sale']),
    discount_percentage: z.number().min(0).max(100).nullable().optional(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    status: z.enum(['active', 'inactive', 'scheduled', 'expired']).default('active'),
    priority: z.number().int().default(0),
  }),
});

export const updatePromotionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    promotion_type: z.enum(['featured', 'deal', 'flash_sale']).optional(),
    discount_percentage: z.number().min(0).max(100).nullable().optional(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    status: z.enum(['active', 'inactive', 'scheduled', 'expired']).optional(),
    priority: z.number().int().optional(),
  }),
});

export const addProductToPromotionSchema = z.object({
  body: z.object({
    product_id: z.string().uuid('Invalid product ID'),
    custom_price: z.number().positive().nullable().optional(),
  }),
});
