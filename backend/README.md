# Annadata Backend API

A crop advisory system and marketplace backend API.

## 🚀 Quick Start

```bash
cd backend
npm install
npm run dev
```

Server runs on: `http://localhost:3000`

## 🔐 Authentication

Include token in all requests after login:
```javascript
headers: {
  'Authorization': 'Bearer YOUR_TOKEN_HERE',
  'Content-Type': 'application/json'
}
```

## 📚 Quick API Reference

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/my-products` - My products

### Orders
- `GET /api/orders/my-orders` - My orders
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update status

### ML Services (Farmers only)
- `GET /api/ml/hardware-messages` - Hardware data
- `GET /api/ml/soil-reports` - Soil analysis
- `POST /api/ml/disease-detection` - Disease detection

### Location (Vendors)
- `POST /api/location/update` - Update location
- `GET /api/location/nearby-vendors` - Find vendors

### Notifications
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read

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

## 📞 Support

- Health Check: `GET /api/health`
- Logs: `backend/logs/`