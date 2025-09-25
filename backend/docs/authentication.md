# Authentication Guide

**SIMPLIFIED FOR DEVELOPMENT**: Authentication has been removed for rapid frontend development.

## Current Status

- ✅ All endpoints are publicly accessible
- ✅ No authentication tokens required
- ✅ Ready for immediate frontend development

## How It Works (Simplified)

1. User registers/logs in (optional)
2. All API calls work without tokens
3. Controllers handle requests in development mode

## Registration (Simplified)

```javascript
const registerUser = async (userData) => {
  try {
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "user@example.com",
        password: "SecurePass123",
        name: "User Name",
        phone: "+919876543210",
        role: "farmer", // farmer, vendor, consumer
        address: "User Address",
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Store user info (no token needed)
      localStorage.setItem("user", JSON.stringify(result.data.user));
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};
```

## Login (Simplified)

```javascript
const loginUser = async (email, password) => {
  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (result.success) {
      // Store user info (no token needed)
      localStorage.setItem("user", JSON.stringify(result.data.user));
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};
```

## Making API Requests (No Auth Required)

Simple API requests without authentication:

```javascript
const makeAPIRequest = async (endpoint, options = {}) => {
  const response = await fetch(`http://localhost:3000/api${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return response.json();
};
```

## User Management

```javascript
const logout = () => {
  localStorage.removeItem("user");
  window.location.href = "/login";
};

const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  return user && user.role === requiredRole;
};
```

## Example Usage

```javascript
// Get all products (no auth needed)
const products = await makeAPIRequest("/products");

// Create a product (no auth needed)
const newProduct = await makeAPIRequest("/products", {
  method: "POST",
  body: JSON.stringify({
    name: "Fresh Tomatoes",
    price: 50,
    category: "vegetables",
  }),
});

// Get user profile (no auth needed)
const profile = await makeAPIRequest("/users/profile");
```

## React Native (Simplified)

For React Native, use AsyncStorage for user data only:

```javascript
import AsyncStorage from "@react-native-async-storage/async-storage";

// Store user info
await AsyncStorage.setItem("user", JSON.stringify(user));

// Get user info
const user = JSON.parse(await AsyncStorage.getItem("user"));

// Remove user info
await AsyncStorage.removeItem("user");
```
