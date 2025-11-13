import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG, { apiRequest } from '../config/api';

class OrderService {
  /**
   * Get authorization header
   */
  async getAuthHeader() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch (error) {
      console.error('Error getting auth header:', error);
      return {};
    }
  }

  /**
   * Get current user's orders
   */
  async getMyOrders(status = null) {
    try {
      const authHeader = await this.getAuthHeader();
      console.log('🔑 Auth header:', authHeader ? 'Present' : 'Missing')
      
      let endpoint = `${API_CONFIG.ENDPOINTS.ORDERS}/my-orders`;
      if (status) {
        endpoint += `?status=${status}`;
      }

      console.log('🌐 Fetching orders from:', endpoint)
      const response = await apiRequest(endpoint, {
        method: 'GET',
        headers: authHeader
      });

      console.log('📡 Order API response:', {
        success: response.success,
        orderCount: response.data?.orders?.length || 0
      })

      if (response.success && response.data) {
        return response.data.orders || [];
      }

      return [];
    } catch (error) {
      console.error('❌ Error fetching my orders:', error)
      return [];
    }
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status) {
    try {
      const authHeader = await this.getAuthHeader();
      
      const response = await apiRequest(
        `${API_CONFIG.ENDPOINTS.ORDERS}/status/${status}`,
        {
          method: 'GET',
          headers: authHeader
        }
      );

      if (response.success && response.data) {
        return response.data.orders || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      return [];
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId) {
    try {
      const authHeader = await this.getAuthHeader();
      
      const response = await apiRequest(
        `${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}`,
        {
          method: 'GET',
          headers: authHeader
        }
      );

      if (response.success && response.data) {
        return response.data.order;
      }

      return null;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  /**
   * Create new order
   */
  async createOrder(orderData) {
    try {
      const authHeader = await this.getAuthHeader();
      
      const response = await apiRequest(
        API_CONFIG.ENDPOINTS.ORDERS,
        {
          method: 'POST',
          headers: {
            ...authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        }
      );

      return response;
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        message: error.message || 'Failed to create order'
      };
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status, deliveryDate = null) {
    try {
      const authHeader = await this.getAuthHeader();
      
      const response = await apiRequest(
        `${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            ...authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status, deliveryDate })
        }
      );

      return response;
    } catch (error) {
      console.error('Error updating order status:', error);
      return {
        success: false,
        message: error.message || 'Failed to update order status'
      };
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId, reason = '') {
    try {
      const authHeader = await this.getAuthHeader();
      
      const response = await apiRequest(
        `${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}/cancel`,
        {
          method: 'PATCH',
          headers: {
            ...authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason })
        }
      );

      return response;
    } catch (error) {
      console.error('Error cancelling order:', error);
      return {
        success: false,
        message: error.message || 'Failed to cancel order'
      };
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats() {
    try {
      const authHeader = await this.getAuthHeader();
      
      const response = await apiRequest(
        `${API_CONFIG.ENDPOINTS.ORDERS}/stats`,
        {
          method: 'GET',
          headers: authHeader
        }
      );

      if (response.success && response.data) {
        return response.data.stats;
      }

      return null;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return null;
    }
  }

  /**
   * Get order messages
   */
  async getOrderMessages(orderId) {
    try {
      const authHeader = await this.getAuthHeader();
      
      const response = await apiRequest(
        `${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}/messages`,
        {
          method: 'GET',
          headers: authHeader
        }
      );

      if (response.success && response.data) {
        return response.data.messages || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching order messages:', error);
      return [];
    }
  }

  /**
   * Send order message
   */
  async sendOrderMessage(orderId, message, messageType = 'text') {
    try {
      const authHeader = await this.getAuthHeader();
      
      const response = await apiRequest(
        `${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}/messages`,
        {
          method: 'POST',
          headers: {
            ...authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message, messageType })
        }
      );

      return response;
    } catch (error) {
      console.error('Error sending order message:', error);
      return {
        success: false,
        message: error.message || 'Failed to send message'
      };
    }
  }

  /**
   * Format order data for display
   */
  formatOrderForDisplay(order) {
    return {
      id: order._id,
      orderId: order._id.substring(order._id.length - 6).toUpperCase(),
      date: new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      status: this.capitalizeStatus(order.status),
      total: order.totalAmount,
      vendor: {
        id: order.sellerId?._id || order.sellerId,
        name: order.sellerId?.name || 'Unknown Vendor',
        location: order.deliveryAddress || 'Location not specified',
        image: order.sellerId?.profileImage || `https://ui-avatars.com/api/?name=${order.sellerId?.name || 'V'}&background=4CAF50&color=fff`
      },
      items: order.products.map(product => ({
        id: product.productId?._id || product.productId,
        name: product.name,
        quantity: product.quantity,
        price: product.price,
        unit: product.unit,
        image: product.productId?.images?.[0] || `https://ui-avatars.com/api/?name=${product.name}&background=random&color=fff`
      })),
      deliveryAddress: order.deliveryAddress,
      deliveryLocation: order.deliveryLocation,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      estimatedDelivery: order.scheduledDelivery,
      deliveredDate: order.actualDelivery
    };
  }

  /**
   * Capitalize status for display
   */
  capitalizeStatus(status) {
    const statusMap = {
      'pending': 'Pending',
      'confirmed': 'Processing',
      'in_transit': 'In Transit',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  }
}

export default new OrderService();
