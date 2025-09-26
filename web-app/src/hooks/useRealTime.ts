import { useEffect, useCallback, useState } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { getRealTimeService, RealTimeService } from '@/services/realTimeService';

export interface RealTimeEventHandler {
  event: string;
  handler: (data: any) => void;
}

export function useRealTime(eventHandlers?: RealTimeEventHandler[]) {
  const { socket, isConnected } = useWebSocket();
  const [realTimeService, setRealTimeService] = useState<RealTimeService | null>(null);
  const [lastEvent, setLastEvent] = useState<{ type: string; data: any; timestamp: Date } | null>(null);

  // Initialize real-time service
  useEffect(() => {
    const service = getRealTimeService(socket);
    setRealTimeService(service);

    return () => {
      // Don't destroy the service as it's a singleton
      // service.destroy();
    };
  }, [socket]);

  // Set up event handlers
  useEffect(() => {
    if (!realTimeService || !eventHandlers) return;

    const unsubscribeFunctions: (() => void)[] = [];

    eventHandlers.forEach(({ event, handler }) => {
      const wrappedHandler = (data: any) => {
        setLastEvent({ type: event, data, timestamp: new Date() });
        handler(data);
      };

      const unsubscribe = realTimeService.on(event, wrappedHandler);
      unsubscribeFunctions.push(unsubscribe);
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [realTimeService, eventHandlers]);

  // Vendor actions
  const updateVendorLocation = useCallback((location: { longitude: number; latitude: number; isActive?: boolean }) => {
    realTimeService?.updateVendorLocation(location);
  }, [realTimeService]);

  const goVendorOnline = useCallback((location: { longitude: number; latitude: number }) => {
    realTimeService?.goVendorOnline(location);
  }, [realTimeService]);

  const goVendorOffline = useCallback(() => {
    realTimeService?.goVendorOffline();
  }, [realTimeService]);

  // Consumer actions
  const updateConsumerLocation = useCallback((location: { longitude: number; latitude: number }) => {
    realTimeService?.updateConsumerLocation(location);
  }, [realTimeService]);

  // Order actions
  const updateOrderStatus = useCallback((orderId: string, status: string, additionalData?: any) => {
    realTimeService?.updateOrderStatus(orderId, status, additionalData);
  }, [realTimeService]);

  const sendOrderMessage = useCallback((orderId: string, message: string, messageType?: string) => {
    realTimeService?.sendOrderMessage(orderId, message, messageType);
  }, [realTimeService]);

  const startTypingInOrder = useCallback((orderId: string) => {
    realTimeService?.startTypingInOrder(orderId);
  }, [realTimeService]);

  const stopTypingInOrder = useCallback((orderId: string) => {
    realTimeService?.stopTypingInOrder(orderId);
  }, [realTimeService]);

  // Product actions
  const notifyProductUpdate = useCallback((productId: string, updateData: any) => {
    realTimeService?.notifyProductUpdate(productId, updateData);
  }, [realTimeService]);

  const notifyNewOrder = useCallback((orderId: string, sellerId: string, orderData: any) => {
    realTimeService?.notifyNewOrder(orderId, sellerId, orderData);
  }, [realTimeService]);

  // Room management
  const joinRoom = useCallback((roomId: string, roomType: string) => {
    realTimeService?.joinRoom(roomId, roomType);
  }, [realTimeService]);

  const leaveRoom = useCallback((roomId: string) => {
    realTimeService?.leaveRoom(roomId);
  }, [realTimeService]);

  // Notification acknowledgment
  const acknowledgeNotification = useCallback((notificationId: string) => {
    realTimeService?.acknowledgeNotification(notificationId);
  }, [realTimeService]);

  return {
    // Connection status
    isConnected,
    connectionStatus: realTimeService?.getConnectionStatus() || 'disconnected',
    
    // Last event for debugging
    lastEvent,
    
    // Vendor actions
    updateVendorLocation,
    goVendorOnline,
    goVendorOffline,
    
    // Consumer actions
    updateConsumerLocation,
    
    // Order actions
    updateOrderStatus,
    sendOrderMessage,
    startTypingInOrder,
    stopTypingInOrder,
    
    // Product actions
    notifyProductUpdate,
    notifyNewOrder,
    
    // Room management
    joinRoom,
    leaveRoom,
    
    // Notifications
    acknowledgeNotification,
    
    // Service instance for advanced usage
    realTimeService
  };
}

// Specialized hooks for specific use cases
export function useVendorRealTime() {
  const [vendorEvents, setVendorEvents] = useState<any[]>([]);
  const [nearbyConsumers, setNearbyConsumers] = useState<any[]>([]);
  const [newOrders, setNewOrders] = useState<any[]>([]);

  const eventHandlers: RealTimeEventHandler[] = [
    {
      event: 'location-update-confirmed',
      handler: (data) => {
        setVendorEvents(prev => [{ type: 'location-confirmed', data, timestamp: new Date() }, ...prev.slice(0, 9)]);
      }
    },
    {
      event: 'new-order-received',
      handler: (data) => {
        setNewOrders(prev => [data, ...prev]);
        setVendorEvents(prev => [{ type: 'new-order', data, timestamp: new Date() }, ...prev.slice(0, 9)]);
      }
    },
    {
      event: 'order-updated',
      handler: (data) => {
        setVendorEvents(prev => [{ type: 'order-updated', data, timestamp: new Date() }, ...prev.slice(0, 9)]);
      }
    }
  ];

  const realTime = useRealTime(eventHandlers);

  const clearNewOrders = useCallback(() => {
    setNewOrders([]);
  }, []);

  const clearEvents = useCallback(() => {
    setVendorEvents([]);
  }, []);

  return {
    ...realTime,
    vendorEvents,
    nearbyConsumers,
    newOrders,
    clearNewOrders,
    clearEvents
  };
}

export function useConsumerRealTime() {
  const [proximityNotifications, setProximityNotifications] = useState<any[]>([]);
  const [orderUpdates, setOrderUpdates] = useState<any[]>([]);
  const [nearbyVendors, setNearbyVendors] = useState<any[]>([]);

  const eventHandlers: RealTimeEventHandler[] = [
    {
      event: 'vendor-nearby',
      handler: (data) => {
        setProximityNotifications(prev => {
          const exists = prev.some(n => n.notificationId === data.notificationId);
          if (exists) return prev;
          return [data, ...prev.slice(0, 9)];
        });
        setNearbyVendors(prev => {
          const exists = prev.some(v => v.vendorId === data.vendorId);
          if (exists) {
            return prev.map(v => v.vendorId === data.vendorId ? { ...v, ...data } : v);
          }
          return [data, ...prev];
        });
      }
    },
    {
      event: 'vendor-departed',
      handler: (data) => {
        setNearbyVendors(prev => prev.filter(v => v.vendorId !== data.vendorId));
      }
    },
    {
      event: 'vendor-updated',
      handler: (data) => {
        setNearbyVendors(prev => 
          prev.map(v => v.vendorId === data.vendorId ? { ...v, ...data } : v)
        );
      }
    },
    {
      event: 'order-updated',
      handler: (data) => {
        setOrderUpdates(prev => [data, ...prev.slice(0, 9)]);
      }
    },
    {
      event: 'vendor-location-updated',
      handler: (data) => {
        setNearbyVendors(prev => 
          prev.map(v => v.vendorId === data.vendorId ? { ...v, ...data } : v)
        );
      }
    }
  ];

  const realTime = useRealTime(eventHandlers);

  const dismissProximityNotification = useCallback((notificationId: string) => {
    setProximityNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
    realTime.acknowledgeNotification(notificationId);
  }, [realTime]);

  const clearOrderUpdates = useCallback(() => {
    setOrderUpdates([]);
  }, []);

  return {
    ...realTime,
    proximityNotifications,
    orderUpdates,
    nearbyVendors,
    dismissProximityNotification,
    clearOrderUpdates
  };
}

export function useOrderRealTime(orderId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  const eventHandlers: RealTimeEventHandler[] = [
    {
      event: 'order-message-received',
      handler: (data) => {
        if (data.orderId === orderId) {
          setMessages(prev => [...prev, data]);
        }
      }
    },
    {
      event: 'user-typing-in-order',
      handler: (data) => {
        if (data.orderId === orderId) {
          setTypingUsers(prev => new Set([...prev, data.userId]));
        }
      }
    },
    {
      event: 'user-stopped-typing-in-order',
      handler: (data) => {
        if (data.orderId === orderId) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
      }
    },
    {
      event: 'order-updated',
      handler: (data) => {
        if (data.orderId === orderId) {
          setOrderStatus(data.status);
        }
      }
    }
  ];

  const realTime = useRealTime(eventHandlers);

  // Join order room on mount
  useEffect(() => {
    if (orderId && realTime.isConnected) {
      realTime.joinRoom(orderId, 'order');
    }

    return () => {
      if (orderId && realTime.isConnected) {
        realTime.leaveRoom(`order:${orderId}`);
      }
    };
  }, [orderId, realTime.isConnected]);

  const sendMessage = useCallback((message: string, messageType: string = 'text') => {
    realTime.sendOrderMessage(orderId, message, messageType);
  }, [realTime, orderId]);

  const startTyping = useCallback(() => {
    realTime.startTypingInOrder(orderId);
  }, [realTime, orderId]);

  const stopTyping = useCallback(() => {
    realTime.stopTypingInOrder(orderId);
  }, [realTime, orderId]);

  return {
    ...realTime,
    messages,
    typingUsers: Array.from(typingUsers),
    orderStatus,
    sendMessage,
    startTyping,
    stopTyping
  };
}

export default useRealTime;