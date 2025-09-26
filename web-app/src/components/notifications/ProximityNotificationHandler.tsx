import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  BellOff, 
  MapPin, 
  Truck, 
  Package,
  Clock,
  Navigation,
  Settings,
  AlertCircle,
  CheckCircle,
  X,
  ShoppingCart
} from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useLocation } from '@/hooks/useLocation';
import { useNotifications } from '@/hooks/useNotifications';
import { getCardStyles } from '@/utils/styles';
import { QuickOrderFromProximity } from '@/components/orders/QuickOrderFromProximity';

interface ProximityNotification {
  id: string;
  type: 'vendor-nearby';
  vendorId: string;
  vendorName: string;
  distance: number;
  products: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    unit: string;
  }>;
  productCount: number;
  hasProducts: boolean;
  timestamp: string;
  estimatedArrival?: string;
}

interface NotificationPreferences {
  enabled: boolean;
  radius: number;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export function ProximityNotificationHandler() {
  const { socket, isConnected, notifications: wsNotifications, acknowledgeNotification } = useWebSocket();
  const { location, requestLocation } = useLocation();
  const { notifications, markAsRead } = useNotifications();
  
  // Use notifications from WebSocket context
  const proximityNotifications = wsNotifications || [];
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    radius: 1000,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    soundEnabled: true,
    vibrationEnabled: false
  });
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [showSettings, setShowSettings] = useState(false);
  const [quickOrderVendor, setQuickOrderVendor] = useState<{
    vendorId: string;
    vendorName: string;
    distance: number;
    estimatedDeliveryTime: string;
  } | null>(null);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);
        return permission === 'granted';
      } catch (error) {
        console.error('Failed to request notification permission:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Check if we're in quiet hours
  const isInQuietHours = useCallback(() => {
    if (!preferences.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    
    const { start, end } = preferences.quietHours;
    
    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    } else {
      return currentTime >= start && currentTime <= end;
    }
  }, [preferences.quietHours]);

  // Show browser notification
  const showBrowserNotification = useCallback((notification: ProximityNotification) => {
    if (permissionStatus !== 'granted' || !preferences.enabled || isInQuietHours()) {
      return;
    }

    const productList = notification.products.slice(0, 3).map(p => p.name).join(', ');
    const title = `${notification.vendorName} is nearby`;
    const body = notification.hasProducts 
      ? `${notification.distance}m away with ${productList}${notification.products.length > 3 ? ' and more' : ''}`
      : `${notification.distance}m away • ${notification.estimatedArrival || 'Available now'}`;

    const browserNotification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `vendor-${notification.vendorId}`,
      requireInteraction: true,
      data: {
        vendorId: notification.vendorId,
        type: 'vendor-nearby'
      }
    });

    // Play sound if enabled
    if (preferences.soundEnabled) {
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore audio play errors (user interaction required)
        });
      } catch (error) {
        console.warn('Failed to play notification sound:', error);
      }
    }

    // Vibrate if enabled and supported
    if (preferences.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // Handle notification click
    browserNotification.onclick = () => {
      window.focus();
      // Navigate to vendor's products
      window.location.href = `/marketplace/vendor/${notification.vendorId}`;
      browserNotification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => {
      browserNotification.close();
    }, 10000);
  }, [permissionStatus, preferences, isInQuietHours]);

  // Show browser notifications for new proximity notifications
  useEffect(() => {
    if (proximityNotifications.length > 0) {
      const latestNotification = proximityNotifications[0];
      showBrowserNotification(latestNotification);
    }
  }, [proximityNotifications, showBrowserNotification]);

  // Update location when preferences change
  useEffect(() => {
    if (preferences.enabled && !location) {
      requestLocation();
    }
  }, [preferences.enabled, location, requestLocation]);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const handleDismissNotification = (notificationId: string) => {
    acknowledgeNotification(notificationId);
  };

  const handleViewVendor = (vendorId: string) => {
    window.location.href = `/marketplace/vendor/${vendorId}`;
  };

  const handleQuickOrder = (notification: any) => {
    setQuickOrderVendor({
      vendorId: notification.vendorId,
      vendorName: notification.vendorName,
      distance: notification.distance,
      estimatedDeliveryTime: notification.estimatedArrival || 'Unknown'
    });
  };

  const handleOrderPlaced = (orderId: string) => {
    console.log('Order placed:', orderId);
    // Could show a success notification or redirect to order tracking
  };

  const updatePreferences = (updates: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
    // In a real app, this would save to backend
  };

  return (
    <div className="space-y-4">
      {/* Notification Permission */}
      {permissionStatus !== 'granted' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Enable Notifications</p>
                  <p className="text-sm text-yellow-700">
                    Get notified when vendors are nearby with fresh products
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={requestNotificationPermission}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Enable
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Proximity Notifications</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Customize how you receive proximity notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Proximity Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when vendors are nearby
                </p>
              </div>
              <Switch
                checked={preferences.enabled}
                onCheckedChange={(enabled) => updatePreferences({ enabled })}
              />
            </div>

            {/* Notification Radius */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notification Radius</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={preferences.radius}
                  onChange={(e) => updatePreferences({ radius: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <div className="text-sm font-semibold min-w-[80px]">
                  {(preferences.radius / 1000).toFixed(1)} km
                </div>
              </div>
            </div>

            {/* Sound and Vibration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Sound</p>
                  <p className="text-xs text-muted-foreground">Play notification sound</p>
                </div>
                <Switch
                  checked={preferences.soundEnabled}
                  onCheckedChange={(soundEnabled) => updatePreferences({ soundEnabled })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Vibration</p>
                  <p className="text-xs text-muted-foreground">Vibrate on notification</p>
                </div>
                <Switch
                  checked={preferences.vibrationEnabled}
                  onCheckedChange={(vibrationEnabled) => updatePreferences({ vibrationEnabled })}
                />
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Quiet Hours</p>
                  <p className="text-sm text-muted-foreground">
                    Disable notifications during specific hours
                  </p>
                </div>
                <Switch
                  checked={preferences.quietHours.enabled}
                  onCheckedChange={(enabled) => 
                    updatePreferences({ 
                      quietHours: { ...preferences.quietHours, enabled } 
                    })
                  }
                />
              </div>

              {preferences.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Time</label>
                    <input
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) => 
                        updatePreferences({ 
                          quietHours: { ...preferences.quietHours, start: e.target.value } 
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Time</label>
                    <input
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) => 
                        updatePreferences({ 
                          quietHours: { ...preferences.quietHours, end: e.target.value } 
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Notifications */}
      {proximityNotifications.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Nearby Vendors</h4>
          {proximityNotifications.map((notification) => (
            <Card key={notification.notificationId} className={`${getCardStyles('hover')} border-blue-200`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-blue-100">
                      <Truck className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold">{notification.vendorName}</h4>
                        <Badge variant="outline" className="text-xs">
                          {notification.distance}m away
                        </Badge>
                        {notification.estimatedArrival && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {notification.estimatedArrival}
                          </Badge>
                        )}
                      </div>
                      
                      {notification.products && notification.products.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Available products ({notification.products.length}):
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {notification.products.slice(0, 4).map((product, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {product}
                              </Badge>
                            ))}
                            {notification.products.length > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{notification.products.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleQuickOrder(notification)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Quick Order
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewVendor(notification.vendorId)}
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismissNotification(notification.notificationId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Notifications */}
      {proximityNotifications.length === 0 && preferences.enabled && (
        <Card>
          <CardContent className="p-6 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-2">No vendors nearby</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You'll be notified when vendors with fresh products are in your area
            </p>
            {!location && (
              <Button size="sm" onClick={requestLocation}>
                <Navigation className="h-4 w-4 mr-2" />
                Enable Location
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Disabled State */}
      {!preferences.enabled && (
        <Card>
          <CardContent className="p-6 text-center">
            <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Notifications Disabled</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enable proximity notifications to get notified when vendors are nearby
            </p>
            <Button 
              size="sm" 
              onClick={() => updatePreferences({ enabled: true })}
            >
              <Bell className="h-4 w-4 mr-2" />
              Enable Notifications
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Order Modal */}
      {quickOrderVendor && (
        <QuickOrderFromProximity
          vendorId={quickOrderVendor.vendorId}
          vendorName={quickOrderVendor.vendorName}
          distance={quickOrderVendor.distance}
          estimatedDeliveryTime={quickOrderVendor.estimatedDeliveryTime}
          onClose={() => setQuickOrderVendor(null)}
          onOrderPlaced={handleOrderPlaced}
        />
      )}
    </div>
  );
}