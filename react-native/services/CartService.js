import AsyncStorage from '@react-native-async-storage/async-storage';

class CartService {
  constructor() {
    this.storageKey = 'CONSUMER_CART';
  }

  // Get cart items from storage
  async getCartItems() {
    try {
      const cartData = await AsyncStorage.getItem(this.storageKey);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error getting cart items:', error);
      return [];
    }
  }

  // Add item to cart
  async addToCart(product, quantity = 1) {
    try {
      const cart = await this.getCartItems();
      
      // Check if product already exists in cart
      const existingIndex = cart.findIndex(
        item => (item.productId === product._id || item.productId === product.id)
      );

      if (existingIndex >= 0) {
        // Update quantity if product exists
        cart[existingIndex].quantity += quantity;
      } else {
        // Add new product to cart
        cart.push({
          productId: product._id || product.id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          quantity: quantity,
          image: this.getProductImage(product),
          availableQuantity: product.availableQuantity,
          minimumOrderQuantity: product.minimumOrderQuantity,
          seller: {
            id: product.sellerId?._id || product.sellerId,
            name: product.sellerId?.name || 'Vendor',
          },
          addedAt: new Date().toISOString(),
        });
      }

      await AsyncStorage.setItem(this.storageKey, JSON.stringify(cart));
      return { success: true, cart };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: error.message };
    }
  }

  // Update quantity of cart item
  async updateQuantity(productId, quantity) {
    try {
      const cart = await this.getCartItems();
      const index = cart.findIndex(item => item.productId === productId);

      if (index >= 0) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          cart.splice(index, 1);
        } else {
          cart[index].quantity = quantity;
        }
        await AsyncStorage.setItem(this.storageKey, JSON.stringify(cart));
        return { success: true, cart };
      }
      return { success: false, error: 'Item not found in cart' };
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove item from cart
  async removeFromCart(productId) {
    try {
      const cart = await this.getCartItems();
      const updatedCart = cart.filter(item => item.productId !== productId);
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(updatedCart));
      return { success: true, cart: updatedCart };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error: error.message };
    }
  }

  // Clear entire cart
  async clearCart() {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      return { success: true, cart: [] };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: error.message };
    }
  }

  // Get cart summary (total items, total amount)
  async getCartSummary() {
    try {
      const cart = await this.getCartItems();
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        success: true,
        totalItems,
        totalAmount,
        itemCount: cart.length,
      };
    } catch (error) {
      console.error('Error getting cart summary:', error);
      return { success: false, totalItems: 0, totalAmount: 0, itemCount: 0 };
    }
  }

  // Helper function to extract product image
  getProductImage(product) {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    if (product.imageUrl) return product.imageUrl;
    if (product.image) return product.image;
    return `https://via.placeholder.com/100x100/4CAF50/FFFFFF?text=${product.name?.substring(0, 1) || 'P'}`;
  }
}

export default new CartService();
