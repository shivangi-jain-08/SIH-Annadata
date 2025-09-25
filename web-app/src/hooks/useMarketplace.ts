import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

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

interface Vendor {
  vendorId: string;
  name: string;
  phone: string;
  coordinates: [number, number];
  distance: number;
  products: Product[];
  productCount: number;
  isActive: boolean;
}

interface Location {
  latitude: number;
  longitude: number;
}

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

export function useMarketplaceProducts(location?: Location | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        longitude: location.longitude.toString(),
        latitude: location.latitude.toString(),
        radius: '5000',
        limit: '50'
      });

      const response = await api.get(`/marketplace/products?${params}`);
      
      if (response.data.success) {
        setProducts(response.data.data.products || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Failed to fetch marketplace products:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch products'));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
}

export function useNearbyVendors(location?: Location | null) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchVendors = useCallback(async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        longitude: location.longitude.toString(),
        latitude: location.latitude.toString(),
        radius: '5000'
      });

      const response = await api.get(`/marketplace/nearby-vendors?${params}`);
      
      if (response.data.success) {
        setVendors(response.data.data.vendors || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch vendors');
      }
    } catch (err) {
      console.error('Failed to fetch nearby vendors:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch vendors'));
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return {
    vendors,
    loading,
    error,
    refetch: fetchVendors
  };
}

export function useVendorProducts(vendorId: string) {
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchVendorProducts = useCallback(async () => {
    if (!vendorId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/marketplace/vendor/${vendorId}/products`);
      
      if (response.data.success) {
        setVendor(response.data.data.vendor);
        setProducts(response.data.data.products || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch vendor products');
      }
    } catch (err) {
      console.error('Failed to fetch vendor products:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch vendor products'));
      setVendor(null);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchVendorProducts();
  }, [fetchVendorProducts]);

  return {
    vendor,
    products,
    loading,
    error,
    refetch: fetchVendorProducts
  };
}

export function useMarketplaceSearch() {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (
    searchTerm: string, 
    options: {
      category?: string;
      location?: Location;
      radius?: number;
    } = {}
  ) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: searchTerm.trim(),
        limit: '50'
      });

      if (options.category) {
        params.append('category', options.category);
      }

      if (options.location) {
        params.append('longitude', options.location.longitude.toString());
        params.append('latitude', options.location.latitude.toString());
        params.append('radius', (options.radius || 5000).toString());
      }

      const response = await api.get(`/marketplace/search?${params}`);
      
      if (response.data.success) {
        setResults(response.data.data.products || []);
      } else {
        throw new Error(response.data.message || 'Search failed');
      }
    } catch (err) {
      console.error('Marketplace search failed:', err);
      setError(err instanceof Error ? err : new Error('Search failed'));
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults
  };
}

export function useMarketplaceCategories(location?: Location | null) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (location) {
        params.append('longitude', location.longitude.toString());
        params.append('latitude', location.latitude.toString());
        params.append('radius', '5000');
      }

      const response = await api.get(`/marketplace/categories?${params}`);
      
      if (response.data.success) {
        setCategories(response.data.data.categories || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch categories');
      }
    } catch (err) {
      console.error('Failed to fetch marketplace categories:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
}

export function useProximityNotifications() {
  const [notifications, setNotifications] = useState<ProximityNotification[]>([]);

  // Mock proximity notifications for now
  // In a real implementation, this would connect to Socket.io
  useEffect(() => {
    // Simulate receiving proximity notifications
    const mockNotifications: ProximityNotification[] = [
      {
        id: '1',
        vendorId: 'vendor1',
        vendorName: 'Fresh Produce Cart',
        distance: 850,
        products: [
          { id: '1', name: 'Tomatoes', category: 'vegetables', price: 45, unit: 'kg' },
          { id: '2', name: 'Onions', category: 'vegetables', price: 35, unit: 'kg' }
        ],
        productCount: 2,
        timestamp: new Date().toISOString()
      }
    ];

    // Simulate notifications appearing after a delay
    const timer = setTimeout(() => {
      setNotifications(mockNotifications);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    dismissNotification,
    clearAllNotifications
  };
}

export function useShoppingCart() {
  const [cart, setCart] = useState<Array<{
    product: Product;
    quantity: number;
  }>>([]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product._id === product._id);
      
      if (existingItem) {
        return prev.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { product, quantity }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.product._id === productId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const getTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cart]);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  };
}