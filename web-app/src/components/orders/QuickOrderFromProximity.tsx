import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  Plus, 
  Minus,
  Truck,
  MapPin,
  Clock,
  Package,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  X,
  Calculator
} from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { getCardStyles } from '@/utils/styles';
import ApiClient from '@/services/api';

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
}

interface Vendor {
  _id: string;
  name: string;
  phone: string;
  location?: {
    coordinates: [number, number];
  };
}

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

interface QuickOrderProps {
  vendorId: string;
  vendorName: string;
  distance: number;
  estimatedDeliveryTime: string;
  onClose: () => void;
  onOrderPlaced?: (orderId: string) => void;
}

export function QuickOrderFromProximity({ 
  vendorId, 
  vendorName, 
  distance, 
  estimatedDeliveryTime, 
  onClose,
  onOrderPlaced 
}: QuickOrderProps) {
  const { location } = useLocation();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Fetch vendor's products
  useEffect(() => {
    const fetchVendorProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get products from this specific vendor
        const response = await ApiClient.getProducts({
          sellerId: vendorId,
          isActive: true
        });

        if (response.data?.products) {
          setProducts(response.data.products);
        }
      } catch (err) {
        console.error('Failed to fetch vendor products:', err);
        setError('Failed to load vendor products');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorProducts();
  }, [vendorId]);

  // Calculate delivery fee based on distance
  useEffect(() => {
    const baseFee = 20; // Base delivery fee
    const distanceFee = Math.max(0, (distance - 500) / 100) * 2; // ₹2 per 100m after 500m
    setDeliveryFee(Math.round(baseFee + distanceFee));
  }, [distance]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const newCart = new Map(prev);
      const existing = newCart.get(product._id);
      
      if (existing) {
        const newQuantity = existing.quantity + product.minimumOrderQuantity;
        if (newQuantity <= product.availableQuantity) {
          newCart.set(product._id, {
            ...existing,
            quantity: newQuantity,
            subtotal: newQuantity * product.price
          });
        }
      } else {
        newCart.set(product._id, {
          product,
          quantity: product.minimumOrderQuantity,
          subtotal: product.minimumOrderQuantity * product.price
        });
      }
      
      return newCart;
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    setCart(prev => {
      const newCart = new Map(prev);
      const item = newCart.get(productId);
      
      if (!item) return prev;
      
      if (newQuantity <= 0) {
        newCart.delete(productId);
      } else if (newQuantity <= item.product.availableQuantity) {
        newCart.set(productId, {
          ...item,
          quantity: newQuantity,
          subtotal: newQuantity * item.product.price
        });
      }
      
      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = new Map(prev);
      newCart.delete(productId);
      return newCart;
    });
  };

  const cartItems = Array.from(cart.values());
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('Please add items to your cart');
      return;
    }

    if (!deliveryAddress.trim()) {
      alert('Please enter a delivery address');
      return;
    }

    setPlacing(true);
    try {
      const orderData = {
        sellerId: vendorId,
        products: cartItems.map(item => ({
          productId: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          unit: item.product.unit
        })),
        totalAmount: total,
        deliveryAddress: deliveryAddress.trim(),
        notes: orderNotes.trim(),
        deliveryFee,
        estimatedDeliveryTime,
        orderType: 'proximity', // Mark as proximity order
        consumerLocation: location ? {
          latitude: location.latitude,
          longitude: location.longitude
        } : undefined
      };

      const response = await ApiClient.createOrder(orderData);
      
      if (response.data?.order) {
        alert(`Order placed successfully! Order ID: ${response.data.order._id}`);
        onOrderPlaced?.(response.data.order._id);
        onClose();
      }
    } catch (err) {
      console.error('Failed to place order:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">Quick Order</h2>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Truck className="h-4 w-4" />
                <span>{vendorName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{distance}m away</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{estimatedDeliveryTime}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Products List */}
          <div className="flex-1 p-4 overflow-y-auto border-r">
            <h3 className="font-semibold mb-3">Available Products</h3>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No products available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <Card key={product._id} className={getCardStyles('hover')}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="font-semibold text-green-600">
                              ₹{product.price}/{product.unit}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Available: {product.availableQuantity} {product.unit}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Min: {product.minimumOrderQuantity} {product.unit}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToCart(product)}
                          disabled={product.availableQuantity === 0}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Cart and Checkout */}
          <div className="w-80 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-3">Your Order</h3>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.product._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ₹{item.product.price}/{item.product.unit}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.availableQuantity}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.product._id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-sm font-medium ml-2">
                        ₹{item.subtotal}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your delivery address..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Order Notes */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Any special instructions..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Order Summary */}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee:</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  onClick={handlePlaceOrder}
                  disabled={placing || cartItems.length === 0 || !deliveryAddress.trim()}
                  className="w-full"
                >
                  {placing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Place Order (₹{total})
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}