import React from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { ProximityNotification } from './ProximityNotification';
import { useAuth } from '@/contexts/AuthContext';

export function NotificationManager() {
  const { user } = useAuth();
  
  // Always call hooks at the top level
  let webSocket;
  try {
    webSocket = useWebSocket();
  } catch (error) {
    // WebSocket not available
    console.warn('WebSocket not available:', error);
    webSocket = { notifications: [], acknowledgeNotification: () => {} };
  }

  const { notifications, acknowledgeNotification } = webSocket;
  
  // Only show notifications for consumers
  if (user?.role !== 'consumer') {
    return null;
  }

  // If no notifications, don't render anything
  if (!notifications || notifications.length === 0) {
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