import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Bell, 
  MapPin, 
  ShoppingCart,
  Package,
  MessageCircle,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/hooks/useLocation';
import { useVendorRealTime, useConsumerRealTime } from '@/hooks/useRealTime';
import { getCardStyles } from '@/utils/styles';

export function RealTimeIntegration() {
  const { user } = useAuth();
  const { location } = useLocation();
  const [showDetails, setShowDetails] = useState(false);
  
  // Use appropriate real-time hook based on user role
  const vendorRealTime = user?.role === 'vendor' ? useVendorRealTime() : null;
  const consumerRealTime = user?.role === 'consumer' ? useConsumerRealTime() : null;
  
  const realTime = vendorRealTime || consumerRealTime;
  
  // Auto-update location for consumers
  useEffect(() => {
    if (user?.role === 'consumer' && location && consumerRealTime) {
      consumerRealTime.updateConsumerLocation({
        longitude: location.longitude,
        latitude: location.latitude
      });
    }
  }, [location, user?.role, consumerRealTime]);

  if (!realTime) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-yellow-800">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Real-time features unavailable</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Please log in to access real-time features.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'connecting':
        return 'text-yellow-600 bg-yellow-100';
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getConnectionIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return Wifi;
      case 'connecting':
        return RefreshCw;
      case 'disconnected':
        return WifiOff;
      default:
        return AlertCircle;
    }
  };

  const ConnectionIcon = getConnectionIcon(realTime.connectionStatus);

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card className={getCardStyles('base')}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <span>Real-time Status</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={getConnectionStatusColor(realTime.connectionStatus)}
              >
                <ConnectionIcon className={`h-3 w-3 mr-1 ${realTime.connectionStatus === 'connecting' ? 'animate-spin' : ''}`} />
                {realTime.connectionStatus}
              </Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {showDetails && (
          <CardContent className="space-y-4">
            {/* Last Event */}
            {realTime.lastEvent && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-blue-800">
                    Last Event: {realTime.lastEvent.type}
                  </span>
                  <span className="text-xs text-blue-600">
                    {realTime.lastEvent.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <pre className="text-xs text-blue-700 bg-blue-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(realTime.lastEvent.data, null, 2)}
                </pre>
              </div>
            )}
            
            {/* Connection Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">User Role</p>
                <p className="text-lg font-bold text-gray-900">{user?.role || 'Unknown'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">Location</p>
                <p className="text-sm text-gray-700">
                  {location ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Vendor-specific Real-time Features */}
      {user?.role === 'vendor' && vendorRealTime && (
        <div className="space-y-4">
          {/* New Orders */}
          {vendorRealTime.newOrders.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-green-800">
                    <ShoppingCart className="h-5 w-5" />
                    <span>New Orders ({vendorRealTime.newOrders.length})</span>
                  </CardTitle>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={vendorRealTime.clearNewOrders}
                  >
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {vendorRealTime.newOrders.slice(0, 3).map((order, index) => (
                  <div key={order.orderId || index} className="flex items-center justify-between p-3 bg-white border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Package className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Order #{order.orderId?.slice(-6)}</p>
                        <p className="text-xs text-muted-foreground">
                          From {order.buyerName} • ₹{order.totalAmount}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View Order
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Vendor Events */}
          {vendorRealTime.vendorEvents.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    <span>Recent Activity</span>
                  </CardTitle>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={vendorRealTime.clearEvents}
                  >
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {vendorRealTime.vendorEvents.slice(0, 5).map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium">{event.type}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Consumer-specific Real-time Features */}
      {user?.role === 'consumer' && consumerRealTime && (
        <div className="space-y-4">
          {/* Proximity Notifications */}
          {consumerRealTime.proximityNotifications.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-blue-800">
                    <Bell className="h-5 w-5" />
                    <span>Vendors Nearby ({consumerRealTime.proximityNotifications.length})</span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {consumerRealTime.proximityNotifications.slice(0, 3).map((notification, index) => (
                  <div key={notification.notificationId || index} className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{notification.vendorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {notification.distance}m away • {notification.products?.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        View Products
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => consumerRealTime.dismissProximityNotification(notification.notificationId)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Nearby Vendors */}
          {consumerRealTime.nearbyVendors.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  <span>Live Vendor Locations ({consumerRealTime.nearbyVendors.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {consumerRealTime.nearbyVendors.slice(0, 5).map((vendor, index) => (
                  <div key={vendor.vendorId || index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-orange-100">
                        <Users className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{vendor.vendorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {vendor.distance}m away • Last updated: {new Date(vendor.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Live
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Order Updates */}
          {consumerRealTime.orderUpdates.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-green-500" />
                    <span>Order Updates</span>
                  </CardTitle>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={consumerRealTime.clearOrderUpdates}
                  >
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {consumerRealTime.orderUpdates.slice(0, 5).map((update, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Order #{update.orderId?.slice(-6)} is now {update.status}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(update.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* No Activity State */}
      {realTime.isConnected && 
       (!vendorRealTime?.newOrders.length && !vendorRealTime?.vendorEvents.length) &&
       (!consumerRealTime?.proximityNotifications.length && !consumerRealTime?.orderUpdates.length) && (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Real-time features active</h3>
            <p className="text-sm text-muted-foreground">
              {user?.role === 'vendor' 
                ? 'You\'ll receive notifications for new orders and location updates here.'
                : 'You\'ll receive notifications when vendors are nearby and order updates here.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default RealTimeIntegration;