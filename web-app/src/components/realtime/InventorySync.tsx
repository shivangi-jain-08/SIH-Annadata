import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { useRealTime } from '@/hooks/useRealTime';
import { getCardStyles } from '@/utils/styles';

interface InventoryUpdate {
  productId: string;
  productName: string;
  oldQuantity: number;
  newQuantity: number;
  timestamp: Date;
  type: 'increase' | 'decrease' | 'out_of_stock' | 'back_in_stock';
}

export function InventorySync() {
  const { user } = useAuth();
  const { products, loading, refetch, updateProduct } = useProducts();
  const [inventoryUpdates, setInventoryUpdates] = useState<InventoryUpdate[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Real-time product update handling
  const realTime = useRealTime([
    {
      event: 'product-updated',
      handler: (data) => {
        handleProductUpdate(data);
      }
    },
    {
      event: 'inventory-sync',
      handler: (data) => {
        handleInventorySync(data);
      }
    }
  ]);

  const handleProductUpdate = useCallback((data: any) => {
    const product = products?.find(p => p._id === data.productId);
    if (!product) return;

    const update: InventoryUpdate = {
      productId: data.productId,
      productName: product.name,
      oldQuantity: product.availableQuantity,
      newQuantity: data.availableQuantity,
      timestamp: new Date(),
      type: getUpdateType(product.availableQuantity, data.availableQuantity)
    };

    setInventoryUpdates(prev => [update, ...prev.slice(0, 19)]); // Keep last 20 updates
    setLastSyncTime(new Date());

    // Update local product data
    refetch();
  }, [products, refetch]);

  const handleInventorySync = useCallback((data: any) => {
    setSyncStatus('syncing');
    
    setTimeout(() => {
      setSyncStatus('idle');
      setLastSyncTime(new Date());
      refetch();
    }, 1000);
  }, [refetch]);

  const getUpdateType = (oldQty: number, newQty: number): InventoryUpdate['type'] => {
    if (oldQty > 0 && newQty === 0) return 'out_of_stock';
    if (oldQty === 0 && newQty > 0) return 'back_in_stock';
    if (newQty > oldQty) return 'increase';
    return 'decrease';
  };

  const getUpdateIcon = (type: InventoryUpdate['type']) => {
    switch (type) {
      case 'increase':
      case 'back_in_stock':
        return TrendingUp;
      case 'decrease':
      case 'out_of_stock':
        return TrendingDown;
      default:
        return Activity;
    }
  };

  const getUpdateColor = (type: InventoryUpdate['type']) => {
    switch (type) {
      case 'increase':
      case 'back_in_stock':
        return 'text-green-600 bg-green-100';
      case 'out_of_stock':
        return 'text-red-600 bg-red-100';
      case 'decrease':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const handleManualSync = async () => {
    setSyncStatus('syncing');
    try {
      await refetch();
      setLastSyncTime(new Date());
      
      // Notify other clients about the sync
      if (realTime.realTimeService) {
        realTime.realTimeService.emit('inventory-sync', {
          userId: user?._id,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      setSyncStatus('error');
      console.error('Manual sync failed:', error);
    } finally {
      setTimeout(() => setSyncStatus('idle'), 1000);
    }
  };

  const handleQuickUpdate = async (productId: string, newQuantity: number) => {
    try {
      await updateProduct(productId, { availableQuantity: newQuantity });
      
      // Broadcast the update to other clients
      realTime.notifyProductUpdate(productId, {
        availableQuantity: newQuantity,
        updatedBy: user?._id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Quick update failed:', error);
    }
  };

  // Auto-sync every 30 seconds if there are products
  useEffect(() => {
    if (!products?.length) return;

    const interval = setInterval(() => {
      if (syncStatus === 'idle') {
        refetch();
        setLastSyncTime(new Date());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [products, syncStatus, refetch]);

  if (user?.role !== 'vendor') {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4 text-center">
          <Package className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-sm text-yellow-800">
            Inventory sync is only available for vendors.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sync Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <span>Inventory Sync</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={syncStatus === 'syncing' ? 'text-blue-600 bg-blue-100' : 
                          syncStatus === 'error' ? 'text-red-600 bg-red-100' : 
                          'text-green-600 bg-green-100'}
              >
                {syncStatus === 'syncing' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                {syncStatus === 'error' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {syncStatus === 'idle' && <CheckCircle className="h-3 w-3 mr-1" />}
                {syncStatus === 'syncing' ? 'Syncing...' : 
                 syncStatus === 'error' ? 'Error' : 'Synced'}
              </Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleManualSync}
                disabled={syncStatus === 'syncing'}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                Sync Now
              </Button>
            </div>
          </div>
          <CardDescription>
            Real-time inventory synchronization across all platforms
            {lastSyncTime && (
              <span className="block text-xs mt-1">
                Last synced: {lastSyncTime.toLocaleTimeString()}
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Product Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
          <CardDescription>
            {products?.length || 0} products • Real-time updates enabled
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product._id} className={`${getCardStyles('hover')} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          ₹{product.price} per {product.unit}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold">
                          {product.availableQuantity} {product.unit}
                        </p>
                        <Badge 
                          variant={product.availableQuantity > 0 ? "outline" : "destructive"}
                          className="text-xs"
                        >
                          {product.availableQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                      
                      {/* Quick Update */}
                      <div className="flex items-center space-x-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleQuickUpdate(product._id, Math.max(0, product.availableQuantity - 1))}
                          disabled={product.availableQuantity === 0}
                        >
                          -1
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleQuickUpdate(product._id, product.availableQuantity + 1)}
                        >
                          +1
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No products found. Add products to start tracking inventory.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Updates */}
      {inventoryUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <span>Recent Updates</span>
            </CardTitle>
            <CardDescription>
              Real-time inventory changes from all sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventoryUpdates.slice(0, 10).map((update, index) => {
                const UpdateIcon = getUpdateIcon(update.type);
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getUpdateColor(update.type)}`}>
                        <UpdateIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{update.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {update.oldQuantity} → {update.newQuantity} units
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs mb-1">
                        {update.type.replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {update.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Status */}
      <Card className={getCardStyles('base')}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                realTime.isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">
                Real-time sync {realTime.isConnected ? 'active' : 'disconnected'}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {inventoryUpdates.length} updates received
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InventorySync;