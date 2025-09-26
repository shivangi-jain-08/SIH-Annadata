import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Bell,
  BellOff,
  Filter,
  X
} from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useProducts } from '@/hooks/useProducts';
import { getCardStyles } from '@/utils/styles';

interface InventoryUpdate {
  id: string;
  productId: string;
  productName: string;
  vendorId: string;
  vendorName: string;
  updateType: 'quantity_change' | 'price_change' | 'availability_change' | 'new_product' | 'product_removed';
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  distance?: number;
  category?: string;
}

interface RealTimeInventoryUpdatesProps {
  maxUpdates?: number;
  showNotifications?: boolean;
  filterByDistance?: number; // in meters
  filterByCategory?: string;
  autoRefresh?: boolean;
}

export function RealTimeInventoryUpdates({
  maxUpdates = 20,
  showNotifications = true,
  filterByDistance,
  filterByCategory,
  autoRefresh = true
}: RealTimeInventoryUpdatesProps) {
  const { socket, isConnected } = useWebSocket();
  const { refetch: refetchProducts } = useProducts();
  
  const [updates, setUpdates] = useState<InventoryUpdate[]>([]);
  const [notifications, setNotifications] = useState(showNotifications);
  const [filters, setFilters] = useState({
    distance: filterByDistance,
    category: filterByCategory,
    updateType: 'all' as string
  });
  const [showFilters, setShowFilters] = useState(false);

  // Listen for real-time inventory updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleProductUpdate = (data: any) => {
      const update: InventoryUpdate = {
        id: `${data.productId}-${Date.now()}`,
        productId: data.productId,
        productName: data.productName || 'Unknown Product',
        vendorId: data.vendorId,
        vendorName: data.vendorName || 'Unknown Vendor',
        updateType: data.updateType || 'quantity_change',
        oldValue: data.oldValue,
        newValue: data.newValue,
        timestamp: new Date(data.timestamp || Date.now()),
        distance: data.distance,
        category: data.category
      };

      // Apply filters
      if (filters.distance && update.distance && update.distance > filters.distance) {
        return;
      }
      
      if (filters.category && filters.category !== 'all' && update.category !== filters.category) {
        return;
      }
      
      if (filters.updateType !== 'all' && update.updateType !== filters.updateType) {
        return;
      }

      setUpdates(prev => [update, ...prev].slice(0, maxUpdates));

      // Show browser notification if enabled
      if (notifications && 'Notification' in window && Notification.permission === 'granted') {
        const notificationTitle = getUpdateNotificationTitle(update);
        const notificationBody = getUpdateNotificationBody(update);
        
        new Notification(notificationTitle, {
          body: notificationBody,
          icon: '/favicon.ico',
          tag: `inventory-${update.productId}`,
          requireInteraction: false
        });
      }

      // Refresh products if auto-refresh is enabled
      if (autoRefresh) {
        refetchProducts();
      }
    };

    const handleProductAvailabilityChange = (data: any) => {
      handleProductUpdate({
        ...data,
        updateType: 'availability_change'
      });
    };

    const handleNewProduct = (data: any) => {
      handleProductUpdate({
        ...data,
        updateType: 'new_product'
      });
    };

    const handleProductRemoved = (data: any) => {
      handleProductUpdate({
        ...data,
        updateType: 'product_removed'
      });
    };

    // Set up event listeners
    socket.on('product-updated', handleProductUpdate);
    socket.on('product-availability-changed', handleProductAvailabilityChange);
    socket.on('new-product-added', handleNewProduct);
    socket.on('product-removed', handleProductRemoved);

    return () => {
      socket.off('product-updated', handleProductUpdate);
      socket.off('product-availability-changed', handleProductAvailabilityChange);
      socket.off('new-product-added', handleNewProduct);
      socket.off('product-removed', handleProductRemoved);
    };
  }, [socket, isConnected, filters, notifications, maxUpdates, autoRefresh, refetchProducts]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotifications(true);
      }
    }
  }, []);

  const getUpdateIcon = (updateType: string) => {
    switch (updateType) {
      case 'quantity_change':
        return Package;
      case 'price_change':
        return TrendingUp;
      case 'availability_change':
        return AlertTriangle;
      case 'new_product':
        return CheckCircle;
      case 'product_removed':
        return X;
      default:
        return Package;
    }
  };

  const getUpdateColor = (updateType: string, oldValue?: any, newValue?: any) => {
    switch (updateType) {
      case 'quantity_change':
        if (oldValue !== undefined && newValue !== undefined) {
          return newValue > oldValue ? 'text-green-600' : 'text-red-600';
        }
        return 'text-blue-600';
      case 'price_change':
        if (oldValue !== undefined && newValue !== undefined) {
          return newValue > oldValue ? 'text-red-600' : 'text-green-600';
        }
        return 'text-purple-600';
      case 'availability_change':
        return newValue ? 'text-green-600' : 'text-red-600';
      case 'new_product':
        return 'text-green-600';
      case 'product_removed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getUpdateBadgeColor = (updateType: string, oldValue?: any, newValue?: any) => {
    switch (updateType) {
      case 'quantity_change':
        if (oldValue !== undefined && newValue !== undefined) {
          return newValue > oldValue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        }
        return 'bg-blue-100 text-blue-800';
      case 'price_change':
        if (oldValue !== undefined && newValue !== undefined) {
          return newValue > oldValue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
        }
        return 'bg-purple-100 text-purple-800';
      case 'availability_change':
        return newValue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
      case 'new_product':
        return 'bg-green-100 text-green-800';
      case 'product_removed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUpdateDescription = (update: InventoryUpdate) => {
    switch (update.updateType) {
      case 'quantity_change':
        if (update.oldValue !== undefined && update.newValue !== undefined) {
          const change = update.newValue - update.oldValue;
          const direction = change > 0 ? 'increased' : 'decreased';
          return `Quantity ${direction} from ${update.oldValue} to ${update.newValue}`;
        }
        return `Quantity updated to ${update.newValue}`;
      case 'price_change':
        if (update.oldValue !== undefined && update.newValue !== undefined) {
          const direction = update.newValue > update.oldValue ? 'increased' : 'decreased';
          return `Price ${direction} from ₹${update.oldValue} to ₹${update.newValue}`;
        }
        return `Price updated to ₹${update.newValue}`;
      case 'availability_change':
        return update.newValue ? 'Now available' : 'No longer available';
      case 'new_product':
        return 'New product added';
      case 'product_removed':
        return 'Product removed from inventory';
      default:
        return 'Product updated';
    }
  };

  const getUpdateNotificationTitle = (update: InventoryUpdate) => {
    switch (update.updateType) {
      case 'new_product':
        return '🆕 New Product Available';
      case 'quantity_change':
        return '📦 Stock Updated';
      case 'price_change':
        return '💰 Price Changed';
      case 'availability_change':
        return update.newValue ? '✅ Back in Stock' : '❌ Out of Stock';
      default:
        return '📱 Product Update';
    }
  };

  const getUpdateNotificationBody = (update: InventoryUpdate) => {
    return `${update.productName} from ${update.vendorName} - ${getUpdateDescription(update)}`;
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const clearUpdates = () => {
    setUpdates([]);
  };

  const toggleNotifications = async () => {
    if (!notifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await requestNotificationPermission();
      } else if (Notification.permission === 'granted') {
        setNotifications(true);
      } else {
        alert('Notifications are blocked. Please enable them in your browser settings.');
      }
    } else {
      setNotifications(!notifications);
    }
  };

  const updateTypeOptions = [
    { value: 'all', label: 'All Updates' },
    { value: 'quantity_change', label: 'Stock Changes' },
    { value: 'price_change', label: 'Price Changes' },
    { value: 'availability_change', label: 'Availability' },
    { value: 'new_product', label: 'New Products' },
    { value: 'product_removed', label: 'Removed Products' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'grains', label: 'Grains' },
    { value: 'pulses', label: 'Pulses' },
    { value: 'spices', label: 'Spices' },
    { value: 'herbs', label: 'Herbs' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <span>Live Inventory Updates</span>
              <Badge variant="outline" className="ml-2">
                {updates.length} updates
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={toggleNotifications}
                className={notifications ? 'text-green-600' : 'text-gray-600'}
              >
                {notifications ? (
                  <Bell className="h-4 w-4 mr-2" />
                ) : (
                  <BellOff className="h-4 w-4 mr-2" />
                )}
                {notifications ? 'Notifications On' : 'Notifications Off'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearUpdates}
                disabled={updates.length === 0}
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span>Real-time product and inventory changes from nearby vendors</span>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>{isConnected ? 'Live' : 'Offline'}</span>
            </div>
          </CardDescription>
        </CardHeader>
        
        {/* Filters */}
        {showFilters && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2">Update Type</label>
                <select
                  value={filters.updateType}
                  onChange={(e) => setFilters(prev => ({ ...prev, updateType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {updateTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={filters.category || 'all'}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value === 'all' ? undefined : e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Max Distance (km)</label>
                <input
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={filters.distance ? (filters.distance / 1000).toFixed(1) : ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    distance: e.target.value ? parseFloat(e.target.value) * 1000 : undefined 
                  }))}
                  placeholder="All distances"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Connection Status */}
      {!isConnected && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Real-time updates unavailable</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              You're viewing cached updates. Connect to see live inventory changes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Updates List */}
      <div className="space-y-3">
        {updates.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No updates yet</h3>
              <p className="text-muted-foreground mb-4">
                {isConnected 
                  ? 'Waiting for inventory updates from nearby vendors...' 
                  : 'Connect to see real-time inventory updates.'
                }
              </p>
              {!isConnected && (
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reconnect
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          updates.map((update) => {
            const Icon = getUpdateIcon(update.updateType);
            const color = getUpdateColor(update.updateType, update.oldValue, update.newValue);
            const badgeColor = getUpdateBadgeColor(update.updateType, update.oldValue, update.newValue);
            
            return (
              <Card key={update.id} className={getCardStyles('hover')}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-sm">{update.productName}</h3>
                        <Badge className={`text-xs ${badgeColor}`}>
                          {update.updateType.replace('_', ' ')}
                        </Badge>
                        {update.category && (
                          <Badge variant="outline" className="text-xs">
                            {update.category}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {update.vendorName} • {getUpdateDescription(update)}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(update.timestamp)}</span>
                        </div>
                        {update.distance && (
                          <div className="flex items-center space-x-1">
                            <span>{update.distance}m away</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {(update.updateType === 'quantity_change' || update.updateType === 'price_change') && (
                      <div className="text-right">
                        {update.updateType === 'quantity_change' && update.oldValue !== undefined && update.newValue !== undefined && (
                          <div className={`flex items-center space-x-1 ${color}`}>
                            {update.newValue > update.oldValue ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span className="text-sm font-semibold">
                              {update.newValue > update.oldValue ? '+' : ''}
                              {update.newValue - update.oldValue}
                            </span>
                          </div>
                        )}
                        {update.updateType === 'price_change' && update.oldValue !== undefined && update.newValue !== undefined && (
                          <div className={`flex items-center space-x-1 ${color}`}>
                            {update.newValue > update.oldValue ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span className="text-sm font-semibold">
                              ₹{Math.abs(update.newValue - update.oldValue)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Show More */}
      {updates.length >= maxUpdates && (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Showing latest {maxUpdates} updates
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearUpdates}
            >
              Clear to see more updates
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}