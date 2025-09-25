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
}

interface VendorStatus {
  isOnline: boolean;
  deliveryRadius: number;
  acceptingOrders: boolean;
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
      const response = await api.get('/products/consumer-sales-stats');
      
      if (response.data.success) {
        setStats(response.data.data);
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
      // This would typically call an API endpoint for delivery opportunities
      // For now, we'll use mock data
      const mockOpportunities: DeliveryOpportunity[] = [
        {
          id: '1',
          type: 'pending_order',
          consumerName: 'Emma Wilson',
          distance: 650,
          priority: 'high',
          orderValue: 180,
          items: ['Tomatoes', 'Onions', 'Potatoes'],
          estimatedDeliveryTime: '15 minutes'
        },
        {
          id: '2',
          type: 'potential_customer',
          consumerName: 'David Kumar',
          distance: 1200,
          priority: 'medium',
          preferredItems: ['Fresh vegetables', 'Fruits'],
          estimatedDeliveryTime: '20 minutes'
        },
        {
          id: '3',
          type: 'pending_order',
          consumerName: 'Lisa Zhang',
          distance: 890,
          priority: 'medium',
          orderValue: 95,
          items: ['Spinach', 'Carrots'],
          estimatedDeliveryTime: '18 minutes'
        }
      ];

      setOpportunities(mockOpportunities);
    } catch (err) {
      console.error('Failed to fetch delivery opportunities:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch delivery opportunities'));
      setOpportunities([]);
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

export function useProximityNotifications() {
  const [sending, setSending] = useState(false);

  const sendProximityNotification = useCallback(async (data: {
    latitude: number;
    longitude: number;
    message: string;
  }) => {
    setSending(true);
    try {
      // This would typically call an API to send proximity notifications
      // For now, we'll just simulate the action
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Proximity notification sent:', data);
      alert('Proximity notification sent to nearby consumers!');
    } catch (error) {
      console.error('Failed to send proximity notification:', error);
      alert('Failed to send proximity notification. Please try again.');
    } finally {
      setSending(false);
    }
  }, []);

  return {
    sendProximityNotification,
    sending
  };
}