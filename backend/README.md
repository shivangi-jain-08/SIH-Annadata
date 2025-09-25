# Annadata Backend API

A crop advisory system and marketplace backend API.

## 🚀 Quick Start

```bash
cd backend
npm install
npm run dev
```

Server runs on: `http://localhost:3000`

## 🔓 Authentication Status

**SIMPLIFIED FOR DEVELOPMENT**: JWT authentication has been removed for rapid frontend development.

### Current State

- ✅ **All endpoints are publicly accessible** (no auth tokens required)
- ✅ **Ready for immediate frontend development**
- ✅ **Full API functionality available**

### API Usage (No Auth Required)

```javascript
// Simple fetch - no headers needed
fetch("http://localhost:3000/api/products")
  .then((res) => res.json())
  .then((data) => console.log(data));

// POST requests
fetch("http://localhost:3000/api/products", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(productData),
});
```

## 📚 API Reference

### Auth

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/role/farmer` - Get users by role

### Products ⭐ **Core Feature**

- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `GET /api/products/search?q=tomato` - Search products
- `GET /api/products/category/vegetables` - Filter by category
- `GET /api/products/my-products` - Get user's products

### Orders ⭐ **Core Feature**

- `GET /api/orders/my-orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/status/pending` - Get orders by status
- `GET /api/orders/stats` - Get order statistics

### ML Services ⭐ **AI Features**

- `GET /api/ml/hardware-messages` - Get sensor data
- `GET /api/ml/crop-recommendations` - Get AI crop suggestions
- `POST /api/ml/disease-detection` - Detect plant diseases
- `GET /api/ml/disease-reports` - Get disease detection history
- `GET /api/ml/health` - Check ML service status

### Location Services ⭐ **Location Features**

- `POST /api/location/update` - Update vendor location
- `GET /api/location/nearby-vendors?longitude=77&latitude=28` - Find nearby vendors
- `GET /api/location/active-vendors` - Get all active vendors
- `GET /api/location/stats` - Get location statistics

### Notifications

- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/test` - Send test notification

## 📖 Detailed Documentation

For complete examples and integration guides, see:

- [API Endpoints](./docs/api-endpoints.md) - All endpoints with examples
- [Frontend Integration](./docs/frontend-integration.md) - React/React Native examples
- [Database Schema](./docs/schema.md) - Data models
- [Authentication Guide](./docs/authentication.md) - Auth implementation
- [Error Handling](./docs/error-handling.md) - Error management

## 🎯 User Roles

- **Farmer**: Products, Orders (seller), ML services
- **Vendor**: Products, Orders (buyer/seller), Location
- **Consumer**: Browse products, Orders (buyer)

## 🔧 Features Available

### ✅ Core Functionality

- **Product Marketplace**: Browse, search, filter products
- **AI Insights**: Crop recommendations, sensor data
- **Location Services**: Find nearby vendors
- **Order Management**: Create and track orders
- **User Profiles**: Profile management
- **Disease Detection**: AI-powered plant disease identification
- **Real-time Notifications**: Order updates and alerts

## 📞 Support & Testing

- **Health Check**: `GET /api/health`
- **API Documentation**: `GET /api/docs`
- **Logs**: `backend/logs/`
- **Database**: MongoDB Atlas (connected)

## 🚀 Frontend Integration

Start building your React/React Native app immediately:

```javascript
// Example: Get all products
const products = await fetch("http://localhost:3000/api/products").then((res) =>
  res.json()
);

// Example: Search products
const results = await fetch(
  "http://localhost:3000/api/products/search?q=tomato"
).then((res) => res.json());

// Example: Get AI recommendations
const recommendations = await fetch(
  "http://localhost:3000/api/ml/crop-recommendations"
).then((res) => res.json());
```

See [Frontend Integration Guide](./docs/frontend-integration.md) for complete examples.
