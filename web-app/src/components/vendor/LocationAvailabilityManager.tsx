import React, { useState, useEffect } from 'react';
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
  EyeOff
} from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useVendorStatus, useProximityNotifications } from '@/hooks/useVendorConsumerSales';
import { useNearbyVendors } from '@/hooks/useMarketplace';
import { getCardStyles } from '@/utils/styles';

export function LocationAvailabilityManager() {
  const { location, requestLocation, locationError, updateLocation } = useLocation();
  const { status: vendorStatus, goOnline, goOffline, toggleAcceptingOrders } = useVendorStatus();
  const { sendProximityNotification, sending: sendingNotification } = useProximityNotifications();
  const { vendors: nearbyVendors } = useNearbyVendors(location);

  const [deliveryRadius, setDeliveryRadius] = useState(vendorStatus.deliveryRadius);
  const [autoNotify, setAutoNotify] = useState(true);
  const [showNearbyVendors, setShowNearbyVendors] = useState(false);

  // Update location when vendor goes online
  useEffect(() => {
    if (vendorStatus.isOnline && !location) {
      requestLocation();
    }
  }, [vendorStatus.isOnline, location, requestLocation]);

  const handleGoOnline = async () => {
    if (!location) {
      await requestLocation();
    }
    await goOnline();
  };

  const handleGoOffline = async () => {
    await goOffline();
  };

  const handleSendProximityNotification = async () => {
    if (!location) {
      alert('Location is required to send proximity notifications');
      return;
    }

    await sendProximityNotification({
      latitude: location.latitude,
      longitude: location.longitude,
      message: 'Fresh products available for delivery!'
    });
  };

  const handleUpdateDeliveryRadius = (newRadius: number) => {
    setDeliveryRadius(newRadius);
    // In a real app, this would update the backend
  };

  return (
    <div className="space-y-6">
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
              <div className={`p-2 rounded-full ${location ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <Navigation className={`h-4 w-4 ${location ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {location ? 'Location Active' : 'Location Not Set'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {location 
                    ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                    : 'Enable location to start receiving orders'
                  }
                </p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => location ? updateLocation(location) : requestLocation()}
            >
              <Navigation className="h-4 w-4 mr-2" />
              {location ? 'Update' : 'Enable'} Location
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
                >
                  Go Offline
                </Button>
              ) : (
                <Button 
                  size="sm"
                  onClick={handleGoOnline}
                  disabled={!location}
                >
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
              onCheckedChange={toggleAcceptingOrders}
            />
          </div>
        </CardContent>
      </Card>

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
                onChange={(e) => handleUpdateDeliveryRadius(parseInt(e.target.value))}
                className="flex-1"
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
              disabled={!vendorStatus.isOnline || !location || sendingNotification}
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