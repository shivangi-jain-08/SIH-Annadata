import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  MapPin,
  Phone,
  MessageCircle,
  Package,
  DollarSign,
  User,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useConsumerOrders } from '@/hooks/useVendorConsumerSales';
import { getCardStyles, getStatusColor } from '@/utils/styles';

interface ConsumerOrder {
  _id: string;
  buyerId: {
    _id: string;
    name: string;
    phone: string;
    location?: {
      coordinates: [number, number];
    };
  };
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    unit: string;
  }>;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'rejected';
  totalAmount: number;
  deliveryAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function ConsumerOrderManagement() {
  const { 
    orders: consumerOrders, 
    loading, 
    error, 
    refetch,
    updateOrderStatus 
  } = useConsumerOrders();

  const [selectedOrder, setSelectedOrder] = useState<ConsumerOrder | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  // Filter orders by status
  const pendingOrders = consumerOrders?.filter(order => order.status === 'pending') || [];
  const activeOrders = consumerOrders?.filter(order => 
    ['accepted', 'preparing', 'ready'].includes(order.status)
  ) || [];
  const completedOrders = consumerOrders?.filter(order => 
    ['delivered', 'cancelled', 'rejected'].includes(order.status)
  ) || [];

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      await refetch(); // Refresh orders after update
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'accepted':
      case 'preparing':
        return 'default';
      case 'ready':
        return 'secondary';
      case 'delivered':
        return 'default';
      case 'cancelled':
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'accepted':
      case 'preparing':
        return Package;
      case 'ready':
        return CheckCircle;
      case 'delivered':
        return Truck;
      case 'cancelled':
      case 'rejected':
        return XCircle;
      default:
        return Clock;
    }
  };

  const OrderCard = ({ order }: { order: ConsumerOrder }) => {
    const StatusIcon = getStatusIcon(order.status);
    const isUpdating = updatingOrder === order._id;

    return (
      <Card className={`${getCardStyles('hover')} transition-all duration-200`}>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Order Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getStatusColor(order.status).bg}`}>
                  <StatusIcon className={`h-4 w-4 ${getStatusColor(order.status).text}`} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-sm">Order #{order._id.slice(-6)}</h3>
                    <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">₹{order.totalAmount}</p>
                <p className="text-xs text-muted-foreground">
                  {order.products.length} item{order.products.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-sm">{order.buyerId.name}</p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{order.buyerId.phone}</span>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat
              </Button>
            </div>

            {/* Products */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Items:</p>
              {order.products.map((product, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{product.name}</span>
                  <span className="text-muted-foreground">
                    {product.quantity} {product.unit} × ₹{product.price} = ₹{product.quantity * product.price}
                  </span>
                </div>
              ))}
            </div>

            {/* Delivery Address */}
            {order.deliveryAddress && (
              <div className="flex items-start space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">{order.deliveryAddress}</span>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> {order.notes}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2 border-t">
              {order.status === 'pending' && (
                <>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleUpdateOrderStatus(order._id, 'accepted')}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleUpdateOrderStatus(order._id, 'rejected')}
                    disabled={isUpdating}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
              
              {order.status === 'accepted' && (
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleUpdateOrderStatus(order._id, 'preparing')}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Package className="h-4 w-4 mr-1" />
                  )}
                  Start Preparing
                </Button>
              )}
              
              {order.status === 'preparing' && (
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleUpdateOrderStatus(order._id, 'ready')}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  Mark Ready
                </Button>
              )}
              
              {order.status === 'ready' && (
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Truck className="h-4 w-4 mr-1" />
                  )}
                  Mark Delivered
                </Button>
              )}

              {['accepted', 'preparing', 'ready'].includes(order.status) && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                  disabled={isUpdating}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consumer Orders</CardTitle>
          <CardDescription>Loading orders...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="font-semibold text-red-800 mb-2">Failed to Load Orders</h3>
          <p className="text-sm text-red-700 mb-4">
            {error.message || 'Unable to load consumer orders'}
          </p>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold">{pendingOrders.length}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                <p className="text-2xl font-bold">{activeOrders.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold">
                  {completedOrders.filter(order => {
                    const today = new Date().toDateString();
                    return new Date(order.updatedAt).toDateString() === today;
                  }).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span>Pending Orders ({pendingOrders.length})</span>
            </CardTitle>
            <CardDescription>
              New orders waiting for your response
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <span>Active Orders ({activeOrders.length})</span>
            </CardTitle>
            <CardDescription>
              Orders in progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Completed Orders */}
      {completedOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Recent Completed Orders</span>
            </CardTitle>
            <CardDescription>
              Recently completed, cancelled, or rejected orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedOrders.slice(0, 5).map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
            {completedOrders.length > 5 && (
              <Button variant="outline" className="w-full">
                View All Completed Orders ({completedOrders.length})
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Orders State */}
      {(!consumerOrders || consumerOrders.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No consumer orders yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              When consumers place orders, they'll appear here for you to manage.
            </p>
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Orders
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}