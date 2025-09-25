import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin,
  Phone,
  MessageCircle,
  ArrowLeft,
  User,
  Star,
  AlertCircle,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { getCardStyles, getStatusColor } from '@/utils/styles';

interface OrderStatus {
  status: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  timestamp?: string;
  completed: boolean;
}

export function OrderTrackingView() {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, loading, error, refetch } = useOrders();
  
  const [order, setOrder] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Find the specific order
  useEffect(() => {
    if (orders && orderId) {
      const foundOrder = orders.find(o => o._id === orderId);
      setOrder(foundOrder || null);
    }
  }, [orders, orderId]);

  // Define order status progression
  const getOrderStatusProgression = (currentStatus: string): OrderStatus[] => {
    const baseStatuses: OrderStatus[] = [
      {
        status: 'pending',
        label: 'Order Placed',
        description: 'Your order has been placed and is waiting for vendor confirmation',
        icon: Clock,
        completed: true
      },
      {
        status: 'accepted',
        label: 'Order Confirmed',
        description: 'Vendor has confirmed your order and will start preparing',
        icon: CheckCircle,
        completed: ['accepted', 'preparing', 'ready', 'delivered'].includes(currentStatus)
      },
      {
        status: 'preparing',
        label: 'Preparing Order',
        description: 'Your order is being prepared by the vendor',
        icon: Package,
        completed: ['preparing', 'ready', 'delivered'].includes(currentStatus)
      },
      {
        status: 'ready',
        label: 'Ready for Delivery',
        description: 'Your order is ready and will be delivered soon',
        icon: Truck,
        completed: ['ready', 'delivered'].includes(currentStatus)
      },
      {
        status: 'delivered',
        label: 'Delivered',
        description: 'Your order has been successfully delivered',
        icon: CheckCircle,
        completed: currentStatus === 'delivered'
      }
    ];

    // Handle cancelled/rejected orders
    if (currentStatus === 'cancelled' || currentStatus === 'rejected') {
      return [
        baseStatuses[0], // Order placed
        {
          status: currentStatus,
          label: currentStatus === 'cancelled' ? 'Order Cancelled' : 'Order Rejected',
          description: currentStatus === 'cancelled' 
            ? 'Your order has been cancelled'
            : 'Your order was rejected by the vendor',
          icon: XCircle,
          completed: true
        }
      ];
    }

    return baseStatuses;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refresh order:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !['pending', 'accepted'].includes(order.status)) {
      return;
    }

    const confirmed = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmed) return;

    try {
      // This would call the cancel order API
      alert('Order cancellation requested. The vendor will be notified.');
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  };

  const handleContactVendor = () => {
    if (order?.sellerId?.phone) {
      window.open(`tel:${order.sellerId.phone}`);
    }
  };

  const handleChatWithVendor = () => {
    // Navigate to chat interface
    window.location.href = `/orders/${orderId}/chat`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-semibold text-red-800 mb-2">Order Not Found</h3>
            <p className="text-sm text-red-700 mb-4">
              {error?.message || 'The order you\'re looking for could not be found.'}
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusProgression = getOrderStatusProgression(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        
        <Button 
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>Order #{order._id.slice(-6)}</span>
                <Badge 
                  variant={order.status === 'delivered' ? 'default' : 'outline'}
                  className={`${getStatusColor(order.status).bg} ${getStatusColor(order.status).text}`}
                >
                  {order.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                Placed on {new Date(order.createdAt).toLocaleString()}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">₹{order.totalAmount}</p>
              <p className="text-sm text-muted-foreground">
                {order.products?.length || 0} items
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vendor Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">{order.sellerId?.name || 'Unknown Vendor'}</p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{order.sellerId?.phone || 'No phone'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleContactVendor}
                disabled={!order.sellerId?.phone}
              >
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleChatWithVendor}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat
              </Button>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Order Items:</h4>
            {order.products?.map((product: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-green-100">
                    <Package className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.quantity} {product.unit} × ₹{product.price}
                    </p>
                  </div>
                </div>
                <p className="font-semibold">₹{product.quantity * product.price}</p>
              </div>
            ))}
          </div>

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-blue-800">Delivery Address:</p>
                <p className="text-sm text-blue-700">{order.deliveryAddress}</p>
              </div>
            </div>
          )}

          {/* Order Notes */}
          {order.notes && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-semibold text-sm text-yellow-800">Order Notes:</p>
              <p className="text-sm text-yellow-700">{order.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
          <CardDescription>
            Track your order progress in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusProgression.map((status, index) => {
              const StatusIcon = status.icon;
              const isActive = order.status === status.status;
              const isCompleted = status.completed;
              
              return (
                <div key={status.status} className="flex items-start space-x-4">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div className={`p-2 rounded-full ${
                      isCompleted 
                        ? 'bg-green-100 text-green-600' 
                        : isActive 
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      <StatusIcon className="h-4 w-4" />
                    </div>
                    {index < statusProgression.length - 1 && (
                      <div className={`w-0.5 h-8 mt-2 ${
                        isCompleted ? 'bg-green-300' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>

                  {/* Status Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-semibold text-sm ${
                        isCompleted ? 'text-green-800' : isActive ? 'text-blue-800' : 'text-gray-600'
                      }`}>
                        {status.label}
                      </h4>
                      {isActive && (
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      )}
                      {isCompleted && status.status !== order.status && (
                        <Badge variant="default" className="text-xs bg-green-500">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${
                      isCompleted ? 'text-green-700' : isActive ? 'text-blue-700' : 'text-gray-500'
                    }`}>
                      {status.description}
                    </p>
                    {status.timestamp && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(status.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            {['pending', 'accepted'].includes(order.status) && (
              <Button 
                variant="outline" 
                onClick={handleCancelOrder}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Order
              </Button>
            )}
            
            {order.status === 'delivered' && (
              <Button 
                className="flex-1"
                onClick={() => alert('Rating feature coming soon!')}
              >
                <Star className="h-4 w-4 mr-2" />
                Rate Vendor
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleChatWithVendor}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Vendor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            If you have any issues with your order, you can:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Contact the vendor directly using the buttons above</li>
            <li>• Cancel your order if it hasn't been confirmed yet</li>
            <li>• Report an issue if there are problems with delivery</li>
          </ul>
          <Button size="sm" variant="outline" className="mt-3">
            Report an Issue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}