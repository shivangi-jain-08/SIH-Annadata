import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle,
  Phone,
  MapPin,
  Package,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Filter,
  Eye
} from 'lucide-react';
import { useConsumerOrders, useConsumerSalesStats } from '@/hooks/useVendorConsumerSales';
import { getCardStyles, getStatusColor } from '@/utils/styles';

export function ConsumerOrders() {
  const [statusFilter, setStatusFilter] = useState('all');
  const { orders, loading, error, updateOrderStatus } = useConsumerOrders();
  const { stats, loading: statsLoading } = useConsumerSalesStats();

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const filteredOrders = orders.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  );

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'accepted': return 'secondary';
      case 'preparing': return 'default';
      case 'ready': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return [
          { value: 'accepted', label: 'Accept Order', color: 'bg-green-600' },
          { value: 'cancelled', label: 'Reject Order', color: 'bg-red-600' }
        ];
      case 'accepted':
        return [
          { value: 'preparing', label: 'Start Preparing', color: 'bg-blue-600' }
        ];
      case 'preparing':
        return [
          { value: 'ready', label: 'Mark Ready', color: 'bg-purple-600' }
        ];
      case 'ready':
        return [
          { value: 'delivered', label: 'Mark Delivered', color: 'bg-green-600' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard/vendor">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold">Consumer Orders</h2>
            <p className="text-muted-foreground">
              Manage orders from consumers for delivery
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalConsumerOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600">₹{stats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <Package className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <div className="flex-1" />
            
            <Badge variant="outline">
              {filteredOrders.length} orders
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Failed to load orders</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              {error.message || 'Please check your connection and try again.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-24 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter !== 'all' 
                  ? `No ${statusFilter} orders at the moment.`
                  : 'No consumer orders yet. Start selling to see orders here.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order._id} className={getCardStyles('hover')}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Order Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold">Order #{order._id.slice(-6)}</h3>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{order.totalAmount}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.products.length} items
                        </p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 rounded-full bg-blue-100">
                          <Phone className="h-3 w-3 text-blue-600" />
                        </div>
                        <span>{order.buyerId.name}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>{order.buyerId.phone}</span>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {order.deliveryAddress && (
                      <div className="flex items-start space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground">{order.deliveryAddress}</span>
                      </div>
                    )}

                    {/* Products */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Items:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {order.products.map((product, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {product.quantity} {product.unit} × ₹{product.price}
                              </p>
                            </div>
                            <p className="font-medium text-sm">
                              ₹{(product.quantity * product.price).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm font-medium text-yellow-800">Customer Notes:</p>
                        <p className="text-sm text-yellow-700">{order.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex flex-col space-y-2">
                    {getNextStatusOptions(order.status).map((action) => (
                      <Button
                        key={action.value}
                        size="sm"
                        className={action.color}
                        onClick={() => handleStatusUpdate(order._id, action.value)}
                      >
                        {action.label}
                      </Button>
                    ))}
                    
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}