import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG, { buildUrl, apiRequest } from '../config/api';

class ProductService {
  constructor() {
    this.storageKey = 'PRODUCTS_DATA';
  }

  // Get authorization header
  async getAuthHeader() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch (error) {
      console.error('Error getting auth header:', error);
      return {};
    }
  }

  // Fetch farmer's products/listings from API
  async getFarmerProducts() {
    try {
      const authHeader = await this.getAuthHeader();
      
      // Check if we have auth token
      if (!authHeader.Authorization) {
        console.warn('No auth token found, using mock data');
        const mockData = this.generateMockProducts();
        return {
          success: true,
          data: mockData,
          message: 'Using mock data - not authenticated',
          isMock: true
        };
      }
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.PRODUCTS}/my-products`, {
        method: 'GET',
        headers: authHeader
      });

      if (response.success && response.data && response.data.products) {
        // Cache the actual products array
        await this.cacheProducts(response.data.products);
        return {
          success: true,
          data: response.data.products,  // Return the products array directly
          message: 'Products fetched successfully'
        };
      } else {
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching farmer products:', error);
      
      // Try to get cached data as fallback
      const cachedData = await this.getCachedProducts();
      if (cachedData.length > 0) {
        return {
          success: true,
          data: cachedData,
          message: 'Using cached data - network error',
          isOffline: true
        };
      }

      // Generate mock data as last resort
      const mockData = this.generateMockProducts();
      return {
        success: true,
        data: mockData,
        message: 'Using mock data - API unavailable',
        isMock: true
      };
    }
  }

  // Get all products from farmers (for vendors/consumers to browse)
  async getAllProducts() {
    try {
      const authHeader = await this.getAuthHeader();
      
      console.log('ProductService: Fetching products from farmers only');
      
      // Use the specific endpoint to get products from farmers only
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.PRODUCTS}/by-role/farmer`, {
        method: 'GET',
        headers: authHeader
      });

      if (response.success && response.data) {
        // Handle different possible response structures
        const products = response.data.products || response.data || [];
        console.log('ProductService: Fetched farmer products:', products.length);
        
        return {
          success: true,
          data: products,
          message: 'Farmer products fetched successfully'
        };
      } else {
        throw new Error(response.message || 'Failed to fetch farmer products');
      }
    } catch (error) {
      console.error('Error fetching farmer products:', error);
      
      // Return mock data as fallback
      const mockData = this.generateMockProductsWithFarmerDetails();
      return {
        success: false,
        data: mockData,
        message: 'Using mock data - API unavailable',
        isMock: true
      };
    }
  }

  // Get all products from vendors (for consumers to browse)
  async getVendorProducts() {
    try {
      const authHeader = await this.getAuthHeader();
      
      console.log('ProductService: Fetching products from vendors only');
      
      // Use the specific endpoint to get products from vendors only
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.PRODUCTS}/by-role/vendor`, {
        method: 'GET',
        headers: authHeader
      });

      if (response.success && response.data) {
        // Handle different possible response structures
        const products = response.data.products || response.data || [];
        console.log('ProductService: Fetched vendor products:', products.length);
        
        return {
          success: true,
          data: products,
          message: 'Vendor products fetched successfully'
        };
      } else {
        throw new Error(response.message || 'Failed to fetch vendor products');
      }
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      
      // Return mock data as fallback
      const mockData = this.generateMockProductsWithVendorDetails();
      return {
        success: false,
        data: mockData,
        message: 'Using mock data - API unavailable',
        isMock: true
      };
    }
  }

  // Generate mock products with farmer details (populated sellerId)
  generateMockProductsWithFarmerDetails() {
    return [
      {
        _id: 'prod1',
        name: 'Premium Wheat',
        description: 'High quality organic wheat grown using traditional methods',
        category: 'grains',
        price: 35,
        unit: 'kg',
        availableQuantity: 500,
        minimumOrderQuantity: 10,
        quality: 'Organic',
        harvestDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        sellerId: {
          _id: 'farmer1',
          name: 'Rajesh Kumar Singh',
          role: 'farmer',
          location: {
            village: 'Khairpur Village',
            district: 'Ludhiana',
            state: 'Punjab'
          },
          address: 'Village Khairpur, Ludhiana, Punjab, India'
        },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  // Generate mock products with vendor details (populated sellerId)
  generateMockProductsWithVendorDetails() {
    return [
      {
        _id: 'prod1',
        name: 'Fresh Vegetables Pack',
        description: 'Assorted fresh vegetables sourced from local farmers',
        category: 'vegetables',
        price: 150,
        unit: 'pack',
        availableQuantity: 50,
        minimumOrderQuantity: 1,
        quality: 'Fresh',
        harvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        sellerId: {
          _id: 'vendor1',
          name: 'Green Grocers',
          role: 'vendor',
          location: {
            district: 'Mumbai',
            state: 'Maharashtra'
          },
          address: 'Shop 12, Market Road, Mumbai, Maharashtra, India'
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'prod2',
        name: 'Organic Fruits Basket',
        description: 'Premium quality organic fruits handpicked from certified farms',
        category: 'fruits',
        price: 280,
        unit: 'basket',
        availableQuantity: 30,
        minimumOrderQuantity: 1,
        quality: 'Organic',
        harvestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        sellerId: {
          _id: 'vendor2',
          name: 'Fresh Mart',
          role: 'vendor',
          location: {
            district: 'Bangalore',
            state: 'Karnataka'
          },
          address: 'Plaza Complex, MG Road, Bangalore, Karnataka, India'
        },
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'prod3',
        name: 'Rice & Grains Combo',
        description: 'Best quality basmati rice and mixed grains combo pack',
        category: 'grains',
        price: 220,
        unit: 'kg',
        availableQuantity: 100,
        minimumOrderQuantity: 2,
        quality: 'Premium',
        harvestDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        sellerId: {
          _id: 'vendor3',
          name: 'Grain House',
          role: 'vendor',
          location: {
            district: 'Delhi',
            state: 'Delhi'
          },
          address: 'Connaught Place, New Delhi, Delhi, India'
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  // Generate mock products for development/fallback (farmer's own products)
  generateMockProducts() {
    return [
      {
        _id: 'mock_1',
        sellerId: 'user_123',
        name: 'Fresh Tomatoes',
        description: 'Organic red tomatoes, freshly harvested from Punjab farms. Perfect for cooking and salads.',
        category: 'vegetables',
        price: 40,
        unit: 'kg',
        availableQuantity: 100,
        minimumOrderQuantity: 5,
        images: [],
        location: {
          district: 'Ludhiana',
          state: 'Punjab'
        },
        isActive: true,
        harvestDate: new Date('2025-09-20'),
        expiryDate: new Date('2025-09-27'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'mock_2',
        sellerId: 'user_123',
        name: 'Basmati Rice',
        description: 'Premium quality basmati rice with long grains and aromatic fragrance. Aged for perfect texture.',
        category: 'grains',
        price: 80,
        unit: 'kg',
        availableQuantity: 500,
        minimumOrderQuantity: 10,
        images: [],
        location: {
          district: 'Amritsar',
          state: 'Punjab'
        },
        isActive: true,
        harvestDate: new Date('2025-08-15'),
        expiryDate: new Date('2026-08-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'mock_3',
        sellerId: 'user_123',
        name: 'Organic Spinach',
        description: 'Fresh organic spinach leaves, grown without pesticides. Rich in iron and vitamins.',
        category: 'vegetables',
        price: 35,
        unit: 'kg',
        availableQuantity: 50,
        minimumOrderQuantity: 2,
        images: [],
        location: {
          district: 'Chandigarh',
          state: 'Punjab'
        },
        isActive: true,
        harvestDate: new Date('2025-09-25'),
        expiryDate: new Date('2025-10-02'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  // Add new product
  async addProduct(productData) {
    try {
      const authHeader = await this.getAuthHeader();
      
      console.log('ProductService: Sending product data:', productData);
      console.log('ProductService: Auth headers:', authHeader);
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.PRODUCTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify(productData)
      });

      console.log('ProductService: API response:', response);

      if (response.success) {
        // Update local cache
        await this.updateLocalCache();
        return response;
      } else {
        // Log detailed error info
        console.error('ProductService: API error response:', response);
        throw new Error(response.message || response.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  // Update existing product
  async updateProduct(productId, productData) {
    try {
      const authHeader = await this.getAuthHeader();
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${productId}`, {
        method: 'PUT',
        headers: authHeader,
        body: JSON.stringify(productData)
      });

      if (response.success) {
        // Update local cache
        await this.updateLocalCache();
        return response;
      } else {
        throw new Error(response.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete product
  async deleteProduct(productId) {
    try {
      const authHeader = await this.getAuthHeader();
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${productId}`, {
        method: 'DELETE',
        headers: authHeader
      });

      if (response.success) {
        // Update local cache
        await this.updateLocalCache();
        return response;
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Cache products locally
  async cacheProducts(products) {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(products));
    } catch (error) {
      console.error('Error caching products:', error);
    }
  }

  // Get cached products
  async getCachedProducts() {
    try {
      const cached = await AsyncStorage.getItem(this.storageKey);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error getting cached products:', error);
      return [];
    }
  }

  // Update local cache after API operations
  async updateLocalCache() {
    try {
      const response = await this.getFarmerProducts();
      return response.data;
    } catch (error) {
      console.error('Error updating local cache:', error);
      return [];
    }
  }

  // Transform API data to display format
  formatProductData(product) {
    if (!product) {
      console.warn('formatProductData: received null/undefined product');
      return null;
    }
    
    // Extract farmer details from populated sellerId
    const farmer = product.sellerId || {};
    const farmerLocation = farmer.location || {};
    
    // Format farmer location with multiple fallback strategies
    let locationString = 'Location not specified';
    
    console.log('ProductService: Formatting location for farmer:', farmer.name);
    console.log('ProductService: Farmer data:', { 
      hasAddress: !!farmer.address, 
      hasLocation: !!farmer.location,
      location: farmer.location,
      address: farmer.address
    });
    
    // Strategy 1: Use address field (primary source for readable location)
    if (farmer.address && farmer.address.trim() !== '') {
      // Extract meaningful location parts from address
      const addressParts = farmer.address.split(',').map(part => part.trim()).filter(part => part !== '');
      
      if (addressParts.length >= 3) {
        // Take last 3 parts for district/state/country or village/district/state
        const relevantParts = addressParts.slice(-3);
        // Remove generic terms like "India" from display
        const filteredParts = relevantParts.filter(part => 
          !['India', 'INDIA', 'india'].includes(part.trim())
        );
        locationString = filteredParts.length > 0 ? filteredParts.join(', ') : addressParts.slice(-2).join(', ');
      } else if (addressParts.length >= 2) {
        // Take last 2 parts for district/state
        locationString = addressParts.slice(-2).join(', ');
      } else if (addressParts.length === 1 && addressParts[0] !== '') {
        locationString = addressParts[0];
      }
    }
    // Strategy 2: Check if farmerLocation has readable properties (from old data structure)
    else if (farmerLocation && typeof farmerLocation === 'object' && !farmerLocation.coordinates) {
      if (farmerLocation.village && farmerLocation.district && farmerLocation.state) {
        locationString = `${farmerLocation.village}, ${farmerLocation.district}, ${farmerLocation.state}`;
      } else if (farmerLocation.district && farmerLocation.state) {
        locationString = `${farmerLocation.district}, ${farmerLocation.state}`;
      } else if (farmerLocation.state) {
        locationString = farmerLocation.state;
      } else if (farmerLocation.city && farmerLocation.state) {
        locationString = `${farmerLocation.city}, ${farmerLocation.state}`;
      }
    }
    // Strategy 3: Check if farmer has coordinates but no address (use generic location)
    else if (farmerLocation && farmerLocation.coordinates && Array.isArray(farmerLocation.coordinates)) {
      locationString = 'GPS coordinates available';
    }
    // Strategy 4: Check if farmer has phone number (at least show that farmer is contactable)
    else if (farmer.phone) {
      locationString = 'Contact farmer for location';
    }
    
    return {
      id: product._id || 'unknown',
      cropName: product.name || 'Unknown Product',
      description: product.description || '',
      category: product.category,
      price: product.price,
      unit: product.unit,
      availableQuantity: product.availableQuantity,
      minimumOrderQuantity: product.minimumOrderQuantity,
      location: locationString,
      harvestDate: product.harvestDate ? this.formatDate(product.harvestDate) : '',
      expiryDate: product.expiryDate ? this.formatDate(product.expiryDate) : '',
      isActive: product.isActive,
      images: product.images || [],
      quality: product.quality || this.getQualityFromCategory(product.category),
      // Farmer details
      farmerName: farmer.name || 'Unknown Farmer',
      farmerId: farmer._id,
      farmerRole: farmer.role,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }

  // Format date for display
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return '';
    }
  }

  // Get quality based on category (mock logic)
  getQualityFromCategory(category) {
    const categoryQualityMap = {
      'vegetables': 'Fresh',
      'fruits': 'Premium',
      'grains': 'Standard',
      'organic': 'Organic',
      'spices': 'Premium'
    };
    return categoryQualityMap[category?.toLowerCase()] || 'Standard';
  }

  // Get crop icon based on crop name
  getCropIcon(cropName) {
    const name = cropName?.toLowerCase() || '';
    if (name.includes('wheat') || name.includes('grain')) return 'Wheat';
    if (name.includes('rice') || name.includes('basmati')) return 'Leaf';
    if (name.includes('tomato') || name.includes('vegetable')) return 'Apple';
    if (name.includes('spinach') || name.includes('leafy')) return 'Leaf';
    if (name.includes('apple') || name.includes('fruit')) return 'Apple';
    if (name.includes('spice') || name.includes('herb')) return 'Star';
    return 'Package';
  }

  // Generate mock products for development/fallback
  generateMockProducts() {
    return [
      {
        _id: 'mock_1',
        sellerId: 'user_123',
        name: 'Fresh Tomatoes',
        description: 'Organic red tomatoes, freshly harvested from Punjab farms. Perfect for cooking and salads.',
        category: 'vegetables',
        price: 40,
        unit: 'kg',
        availableQuantity: 100,
        minimumOrderQuantity: 5,
        images: [],
        location: {
          district: 'Ludhiana',
          state: 'Punjab'
        },
        isActive: true,
        harvestDate: new Date('2025-09-20'),
        expiryDate: new Date('2025-09-27'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'mock_2',
        sellerId: 'user_123',
        name: 'Basmati Rice',
        description: 'Premium quality basmati rice with long grains and aromatic fragrance. Aged for perfect texture.',
        category: 'grains',
        price: 80,
        unit: 'kg',
        availableQuantity: 500,
        minimumOrderQuantity: 10,
        images: [],
        location: {
          district: 'Amritsar',
          state: 'Punjab'
        },
        isActive: true,
        harvestDate: new Date('2025-08-15'),
        expiryDate: new Date('2026-08-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'mock_3',
        sellerId: 'user_123',
        name: 'Organic Spinach',
        description: 'Fresh organic spinach leaves, grown without pesticides. Rich in iron and vitamins.',
        category: 'vegetables',
        price: 35,
        unit: 'kg',
        availableQuantity: 50,
        minimumOrderQuantity: 2,
        images: [],
        location: {
          district: 'Chandigarh',
          state: 'Punjab'
        },
        isActive: true,
        harvestDate: new Date('2025-09-25'),
        expiryDate: new Date('2025-10-02'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  // Calculate total value of products
  calculateTotalValue(products) {
    return products.reduce((total, product) => {
      const productValue = product.availableQuantity * product.price;
      return total + productValue;
    }, 0);
  }

  // Get products analytics
  getProductsAnalytics(products) {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive).length;
    const totalValue = this.calculateTotalValue(products);
    const totalQuantity = products.reduce((sum, p) => sum + p.availableQuantity, 0);
    
    // Group by category
    const categoryStats = products.reduce((stats, product) => {
      const category = product.category || 'Other';
      if (!stats[category]) {
        stats[category] = { count: 0, value: 0, quantity: 0 };
      }
      stats[category].count++;
      stats[category].value += product.availableQuantity * product.price;
      stats[category].quantity += product.availableQuantity;
      return stats;
    }, {});

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      totalValue,
      totalQuantity,
      categoryStats,
      averagePrice: totalProducts > 0 ? totalValue / totalQuantity : 0
    };
  }

  // Search products
  searchProducts(products, searchQuery) {
    if (!searchQuery || !searchQuery.trim()) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(product => 
      (product.name && product.name.toLowerCase().includes(query)) ||
      (product.description && product.description.toLowerCase().includes(query)) ||
      (product.category && product.category.toLowerCase().includes(query))
    );
  }

  // Filter products by category
  filterByCategory(products, category) {
    if (!category || category === 'all') return products;
    return products.filter(product => 
      product.category && category && 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Sort products
  sortProducts(products, sortBy = 'name', order = 'asc') {
    const sorted = [...products].sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = (a.name || '').toLowerCase();
          bVal = (b.name || '').toLowerCase();
          break;
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'quantity':
          aVal = a.availableQuantity;
          bVal = b.availableQuantity;
          break;
        case 'date':
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        default:
          return 0;
      }
      
      if (order === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });
    
    return sorted;
  }
}

export default new ProductService();