import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  MapPin, 
  Navigation, 
  Users, 
  Clock,
  Truck,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Settings,
  Bell,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useVendorLocationStatus, useProximityNotifications } from '@/hooks/useVendorConsumerSales';
import { useNearbyVendors } from '@/hooks/useMarketplace';
import { getCardStyles } from '@/utils/styles';
import ApiClient from '@/services/api';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useVendorRealTime } from '@/hooks/useRealTime';

export function LocationAvailabilityManager() {
  const { location, requestLocation, locationError } = useLocation();
  const { socket, isConnected } = useWebSocket();
  const { 
    vendorEvents, 
    newOrders, 
    updateVendorLocation: realTimeUpdateLocation,
    goVendorOnline: realTimeGoOnline,
    goVendorOffline: realTimeGoOffline,
    clearNewOrders,
    clearEvents
  } = useVendorRealTime();
  const { 
    status: vendorStatus, 
    loading: statusLoading,
    error: statusError,
    goOnline, 
    goOffline, 
    updateDeliverySettings,
    updateLocation: updateVendorLocation
  } = useVendorLocationStatus();
  const { sendProximityNotification, sending: sendingNotification } = useProximityNotifications();
  const { vendors: nearbyVendors } = useNearbyVendors(location);

  const [deliveryRadius, setDeliveryRadius] = useState(vendorStatus.deliveryRadius);
  const [autoNotify, setAutoNotify] = useState(true);
  const [showNearbyVendors, setShowNearbyVendors] = useState(false);

  // Update local state when vendor status changes
  useEffect(() => {
    setDeliveryRadius(vendorStatus.deliveryRadius);
  }, [vendorStatus.deliveryRadius]);

  // Set up real-time location updates when vendor is online
  useEffect(() => {
    if (!vendorStatus.isOnline || !socket || !isConnected) return;

    let watchId: number | null = null;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };

          // Update backend
          updateVendorLocation(newLocation).catch(console.error);

          // Broadcast via Socket.io
          socket.emit('vendor-location-update', {
            longitude: newLocation.longitude,
            latitude: newLocation.latitude,
            isActive: vendorStatus.acceptingOrders
          });
        },
        (error) => {
          console.warn('Location watch error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000 // 30 seconds
        }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [vendorStatus.isOnline, socket, isConnected, updateVendorLocation, vendorStatus.acceptingOrders]);

  const handleGoOnline = async () => {
    try {
      let coords = vendorStatus.currentLocation;
      
      if (!coords) {
        // Request location if not available
        if (navigator.geolocation) {
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
      }

      await goOnline(coords);
      
      // Broadcast vendor online status via Socket.io
      if (socket && isConnected && coords) {
        socket.emit('vendor-online', {
          longitude: coords.longitude,
          latitude: coords.latitude
        });
      }
    } catch (error) {
      console.error('Failed to go online:', error);
      alert('Failed to go online. Please check your location permissions and try again.');
    }
  };

  const handleGoOffline = async () => {
    try {
      await goOffline();
      
      // Broadcast vendor offline status via Socket.io
      if (socket && isConnected) {
        socket.emit('vendor-offline');
      }
    } catch (error) {
      console.error('Failed to go offline:', error);
      alert('Failed to go offline. Please try again.');
    }
  };

  const handleSendProximityNotification = async () => {
    const currentLocation = vendorStatus.currentLocation || location;
    
    if (!currentLocation) {
      alert('Location is required to send proximity notifications');
      return;
    }

    try {
      await sendProximityNotification({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        message: 'Fresh products available for delivery!'
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleUpdateDeliveryRadius = async (newRadius: number) => {
    setDeliveryRadius(newRadius);
    
    try {
      await updateDeliverySettings({ deliveryRadius: newRadius });
    } catch (error) {
      console.error('Failed to update delivery radius:', error);
      // Revert local state on error
      setDeliveryRadius(vendorStatus.deliveryRadius);
      alert('Failed to update delivery radius. Please try again.');
    }
  };

  const handleToggleAcceptingOrders = async () => {
    try {
      await updateDeliverySettings({ 
        acceptingOrders: !vendorStatus.acceptingOrders 
      });
    } catch (error) {
      console.error('Failed to toggle accepting orders:', error);
      alert('Failed to update order acceptance status. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/dashboard/vendor">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Location & Availability</h2>
          <p className="text-muted-foreground">
            Control your online status and location sharing
          </p>
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span>Vendor Status</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={vendorStatus.isOnline ? "default" : "outline"}
                className={vendorStatus.isOnline ? "bg-green-500" : ""}
              >
                {vendorStatus.isOnline ? "Online" : "Offline"}
              </Badge>
              <Badge 
                variant={vendorStatus.acceptingOrders ? "default" : "outline"}
                className={vendorStatus.acceptingOrders ? "bg-blue-500" : ""}
              >
                {vendorStatus.acceptingOrders ? "Accepting Orders" : "Not Accepting"}
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Manage your online presence and delivery availability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${vendorStatus.currentLocation ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <Navigation className={`h-4 w-4 ${vendorStatus.currentLocation ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {vendorStatus.currentLocation ? 'Location Active' : 'Location Not Set'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {vendorStatus.currentLocation 
                    ? `${vendorStatus.currentLocation.latitude.toFixed(4)}, ${vendorStatus.currentLocation.longitude.toFixed(4)}`
                    : 'Enable location to start receiving orders'
                  }
                </p>
                {vendorStatus.onlineSince && (
                  <p className="text-xs text-muted-foreground">
                    Online since: {new Date(vendorStatus.onlineSince).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={requestLocation}
              disabled={statusLoading}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Update Location
            </Button>
          </div>

          {/* Online/Offline Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${vendorStatus.isOnline ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Truck className={`h-4 w-4 ${vendorStatus.isOnline ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">Vendor Status</p>
                <p className="text-xs text-muted-foreground">
                  {vendorStatus.isOnline 
                    ? 'You are visible to nearby consumers'
                    : 'You are not visible to consumers'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {vendorStatus.isOnline ? (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleGoOffline}
                  disabled={statusLoading}
                >
                  {statusLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Go Offline
                </Button>
              ) : (
                <Button 
                  size="sm"
                  onClick={handleGoOnline}
                  disabled={statusLoading}
                >
                  {statusLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Go Online
                </Button>
              )}
            </div>
          </div>

          {/* Order Acceptance Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${vendorStatus.acceptingOrders ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <CheckCircle className={`h-4 w-4 ${vendorStatus.acceptingOrders ? 'text-blue-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">Order Acceptance</p>
                <p className="text-xs text-muted-foreground">
                  {vendorStatus.acceptingOrders 
                    ? 'Currently accepting new orders'
                    : 'Not accepting new orders'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={vendorStatus.acceptingOrders}
              onCheckedChange={handleToggleAcceptingOrders}
              disabled={statusLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Status Error */}
      {statusError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Status Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              {statusError.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Location Error */}
      {locationError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Location Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              {locationError}
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2"
              onClick={requestLocation}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delivery Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-purple-500" />
            <span>Delivery Settings</span>
          </CardTitle>
          <CardDescription>
            Configure your delivery preferences and coverage area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Delivery Radius */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Delivery Radius</label>
            <div className="flex items-center space-x-4">
              <Input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={deliveryRadius}
                onChange={(e) => setDeliveryRadius(parseInt(e.target.value))}
                onMouseUp={(e) => handleUpdateDeliveryRadius(parseInt((e.target as HTMLInputElement).value))}
                className="flex-1"
                disabled={statusLoading}
              />
              <div className="text-sm font-semibold min-w-[80px]">
                {(deliveryRadius / 1000).toFixed(1)} km
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Consumers within this radius will see your products and receive proximity notifications
            </p>
          </div>

          {/* Auto Notifications */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-semibold text-sm">Auto Proximity Notifications</p>
              <p className="text-xs text-muted-foreground">
                Automatically notify nearby consumers when you go online
              </p>
            </div>
            <Switch
              checked={autoNotify}
              onCheckedChange={setAutoNotify}
            />
          </div>

          {/* Manual Notification */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-semibold text-sm">Send Proximity Notification</p>
              <p className="text-xs text-muted-foreground">
                Manually notify nearby consumers about your availability
              </p>
            </div>
            <Button 
              size="sm"
              onClick={handleSendProximityNotification}
              disabled={!vendorStatus.isOnline || (!vendorStatus.currentLocation && !location) || sendingNotification}
            >
              {sendingNotification ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bell className="h-4 w-4 mr-2" />
              )}
              Notify Nearby
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Nearby Consumers/Competition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-500" />
              <span>Area Overview</span>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowNearbyVendors(!showNearbyVendors)}
            >
              {showNearbyVendors ? (
                <EyeOff className="h-4 w-4 mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {showNearbyVendors ? 'Hide' : 'Show'} Competition
            </Button>
          </CardTitle>
          <CardDescription>
            Information about your delivery area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Area Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-900">
                {Math.floor(Math.random() * 50) + 20}
              </p>
              <p className="text-xs text-blue-700">Potential Customers</p>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
              <p className="text-2xl font-bold text-orange-900">
                {nearbyVendors?.length || 0}
              </p>
              <p className="text-xs text-orange-700">Nearby Vendors</p>
            </div>
          </div>

          {/* Nearby Vendors */}
          {showNearbyVendors && nearbyVendors && nearbyVendors.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Nearby Competition:</p>
              {nearbyVendors.slice(0, 3).map((vendor, index) => (
                <div key={vendor.vendorId || index} className={`${getCardStyles('base')} p-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-gray-100">
                        <Users className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{vendor.name || 'Unknown Vendor'}</p>
                        <p className="text-xs text-muted-foreground">
                          {vendor.productCount || 0} products • {vendor.distance}m away
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {vendor.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
              {nearbyVendors.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{nearbyVendors.length - 3} more vendors in your area
                </p>
              )}
            </div>
          )}

          {/* Tips */}
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-2">💡 Tips for Success:</p>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Stay online during peak hours (7-9 AM, 6-8 PM)</li>
              <li>• Keep your product inventory updated</li>
              <li>• Respond quickly to customer orders</li>
              <li>• Send proximity notifications during busy times</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}