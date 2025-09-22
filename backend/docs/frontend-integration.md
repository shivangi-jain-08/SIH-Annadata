# Frontend Integration

Complete guide for integrating with React and React Native.

## API Client Setup

Create a centralized API client:

```javascript
// api.js
class ApiClient {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
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
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
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
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
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
      {products?.products?.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>Price: ₹{product.price}/{product.unit}</p>
          <p>Available: {product.quantity} {product.unit}</p>
        </div>
      ))}
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
    price: '',
    quantity: '',
    unit: 'kg',
    category: 'vegetables'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ApiClient.createProduct(formData);
      alert('Product created successfully!');
      setFormData({ name: '', price: '', quantity: '', unit: 'kg', category: 'vegetables' });
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
      />
      <input 
        type="number"
        placeholder="Price"
        value={formData.price}
        onChange={(e) => setFormData({...formData, price: e.target.value})}
      />
      <button type="submit">Create Product</button>
    </form>
  );
};
```

## Error Handling

```javascript
// errorHandler.js
export const handleApiError = (error) => {
  if (error.message.includes('401')) {
    // Unauthorized - redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  } else if (error.message.includes('403')) {
    alert('Access denied. You do not have permission for this action.');
  } else if (error.message.includes('500')) {
    alert('Server error. Please try again later.');
  } else {
    alert(error.message || 'An unexpected error occurred.');
  }
};
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

  const token = await AsyncStorage.getItem('authToken');
  
  try {
    const response = await fetch('http://localhost:3000/api/ml/disease-detection', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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