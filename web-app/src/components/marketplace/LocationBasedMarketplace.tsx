import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Filter,
  Clock,
  Truck,
  Package,
  Star,
  RefreshCw,
  AlertCircle,
  ShoppingCart,
  Eye,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useProducts } from '@/hooks/useProducts';
import { useNearbyVendors } from '@/hooks/useMarketplace';
import { getCardStyles } from '@/utils/styles';
import ApiClient from '@/services/api';
import { QuickOrderFromProximity } from '@/components/orders/QuickOrderFromProximity';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  availableQuantity: number;
  minimumOrderQuantity: number;
  images: string[];
  isActive: boolean;
  sellerId: {
    _id: string;
    name: string;
    phone: string;
    location?: {
      coordinates: [number, number];
    };
  };
  distance?: number;
  estimatedDeliveryTime?: string;
  createdAt: string;
}

interface Vendor {
  vendorId: string;
  name: string;
  distance: number;
  isActive: boolean;
  productCount: number;
  rating?: number;
  coordinates: [number, number];
}

type SortOption = 'distance' | 'price-low' | 'price-high' | 'rating' | 'newest';

export function LocationBasedMarketplace() {
  const { location, requestLocation, locationError } = useLocation();
  const { vendors: nearbyVendors, loading: vendorsLoading } = useNearbyVendors(location);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [maxDistance, setMaxDistance] = useState(5000); // 5km default
  const [showFilters, setShowFilters] = useState(false);
  const [quickOrderVendor, setQuickOrderVendor] = useState<{
    vendorId: string;
    vendorName: string;
    distance: number;
    estimatedDeliveryTime: string;
  } | null>(null);

  const categories = [
    'all',
    'vegetables',
    'fruits',
    'grains',
    'pulses',
    'spices',
    'herbs',
    'dairy',
    'other'
  ];

  // Fetch location-based products
  const fetchLocationBasedProducts = async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const response = await ApiClient.getConsumerProducts({
        location: `${location.longitude},${location.latitude}`,
        radius: maxDistance,
        category: selectedCategory !== 'all' ? selectedCategory : undefined
      });

      if (response.data?.products) {
        // Calculate distance and delivery time for each product
        const productsWithDistance = response.data.products.map((product: any) => {
          let distance = 0;
          let estimatedDeliveryTime = 'Unknown';

          if (product.sellerId?.location?.coordinates) {
            distance = calculateDistance(
              location.latitude,
              location.longitude,
              product.sellerId.location.coordinates[1],
              product.sellerId.location.coordinates[0]
            );
            estimatedDeliveryTime = calculateDeliveryTime(distance);
          }

          return {
            ...product,
            distance: Math.round(distance),
            estimatedDeliveryTime
          };
        });

        setProducts(productsWithDistance);
      }
    } catch (err) {
      console.error('Failed to fetch location-based products:', err);
      setError('Failed to load nearby products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Calculate estimated delivery time
  const calculateDeliveryTime = (distanceInMeters: number): string => {
    const walkingSpeedKmh = 5;
    const walkingSpeedMs = (walkingSpeedKmh * 1000) / 3600;
    const timeInSeconds = distanceInMeters / walkingSpeedMs;
    const timeInMinutes = Math.ceil(timeInSeconds / 60);

    if (timeInMinutes < 1) return 'Less than 1 minute';
    if (timeInMinutes === 1) return '1 minute';
    if (timeInMinutes < 60) return `${timeInMinutes} minutes`;
    
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sellerId.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      const withinDistance = !product.distance || product.distance <= maxDistance;
      
      return matchesSearch && matchesCategory && withinDistance;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          // Placeholder for vendor rating
          return 0;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, maxDistance, sortBy]);

  // Fetch products when location or filters change
  useEffect(() => {
    if (location) {
      fetchLocationBasedProducts();
    }
  }, [location, selectedCategory, maxDistance]);

  const handleLocationRequest = async () => {
    try {
      await requestLocation();
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const handleAddToCart = (product: Product) => {
    // Implement add to cart functionality
    console.log('Add to cart:', product);
    alert(`Added ${product.name} to cart!`);
  };

  const handleViewVendor = (vendorId: string) => {
    window.location.href = `/marketplace/vendor/${vendorId}`;
  };

  const handleQuickOrder = (product: Product) => {
    setQuickOrderVendor({
      vendorId: product.sellerId._id,
      vendorName: product.sellerId.name,
      distance: product.distance || 0,
      estimatedDeliveryTime: product.estimatedDeliveryTime || 'Unknown'
    });
  };

  const handleOrderPlaced = (orderId: string) => {
    console.log('Order placed:', orderId);
    alert('Order placed successfully! You can track it in your orders.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Nearby Products</h2>
          <p className="text-muted-foreground">
            Fresh products from vendors in your area
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchLocationBasedProducts}
          disabled={loading || !location}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Location Status */}
      {!location && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Location Required</p>
                  <p className="text-sm text-yellow-700">
                    Enable location to see nearby products and vendors
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={handleLocationRequest}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Enable Location
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              onClick={handleLocationRequest}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Nearby Vendors Summary */}
      {location && nearbyVendors.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-green-100">
                  <Truck className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">
                    {nearbyVendors.length} vendors nearby
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Within {(maxDistance / 1000).toFixed(1)}km of your location
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {nearbyVendors.slice(0, 3).map((vendor, index) => (
                  <Badge key={vendor.vendorId} variant="outline" className="text-xs">
                    {vendor.name} ({vendor.distance}m)
                  </Badge>
                ))}
                {nearbyVendors.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{nearbyVendors.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products or vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="distance">Sort by Distance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>

            {/* Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Maximum Distance: {(maxDistance / 1000).toFixed(1)}km
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="500"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLocationBasedProducts}
              className="mt-2"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {!location 
                  ? 'Enable location to see nearby products'
                  : searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No vendors are currently active in your area'
                }
              </p>
              {!location && (
                <Button onClick={handleLocationRequest}>
                  <Navigation className="h-4 w-4 mr-2" />
                  Enable Location
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedProducts.map((product) => (
              <Card key={product._id} className={getCardStyles('hover')}>
                <CardContent className="p-4">
                  {/* Product Image */}
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {product.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>

                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Price and Quantity */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-green-600">
                          ₹{product.price}/{product.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Available: {product.availableQuantity} {product.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Min order: {product.minimumOrderQuantity} {product.unit}
                        </p>
                      </div>
                    </div>

                    {/* Vendor Info */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">
                            {product.sellerId.name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            {product.distance !== undefined && (
                              <>
                                <MapPin className="h-3 w-3" />
                                <span>{product.distance}m away</span>
                              </>
                            )}
                            {product.estimatedDeliveryTime && (
                              <>
                                <Clock className="h-3 w-3" />
                                <span>{product.estimatedDeliveryTime}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleQuickOrder(product)}
                        className="flex-1"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Quick Order
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewVendor(product.sellerId._id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredAndSortedProducts.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredAndSortedProducts.length} products
          </p>
        </div>
      )}

      {/* Quick Order Modal */}
      {quickOrderVendor && (
        <QuickOrderFromProximity
          vendorId={quickOrderVendor.vendorId}
          vendorName={quickOrderVendor.vendorName}
          distance={quickOrderVendor.distance}
          estimatedDeliveryTime={quickOrderVendor.estimatedDeliveryTime}
          onClose={() => setQuickOrderVendor(null)}
          onOrderPlaced={handleOrderPlaced}
        />
      )}
    </div>
  );
}