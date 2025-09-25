import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Truck, 
  ShoppingCart, 
  Package, 
  MapPin, 
  TrendingUp, 
  Users,
  Clock,
  DollarSign,
  Navigation,
  AlertCircle,
  RefreshCw,
  Plus,
  Search,
  BarChart3,
  Bell
} from 'lucide-react';
import { useMyProducts, useProducts } from '@/hooks/useProducts';
import { useOrders, useOrderStats } from '@/hooks/useOrders';
import { useLocation, useActiveVendors } from '@/hooks/useLocation';
import { 
  useConsumerOrders, 
  useConsumerSalesStats, 
  useDeliveryOpportunities,
  useVendorStatus,
  useProximityNotifications
} from '@/hooks/useVendorConsumerSales';
import { componentStyles, getCardStyles, getRoleColor, getStatusColor } from '@/utils/styles';
import { useAuth } from '@/contexts/AuthContext';

export function VendorDashboard() {
  const { user } = useAuth();
  const { 
    products: myProducts, 
    stats: productStats, 
    loading: productsLoading, 
    error: productsError,
    refetch: refetchProducts 
  } = useMyProducts();
  const { 
    products: farmerProducts, 
    loading: farmerProductsLoading,
    error: farmerProductsError,
    refetch: refetchFarmerProducts 
  } = useProducts(); // Get products from farmers
  const { 
    orders, 
    orderStats, 
    loading: ordersLoading, 
    error: ordersError,
    refetch: refetchOrders 
  } = useOrders();
  const { 
    stats: backendOrderStats, 
    loading: statsLoading,
    refetch: refetchStats 
  } = useOrderStats();
  const { location } = useLocation();
  const { vendors } = useActiveVendors();
  
  // Consumer sales functionality
  const { orders: consumerOrders, loading: consumerOrdersLoading } = useConsumerOrders();
  const { stats: consumerSalesStats, loading: consumerStatsLoading } = useConsumerSalesStats();
  const { opportunities, loading: opportunitiesLoading } = useDeliveryOpportunities(location || undefined);
  const { status: vendorStatus, goOnline, goOffline, toggleAcceptingOrders } = useVendorStatus();
  const { sendProximityNotification, sending: sendingNotification } = useProximityNotifications();

  // Calculate real-time statistics
  const stats = useMemo(() => {
    const safeOrders = orders || [];
    const safeConsumerOrders = consumerOrders || [];
    const safeConsumerStats = consumerSalesStats || {};
    const safeProductStats = productStats || {};
    
    const todaysOrders = safeOrders.filter(order => {
      const today = new Date().toDateString();
      return new Date(order.createdAt).toDateString() === today;
    });

    const dailyRevenue = todaysOrders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + (order.total || 0), 0);

    const purchaseOrders = safeOrders.filter(order => order.buyerId === (user as any)?._id);
    const salesOrders = safeOrders.filter(order => order.sellerId === (user as any)?._id);

    return [
      {
        title: 'My Inventory',
        value: safeProductStats.active || 0,
        icon: Package,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        loading: productsLoading,
      },
      {
        title: 'Consumer Orders',
        value: (safeConsumerStats as any)?.pendingOrders || 0,
        icon: ShoppingCart,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        loading: consumerOrdersLoading,
      },
      {
        title: 'Monthly Revenue',
        value: `₹${((safeConsumerStats as any)?.monthlyRevenue || 0).toLocaleString()}`,
        icon: DollarSign,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
        loading: consumerStatsLoading,
      },
      {
        title: 'Delivery Opportunities',
        value: opportunities?.length || 0,
        icon: BarChart3,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        loading: opportunitiesLoading,
      },
    ];
  }, [orders, consumerOrders, consumerSalesStats, productStats, opportunities, user, productsLoading, ordersLoading, consumerOrdersLoading, consumerStatsLoading, opportunitiesLoading]);

  const handleRefreshData = async () => {
    try {
      await Promise.all([
        refetchProducts(),
        refetchFarmerProducts(),
        refetchOrders(),
        refetchStats()
      ]);
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    }
  };

  const quickActions = [
    {
      title: 'Buy from Farmers',
      description: 'Browse fresh produce from local farmers',
      icon: Search,
      href: '/dashboard/vendor/buy',
      color: 'bg-green-500',
      badge: farmerProducts.length > 0 ? `${farmerProducts.length} available` : null,
    },
    {
      title: 'Consumer Orders',
      description: 'Manage orders from consumers',
      icon: Users,
      href: '/dashboard/vendor/consumer-orders',
      color: 'bg-blue-500',
      badge: (consumerSalesStats as any)?.pendingOrders > 0 ? `${(consumerSalesStats as any)?.pendingOrders} pending` : null,
    },
    {
      title: 'Manage Inventory',
      description: 'Update stock and product listings',
      icon: Package,
      href: '/dashboard/vendor/inventory',
      color: 'bg-purple-500',
      badge: productStats.total > 0 ? `${productStats.total}` : null,
    },
    {
      title: 'Location Services',
      description: 'Update location and find nearby customers',
      icon: MapPin,
      href: '/dashboard/vendor/location',
      color: 'bg-orange-500',
      badge: vendorStatus.isOnline ? 'Online' : 'Offline',
    },
  ];

  const recentTransactions = [
    {
      id: '1',
      type: 'purchase',
      description: 'Bought tomatoes from Farmer John',
      amount: '₹2,500',
      status: 'completed',
      time: '2 hours ago',
    },
    {
      id: '2',
      type: 'sale',
      description: 'Sold vegetables to Consumer Mary',
      amount: '₹1,800',
      status: 'delivered',
      time: '4 hours ago',
    },
    {
      id: '3',
      type: 'purchase',
      description: 'Bought rice from Farmer Singh',
      amount: '₹3,200',
      status: 'pending',
      time: '6 hours ago',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`${componentStyles.dashboard.welcomeSection} bg-gradient-to-r from-orange-500 to-red-600`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name || 'Vendor'}!
            </h1>
            <p className="text-orange-100">
              Manage your dual marketplace operations - buy from farmers and sell to consumers.
            </p>
          </div>
          <Button 
            variant="secondary" 
            onClick={handleRefreshData}
            disabled={productsLoading || ordersLoading || statsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(productsLoading || ordersLoading || statsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error States */}
      {(productsError || ordersError || farmerProductsError) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Unable to load dashboard data</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              {productsError?.message || ordersError?.message || farmerProductsError?.message || 'Please check your connection and try again.'}
            </p>
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
                Access your marketplace operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className={`${componentStyles.dashboard.quickAction} relative`}
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
                <MapPin className="h-5 w-5 text-orange-500" />
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
                    <span className="text-sm">Latitude</span>
                    <span className="font-mono text-xs">{location.latitude.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Longitude</span>
                    <span className="font-mono text-xs">{location.longitude.toFixed(4)}</span>
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
                    Location not shared
                  </p>
                  <Button size="sm" className="w-full">
                    Enable Location
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Consumer Sales Management */}
      <Card className={getCardStyles('base')}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>Consumer Sales</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={vendorStatus.isOnline ? "default" : "outline"}
                className={vendorStatus.isOnline ? "bg-green-500" : ""}
              >
                {vendorStatus.isOnline ? "Online" : "Offline"}
              </Badge>
              <Button 
                size="sm" 
                variant={vendorStatus.isOnline ? "outline" : "default"}
                onClick={vendorStatus.isOnline ? goOffline : goOnline}
              >
                {vendorStatus.isOnline ? "Go Offline" : "Go Online"}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Manage your consumer sales and delivery operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-blue-800">Pending Consumer Orders</p>
                  <p className="text-2xl font-bold text-blue-900">{(consumerSalesStats as any)?.pendingOrders || 0}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-green-800">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-green-900">₹{((consumerSalesStats as any)?.monthlyRevenue || 0).toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Delivery Opportunities */}
          {opportunities && opportunities.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Delivery Opportunities</h4>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => location && sendProximityNotification({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    message: "Fresh produce available for delivery!"
                  })}
                  disabled={sendingNotification || !location}
                >
                  {sendingNotification ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Bell className="h-4 w-4 mr-2" />
                  )}
                  Notify Nearby
                </Button>
              </div>
              
              {opportunities.slice(0, 3).map((opportunity: any) => (
                <div key={opportunity.id} className={`${getCardStyles('hover')} p-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        opportunity.priority === 'high' ? 'bg-red-100' :
                        opportunity.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        <Users className={`h-4 w-4 ${
                          opportunity.priority === 'high' ? 'text-red-600' :
                          opportunity.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-sm">{opportunity.consumerName}</p>
                          <Badge variant="outline" className="text-xs">
                            {opportunity.distance}m away
                          </Badge>
                          <Badge 
                            variant={opportunity.priority === 'high' ? 'destructive' : 'outline'}
                            className="text-xs"
                          >
                            {opportunity.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {opportunity.type === 'pending_order' ? (
                            <>Order Value: ₹{opportunity.orderValue} • {opportunity.items?.join(', ')}</>
                          ) : (
                            <>Interested in: {opportunity.preferredItems?.join(', ')}</>
                          )}
                        </p>
                        {opportunity.estimatedDeliveryTime && (
                          <p className="text-xs text-muted-foreground">
                            Est. delivery: {opportunity.estimatedDeliveryTime}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      {opportunity.type === 'pending_order' ? 'Accept Order' : 'Contact'}
                    </Button>
                  </div>
                </div>
              ))}
              
              {opportunities.length > 3 && (
                <Button size="sm" variant="outline" className="w-full">
                  View All Opportunities ({opportunities.length})
                </Button>
              )}
            </div>
          )}

          {(!opportunities || opportunities.length === 0) && !opportunitiesLoading && (
            <div className="text-center py-6">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                No delivery opportunities nearby
              </p>
              <p className="text-xs text-muted-foreground">
                Go online and share your location to find customers
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Farmer Products */}
      <Card className={getCardStyles('base')}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-green-500" />
              <span>Available from Farmers</span>
            </div>
            {farmerProductsError && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={refetchFarmerProducts}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Fresh produce available for purchase from local farmers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {farmerProductsError && (
            <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 mb-4">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Failed to load farmer products: {farmerProductsError.message}</span>
            </div>
          )}
          
          {farmerProductsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : farmerProducts && farmerProducts.length > 0 ? (
            <div className="space-y-3">
              {farmerProducts.slice(0, 5).map((product: any, index: number) => (
                <div key={product._id || index} className={`${getCardStyles('hover')} p-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Package className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-sm">{product.name}</p>
                          <Badge variant="outline" className="text-xs">
                            ₹{product.price}/{product.unit}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Available: {product.availableQuantity} {product.unit} • {product.category}
                        </p>
                        {product.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Order Now
                    </Button>
                  </div>
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full">
                Browse All Products ({farmerProducts.length})
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                No farmer products available
              </p>
              <p className="text-xs text-muted-foreground">
                Check back later for fresh produce from local farmers
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className={getCardStyles('base')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>Recent Transactions</span>
            </CardTitle>
            <CardDescription>
              Your latest buying and selling activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'purchase' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {transaction.type === 'purchase' ? (
                        <ShoppingCart className={`h-4 w-4 ${
                          transaction.type === 'purchase' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                      ) : (
                        <DollarSign className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{transaction.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant={transaction.status === 'completed' || transaction.status === 'delivered' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {transaction.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'purchase' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.type === 'purchase' ? '-' : '+'}{transaction.amount}
                    </p>
                  </div>
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full">
                View All Transactions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Nearby Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-500" />
              <span>Nearby Opportunities</span>
            </CardTitle>
            <CardDescription>
              Real-time opportunities in your delivery area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-semibold text-sm text-green-800">
                    {farmerProducts?.length || 0} Farmers Nearby
                  </p>
                  <p className="text-xs text-green-700">Fresh produce available for purchase</p>
                </div>
                <Button size="sm" variant="outline">
                  Browse
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="font-semibold text-sm text-blue-800">
                    {opportunities?.filter((o: any) => o.type === 'pending_order').length || 0} Consumer Orders
                  </p>
                  <p className="text-xs text-blue-700">Orders pending in your delivery area</p>
                </div>
                <Button size="sm" variant="outline">
                  View Orders
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div>
                  <p className="font-semibold text-sm text-purple-800">
                    {opportunities?.filter((o: any) => o.type === 'potential_customer').length || 0} Potential Customers
                  </p>
                  <p className="text-xs text-purple-700">Consumers interested in your products</p>
                </div>
                <Button size="sm" variant="outline">
                  Contact
                </Button>
              </div>

              {vendorStatus.isOnline && location && (
                <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm text-orange-800">You're Online</p>
                    <p className="text-xs text-orange-700">
                      Delivery radius: {(vendorStatus.deliveryRadius / 1000).toFixed(1)}km
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => sendProximityNotification({
                      latitude: location.latitude,
                      longitude: location.longitude,
                      message: "Fresh produce available for delivery!"
                    })}
                    disabled={sendingNotification}
                  >
                    {sendingNotification ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Bell className="h-4 w-4 mr-2" />
                    )}
                    Notify Area
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span>Performance Metrics</span>
          </CardTitle>
          <CardDescription>
            Your dual marketplace performance this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ₹{(((consumerSalesStats as any)?.totalRevenue || 0) + (backendOrderStats?.salesValue || 0)).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <div className="flex justify-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                  Consumer: ₹{((consumerSalesStats as any)?.totalRevenue || 0).toLocaleString()}
                </Badge>
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">
                  Farmer: ₹{(backendOrderStats?.salesValue || 0).toLocaleString()}
                </Badge>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {((consumerSalesStats as any)?.totalConsumerOrders || 0) + (backendOrderStats?.totalSales || 0)}
              </div>
              <p className="text-sm text-muted-foreground">Orders Completed</p>
              <div className="flex justify-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                  To Consumers: {(consumerSalesStats as any)?.deliveredOrders || 0}
                </Badge>
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">
                  From Farmers: {backendOrderStats?.totalPurchases || 0}
                </Badge>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {vendorStatus.isOnline ? 'Online' : 'Offline'}
              </div>
              <p className="text-sm text-muted-foreground">Vendor Status</p>
              <Badge 
                variant="outline" 
                className={`mt-1 ${vendorStatus.isOnline ? 'text-green-600 border-green-600' : 'text-gray-600 border-gray-600'}`}
              >
                {vendorStatus.acceptingOrders ? 'Accepting Orders' : 'Not Accepting Orders'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}