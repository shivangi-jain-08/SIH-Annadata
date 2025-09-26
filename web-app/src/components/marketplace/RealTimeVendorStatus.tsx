import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Clock, 
  Package, 
  Truck,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Navigation,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyVendors } from '@/hooks/useMarketplace';
import { getCardStyles } from '@/utils/styles';

interface VendorStatus {
  vendorId: string;
  name: string;
  isOnline: boolean;
  acceptingOrders: boolean;
  distance: number;
  lastSeen: string;
  productCount: number;
  estimatedDeliveryTime: string;
  deliveryRadius: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface RealTimeVendorStatusProps {
  showOfflineVendors?: boolean;
  maxVendors?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function RealTimeVendorStatus({ 
  showOfflineVendors = false,
  maxVendors = 10,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}: RealTimeVendorStatusProps) {
  const { socket, isConnected, notifications } = useWebSocket();
  const { location } = useLocation();
  const { vendors: nearbyVendors, loading, error, refetch } = useNearbyVendors(location);
  
  const [vendorStatuses, setVendorStatuses] = useState<Map<string, VendorStatus>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showDetails, setShowDetails] = useState(false);

  // Initialize vendor statuses from nearby vendors
  useEffect(() => {
    if (nearbyVendors && nearbyVendors.length > 0) {
      const statusMap = new Map<string, VendorStatus>();
      
      nearbyVendors.forEach(vendor => {
        statusMap.set(vendor.vendorId, {
          vendorId: vendor.vendorId,
          name: vendor.name || 'Unknown Vendor',
          isOnline: vendor.isActive || false,
          acceptingOrders: vendor.acceptingOrders !== false,
          distance: vendor.distance || 0,
          lastSeen: vendor.lastSeen || new Date().toISOString(),
          productCount: vendor.productCount || 0,
          estimatedDeliveryTime: vendor.estimatedDeliveryTime || '15-30 minutes',
          deliveryRadius: vendor.deliveryRadius || 2000,
          location: vendor.location
        });
      });
      
      setVendorStatuses(statusMap);
      setLastUpdate(new Date());
    }
  }, [nearbyVendors]);

  // Listen for real-time vendor updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleVendorOnline = (data: any) => {
      setVendorStatuses(prev => {
        const updated = new Map(prev);
        const existing = updated.get(data.vendorId) || {
          vendorId: data.vendorId,
          name: data.vendorName || 'Unknown Vendor',
          isOnline: false,
          acceptingOrders: true,
          distance: data.distance || 0,
          lastSeen: new Date().toISOString(),
          productCount: data.productCount || 0,
          estimatedDeliveryTime: '15-30 minutes',
          deliveryRadius: 2000
        };
        
        updated.set(data.vendorId, {
          ...existing,
          isOnline: true,
          acceptingOrders: data.acceptingOrders !== false,
          lastSeen: new Date().toISOString(),
          location: data.location ? {
            latitude: data.location.latitude || data.latitude,
            longitude: data.location.longitude || data.longitude
          } : existing.location
        });
        
        return updated;
      });
      setLastUpdate(new Date());
    };

    const handleVendorOffline = (data: any) => {
      setVendorStatuses(prev => {
        const updated = new Map(prev);
        const existing = updated.get(data.vendorId);
        
        if (existing) {
          updated.set(data.vendorId, {
            ...existing,
            isOnline: false,
            lastSeen: new Date().toISOString()
          });
        }
        
        return updated;
      });
      setLastUpdate(new Date());
    };

    const handleVendorLocationUpdate = (data: any) => {
      setVendorStatuses(prev => {
        const updated = new Map(prev);
        const existing = updated.get(data.vendorId);
        
        if (existing) {
          updated.set(data.vendorId, {
            ...existing,
            location: {
              latitude: data.latitude,
              longitude: data.longitude
            },
            acceptingOrders: data.isActive !== false,
            lastSeen: new Date().toISOString()
          });
        }
        
        return updated;
      });
      setLastUpdate(new Date());
    };

    const handleVendorStatusUpdate = (data: any) => {
      setVendorStatuses(prev => {
        const updated = new Map(prev);
        const existing = updated.get(data.vendorId);
        
        if (existing) {
          updated.set(data.vendorId, {
            ...existing,
            acceptingOrders: data.acceptingOrders,
            deliveryRadius: data.deliveryRadius || existing.deliveryRadius,
            lastSeen: new Date().toISOString()
          });
        }
        
        return updated;
      });
      setLastUpdate(new Date());
    };

    // Set up event listeners
    socket.on('vendor-online', handleVendorOnline);
    socket.on('vendor-offline', handleVendorOffline);
    socket.on('vendor-location-updated', handleVendorLocationUpdate);
    socket.on('vendor-status-updated', handleVendorStatusUpdate);

    return () => {
      socket.off('vendor-online', handleVendorOnline);
      socket.off('vendor-offline', handleVendorOffline);
      socket.off('vendor-location-updated', handleVendorLocationUpdate);
      socket.off('vendor-status-updated', handleVendorStatusUpdate);
    };
  }, [socket, isConnected]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetch]);

  // Filter and sort vendors
  const filteredVendors = Array.from(vendorStatuses.values())
    .filter(vendor => showOfflineVendors || vendor.isOnline)
    .sort((a, b) => {
      // Online vendors first
      if (a.isOnline !== b.isOnline) {
        return a.isOnline ? -1 : 1;
      }
      // Then by distance
      return a.distance - b.distance;
    })
    .slice(0, maxVendors);

  const onlineCount = Array.from(vendorStatuses.values()).filter(v => v.isOnline).length;
  const acceptingOrdersCount = Array.from(vendorStatuses.values()).filter(v => v.isOnline && v.acceptingOrders).length;

  const getStatusColor = (vendor: VendorStatus) => {
    if (!vendor.isOnline) return 'text-gray-500';
    if (!vendor.acceptingOrders) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusBadge = (vendor: VendorStatus) => {
    if (!vendor.isOnline) return { variant: 'outline' as const, text: 'Offline', color: 'border-gray-300' };
    if (!vendor.acceptingOrders) return { variant: 'outline' as const, text: 'Busy', color: 'border-yellow-300 text-yellow-700' };
    return { variant: 'default' as const, text: 'Available', color: 'bg-green-500' };
  };

  const formatLastSeen = (lastSeen: string) => {
    const now = new Date();
    const seen = new Date(lastSeen);
    const diffMs = now.getTime() - seen.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>Nearby Vendors</span>
              <Badge variant="outline" className="ml-2">
                {onlineCount} online
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? (
                  <EyeOff className="h-4 w-4 mr-2" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={refetch}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span>Real-time vendor availability in your area</span>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <span>Updated {formatLastSeen(lastUpdate.toISOString())}</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-2xl font-bold text-blue-900">{onlineCount}</p>
              <p className="text-xs text-blue-700">Online Now</p>
            </div>
            <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-2xl font-bold text-green-900">{acceptingOrdersCount}</p>
              <p className="text-xs text-green-700">Accepting Orders</p>
            </div>
            <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-2xl font-bold text-purple-900">{notifications.length}</p>
              <p className="text-xs text-purple-700">New Notifications</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Error */}
      {!isConnected && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Real-time updates unavailable</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Vendor status may not be current. Check your connection and refresh.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Failed to load vendor data</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              {error.message || 'Please check your connection and try again.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              className="mt-2"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Vendor List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredVendors.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No vendors nearby</h3>
              <p className="text-muted-foreground mb-4">
                {showOfflineVendors 
                  ? 'No vendors found in your area.' 
                  : 'No vendors are currently online in your area.'
                }
              </p>
              <Button onClick={refetch} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredVendors.map((vendor) => {
            const statusBadge = getStatusBadge(vendor);
            
            return (
              <Card key={vendor.vendorId} className={getCardStyles('hover')}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-full ${
                        vendor.isOnline ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Truck className={`h-4 w-4 ${getStatusColor(vendor)}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-sm">{vendor.name}</h3>
                          <Badge 
                            variant={statusBadge.variant}
                            className={statusBadge.color}
                          >
                            {statusBadge.text}
                          </Badge>
                          {vendor.isOnline && (
                            <div className="flex items-center space-x-1 text-xs text-green-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              <span>Live</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{vendor.distance}m away</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{vendor.estimatedDeliveryTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Package className="h-3 w-3" />
                            <span>{vendor.productCount} products</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Navigation className="h-3 w-3" />
                            <span>{formatLastSeen(vendor.lastSeen)}</span>
                          </div>
                        </div>
                        
                        {showDetails && vendor.location && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="font-medium">Lat:</span> {vendor.location.latitude.toFixed(4)}
                              </div>
                              <div>
                                <span className="font-medium">Lng:</span> {vendor.location.longitude.toFixed(4)}
                              </div>
                              <div>
                                <span className="font-medium">Radius:</span> {(vendor.deliveryRadius / 1000).toFixed(1)}km
                              </div>
                              <div>
                                <span className="font-medium">Orders:</span> {vendor.acceptingOrders ? 'Yes' : 'No'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      {vendor.isOnline && vendor.acceptingOrders && (
                        <Button size="sm" variant="outline">
                          View Products
                        </Button>
                      )}
                      {!vendor.isOnline && (
                        <Badge variant="outline" className="text-xs">
                          Last seen {formatLastSeen(vendor.lastSeen)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Show More Button */}
      {filteredVendors.length === maxVendors && vendorStatuses.size > maxVendors && (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Showing {maxVendors} of {vendorStatuses.size} vendors
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {/* Implement show more functionality */}}
            >
              Show More Vendors
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}