// Simple event emitter for cart updates
type CartEventListener = () => void;

class CartEvents {
  private listeners: CartEventListener[] = [];

  subscribe(listener: CartEventListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit() {
    this.listeners.forEach(listener => listener());
  }
}

export const cartEvents = new CartEvents();
