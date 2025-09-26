import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  Search, 
  ShoppingCart, 
  MapPin, 
  Phone,
  User,
  Filter,
  RefreshCw,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { getCardStyles } from '@/utils/styles';
import { useAuth } from '@/contexts/AuthContext';

export function BuyFromFarmers() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<Array<{productId: string, quantity: number}>>([]);
  
  const { 
    products: farmerProducts, 
    loading, 
    error, 
    refetch 
  } = useProducts({ role: 'farmer' });

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

  // Filter products based on search and category
  const filteredProducts = farmerProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (productId: string, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId, quantity }];
    });
  };

  const getCartQuantity = (productId: string) => {
    const item = cart.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const getTotalCartItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
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
            <h2 className="text-2xl font-bold">Buy from Farmers</h2>
            <p className="text-muted-foreground">
              Browse fresh produce directly from local farmers
            </p>
          </div>
        </div>
        
        {getTotalCartItems() > 0 && (
          <Button className="relative">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart ({getTotalCartItems()})
            <Badge className="absolute -top-2 -right-2 bg-red-500">
              {getTotalCartItems()}
            </Badge>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
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
              
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Failed to load farmer products</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              {error.message || 'Please check your connection and try again.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              className="mt-2"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No farmer products are currently available.'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product._id} className={getCardStyles('hover')}>
              <CardContent className="p-4">
                {/* Product Image Placeholder */}
                <div className="h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-lg mb-4 flex items-center justify-center">
                  <Package className="h-8 w-8 text-green-600" />
                </div>
                
                {/* Product Info */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Farmer Info */}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{(product as any).sellerId?.name || 'Unknown Farmer'}</span>
                  </div>

                  {/* Price and Availability */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        ₹{product.price}/{product.unit}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {product.availableQuantity} {product.unit} available
                      </span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Min order: {product.minimumOrderQuantity} {product.unit}
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <div className="flex items-center justify-between pt-2">
                    {getCartQuantity(product._id) > 0 ? (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newCart = cart.map(item => 
                              item.productId === product._id 
                                ? { ...item, quantity: Math.max(0, item.quantity - 1) }
                                : item
                            ).filter(item => item.quantity > 0);
                            setCart(newCart);
                          }}
                        >
                          -
                        </Button>
                        <span className="font-medium">
                          {getCartQuantity(product._id)} {product.unit}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addToCart(product._id, 1)}
                          disabled={getCartQuantity(product._id) >= product.availableQuantity}
                        >
                          +
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => addToCart(product._id, product.minimumOrderQuantity)}
                        disabled={product.availableQuantity < product.minimumOrderQuantity}
                        className="flex-1"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Cart Summary */}
      {getTotalCartItems() > 0 && (
        <Card className="sticky bottom-4 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-green-800">
                  {getTotalCartItems()} items in cart
                </p>
                <p className="text-sm text-green-700">
                  Ready to place order with farmers
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setCart([])}>
                  Clear Cart
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  Place Order
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}