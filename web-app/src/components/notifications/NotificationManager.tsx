import React from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { ProximityNotification } from './ProximityNotification';
import { useAuth } from '@/contexts/AuthContext';

export function NotificationManager() {
  const { user } = useAuth();
  
  // Only show notifications for consumers
  if (user?.role !== 'consumer') {
    return null;
  }

  let notifications = [];
  let acknowledgeNotification = (id: string) => {};

  try {
    const webSocket = useWebSocket();
    notifications = webSocket.notifications;
    acknowledgeNotification = webSocket.acknowledgeNotification;
  } catch (error) {
    // WebSocket not available, use empty state
    console.warn('WebSocket not available:', error);
    return null;
  }

  const handleDismiss = (notificationId: string) => {
    acknowledgeNotification(notificationId);
  };

  const handleViewDetails = (vendorId: string) => {
    // Navigate to vendor details or open modal
    console.log('View vendor details:', vendorId);
    // You can implement navigation logic here
  };

  const handleContact = (vendorId: string) => {
    // Open contact modal or initiate call
    console.log('Contact vendor:', vendorId);
    // You can implement contact logic here
  };

  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        {notifications.map((notification, index) => (
          <div
            key={notification.notificationId}
            style={{
              transform: `translateY(${index * 10}px)`,
              zIndex: 50 - index,
            }}
          >
            <ProximityNotification
              notification={notification}
              onDismiss={handleDismiss}
              onViewDetails={handleViewDetails}
              onContact={handleContact}
            />
          </div>
        ))}
      </div>
    </div>
  );
}