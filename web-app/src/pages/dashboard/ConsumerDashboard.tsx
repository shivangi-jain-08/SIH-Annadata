import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  MapPin, 
  Bell, 
  Package, 
  Clock, 
  DollarSign,
  Navigation,
  AlertCircle,
  RefreshCw,
  Search,
  Users,
  Star,
  Truck,
  Eye,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/hooks/useLocation';
import { useOrders } from '@/hooks/useOrders';
import { 
  useNearbyVendors, 
  useMarketplaceProducts, 
  useProximityNotifications 
} from '@/hooks/useMarketplace';
import { componentStyles, getCardStyles } from '@/utils/styles';

interface ProximityNotification {
  id: string;
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
  timestamp: string;
}

export function ConsumerDashboard() {
  const { user } = useAuth();
  const { location, requestLocation, locationError } = useLocation();
  const { orders, loading: ordersLoading, refetch: refetchOrders } = useOrders();
  const { 
    vendors: nearbyVendors, 
    loading: vendorsLoading, 
    refetch: refetchVendors 
  } = useNearbyVendors(location);
  const { 
    products: marketplaceProducts, 
    loading: productsLoading 
  } = useMarketplaceProducts(location);
  const { 
    notifications: proximityNotifications, 
    dismissNotification,
    clearAllNotifications 
  } = useProximityNotifications();

  const [activeNotifications, setActiveNotifications] = useState<ProximityNotification[]>([]);

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const safeOrders = orders || [];
    const recentOrders = safeOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return orderDate > weekAgo;
    });

    const monthlySpending = safeOrders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        const currentMonth = new Date();
        return orderDate.getMonth() === currentMonth.getMonth() && 
               orderDate.getFullYear() === currentMonth.getFullYear();
      })
      .reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);

    return [
      {
        title: 'Nearby Vendors',
        value: nearbyVendors?.length || 0,
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        loading: vendorsLoading,
      },
      {
        title: 'Active Orders',
        value: safeOrders.filter(o => ['pending', 'confirmed', 'in_transit'].includes(o.status)).length,
        icon: ShoppingCart,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        loading: ordersLoading,
      },
      {
        title: 'Monthly Spending',
        value: `₹${monthlySpending.toLocaleString()}`,
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        loading: ordersLoading,
      },
      {
        title: 'Available Products',
        value: marketplaceProducts?.length || 0,
        icon: Package,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        loading: productsLoading,
      },
    ];
  }, [nearbyVendors, orders, marketplaceProducts, vendorsLoading, ordersLoading, productsLoading]);

  const handleRefreshData = async () => {
    try {
      await Promise.all([
        refetchOrders(),
        refetchVendors()
      ]);
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    }
  };

  const handleViewVendorProducts = (vendorId: string) => {
    // Navigate to vendor products page
    window.location.href = `/marketplace/vendor/${vendorId}`;
  };

  const handleDismissNotification = (notificationId: string) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== notificationId));
    dismissNotification(notificationId);
  };

  const quickActions = [
    {
      title: 'Browse Marketplace',
      description: 'Explore products from nearby vendors',
      icon: Search,
      href: '/marketplace',
      color: 'bg-blue-500',
      badge: marketplaceProducts?.length > 0 ? `${marketplaceProducts.length} available` : null,
    },
    {
      title: 'My Orders',
      description: 'Track your current and past orders',
      icon: Truck,
      href: '/orders',
      color: 'bg-green-500',
      badge: orders?.filter(o => ['pending', 'confirmed', 'in_transit'].includes(o.status)).length > 0 
        ? `${orders.filter(o => ['pending', 'confirmed', 'in_transit'].includes(o.status)).length} active` 
        : null,
    },
    {
      title: 'Nearby Vendors',
      description: 'Find vendors in your area',
      icon: MapPin,
      href: '/marketplace/vendors',
      color: 'bg-purple-500',
      badge: nearbyVendors?.length > 0 ? `${nearbyVendors.length} nearby` : null,
    },
    {
      title: 'Notifications',
      description: 'Manage your notification preferences',
      icon: Bell,
      href: '/settings/notifications',
      color: 'bg-orange-500',
      badge: proximityNotifications?.length > 0 ? `${proximityNotifications.length}` : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`${componentStyles.dashboard.welcomeSection} bg-gradient-to-r from-blue-500 to-purple-600`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name || 'Consumer'}!
            </h1>
            <p className="text-blue-100">
              Discover fresh products from nearby vendors and track your orders.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="secondary" 
              onClick={handleRefreshData}
              disabled={ordersLoading || vendorsLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${(ordersLoading || vendorsLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {!location && (
              <Button 
                variant="secondary" 
                onClick={requestLocation}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Enable Location
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Location Error */}
      {locationError && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Location access needed</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Enable location access to find nearby vendors and receive proximity notifications.
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2"
              onClick={requestLocation}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Enable Location
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Proximity Notifications */}
      {activeNotifications.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-800 flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Vendors Nearby</span>
              </CardTitle>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setActiveNotifications([])}
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeNotifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-3 bg-white border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-green-100">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-sm">{notification.vendorName}</p>
                      <Badge variant="outline" className="text-xs">
                        {notification.distance}m away
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {notification.productCount > 0 
                        ? `${notification.products.slice(0, 2).map(p => p.name).join(', ')}${notification.productCount > 2 ? ` +${notification.productCount - 2} more` : ''}`
                        : 'Products available'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewVendorProducts(notification.vendorId)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleDismissNotification(notification.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className={componentStyles.layout.grid.cols4}>
        {stats.map((stat, index) => (
          <Card key={index} className={getCardStyles('hover')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  {stat.loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold">{stat.value}</p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Access your marketplace features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className={`${componentStyles.dashboard.quickAction} relative cursor-pointer`}
                    onClick={() => window.location.href = action.href}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-sm">{action.title}</h3>
                          {action.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {action.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Status */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span>Location Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {location ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Nearby Vendors</span>
                    <span className="font-semibold">{nearbyVendors?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Available Products</span>
                    <span className="font-semibold">{marketplaceProducts?.length || 0}</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    <Navigation className="h-4 w-4 mr-2" />
                    Update Location
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Location not enabled
                  </p>
                  <Button size="sm" className="w-full" onClick={requestLocation}>
                    <Navigation className="h-4 w-4 mr-2" />
                    Enable Location
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-orange-500" />
            <span>Recent Orders</span>
          </CardTitle>
          <CardDescription>
            Your latest orders and delivery status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order, index) => (
                <div key={order._id || index} className={`${getCardStyles('hover')} p-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-orange-100">
                        <Package className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-sm">Order #{order._id?.slice(-6) || 'N/A'}</p>
                          <Badge 
                            variant={order.status === 'delivered' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {order.products?.length || 0} items • ₹{order.totalAmount || order.total || 0} • {typeof order.sellerId === 'object' ? order.sellerId?.name : 'Unknown Vendor'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Track Order
                    </Button>
                  </div>
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full">
                View All Orders ({orders.length})
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                No orders yet
              </p>
              <p className="text-xs text-muted-foreground">
                Start shopping from nearby vendors to see your orders here
              </p>
              <Button size="sm" className="mt-3" onClick={() => window.location.href = '/marketplace'}>
                Browse Marketplace
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}