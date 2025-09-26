import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface ConsumerOrder {
  _id: string;
  buyerId: {
    _id: string;
    name: string;
    phone: string;
    location?: {
      coordinates: [number, number];
    };
  };
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    unit: string;
  }>;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'rejected';
  totalAmount: number;
  deliveryAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConsumerSalesStats {
  totalConsumerOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  monthlyOrders: number;
  monthlyRevenue: number;
}

interface DeliveryOpportunity {
  id: string;
  type: 'pending_order' | 'potential_customer';
  consumerName: string;
  distance: number;
  priority: 'high' | 'medium' | 'low';
  orderValue?: number;
  items?: string[];
  preferredItems?: string[];
  estimatedDeliveryTime?: string;
  estimatedValue?: number;
  products?: string[];
  timestamp?: string;
}

interface VendorStatus {
  isOnline: boolean;
  deliveryRadius: number;
  acceptingOrders: boolean;
  onlineSince?: string;
  totalOnlineTime?: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

export function useConsumerOrders() {
  const [orders, setOrders] = useState<ConsumerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get orders where current user is the seller (vendor)
      const response = await api.get('/orders/my-orders?role=seller');
      
      if (response.data.success) {
        // Filter for consumer orders (orders from consumers, not farmers)
        const consumerOrders = response.data.data.orders.filter((order: any) => 
          order.buyerId && order.buyerId.role !== 'farmer'
        );
        setOrders(consumerOrders || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch consumer orders');
      }
    } catch (err) {
      console.error('Failed to fetch consumer orders:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch consumer orders'));
      
      // Mock data for development
      const mockOrders: ConsumerOrder[] = [
        {
          _id: '507f1f77bcf86cd799439020',
          buyerId: {
            _id: '507f1f77bcf86cd799439021',
            name: 'Sarah Johnson',
            phone: '+1234567893',
            location: {
              coordinates: [77.2090, 28.6139]
            }
          },
          products: [
            {
              productId: '507f1f77bcf86cd799439014',
              name: 'Fresh Tomatoes',
              quantity: 2,
              price: 45,
              unit: 'kg'
            },
            {
              productId: '507f1f77bcf86cd799439015',
              name: 'Organic Spinach',
              quantity: 1,
              price: 35,
              unit: 'kg'
            }
          ],
          status: 'pending',
          totalAmount: 125,
          deliveryAddress: '123 Main Street, Delhi, India',
          notes: 'Please call before delivery',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '507f1f77bcf86cd799439022',
          buyerId: {
            _id: '507f1f77bcf86cd799439023',
            name: 'Mike Chen',
            phone: '+1234567894'
          },
          products: [
            {
              productId: '507f1f77bcf86cd799439016',
              name: 'Fresh Carrots',
              quantity: 3,
              price: 40,
              unit: 'kg'
            }
          ],
          status: 'preparing',
          totalAmount: 120,
          deliveryAddress: '456 Oak Avenue, Delhi, India',
          createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          updatedAt: new Date().toISOString()
        }
      ];
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      
      if (response.data.success) {
        // Update local state
        setOrders(prev => 
          prev.map(order => 
            order._id === orderId 
              ? { ...order, status: status as any, updatedAt: new Date().toISOString() }
              : order
          )
        );
        return response.data.data.order;
      } else {
        throw new Error(response.data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      throw err instanceof Error ? err : new Error('Failed to update order status');
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    updateOrderStatus
  };
}

export function useConsumerSalesStats() {
  const [stats, setStats] = useState<ConsumerSalesStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/analytics/vendor-dashboard');
      
      if (response.data.success) {
        const data = response.data.data.stats;
        const mappedStats: ConsumerSalesStats = {
          totalConsumerOrders: data.orders.total,
          pendingOrders: data.orders.pending,
          confirmedOrders: data.orders.completed,
          deliveredOrders: data.orders.completed,
          totalRevenue: data.revenue.total,
          monthlyOrders: data.orders.monthly,
          monthlyRevenue: data.revenue.monthly
        };
        setStats(mappedStats);
      } else {
        throw new Error(response.data.message || 'Failed to fetch consumer sales stats');
      }
    } catch (err) {
      console.error('Failed to fetch consumer sales stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch consumer sales stats'));
      
      // Mock data for development
      const mockStats: ConsumerSalesStats = {
        totalConsumerOrders: 25,
        pendingOrders: 3,
        confirmedOrders: 5,
        deliveredOrders: 17,
        totalRevenue: 12500,
        monthlyOrders: 8,
        monthlyRevenue: 3200
      };
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

export function useDeliveryOpportunities(location?: { latitude: number; longitude: number }) {
  const [opportunities, setOpportunities] = useState<DeliveryOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchOpportunities = useCallback(async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/location/delivery-opportunities', {
        params: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      });

      if (response.data.success) {
        const apiOpportunities = response.data.data.map((opp: any) => ({
          id: opp.id,
          type: opp.type,
          consumerName: opp.consumerName,
          distance: opp.distance,
          priority: opp.priority,
          orderValue: opp.orderValue,
          items: opp.items,
          preferredItems: opp.preferredItems,
          estimatedDeliveryTime: opp.estimatedDeliveryTime,
          estimatedValue: opp.orderValue,
          products: opp.items,
          timestamp: opp.orderDate || new Date().toISOString()
        }));
        setOpportunities(apiOpportunities);
      } else {
        throw new Error(response.data.message || 'Failed to fetch delivery opportunities');
      }
    } catch (err) {
      console.error('Failed to fetch delivery opportunities:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch delivery opportunities'));
      
      // Fallback to mock data for development
      const mockOpportunities: DeliveryOpportunity[] = [
        {
          id: '1',
          type: 'pending_order',
          consumerName: 'Emma Wilson',
          distance: 650,
          priority: 'high',
          orderValue: 180,
          items: ['Tomatoes', 'Onions', 'Potatoes'],
          estimatedDeliveryTime: '15 minutes',
          estimatedValue: 180,
          products: ['Tomatoes', 'Onions', 'Potatoes'],
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'potential_customer',
          consumerName: 'David Kumar',
          distance: 1200,
          priority: 'medium',
          preferredItems: ['Fresh vegetables', 'Fruits'],
          estimatedDeliveryTime: '20 minutes',
          timestamp: new Date().toISOString()
        }
      ];
      setOpportunities(mockOpportunities);
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  return {
    opportunities,
    loading,
    error,
    refetch: fetchOpportunities
  };
}

export function useVendorStatus() {
  const [status, setStatus] = useState<VendorStatus>({
    isOnline: false,
    deliveryRadius: 2000, // 2km default
    acceptingOrders: true
  });

  const goOnline = useCallback(async () => {
    try {
      // This would typically call an API to update vendor status
      setStatus(prev => ({ ...prev, isOnline: true }));
      
      // Request location if not available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setStatus(prev => ({
              ...prev,
              currentLocation: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            }));
          },
          (error) => {
            console.error('Failed to get location:', error);
          }
        );
      }
    } catch (error) {
      console.error('Failed to go online:', error);
    }
  }, []);

  const goOffline = useCallback(async () => {
    try {
      // This would typically call an API to update vendor status
      setStatus(prev => ({ ...prev, isOnline: false, currentLocation: undefined }));
    } catch (error) {
      console.error('Failed to go offline:', error);
    }
  }, []);

  const toggleAcceptingOrders = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, acceptingOrders: !prev.acceptingOrders }));
    } catch (error) {
      console.error('Failed to toggle accepting orders:', error);
    }
  }, []);

  return {
    status,
    goOnline,
    goOffline,
    toggleAcceptingOrders
  };
}

// New hook for real vendor location status
export function useVendorLocationStatus() {
  const [status, setStatus] = useState<VendorStatus>({
    isOnline: false,
    deliveryRadius: 2000,
    acceptingOrders: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch current vendor status
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/location/vendor-status');
      
      if (response.data.success) {
        const data = response.data.data;
        setStatus({
          isOnline: data.isOnline,
          deliveryRadius: data.deliveryRadius,
          acceptingOrders: data.acceptingOrders,
          currentLocation: data.location ? {
            latitude: data.location.coordinates[1],
            longitude: data.location.coordinates[0]
          } : undefined,
          onlineSince: data.onlineSince,
          totalOnlineTime: data.totalOnlineTime,
          rating: data.rating,
          completedDeliveries: data.completedDeliveries
        });
      }
    } catch (err) {
      console.error('Failed to fetch vendor status:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch vendor status'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Go online with location
  const goOnline = useCallback(async (location?: { latitude: number; longitude: number }) => {
    try {
      setLoading(true);
      setError(null);

      let coords = location;
      if (!coords && navigator.geolocation) {
        coords = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }),
            reject,
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });
      }

      if (!coords) {
        throw new Error('Location is required to go online');
      }

      const response = await api.patch('/location/vendor-status', {
        isOnline: true,
        longitude: coords.longitude,
        latitude: coords.latitude,
        acceptingOrders: status.acceptingOrders,
        deliveryRadius: status.deliveryRadius
      });

      if (response.data.success) {
        const data = response.data.data;
        setStatus(prev => ({
          ...prev,
          isOnline: true,
          currentLocation: coords,
          onlineSince: data.onlineSince
        }));
      }
    } catch (err) {
      console.error('Failed to go online:', err);
      setError(err instanceof Error ? err : new Error('Failed to go online'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [status.acceptingOrders, status.deliveryRadius]);

  // Go offline
  const goOffline = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.patch('/location/vendor-status', {
        isOnline: false
      });

      if (response.data.success) {
        setStatus(prev => ({
          ...prev,
          isOnline: false,
          currentLocation: undefined
        }));
      }
    } catch (err) {
      console.error('Failed to go offline:', err);
      setError(err instanceof Error ? err : new Error('Failed to go offline'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update delivery settings
  const updateDeliverySettings = useCallback(async (settings: {
    deliveryRadius?: number;
    acceptingOrders?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.patch('/location/vendor-status', {
        ...settings,
        isOnline: status.isOnline,
        ...(status.currentLocation && {
          longitude: status.currentLocation.longitude,
          latitude: status.currentLocation.latitude
        })
      });

      if (response.data.success) {
        setStatus(prev => ({
          ...prev,
          ...settings
        }));
      }
    } catch (err) {
      console.error('Failed to update delivery settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to update delivery settings'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [status.isOnline, status.currentLocation]);

  // Update location while online
  const updateLocation = useCallback(async (location: { latitude: number; longitude: number }) => {
    try {
      if (!status.isOnline) {
        throw new Error('Must be online to update location');
      }

      const response = await api.post('/location/update', {
        longitude: location.longitude,
        latitude: location.latitude
      });

      if (response.data.success) {
        setStatus(prev => ({
          ...prev,
          currentLocation: location
        }));
      }
    } catch (err) {
      console.error('Failed to update location:', err);
      setError(err instanceof Error ? err : new Error('Failed to update location'));
      throw err;
    }
  }, [status.isOnline]);

  // Load status on mount
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    goOnline,
    goOffline,
    updateDeliverySettings,
    updateLocation,
    refetch: fetchStatus
  };
}

export function useProximityNotifications() {
  const [sending, setSending] = useState(false);

  const sendProximityNotification = useCallback(async (data: {
    latitude: number;
    longitude: number;
    message?: string;
    products?: string[];
  }) => {
    setSending(true);
    try {
      const response = await api.post('/location/notify-proximity', {
        latitude: data.latitude,
        longitude: data.longitude,
        message: data.message || 'Fresh products available for delivery!',
        products: data.products
      });

      if (response.data.success) {
        const result = response.data.data;
        console.log('Proximity notification sent:', result);
        
        // Show success message with details
        const notificationCount = result.notificationsSent || 0;
        if (notificationCount > 0) {
          alert(`Proximity notification sent to ${notificationCount} nearby consumers!`);
        } else {
          alert('No consumers nearby to notify at this time.');
        }
        
        return result;
      } else {
        throw new Error(response.data.message || 'Failed to send proximity notification');
      }
    } catch (error) {
      console.error('Failed to send proximity notification:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send proximity notification. Please try again.';
      alert(errorMessage);
      throw error;
    } finally {
      setSending(false);
    }
  }, []);

  return {
    sendProximityNotification,
    sending
  };
}