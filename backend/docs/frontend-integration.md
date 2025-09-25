# Frontend Integration

Complete guide for integrating with React and React Native.

## 🔓 Authentication Status

**SIMPLIFIED FOR DEVELOPMENT**: JWT authentication has been removed for rapid frontend development. All endpoints are publicly accessible.

### Current State
- ✅ All API endpoints work without authentication
- ✅ No JWT tokens required
- ✅ Ready for immediate frontend development

## API Client Setup

Create a centralized API client (simplified without JWT):

```javascript
// api.js
class ApiClient {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'API request failed');
      }
      
      return result.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // User methods
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(userData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Product methods
  async getProducts(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/products?${queryParams}`);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async searchProducts(query) {
    return this.request(`/products/search?q=${encodeURIComponent(query)}`);
  }

  async getProductsByCategory(category) {
    return this.request(`/products/category/${category}`);
  }

  // Order methods
  async getMyOrders() {
    return this.request('/orders/my-orders');
  }

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // ML methods
  async getCropRecommendations() {
    return this.request('/ml/crop-recommendations');
  }

  async getHardwareMessages() {
    return this.request('/ml/hardware-messages');
  }

  async getDiseaseReports() {
    return this.request('/ml/disease-reports');
  }

  // Location methods
  async getNearbyVendors(longitude, latitude, radius = 5000) {
    return this.request(`/location/nearby-vendors?longitude=${longitude}&latitude=${latitude}&radius=${radius}`);
  }

  async updateLocation(longitude, latitude) {
    return this.request('/location/update', {
      method: 'POST',
      body: JSON.stringify({ longitude, latitude }),
    });
  }

  // Notification methods
  async getNotifications() {
    return this.request('/notifications');
  }
}

export default new ApiClient();
```

## React Hook

Custom hook for API calls:

```javascript
// useApi.js
import { useState, useEffect } from 'react';
import ApiClient from './api';

export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await ApiClient.request(endpoint, options);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};
```

## Usage Examples

### Authentication
```javascript
// Login component
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const result = await ApiClient.login(email, password);
      localStorage.setItem('user', JSON.stringify(result.user || { name: 'User', role: 'farmer' }));
      // Redirect to dashboard
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
};
```

### Product List
```javascript
// ProductList component
const ProductList = () => {
  const { data: products, loading, error } = useApi('/products');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Available Products</h2>
      {products?.products?.map(product => (
        <div key={product._id} className="product-card">
          <h3>{product.name}</h3>
          <p>Price: ₹{product.price}/{product.unit}</p>
          <p>Available: {product.availableQuantity} {product.unit}</p>
          <p>Category: {product.category}</p>
          <p>Seller: {product.sellerId?.name || 'Unknown'}</p>
          {product.images && product.images.length > 0 && (
            <img src={product.images[0]} alt={product.name} style={{width: '200px'}} />
          )}
        </div>
      ))}
    </div>
  );
};

// Product Search
const ProductSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const data = await ApiClient.searchProducts(query);
      setResults(data.products || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      
      <div>
        {results.map(product => (
          <div key={product._id}>
            <h4>{product.name}</h4>
            <p>₹{product.price}/{product.unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Create Product
```javascript
// CreateProduct component
const CreateProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    availableQuantity: '',
    unit: 'kg',
    category: 'vegetables',
    minimumOrderQuantity: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        availableQuantity: parseFloat(formData.availableQuantity),
        minimumOrderQuantity: parseInt(formData.minimumOrderQuantity)
      };
      
      await ApiClient.createProduct(productData);
      alert('Product created successfully!');
      setFormData({ 
        name: '', 
        description: '',
        price: '', 
        availableQuantity: '', 
        unit: 'kg', 
        category: 'vegetables',
        minimumOrderQuantity: 1
      });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        placeholder="Product Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      <textarea 
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
      <input 
        type="number"
        placeholder="Price per unit"
        value={formData.price}
        onChange={(e) => setFormData({...formData, price: e.target.value})}
        required
      />
      <input 
        type="number"
        placeholder="Available Quantity"
        value={formData.availableQuantity}
        onChange={(e) => setFormData({...formData, availableQuantity: e.target.value})}
        required
      />
      <select 
        value={formData.unit}
        onChange={(e) => setFormData({...formData, unit: e.target.value})}
      >
        <option value="kg">Kg</option>
        <option value="gram">Gram</option>
        <option value="ton">Ton</option>
        <option value="piece">Piece</option>
        <option value="dozen">Dozen</option>
        <option value="liter">Liter</option>
        <option value="bundle">Bundle</option>
      </select>
      <select 
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value})}
      >
        <option value="vegetables">Vegetables</option>
        <option value="fruits">Fruits</option>
        <option value="grains">Grains</option>
        <option value="pulses">Pulses</option>
        <option value="spices">Spices</option>
        <option value="herbs">Herbs</option>
        <option value="dairy">Dairy</option>
        <option value="other">Other</option>
      </select>
      <button type="submit">Create Product</button>
    </form>
  );
};

// ML Integration Example
const CropRecommendations = () => {
  const { data: recommendations, loading, error } = useApi('/ml/crop-recommendations');

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>AI Crop Recommendations</h2>
      {recommendations?.recommendations?.map((rec, index) => (
        <div key={index} className="recommendation-card">
          <h3>{rec.cropName}</h3>
          <p>Suitability: {rec.suitabilityPercentage}%</p>
          <p>Expected Yield: {rec.expectedYield}</p>
        </div>
      ))}
    </div>
  );
};

// Location Services Example
const NearbyVendors = () => {
  const [location, setLocation] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      });
    }
  };

  const findNearbyVendors = async () => {
    if (!location) return;
    
    setLoading(true);
    try {
      const data = await ApiClient.getNearbyVendors(location.longitude, location.latitude);
      setVendors(data.vendors || []);
    } catch (error) {
      console.error('Failed to find vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Nearby Vendors</h2>
      <button onClick={getCurrentLocation}>Get My Location</button>
      {location && (
        <button onClick={findNearbyVendors} disabled={loading}>
          {loading ? 'Searching...' : 'Find Nearby Vendors'}
        </button>
      )}
      
      <div>
        {vendors.map(vendor => (
          <div key={vendor._id}>
            <h4>{vendor.name}</h4>
            <p>Distance: {vendor.distance}m</p>
            <p>Phone: {vendor.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Error Handling

```javascript
// errorHandler.js
export const handleApiError = (error) => {
  if (error.message.includes('401')) {
    alert('Authentication required');
  } else if (error.message.includes('403')) {
    alert('Access denied. You do not have permission for this action.');
  } else if (error.message.includes('404')) {
    alert('Resource not found.');
  } else if (error.message.includes('500')) {
    alert('Server error. Please try again later.');
  } else {
    alert(error.message || 'An unexpected error occurred.');
  }
};

// Global error boundary for React
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please refresh the page.</h1>;
    }

    return this.props.children;
  }
}
```

## React Native

For React Native, update the base URL:

```javascript
// React Native API client
import { Platform } from 'react-native';

const API_BASE_URL = Platform.select({
  ios: 'http://localhost:3000/api',
  android: 'http://10.0.2.2:3000/api', // Android emulator
  // For physical device, use your computer's IP
  // android: 'http://192.168.1.100:3000/api',
});

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }
  // ... rest of the implementation
}
```

### File Upload (Disease Detection)
```javascript
// React Native file upload
const uploadImage = async (imageUri, cropType) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'disease-image.jpg',
  });
  formData.append('cropType', cropType);
  
  try {
    const response = await fetch('http://localhost:3000/api/ml/disease-detection', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    throw error;
  }
};

// Web version (React)
const DiseaseDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [cropType, setCropType] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('cropType', cropType);

    try {
      const response = await fetch('http://localhost:3000/api/ml/disease-detection', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      setResult(data.data);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Disease Detection</h2>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      <input 
        type="text" 
        placeholder="Crop type (e.g., tomato)" 
        value={cropType}
        onChange={(e) => setCropType(e.target.value)}
      />
      <button onClick={handleUpload} disabled={loading || !selectedFile}>
        {loading ? 'Analyzing...' : 'Detect Disease'}
      </button>
      
      {result && (
        <div>
          <h3>Detection Result</h3>
          <p>Disease: {result.diseaseName}</p>
          <p>Confidence: {result.confidence}%</p>
          <p>Treatment: {result.treatment}</p>
        </div>
      )}
    </div>
  );
};
```

## Real-time Updates

Socket.IO integration:

```javascript
// socket.js
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

// Listen for updates
socket.on('orderUpdate', (data) => {
  console.log('Order updated:', data);
  // Update UI
});

socket.on('vendorNearby', (data) => {
  console.log('Vendor nearby:', data);
  // Show notification
});

export default socket;
```