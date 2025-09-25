import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  MapPin, 
  Package, 
  Star,
  Phone,
  Clock,
  Truck,
  Plus,
  Minus,
  ArrowLeft,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useVendorProducts, useShoppingCart } from '@/hooks/useMarketplace';
import { componentStyles, getCardStyles } from '@/utils/styles';

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  unit: string;
  maxQuantity: number;
}

export function VendorProductsView() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const { vendor, products, loading, error, refetch } = useVendorProducts(vendorId || '');
  const { addToCart, getTotalItems } = useShoppingCart();
  
  const [localCart, setLocalCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Add to local cart
  const handleAddToLocalCart = (product: any, quantity: number = 1) => {
    setLocalCart(prev => {
      const existingItem = prev.find(item => item.productId === product._id);
      
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantity, product.availableQuantity);
        return prev.map(item =>
          item.productId === product._id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        return [...prev, {
          productId: product._id,
          quantity: Math.min(quantity, product.availableQuantity),
          price: product.price,
          name: product.name,
          unit: product.unit,
          maxQuantity: product.availableQuantity
        }];
      }
    });
  };

  // Update quantity in local cart
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setLocalCart(prev => prev.filter(item => item.productId !== productId));
      return;
    }

    setLocalCart(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
          : item
      )
    );
  };

  // Get quantity for a product in local cart
  const getCartQuantity = (productId: string) => {
    const item = localCart.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  // Calculate cart totals
  const cartTotal = localCart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = localCart.reduce((total, item) => total + item.quantity, 0);

  // Handle place order
  const handlePlaceOrder = async () => {
    if (localCart.length === 0) return;

    try {
      // Add all items to global cart
      localCart.forEach(item => {
        const product = products?.find(p => p._id === item.productId);
        if (product) {
          addToCart(product, item.quantity);
        }
      });

      // Clear local cart
      setLocalCart([]);
      setShowCart(false);

      // Navigate to checkout or show success message
      alert('Items added to cart! Proceed to checkout.');
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to add items to cart. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="aspect-square bg-gray-200 rounded-lg"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-semibold text-red-800 mb-2">Vendor Not Found</h3>
            <p className="text-sm text-red-700 mb-4">
              {error?.message || 'The vendor you\'re looking for could not be found.'}
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
          Back to Marketplace
        </Button>
        
        {cartItemCount > 0 && (
          <Button 
            onClick={() => setShowCart(!showCart)}
            className="relative"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart ({cartItemCount})
            <Badge className="absolute -top-2 -right-2 bg-red-500">
              {cartItemCount}
            </Badge>
          </Button>
        )}
      </div>

      {/* Vendor Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{vendor.name}</h1>
                <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>{vendor.phone}</span>
                  </div>
                  {vendor.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>Location available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {vendor.stats && (
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{vendor.stats.totalProducts}</p>
                  <p className="text-xs text-muted-foreground">Products</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{vendor.stats.completedOrders}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div>
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-bold">{vendor.stats.averageRating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div>
                  <p className="font-bold">{vendor.stats.responseTime}</p>
                  <p className="text-xs text-muted-foreground">Response</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shopping Cart Sidebar */}
      {showCart && cartItemCount > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Order</span>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setShowCart(false)}
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {localCart.map((item) => (
              <div key={item.productId} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">₹{item.price} per {item.unit}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.maxQuantity}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">Total:</span>
                <span className="text-xl font-bold">₹{cartTotal.toFixed(2)}</span>
              </div>
              <Button 
                className="w-full" 
                onClick={handlePlaceOrder}
                disabled={cartItemCount === 0}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Add to Cart & Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Available Products</h2>
          <p className="text-sm text-muted-foreground">
            {products?.length || 0} products available
          </p>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => {
              const cartQuantity = getCartQuantity(product._id);
              
              return (
                <Card key={product._id} className={getCardStyles('hover')}>
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

                        {/* Add to Cart Controls */}
                        <div className="pt-2 border-t">
                          {cartQuantity > 0 ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUpdateQuantity(product._id, cartQuantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-semibold">{cartQuantity}</span>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUpdateQuantity(product._id, cartQuantity + 1)}
                                  disabled={cartQuantity >= product.availableQuantity}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-sm font-semibold">
                                ₹{(product.price * cartQuantity).toFixed(2)}
                              </p>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAddToLocalCart(product)}
                              disabled={product.availableQuantity === 0}
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Add to Cart
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No products available</h3>
              <p className="text-sm text-muted-foreground">
                This vendor doesn't have any products available at the moment.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && !showCart && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            size="lg"
            onClick={() => setShowCart(true)}
            className="rounded-full shadow-lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {cartItemCount} items • ₹{cartTotal.toFixed(2)}
          </Button>
        </div>
      )}
    </div>
  );
}