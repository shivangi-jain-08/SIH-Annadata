import { Socket } from 'socket.io-client';

// Type definitions for real-time events
interface LocationUpdate {
  userId: string;
  longitude: number;
  latitude: number;
  isActive: boolean;
  timestamp: string;
}

interface ProximityNotification {
  vendorId: string;
  vendorName: string;
  distance: number;
  products: string[];
  location: {
    longitude: number;
    latitude: number;
  };
}

interface OrderStatusUpdate {
  orderId: string;
  status: string;
  buyerName?: string;
  sellerName?: string;
  timestamp: string;
}

interface ProductUpdate {
  productId: string;
  sellerId: string;
  changes: any;
  timestamp: string;
}

/**
 * Real-time service for handling Socket.IO connections and events
 * Manages vendor location updates, proximity notifications, and order updates
 */
class RealTimeService {
  private socket: Socket | null = null;
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
  private isInitialized = false;

  constructor(socket: Socket | null = null) {
    if (socket) {
      this.updateSocket(socket);
    }
  }

  /**
   * Update the socket instance and reinitialize event listeners
   */
  updateSocket(socket: Socket | null) {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
    
    this.socket = socket;
    this.isInitialized = false;
    
    if (socket) {
      this.initialize();
    }
  }

  /**
   * Initialize socket event listeners
   */
  private initialize() {
    if (!this.socket || this.isInitialized) return;

    // Location and proximity events
    this.socket.on('vendor-nearby', (data: ProximityNotification) => {
      this.emit('vendor-nearby', data);
      this.showBrowserNotification({
        type: 'vendor-nearby',
        title: `${data.vendorName} is nearby`,
        message: `${data.distance}m away • ${data.products?.join(', ') || 'Products available'}`,
        data
      });
    });

    this.socket.on('vendor-departed', (data: any) => {
      this.emit('vendor-departed', data);
      this.showBrowserNotification({
        type: 'vendor-departed',
        title: `${data.vendorName} has left your area`,
        message: 'Vendor is no longer in your area',
        data
      });
    });

    this.socket.on('vendor-location-updated', (data: LocationUpdate) => {
      this.emit('vendor-location-updated', data);
    });

    this.socket.on('consumer-location-updated', (data: LocationUpdate) => {
      this.emit('consumer-location-updated', data);
    });

    // Order events
    this.socket.on('order-updated', (data: OrderStatusUpdate) => {
      this.emit('order-updated', data);
    });

    this.socket.on('new-order-received', (data: any) => {
      this.emit('new-order-received', data);
      this.showBrowserNotification({
        type: 'new-order',
        title: 'New Order Received',
        message: `You have a new order from ${data.buyerName}`,
        data
      });
    });

    // Product events
    this.socket.on('product-updated', (data: ProductUpdate) => {
      this.emit('product-updated', data);
    });

    // Order messaging
    this.socket.on('order-message-received', (data: any) => {
      this.emit('order-message-received', data);
    });

    this.socket.on('user-typing-in-order', (data: any) => {
      this.emit('user-typing-in-order', data);
    });

    this.socket.on('user-stopped-typing-in-order', (data: any) => {
      this.emit('user-stopped-typing-in-order', data);
    });

    // Connection events
    this.socket.on('location-update-confirmed', (data: any) => {
      this.emit('location-update-confirmed', data);
    });

    this.socket.on('error', (data: any) => {
      this.emit('socket-error', data);
      console.error('Socket error:', data);
    });

    this.isInitialized = true;
  }

  // Event listener management
  on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.eventListeners.get(event)?.delete(callback);
    };
  }

  off(event: string, callback?: (data: any) => void) {
    if (callback) {
      this.eventListeners.get(event)?.delete(callback);
    } else {
      this.eventListeners.delete(event);
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Vendor actions
  updateVendorLocation(location: { longitude: number; latitude: number; isActive?: boolean }) {
    if (!this.socket?.connected) return;

    this.socket.emit('vendor-location-update', {
      longitude: location.longitude,
      latitude: location.latitude,
      isActive: location.isActive ?? true,
      timestamp: new Date().toISOString()
    });
  }

  goVendorOnline(location: { longitude: number; latitude: number }) {
    if (!this.socket?.connected) return;

    this.socket.emit('vendor-online', {
      longitude: location.longitude,
      latitude: location.latitude,
      timestamp: new Date().toISOString()
    });
  }

  goVendorOffline() {
    if (!this.socket?.connected) return;

    this.socket.emit('vendor-offline', {
      timestamp: new Date().toISOString()
    });
  }

  // Consumer actions
  updateConsumerLocation(location: { longitude: number; latitude: number }) {
    if (!this.socket?.connected) return;

    this.socket.emit('consumer-location-update', {
      longitude: location.longitude,
      latitude: location.latitude,
      timestamp: new Date().toISOString()
    });
  }

  // Order actions
  updateOrderStatus(orderId: string, status: string, additionalData?: any) {
    if (!this.socket?.connected) return;

    this.socket.emit('order-status-update', {
      orderId,
      status,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  sendOrderMessage(orderId: string, message: string, messageType: string = 'text') {
    if (!this.socket?.connected) return;

    this.socket.emit('send-order-message', {
      orderId,
      message,
      messageType,
      timestamp: new Date().toISOString()
    });
  }

  startTypingInOrder(orderId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('typing-in-order', {
      orderId,
      timestamp: new Date().toISOString()
    });
  }

  stopTypingInOrder(orderId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('stop-typing-in-order', {
      orderId,
      timestamp: new Date().toISOString()
    });
  }

  // Product actions
  notifyProductUpdate(productId: string, updateData: any) {
    if (!this.socket?.connected) return;

    this.socket.emit('product-updated', {
      productId,
      ...updateData,
      timestamp: new Date().toISOString()
    });
  }

  notifyNewOrder(orderId: string, sellerId: string, orderData: any) {
    if (!this.socket?.connected) return;

    this.socket.emit('new-order-created', {
      orderId,
      sellerId,
      ...orderData,
      timestamp: new Date().toISOString()
    });
  }

  // Room management
  joinRoom(roomId: string, roomType: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('join-room', {
      roomId,
      roomType
    });
  }

  leaveRoom(roomId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('leave-room', {
      roomId
    });
  }

  // Notification acknowledgment
  acknowledgeNotification(notificationId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('notification-received', {
      notificationId,
      timestamp: new Date().toISOString()
    });
  }

  // Browser notifications
  private async showBrowserNotification(data: any) {
    if (!('Notification' in window)) return;

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      const title = data.title || this.getNotificationTitle(data);
      const message = data.message || this.getNotificationMessage(data);
      
      const notification = new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: data.notificationId || data.type,
        requireInteraction: false,
        silent: false
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Navigate based on notification type
        this.handleNotificationClick(data);
      };
    }
  }

  private getNotificationTitle(data: any): string {
    switch (data.type) {
      case 'vendor-nearby':
        return `${data.vendorName} is nearby`;
      case 'vendor-departed':
        return `${data.vendorName} has left your area`;
      case 'vendor-updated':
        return `${data.vendorName} updated their products`;
      case 'new-order':
        return 'New Order Received';
      case 'order-updated':
        return 'Order Status Updated';
      default:
        return 'Annadata Notification';
    }
  }

  private getNotificationMessage(data: any): string {
    switch (data.type) {
      case 'vendor-nearby':
        return `${data.distance}m away • ${data.products?.join(', ') || 'Products available'}`;
      case 'vendor-departed':
        return 'Vendor is no longer in your area';
      case 'vendor-updated':
        return 'Check out their updated products';
      case 'new-order':
        return `Order #${data.orderId?.slice(-6)} from ${data.buyerName}`;
      case 'order-updated':
        return `Order #${data.orderId?.slice(-6)} is now ${data.status}`;
      default:
        return 'You have a new notification';
    }
  }

  private handleNotificationClick(data: any) {
    switch (data.type) {
      case 'vendor-nearby':
      case 'vendor-updated':
        window.location.href = `/marketplace/vendor/${data.vendorId}`;
        break;
      case 'new-order':
      case 'order-updated':
        window.location.href = `/orders/${data.orderId}`;
        break;
      default:
        window.location.href = '/dashboard';
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getConnectionStatus(): string {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    // Socket.IO doesn't have a connecting property, check if socket exists but not connected
    if (this.socket && !this.socket.connected) return 'connecting';
    return 'disconnected';
  }

  // Cleanup
  destroy() {
    this.eventListeners.clear();
    this.isInitialized = false;
  }
}

// Singleton instance
let realTimeServiceInstance: RealTimeService | null = null;

export function getRealTimeService(socket?: Socket | null): RealTimeService {
  if (!realTimeServiceInstance) {
    realTimeServiceInstance = new RealTimeService(socket || null);
  } else if (socket) {
    realTimeServiceInstance.updateSocket(socket);
  }
  return realTimeServiceInstance;
}

export { RealTimeService };
export default RealTimeService;