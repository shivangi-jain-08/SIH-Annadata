# Authentication Guide

Simple token-based authentication system.

## How It Works

1. User registers/logs in
2. Server returns a token (user ID)
3. Include token in all subsequent requests
4. Server validates token and identifies user

## Registration

```javascript
const registerUser = async (userData) => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'SecurePass123',
        name: 'User Name',
        phone: '+919876543210',
        role: 'farmer', // farmer, vendor, consumer
        address: 'User Address'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Store token
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

## Login

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

## Using Token

Include in all protected requests:

```javascript
const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`http://localhost:3000/api${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  return response.json();
};
```

## Logout

```javascript
const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};
```

## Check Authentication

```javascript
const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  return token && user;
};

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
```

## Protected Route (React)

```javascript
const ProtectedRoute = ({ children }) => {
  const isAuth = isAuthenticated();
  
  if (!isAuth) {
    return <Navigate to="/login" />;
  }
  
  return children;
};
```

## Role-based Access

```javascript
const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  return user && user.role === requiredRole;
};

// Usage
if (hasRole('farmer')) {
  // Show farmer-specific features
}
```

## Error Handling

```javascript
const handleAuthError = (error) => {
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    // Token expired or invalid
    logout();
  }
};
```

## React Native

For React Native, use AsyncStorage:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store token
await AsyncStorage.setItem('authToken', token);
await AsyncStorage.setItem('user', JSON.stringify(user));

// Get token
const token = await AsyncStorage.getItem('authToken');
const user = JSON.parse(await AsyncStorage.getItem('user'));

// Remove token
await AsyncStorage.removeItem('authToken');
await AsyncStorage.removeItem('user');
```