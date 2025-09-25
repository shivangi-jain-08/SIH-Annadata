import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  MapPin, 
  Package, 
  ShoppingCart, 
  Star,
  Navigation,
  AlertCircle,
  RefreshCw,
  Grid,
  List,
  SlidersHorizontal,
  Users,
  Eye
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocation } from '@/hooks/useLocation';
import { 
  useMarketplaceProducts, 
  useMarketplaceSearch, 
  useMarketplaceCategories,
  useShoppingCart 
} from '@/hooks/useMarketplace';
import { componentStyles, getCardStyles } from '@/utils/styles';

interface Product {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  unit: string;
  availableQuantity: number;
  images: string[];
  sellerId: {
    _id: string;
    name: string;
    phone: string;
    location?: {
      coordinates: [number, number];
    };
  };
  distance?: number;
  createdAt: string;
}

export function MarketplaceView() {
  const { location, requestLocation, locationError } = useLocation();
  const { 
    products: allProducts, 
    loading: productsLoading, 
    error: productsError,
    refetch: refetchProducts 
  } = useMarketplaceProducts(location);
  const { 
    results: searchResults, 
    loading: searchLoading, 
    search, 
    clearResults 
  } = useMarketplaceSearch();
  const { categories, loading: categoriesLoading } = useMarketplaceCategories(location);
  const { addToCart, getTotalItems } = useShoppingCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<string>('distance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Determine which products to display
  const displayProducts = searchTerm ? searchResults : allProducts;
  const isLoading = searchTerm ? searchLoading : productsLoading;

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...(displayProducts || [])];

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max));
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'distance':
          return (a.distance || Infinity) - (b.distance || Infinity);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [displayProducts, selectedCategory, priceRange, sortBy]);

  // Handle search
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      await search(term, {
        category: selectedCategory || undefined,
        location: location || undefined,
        radius: 5000
      });
    } else {
      clearResults();
    }
  };

  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    // Show success message or animation
  };

  // Handle view vendor products
  const handleViewVendor = (vendorId: string) => {
    window.location.href = `/marketplace/vendor/${vendorId}`;
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className={`${getCardStyles('hover')} transition-all duration-200`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="h-12 w-12 text-gray-400" />
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
              <Badge variant="outline" className="text-xs ml-2">
                {product.category}
              </Badge>
            </div>

            {product.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">₹{product.price}</p>
                <p className="text-xs text-muted-foreground">per {product.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Available</p>
                <p className="font-semibold text-sm">{product.availableQuantity} {product.unit}</p>
              </div>
            </div>

            {/* Vendor Info */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{product.sellerId.name}</span>
              </div>
              {product.distance && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {product.distance < 1000 
                      ? `${product.distance}m` 
                      : `${(product.distance / 1000).toFixed(1)}km`
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => handleAddToCart(product)}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
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
        </div>
      </CardContent>
    </Card>
  );

  const ProductListItem = ({ product }: { product: Product }) => (
    <Card className={`${getCardStyles('hover')} transition-all duration-200`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Product Image */}
          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="h-8 w-8 text-gray-400" />
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.category}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">₹{product.price}</p>
                <p className="text-xs text-muted-foreground">per {product.unit}</p>
              </div>
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {product.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{product.sellerId.name}</span>
                </div>
                {product.distance && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {product.distance < 1000 
                        ? `${product.distance}m` 
                        : `${(product.distance / 1000).toFixed(1)}km`
                      }
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {product.availableQuantity} {product.unit} available
                </span>
                <Button 
                  size="sm"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
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
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">
            Discover fresh products from nearby vendors
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getTotalItems() > 0 && (
            <Button variant="outline">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart ({getTotalItems()})
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Location Status */}
      {!location && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-yellow-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Enable location for better results</span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={requestLocation}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Enable Location
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.category} value={category.category}>
                          {category.category} ({category.productCount})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Min Price</label>
                  <Input
                    type="number"
                    placeholder="₹0"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Max Price</label>
                  <Input
                    type="number"
                    placeholder="₹1000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distance">Distance</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            'Loading products...'
          ) : (
            `Showing ${filteredProducts.length} products${location ? ' nearby' : ''}`
          )}
        </p>
        {(productsError || locationError) && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={refetchProducts}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </div>

      {/* Products Grid/List */}
      {isLoading ? (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4`}>
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="aspect-square bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4`}>
          {filteredProducts.map((product) => (
            viewMode === 'grid' ? (
              <ProductCard key={product._id} product={product} />
            ) : (
              <ProductListItem key={product._id} product={product} />
            )
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No products found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm 
                ? `No products match "${searchTerm}"`
                : location 
                  ? 'No products available from nearby vendors'
                  : 'Enable location to find products from nearby vendors'
              }
            </p>
            {!location && (
              <Button onClick={requestLocation}>
                <Navigation className="h-4 w-4 mr-2" />
                Enable Location
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}