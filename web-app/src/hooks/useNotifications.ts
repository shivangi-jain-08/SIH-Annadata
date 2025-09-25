import { useCallback } from 'react';
import { useApi } from './useApi';
import ApiClient from '@/services/api';
import { NotificationsResponse } from '@/types/api';

export function useNotifications(page = 1, limit = 20) {
  const {
    data: notificationsResponse,
    loading,
    error,
    refetch,
  } = useApi<NotificationsResponse>(
    () => ApiClient.getNotifications(page, limit),
    [page, limit]
  );

  const notifications = notificationsResponse?.data?.notifications || [];

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await ApiClient.markNotificationAsRead(notificationId);
      refetch(); // Refresh the notifications list
    } catch (error) {
      console.error('Mark notification as read failed:', error);
      throw error;
    }
  }, [refetch]);

  const markAllAsRead = useCallback(async () => {
    try {
      await ApiClient.markAllNotificationsAsRead();
      refetch(); // Refresh the notifications list
    } catch (error) {
      console.error('Mark all notifications as read failed:', error);
      throw error;
    }
  }, [refetch]);

  return {
    notifications,
    loading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
  };
}

export function useNotificationStats() {
  const {
    data: statsResponse,
    loading,
    error,
    refetch,
  } = useApi(
    () => ApiClient.getNotificationStats(),
    []
  );

  const stats = statsResponse?.data || {};

  return {
    stats,
    loading,
    error,
    refetch,
  };
}