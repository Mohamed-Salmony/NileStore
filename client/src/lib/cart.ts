import { cartEvents } from './cartEvents';

// Guest cart management using localStorage
export interface CartItem {
  product_id: string;
  quantity: number;
  product?: any; // Product details will be fetched separately
}

const CART_STORAGE_KEY = 'guest_cart';

export const guestCart = {
  // Get guest cart from localStorage
  getCart(): CartItem[] {
    if (typeof window === 'undefined') return [];
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  },

  // Save cart to localStorage
  saveCart(cart: CartItem[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  },

  // Add item to cart
  addToCart(product_id: string, quantity: number): CartItem[] {
    const cart = this.getCart();
    const existingItem = cart.find(item => item.product_id === product_id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ product_id, quantity });
    }

    this.saveCart(cart);
    cartEvents.emit(); // Notify listeners
    return cart;
  },

  // Update cart item quantity
  updateCartItem(product_id: string, quantity: number): CartItem[] {
    const cart = this.getCart();
    const item = cart.find(item => item.product_id === product_id);

    if (item) {
      if (quantity <= 0) {
        return this.removeFromCart(product_id);
      }
      item.quantity = quantity;
      this.saveCart(cart);
      cartEvents.emit(); // Notify listeners
    }

    return cart;
  },

  // Remove item from cart
  removeFromCart(product_id: string): CartItem[] {
    const cart = this.getCart().filter(item => item.product_id !== product_id);
    this.saveCart(cart);
    cartEvents.emit(); // Notify listeners
    return cart;
  },

  // Clear entire cart
  clearCart(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CART_STORAGE_KEY);
    cartEvents.emit(); // Notify listeners
  },

  // Get cart count
  getCartCount(): number {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  },

  // Merge guest cart with user cart after login
  async mergeWithUserCart(apiAddToCart: (product_id: string, quantity: number) => Promise<any>): Promise<void> {
    const guestCartItems = this.getCart();
    
    if (guestCartItems.length === 0) return;

    // Add all guest cart items to user cart
    for (const item of guestCartItems) {
      try {
        await apiAddToCart(item.product_id, item.quantity);
      } catch (error) {
        console.error('Failed to merge cart item:', error);
      }
    }

    // Clear guest cart after merging
    this.clearCart();
  }
};
