import { supabase } from './supabase';
import { guestCart } from './cart';
import { cartEvents } from './cartEvents';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json',
  };
}

async function isAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

export const api = {
  // Auth & Users
  async getCurrentUser() {
    const res = await fetch(`${API_URL}/api/users/me`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  async updateProfile(data: { full_name?: string; phone?: string; avatar_url?: string; address?: string }) {
    const res = await fetch(`${API_URL}/api/users/me`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  async createUserWelcomeNotification() {
    const res = await fetch(`${API_URL}/api/users/welcome-notification`, {
      method: 'POST',
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to create welcome notification');
    return res.json();
  },

  // Products
  async getProducts(params?: { category_id?: string; search?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/api/products?${query}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProduct(id: string) {
    const res = await fetch(`${API_URL}/api/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_URL}/api/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  // Cart
  async getCart() {
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
      // Return guest cart from localStorage
      const guestCartItems = guestCart.getCart();
      
      // Fetch product details for each cart item
      const cartWithProducts = await Promise.all(
        guestCartItems.map(async (item) => {
          try {
            const productData = await this.getProduct(item.product_id);
            return {
              id: item.product_id,
              product_id: item.product_id,
              quantity: item.quantity,
              products: productData.product, // Use 'products' to match backend format
              product: productData.product   // Keep both for compatibility
            };
          } catch (error) {
            console.error('Failed to fetch product:', error);
            return null;
          }
        })
      );
      
      return { cart: cartWithProducts.filter(item => item !== null) };
    }
    
    const res = await fetch(`${API_URL}/api/cart`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch cart');
    return res.json();
  },

  async addToCart(product_id: string, quantity: number) {
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
      // Add to guest cart in localStorage
      guestCart.addToCart(product_id, quantity);
      return { success: true, message: 'Added to cart' };
    }
    
    const res = await fetch(`${API_URL}/api/cart`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ product_id, quantity }),
    });
    if (!res.ok) throw new Error('Failed to add to cart');
    
    // Emit cart event for authenticated users
    cartEvents.emit();
    
    return res.json();
  },

  async updateCartItem(id: string, quantity: number) {
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
      // Update guest cart item
      guestCart.updateCartItem(id, quantity);
      cartEvents.emit(); // Emit event for guest cart update
      return { success: true };
    }
    
    const res = await fetch(`${API_URL}/api/cart/${id}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) throw new Error('Failed to update cart item');
    
    // Emit cart event for authenticated users
    cartEvents.emit();
    
    return res.json();
  },

  async removeFromCart(id: string) {
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
      // Remove from guest cart
      guestCart.removeFromCart(id);
      cartEvents.emit(); // Emit event for guest cart removal
      return { success: true };
    }
    
    const res = await fetch(`${API_URL}/api/cart/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to remove from cart');
    
    // Emit cart event for authenticated users
    cartEvents.emit();
    
    return res.json();
  },

  async clearCart() {
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
      // Clear guest cart
      guestCart.clearCart();
      cartEvents.emit(); // Emit event for guest cart clear
      return { success: true };
    }
    
    const res = await fetch(`${API_URL}/api/cart`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to clear cart');
    
    // Emit cart event for authenticated users
    cartEvents.emit();
    
    return res.json();
  },

  // Merge guest cart with user cart after login
  async mergeGuestCart() {
    await guestCart.mergeWithUserCart(this.addToCart.bind(this));
  },

  // Orders
  async createOrder(data: any) {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to create order' }));
      throw new Error(errorData.error || 'Failed to create order');
    }
    return res.json();
  },

  async getOrders(params?: { page?: number; limit?: number; status?: string }) {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    const res = await fetch(`${API_URL}/api/orders${query ? `?${query}` : ''}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getAnalytics() {
    const res = await fetch(`${API_URL}/api/analytics/dashboard`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async getOrder(id: string) {
    const res = await fetch(`${API_URL}/api/orders/${id}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  },

  async updateOrderStatus(id: string, data: { status?: string; payment_status?: string }) {
    const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to update order status' }));
      throw new Error(errorData.error || 'Failed to update order status');
    }
    return res.json();
  },

  // Storage
  async uploadFile(file: File, folder?: string) {
    const formData = new FormData();
    formData.append('file', file);
    // Create full path with folder and filename
    if (folder) {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      formData.append('path', `${folder}/${timestamp}_${sanitizedName}`);
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    console.log('Uploading file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      hasSession: !!session
    });

    const res = await fetch(`${API_URL}/api/storage/upload`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${session?.access_token}`
        // Don't set Content-Type, let browser set it with boundary
      },
      body: formData,
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Upload failed:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      throw new Error(errorData.error || 'Failed to upload file');
    }
    
    const result = await res.json();
    console.log('Upload successful:', result);
    return result;
  },

  // Admin - Users Management
  async getAllUsers() {
    const res = await fetch(`${API_URL}/api/users`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async updateUserRole(userId: string, role: 'admin' | 'user') {
    const res = await fetch(`${API_URL}/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error('Failed to update user role');
    return res.json();
  },

  async deleteUser(userId: string) {
    const res = await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return res.json();
  },

  // Admin - Categories Management
  async createCategory(data: { name: string; slug: string; description?: string; image_url?: string; parent_id?: string }) {
    const res = await fetch(`${API_URL}/api/categories`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  async updateCategory(categoryId: string, data: { name?: string; slug?: string; description?: string; image_url?: string; parent_id?: string }) {
    const res = await fetch(`${API_URL}/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  },

  async deleteCategory(categoryId: string) {
    const res = await fetch(`${API_URL}/api/categories/${categoryId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete category');
    return res.json();
  },

  // Admin - Products Management
  async createProduct(data: any) {
    const res = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to create product' }));
      console.error('Create product error:', errorData);
      throw new Error(errorData.message || 'Failed to create product');
    }
    return res.json();
  },

  async updateProduct(productId: string, data: any) {
    const res = await fetch(`${API_URL}/api/products/${productId}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },

  async deleteProduct(productId: string) {
    const res = await fetch(`${API_URL}/api/products/${productId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
  },

  // Admin - Coupons Management
  async getAllCoupons(params?: { status?: string; search?: string }) {
    const queryParams = new URLSearchParams(params as any);
    const res = await fetch(`${API_URL}/api/coupons?${queryParams}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch coupons');
    return res.json();
  },

  async getCouponById(couponId: string) {
    const res = await fetch(`${API_URL}/api/coupons/${couponId}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch coupon');
    return res.json();
  },

  async getCouponUsage(couponId: string) {
    const res = await fetch(`${API_URL}/api/coupons/${couponId}/usage`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch coupon usage');
    return res.json();
  },

  async getCouponStats(couponId: string) {
    const res = await fetch(`${API_URL}/api/coupons/${couponId}/stats`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch coupon stats');
    return res.json();
  },

  async createCoupon(data: any) {
    const res = await fetch(`${API_URL}/api/coupons`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to create coupon' }));
      throw new Error(errorData.message || 'Failed to create coupon');
    }
    return res.json();
  },

  async updateCoupon(couponId: string, data: any) {
    const res = await fetch(`${API_URL}/api/coupons/${couponId}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update coupon');
    return res.json();
  },

  async deleteCoupon(couponId: string) {
    const res = await fetch(`${API_URL}/api/coupons/${couponId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete coupon');
    return res.json();
  },

  async validateCoupon(code: string, orderTotal: number) {
    const res = await fetch(`${API_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ code, orderTotal }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Invalid coupon' }));
      throw new Error(errorData.message || 'Invalid coupon');
    }
    return res.json();
  },

  // Admin - Promotions Management
  async getAllPromotions(params?: { status?: string; type?: string }) {
    const queryParams = new URLSearchParams(params as any);
    const res = await fetch(`${API_URL}/api/promotions?${queryParams}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch promotions');
    return res.json();
  },

  async getPromotionById(promotionId: string) {
    const res = await fetch(`${API_URL}/api/promotions/${promotionId}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch promotion');
    return res.json();
  },

  async getPromotionProducts(promotionId: string) {
    const res = await fetch(`${API_URL}/api/promotions/${promotionId}/products`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch promotion products');
    return res.json();
  },

  async getActivePromotions() {
    const res = await fetch(`${API_URL}/api/promotions/active`);
    if (!res.ok) throw new Error('Failed to fetch active promotions');
    return res.json();
  },

  async createPromotion(data: any) {
    const res = await fetch(`${API_URL}/api/promotions`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to create promotion' }));
      throw new Error(errorData.message || 'Failed to create promotion');
    }
    return res.json();
  },

  async updatePromotion(promotionId: string, data: any) {
    const res = await fetch(`${API_URL}/api/promotions/${promotionId}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update promotion');
    return res.json();
  },

  async deletePromotion(promotionId: string) {
    const res = await fetch(`${API_URL}/api/promotions/${promotionId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete promotion');
    return res.json();
  },

  async addProductToPromotion(promotionId: string, productId: string, customPrice?: number) {
    const res = await fetch(`${API_URL}/api/promotions/${promotionId}/products`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ product_id: productId, custom_price: customPrice }),
    });
    if (!res.ok) throw new Error('Failed to add product to promotion');
    return res.json();
  },

  async removeProductFromPromotion(promotionId: string, productId: string) {
    const res = await fetch(`${API_URL}/api/promotions/${promotionId}/products/${productId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to remove product from promotion');
    return res.json();
  },

  async updatePromotionProduct(promotionId: string, productId: string, customPrice: number) {
    const res = await fetch(`${API_URL}/api/promotions/${promotionId}/products/${productId}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ custom_price: customPrice }),
    });
    if (!res.ok) throw new Error('Failed to update promotion product');
    return res.json();
  },

  // Wishlist
  async getWishlist() {
    const res = await fetch(`${API_URL}/api/wishlist`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch wishlist');
    return res.json();
  },

  async addToWishlist(productId: string) {
    const res = await fetch(`${API_URL}/api/wishlist`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ product_id: productId }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to add to wishlist' }));
      throw new Error(errorData.message || 'Failed to add to wishlist');
    }
    return res.json();
  },

  async removeFromWishlist(productId: string) {
    const res = await fetch(`${API_URL}/api/wishlist/${productId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to remove from wishlist');
    return res.json();
  },

  async checkWishlistStatus(productIds: string[]) {
    const res = await fetch(`${API_URL}/api/wishlist/check`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ product_ids: productIds }),
    });
    if (!res.ok) throw new Error('Failed to check wishlist status');
    return res.json();
  },

  // Governorates
  async getGovernorates() {
    const res = await fetch(`${API_URL}/api/governorates`);
    if (!res.ok) throw new Error('Failed to fetch governorates');
    return res.json();
  },

  async getGovernorateById(id: string) {
    const res = await fetch(`${API_URL}/api/governorates/${id}`);
    if (!res.ok) throw new Error('Failed to fetch governorate');
    return res.json();
  },

  async createGovernorate(data: any) {
    const res = await fetch(`${API_URL}/api/governorates`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create governorate');
    return res.json();
  },

  async updateGovernorate(id: string, data: any) {
    const res = await fetch(`${API_URL}/api/governorates/${id}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update governorate');
    return res.json();
  },

  async deleteGovernorate(id: string) {
    const res = await fetch(`${API_URL}/api/governorates/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete governorate');
    return res.json();
  },

  async bulkUpdateShippingCost(data: { governorate_ids: string[]; shipping_cost: number; is_free_shipping: boolean }) {
    const res = await fetch(`${API_URL}/api/governorates/bulk-update`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update shipping costs');
    return res.json();
  },

  // Payment Methods
  async getPaymentMethods() {
    const res = await fetch(`${API_URL}/api/payment-methods`);
    if (!res.ok) throw new Error('Failed to fetch payment methods');
    return res.json();
  },

  async getPaymentMethodByType(type: string) {
    const res = await fetch(`${API_URL}/api/payment-methods/${type}`);
    if (!res.ok) throw new Error('Failed to fetch payment method');
    return res.json();
  },

  async updatePaymentMethod(type: string, data: any) {
    const res = await fetch(`${API_URL}/api/payment-methods/${type}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update payment method');
    return res.json();
  },

  // Upload Payment Proof
  async uploadPaymentProof(formData: FormData) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${API_URL}/api/upload/payment-proof`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload payment proof');
    return res.json();
  },

  // Newsletter
  async subscribeToNewsletter(email: string) {
    const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to subscribe to newsletter');
    }
    return res.json();
  },

  async unsubscribeFromNewsletter(email: string) {
    const res = await fetch(`${API_URL}/api/newsletter/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Failed to unsubscribe from newsletter');
    return res.json();
  },

  // Contact
  async submitContactMessage(data: { name: string; email: string; subject: string; message: string }) {
    const res = await fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to send contact message');
    }
    return res.json();
  },

  // Admin - Newsletter
  async getAllNewsletterSubscriptions(params?: { status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/api/newsletter?${query}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch newsletter subscriptions');
    return res.json();
  },

  async getNewsletterStats() {
    const res = await fetch(`${API_URL}/api/newsletter/stats`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch newsletter stats');
    return res.json();
  },

  async deleteNewsletterSubscription(id: string) {
    const res = await fetch(`${API_URL}/api/newsletter/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete subscription');
    return res.json();
  },

  // Admin - Contact Messages
  async getAllContactMessages(params?: { status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/api/contact?${query}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch contact messages');
    return res.json();
  },

  async getContactMessage(id: string) {
    const res = await fetch(`${API_URL}/api/contact/${id}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch contact message');
    return res.json();
  },

  async updateContactMessageStatus(id: string, data: { status?: string; admin_notes?: string }) {
    const res = await fetch(`${API_URL}/api/contact/${id}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update contact message');
    return res.json();
  },

  async deleteContactMessage(id: string) {
    const res = await fetch(`${API_URL}/api/contact/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete contact message');
    return res.json();
  },

  async getContactMessageStats() {
    const res = await fetch(`${API_URL}/api/contact/stats`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch contact message stats');
    return res.json();
  },

  // Notifications
  async getMyNotifications(params?: { page?: number; limit?: number; unread_only?: boolean }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/api/notifications/my?${query}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async getUnreadNotificationsCount() {
    const res = await fetch(`${API_URL}/api/notifications/unread-count`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch unread count');
    return res.json();
  },

  async markNotificationAsRead(id: string) {
    const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    return res.json();
  },

  async markAllNotificationsAsRead() {
    const res = await fetch(`${API_URL}/api/notifications/read-all`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to mark all notifications as read');
    return res.json();
  },

  async deleteNotification(id: string) {
    const res = await fetch(`${API_URL}/api/notifications/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete notification');
    return res.json();
  },

  // Admin - Notifications
  async createNotification(data: {
    user_id?: string;
    user_ids?: string[];
    type: string;
    title_ar: string;
    title_en: string;
    message_ar: string;
    message_en: string;
    data?: any;
  }) {
    const res = await fetch(`${API_URL}/api/notifications`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create notification');
    return res.json();
  },

  async sendNotificationToAll(data: {
    type: string;
    title_ar: string;
    title_en: string;
    message_ar: string;
    message_en: string;
    data?: any;
  }) {
    const res = await fetch(`${API_URL}/api/notifications/send-all`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to send notifications');
    return res.json();
  },

  async getAllNotifications(params?: { page?: number; limit?: number; user_id?: string; type?: string; is_read?: boolean }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/api/notifications/all?${query}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch all notifications');
    return res.json();
  },

  async adminDeleteNotification(id: string) {
    const res = await fetch(`${API_URL}/api/notifications/admin/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete notification');
    return res.json();
  },

  // Support Tickets
  async createSupportTicket(data: { subject: string; message: string; category?: string; priority?: string }) {
    const res = await fetch(`${API_URL}/api/support-tickets`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create support ticket');
    return res.json();
  },

  async getMyTickets(params?: { status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/api/support-tickets/my?${query}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch tickets');
    return res.json();
  },

  // Alias for getMyTickets
  async getUserTickets(params?: { status?: string; page?: number; limit?: number }) {
    return this.getMyTickets(params);
  },

  async getTicketDetails(id: string) {
    const res = await fetch(`${API_URL}/api/support-tickets/${id}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch ticket details');
    return res.json();
  },

  async addTicketMessage(id: string, message: string) {
    const res = await fetch(`${API_URL}/api/support-tickets/${id}/messages`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  // Admin - Support Tickets
  async getAllSupportTickets(params?: { status?: string; priority?: string; category?: string; assigned_to?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/api/support-tickets/admin/all?${query}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch tickets');
    return res.json();
  },

  async getTicketStats() {
    const res = await fetch(`${API_URL}/api/support-tickets/admin/stats`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch ticket stats');
    return res.json();
  },

  async adminGetTicketDetails(id: string) {
    const res = await fetch(`${API_URL}/api/support-tickets/admin/${id}`, {
      headers: await getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch ticket details');
    return res.json();
  },

  async adminReplyToTicket(id: string, data: { message: string; is_internal?: boolean }) {
    const res = await fetch(`${API_URL}/api/support-tickets/admin/${id}/reply`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to send reply');
    return res.json();
  },

  async updateSupportTicket(id: string, data: { status?: string; priority?: string; category?: string; assigned_to?: string }) {
    const res = await fetch(`${API_URL}/api/support-tickets/admin/${id}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update ticket');
    return res.json();
  },
};
