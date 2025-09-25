import { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sprout, 
  Camera, 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Plus,
  RefreshCw,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { useLatestCropRecommendation } from '@/hooks/useCropRecommendations';
import { useMyProducts } from '@/hooks/useProducts';
import { useOrders, useOrderStats } from '@/hooks/useOrders';
import { componentStyles, getCardStyles } from '@/utils/styles';
import { useAuth } from '@/contexts/AuthContext';

export function FarmerDashboard() {
  const { user } = useAuth();
  const { recommendation, loading: recLoading, refetch: refetchRecommendation } = useLatestCropRecommendation();
  const { 
    stats: productStats, 
    loading: productsLoading, 
    error: productsError,
    refetch: refetchProducts 
  } = useMyProducts();
  const { 
    orders, 
    orderStats, 
    loading: ordersLoading, 
    error: ordersError,
    refetch: refetchOrders 
  } = useOrders();
  const { 
    loading: statsLoading,
    refetch: refetchStats 
  } = useOrderStats();

  // Calculate real-time statistics
  const stats = useMemo(() => {
    const safeOrders = orders || [];
    const safeOrderStats = orderStats || {};
    const safeProductStats = productStats || {};
    
    const monthlyRevenue = safeOrders
      .filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        const currentMonth = new Date();
        return orderDate.getMonth() === currentMonth.getMonth() && 
               orderDate.getFullYear() === currentMonth.getFullYear() &&
               order.status === 'delivered';
      })
      .reduce((sum, order) => sum + (order.total || 0), 0);

    return [
      {
        title: 'Active Products',
        value: safeProductStats.active || 0,
        icon: Package,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        loading: productsLoading,
      },
      {
        title: 'Pending Orders',
        value: safeOrderStats.pending || 0,
        icon: ShoppingCart,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        loading: ordersLoading,
      },
      {
        title: 'Monthly Revenue',
        value: `₹${monthlyRevenue.toLocaleString()}`,
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        loading: ordersLoading,
      },
      {
        title: 'Total Products',
        value: safeProductStats.total || 0,
        icon: BarChart3,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        loading: productsLoading,
      },
    ];
  }, [orders, orderStats, productStats, productsLoading, ordersLoading]);

  const handleRefreshData = async () => {
    try {
      // Load data sequentially to prevent resource exhaustion
      await refetchRecommendation();
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
      await refetchProducts();
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
      await refetchOrders();
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
      await refetchStats();
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    }
  };

  const quickActions = [
    {
      title: 'Soil Analysis',
      description: 'Get AI-powered soil recommendations',
      icon: Sprout,
      href: '/dashboard/farmer/crop-advisory',
      color: 'bg-green-500',
      badge: recommendation ? 'New' : null,
    },
    {
      title: 'Disease Detection',
      description: 'Upload plant images for diagnosis',
      icon: Camera,
      href: '/dashboard/farmer/disease-detection',
      color: 'bg-blue-500',
    },
    {
      title: 'Add Product',
      description: 'List new products for sale',
      icon: Plus,
      href: '/dashboard/farmer/products/new',
      color: 'bg-purple-500',
    },
    {
      title: 'View Orders',
      description: 'Manage incoming orders',
      icon: ShoppingCart,
      href: '/dashboard/farmer/orders',
      color: 'bg-orange-500',
      badge: (orderStats?.pending || 0) > 0 ? `${orderStats.pending}` : null,
    },
  ];

  const weatherData = {
    temperature: '28°C',
    humidity: '65%',
    rainfall: '12mm',
    windSpeed: '8 km/h',
  };

  // Load data after component mounts with staggered timing
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load critical data first
        await refetchRecommendation();
        
        // Stagger other API calls to prevent resource exhaustion
        setTimeout(() => refetchProducts(), 1000);
        setTimeout(() => refetchOrders(), 2000);
        setTimeout(() => refetchStats(), 3000);
      } catch (error) {
        console.error('Failed to load initial dashboard data:', error);
      }
    };

    loadData();
  }, []); // Only run once on mount

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`${componentStyles.dashboard.welcomeSection} bg-gradient-to-r from-green-500 to-emerald-600`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name || 'Farmer'}!
            </h1>
            <p className="text-green-100">
              Here's your farm overview for today. Check your crops, manage orders, and get AI insights.
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
      {(productsError || ordersError) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Unable to load dashboard data</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              {productsError?.message || ordersError?.message || 'Please check your connection and try again.'}
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
                Access your most used farming tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.href}
                    className={`${componentStyles.dashboard.quickAction} relative block hover:shadow-md transition-shadow`}
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
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weather Widget */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sun className="h-5 w-5 text-yellow-500" />
                <span>Weather Today</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Temperature</span>
                </div>
                <span className="font-semibold">{weatherData.temperature}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Humidity</span>
                </div>
                <span className="font-semibold">{weatherData.humidity}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Droplets className="h-4 w-4 text-cyan-500" />
                  <span className="text-sm">Rainfall</span>
                </div>
                <span className="font-semibold">{weatherData.rainfall}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wind className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Wind Speed</span>
                </div>
                <span className="font-semibold">{weatherData.windSpeed}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Crop Recommendation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sprout className="h-5 w-5 text-green-500" />
              <span>Latest Crop Recommendation</span>
            </CardTitle>
            <CardDescription>
              AI-powered suggestions based on your soil analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : recommendation ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{recommendation.cropName}</span>
                  <Badge variant="outline">
                    {recommendation.suitabilityPercentage}% suitable
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Expected yield: {recommendation.expectedYield}
                </p>
                <Link to="/dashboard/farmer/crop-advisory">
                  <Button size="sm" className="w-full">
                    View Full Analysis
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  No recommendations available. Upload soil data to get started.
                </p>
                <Link to="/dashboard/farmer/crop-advisory">
                  <Button size="sm" className="mt-2">
                    Upload Soil Data
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-orange-500" />
              <span>Recent Orders</span>
            </CardTitle>
            <CardDescription>
              Latest orders from vendors and consumers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">Order #{order._id?.slice(-6) || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.products?.length || 0} items • ₹{order.total || 0}
                      </p>
                    </div>
                    <Badge 
                      variant={order.status === 'pending' ? 'default' : 'outline'}
                    >
                      {order.status}
                    </Badge>
                  </div>
                ))}
                <Link to="/dashboard/farmer/orders">
                  <Button size="sm" variant="outline" className="w-full">
                    View All Orders
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  No orders yet. List your products to start selling.
                </p>
                <Link to="/dashboard/farmer/products/new">
                  <Button size="sm" className="mt-2">
                    Add Products
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span>Farm Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-yellow-800">
                  Weather Alert
                </p>
                <p className="text-xs text-yellow-700">
                  Heavy rainfall expected in the next 48 hours. Consider protective measures for your crops.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Sprout className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-blue-800">
                  Soil Analysis Due
                </p>
                <p className="text-xs text-blue-700">
                  It's been 30 days since your last soil analysis. Consider getting a fresh report.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}