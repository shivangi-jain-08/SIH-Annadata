# Annadata Backend API

A comprehensive crop advisory system and marketplace backend API built with Node.js, Express, MongoDB, Redis, and Firebase Cloud Messaging.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Redis Cloud account (optional)
- Firebase project with FCM enabled

### Installation
```bash
cd backend
npm install
```

### Environment Setup
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

### Start Server
```bash
# Development
npm run dev

# Production
npm start
```

Server runs on: `http://localhost:3000`

## 📊 Server Status

Check server health:
```bash
GET /api/health
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-09-22T16:35:10.443Z",
    "uptime": 14.7089381,
    "environment": "development",
    "version": "1.0.0",
    "services": {
      "database": "connected",
      "redis": "connected",
      "firebase": "connected",
      "socketio": "active"
    }
  }
}
```

## 🔐 Authentication

The API uses simplified token-based authentication. After login/register, include the token in all requests:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_TOKEN_HERE',
  'Content-Type': 'application/json'
}
```

## 📚 API Endpoints

### 🔑 Authentication Endpoints

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "farmer@example.com",
  "password": "SecurePass123",
  "name": "John Farmer",
  "phone": "+919876543210",
  "role": "farmer",
  "address": "Village, District, State"
}
```

**Frontend Example:**
```javascript
const registerUser = async (userData) => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Store token for future requests
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id_here",
      "email": "farmer@example.com",
      "name": "John Farmer",
      "role": "farmer",
      "phone": "+919876543210",
      "isActive": true,
      "createdAt": "2025-09-22T16:35:10.443Z"
    },
    "token": "user_id_here"
  }
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "farmer@example.com",
  "password": "SecurePass123"
}
```

**Frontend Example:**
```javascript
const loginUser = async (email, password) => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    
    if (result.success) {
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

### 👤 User Management

#### Get Current User Profile
```http
GET /api/users/profile
Authorization: Bearer TOKEN
```

**Frontend Example:**
```javascript
const getUserProfile = async () => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch('http://localhost:3000/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    return result.data.user;
  } catch (error) {
    console.error('Failed to get profile:', error);
    throw error;
  }
};
```

#### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer TOKEN
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "address": "New Address",
  "phone": "+919876543211"
}
```

**Frontend Example:**
```javascript
const updateProfile = async (updates) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch('http://localhost:3000/api/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });
    
    const result = await response.json();
    return result.data.user;
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
};
```

### 🛒 Product Management

#### Get All Products
```http
GET /api/products?category=vegetables&page=1&limit=10
Authorization: Bearer TOKEN
```

**Query Parameters:**
- `category` (optional): Filter by category
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name

**Frontend Example:**
```javascript
const getProducts = async (filters = {}) => {
  const token = localStorage.getItem('authToken');
  const queryParams = new URLSearchParams(filters).toString();
  
  try {
    const response = await fetch(`http://localhost:3000/api/products?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to get products:', error);
    throw error;
  }
};
```

#### Create Product (Farmers/Vendors only)
```http
POST /api/products
Authorization: Bearer TOKEN
```

**Request Body:**
```json
{
  "name": "Fresh Tomatoes",
  "description": "Organic tomatoes from our farm",
  "price": 50,
  "quantity": 100,
  "unit": "kg",
  "category": "vegetables",
  "minimumOrderQuantity": 5
}
```

**Frontend Example:**
```javascript
const createProduct = async (productData) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData)
    });
    
    const result = await response.json();
    return result.data.product;
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
};
```

#### Get My Products
```http
GET /api/products/my-products
Authorization: Bearer TOKEN
```

**Frontend Example:**
```javascript
const getMyProducts = async () => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch('http://localhost:3000/api/products/my-products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    return result.data.products;
  } catch (error) {
    console.error('Failed to get my products:', error);
    throw error;
  }
};
```

### 📦 Order Management

#### Get My Orders
```http
GET /api/orders/my-orders?status=pending&page=1&limit=10
Authorization: Bearer TOKEN
```

**Frontend Example:**
```javascript
const getMyOrders = async (filters = {}) => {
  const token = localStorage.getItem('authToken');
  const queryParams = new URLSearchParams(filters).toString();
  
  try {
    const response = await fetch(`http://localhost:3000/api/orders/my-orders?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to get orders:', error);
    throw error;
  }
};
```

#### Create Order
```http
POST /api/orders
Authorization: Bearer TOKEN
```

**Request Body:**
```json
{
  "sellerId": "seller_user_id",
  "products": [
    {
      "productId": "product_id",
      "name": "Fresh Tomatoes",
      "quantity": 10,
      "price": 50,
      "unit": "kg"
    }
  ],
  "totalAmount": 500,
  "deliveryAddress": "123 Main St, City, State",
  "deliveryLocation": {
    "type": "Point",
    "coordinates": [77.2090, 28.6139]
  }
}
```

**Frontend Example:**
```javascript
const createOrder = async (orderData) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    
    const result = await response.json();
    return result.data.order;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
};
```

#### Update Order Status
```http
PATCH /api/orders/:orderId/status
Authorization: Bearer TOKEN
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Frontend Example:**
```javascript
const updateOrderStatus = async (orderId, status) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    });
    
    const result = await response.json();
    return result.data.order;
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw error;
  }
};
```

### 🤖 ML Services

#### Get Hardware Messages (Farmers only)
```http
GET /api/ml/hardware-messages?page=1&limit=10
Authorization: Bearer TOKEN
```

**Frontend Example:**
```javascript
const getHardwareMessages = async (page = 1, limit = 10) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`http://localhost:3000/api/ml/hardware-messages?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to get hardware messages:', error);
    throw error;
  }
};
```

#### Get Soil Reports (Farmers only)
```http
GET /api/ml/soil-reports?page=1&limit=10
Authorization: Bearer TOKEN
```

**Frontend Example:**
```javascript
const getSoilReports = async (page = 1, limit = 10) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`http://localhost:3000/api/ml/soil-reports?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to get soil reports:', error);
    throw error;
  }
};
```

#### Disease Detection (Farmers only)
```http
POST /api/ml/disease-detection
Authorization: Bearer TOKEN
Content-Type: multipart/form-data
```

**Frontend Example:**
```javascript
const detectDisease = async (imageFile, cropType) => {
  const token = localStorage.getItem('authToken');
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('cropType', cropType);
  
  try {
    const response = await fetch('http://localhost:3000/api/ml/disease-detection', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to detect disease:', error);
    throw error;
  }
};
```

### 📍 Location Services

#### Update Vendor Location (Vendors only)
```http
POST /api/location/update
Authorization: Bearer TOKEN
```

**Request Body:**
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

**Frontend Example:**
```javascript
const updateLocation = async (latitude, longitude) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch('http://localhost:3000/api/location/update', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latitude, longitude })
    });
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to update location:', error);
    throw error;
  }
};
```

#### Get Nearby Vendors
```http
GET /api/location/nearby-vendors?lat=28.6139&lng=77.2090&radius=5000
Authorization: Bearer TOKEN
```

**Frontend Example:**
```javascript
const getNearbyVendors = async (lat, lng, radius = 5000) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`http://localhost:3000/api/location/nearby-vendors?lat=${lat}&lng=${lng}&radius=${radius}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    return result.data.vendors;
  } catch (error) {
    console.error('Failed to get nearby vendors:', error);
    throw error;
  }
};
```

### 🔔 Notifications

#### Get User Notifications
```http
GET /api/notifications?page=1&limit=20
Authorization: Bearer TOKEN
```

**Frontend Example:**
```javascript
const getNotifications = async (page = 1, limit = 20) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`http://localhost:3000/api/notifications?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to get notifications:', error);
    throw error;
  }
};
```

#### Mark Notification as Read
```http
PATCH /api/notifications/:notificationId/read
Authorization: Bearer TOKEN
```

**Frontend Example:**
```javascript
const markNotificationAsRead = async (notificationId) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`http://localhost:3000/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
};
```

## 🔧 Frontend Integration Helpers

### API Client Setup
```javascript
// api.js - Create a centralized API client
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

  // Order methods
  async getMyOrders(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/orders/my-orders?${queryParams}`);
  }

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Add more methods as needed...
}

export default new ApiClient();
```

### React Hook Example
```javascript
// useApi.js - Custom React hook for API calls
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

// Usage in component
const ProductList = () => {
  const { data: products, loading, error } = useApi('/products');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products?.products?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
};
```

### Error Handling
```javascript
// errorHandler.js - Centralized error handling
export const handleApiError = (error) => {
  if (error.message.includes('401')) {
    // Unauthorized - redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  } else if (error.message.includes('403')) {
    // Forbidden - show access denied message
    alert('Access denied. You do not have permission for this action.');
  } else if (error.message.includes('500')) {
    // Server error
    alert('Server error. Please try again later.');
  } else {
    // Other errors
    alert(error.message || 'An unexpected error occurred.');
  }
};
```

## 🎯 User Roles & Permissions

### Farmer
- ✅ Register/Login
- ✅ Manage profile
- ✅ Create/manage products
- ✅ View/manage orders (as seller)
- ✅ Access ML services (soil analysis, disease detection)
- ✅ View notifications

### Vendor
- ✅ Register/Login
- ✅ Manage profile
- ✅ Create/manage products
- ✅ View/manage orders (as buyer/seller)
- ✅ Update location
- ✅ View nearby consumers
- ✅ View notifications

### Consumer
- ✅ Register/Login
- ✅ Manage profile
- ✅ Browse products
- ✅ Create orders
- ✅ View nearby vendors
- ✅ View notifications

## 🔄 Real-time Features

The API supports Socket.IO for real-time updates:

```javascript
// Frontend Socket.IO setup
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

// Listen for real-time updates
socket.on('orderUpdate', (data) => {
  console.log('Order updated:', data);
  // Update UI accordingly
});

socket.on('vendorNearby', (data) => {
  console.log('Vendor nearby:', data);
  // Show notification to user
});

socket.on('newNotification', (data) => {
  console.log('New notification:', data);
  // Update notification count
});
```

## 🚨 Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## 📱 Mobile App Integration

For React Native apps, use the same API endpoints with these considerations:

1. **Base URL**: Update to your server's IP address
2. **File Uploads**: Use `react-native-image-picker` for disease detection
3. **Location**: Use `@react-native-community/geolocation`
4. **Push Notifications**: Integrate with Firebase SDK

```javascript
// React Native example
import { Platform } from 'react-native';

const API_BASE_URL = Platform.select({
  ios: 'http://localhost:3000/api',
  android: 'http://10.0.2.2:3000/api', // Android emulator
  // For physical device, use your computer's IP
  // android: 'http://192.168.1.100:3000/api',
});
```

## 🔧 Development Tips

1. **CORS**: The server is configured to accept requests from `localhost:3000` and `localhost:19006` (Expo)
2. **Rate Limiting**: API has rate limiting enabled (100 requests per 15 minutes)
3. **File Uploads**: Maximum file size is 5MB for images
4. **Pagination**: Most list endpoints support `page` and `limit` parameters
5. **Filtering**: Use query parameters for filtering and searching

## 📞 Support

- **Health Check**: `GET /api/health` - Check if all services are running
- **API Documentation**: `GET /api/docs` - Get complete endpoint documentation
- **Logs**: Check `backend/logs/` for detailed error logs

---

**Happy Coding! 🚀**
