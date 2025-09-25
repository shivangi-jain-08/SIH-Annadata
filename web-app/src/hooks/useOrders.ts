import { useCallback, useMemo } from 'react';
import { useApi, useMutation } from './useApi';
import ApiClient from '@/services/api';
import { OrdersResponse, OrderData, ApiResponse } from '@/types/api';

export function useOrders(status?: string) {
  const {
    data: ordersResponse,
    loading,
    error,
    refetch,
    retry,
  } = useApi<OrdersResponse>(
    () => ApiClient.getMyOrders(status),
    [status],
    {
      immediate: false, // Don't load immediately
      retryCount: 1, // Reduced retries
      onError: (error) => {
        console.error('Failed to fetch orders:', error);
      }
    }
  );

  const orders = useMemo(() => {
    return ordersResponse?.data?.orders || [];
  }, [ordersResponse]);

  const orderStats = useMemo(() => {
    const stats = {
      total: orders.length,
      pending: 0,
      confirmed: 0,
      in_transit: 0,
      delivered: 0,
      cancelled: 0,
      totalValue: 0,
      averageOrderValue: 0,
    };

    orders.forEach(order => {
      stats[order.status as keyof typeof stats]++;
      stats.totalValue += order.total;
    });

    stats.averageOrderValue = stats.total > 0 ? stats.totalValue / stats.total : 0;

    return stats;
  }, [orders]);

  const {
    mutate: createOrder,
    loading: creating,
    error: createError,
  } = useMutation<ApiResponse, OrderData>(
    (orderData: OrderData) => ApiClient.createOrder(orderData),
    {
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        console.error('Create order failed:', error);
      }
    }
  );

  const {
    mutate: updateOrderStatus,
    loading: updating,
    error: updateError,
  } = useMutation<ApiResponse, { orderId: string; status: string; deliveryDate?: string }>(
    ({ orderId, status, deliveryDate }) => ApiClient.updateOrderStatus(orderId, status, deliveryDate),
    {
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        console.error('Update order status failed:', error);
      }
    }
  );

  const {
    mutate: cancelOrder,
    loading: cancelling,
    error: cancelError,
  } = useMutation<ApiResponse, { orderId: string; reason: string }>(
    ({ orderId, reason }) => ApiClient.cancelOrder(orderId, reason),
    {
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        console.error('Cancel order failed:', error);
      }
    }
  );

  return {
    orders,
    orderStats,
    loading,
    error,
    retry,
    refetch,
    createOrder,
    creating,
    createError,
    updateOrderStatus,
    updating,
    updateError,
    cancelOrder,
    cancelling,
    cancelError,
  };
}

export function useOrderStats() {
  const {
    data: statsResponse,
    loading,
    error,
    refetch,
    retry,
  } = useApi<ApiResponse>(
    () => ApiClient.getOrderStats(),
    [],
    {
      immediate: false, // Don't load immediately
      retryCount: 1, // Reduced retries
      onError: (error) => {
        console.error('Failed to fetch order stats:', error);
      }
    }
  );

  const stats = useMemo(() => {
    return statsResponse?.data || {};
  }, [statsResponse]);

  return {
    stats,
    loading,
    error,
    retry,
    refetch,
  };
}

// New hook for order management
export function useOrderManagement() {
  const {
    mutate: getOrder,
    data: currentOrder,
    loading: fetchingOrder,
    error: fetchError,
  } = useMutation<ApiResponse, string>(
    (orderId: string) => ApiClient.getOrder(orderId),
    {
      onError: (error) => {
        console.error('Failed to fetch order:', error);
      }
    }
  );

  const {
    mutate: updateOrderStatus,
    loading: updatingStatus,
    error: updateStatusError,
  } = useMutation<ApiResponse, { orderId: string; status: string; deliveryDate?: string }>(
    ({ orderId, status, deliveryDate }) => ApiClient.updateOrderStatus(orderId, status, deliveryDate),
    {
      onSuccess: (data) => {
        console.log('Order status updated successfully:', data);
      },
      onError: (error) => {
        console.error('Update order status failed:', error);
      }
    }
  );

  const {
    mutate: cancelOrder,
    loading: cancellingOrder,
    error: cancelOrderError,
  } = useMutation<ApiResponse, { orderId: string; reason: string }>(
    ({ orderId, reason }) => ApiClient.cancelOrder(orderId, reason),
    {
      onSuccess: (data) => {
        console.log('Order cancelled successfully:', data);
      },
      onError: (error) => {
        console.error('Cancel order failed:', error);
      }
    }
  );

  return {
    getOrder,
    currentOrder: currentOrder?.data,
    fetchingOrder,
    fetchError,
    updateOrderStatus,
    updatingStatus,
    updateStatusError,
    cancelOrder,
    cancellingOrder,
    cancelOrderError,
  };
}