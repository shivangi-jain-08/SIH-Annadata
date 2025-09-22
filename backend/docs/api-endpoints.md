# API Endpoints

Complete reference for all API endpoints with examples.

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require:
```javascript
headers: {
  'Authorization': 'Bearer YOUR_TOKEN_HERE',
  'Content-Type': 'application/json'
}
```

## 🔑 Authentication

### Register User
```http
POST /api/auth/register
```

**Request:**
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

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "farmer@example.com",
      "name": "John Farmer",
      "role": "farmer"
    },
    "token": "user_id"
  }
}
```

### Login User
```http
POST /api/auth/login
```

**Request:**
```json
{
  "email": "farmer@example.com",
  "password": "SecurePass123"
}
```

## 👤 Users

### Get Profile
```http
GET /api/users/profile
Authorization: Bearer TOKEN
```

### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer TOKEN
```

**Request:**
```json
{
  "name": "Updated Name",
  "address": "New Address"
}
```

## 🛒 Products

### List Products
```http
GET /api/products?category=vegetables&page=1&limit=10
Authorization: Bearer TOKEN
```

**Query Parameters:**
- `category` - Filter by category
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name

### Create Product
```http
POST /api/products
Authorization: Bearer TOKEN
```

**Request:**
```json
{
  "name": "Fresh Tomatoes",
  "description": "Organic tomatoes",
  "price": 50,
  "quantity": 100,
  "unit": "kg",
  "category": "vegetables"
}
```

### My Products
```http
GET /api/products/my-products
Authorization: Bearer TOKEN
```

## 📦 Orders

### My Orders
```http
GET /api/orders/my-orders?status=pending
Authorization: Bearer TOKEN
```

### Create Order
```http
POST /api/orders
Authorization: Bearer TOKEN
```

**Request:**
```json
{
  "sellerId": "seller_id",
  "products": [{
    "productId": "product_id",
    "name": "Fresh Tomatoes",
    "quantity": 10,
    "price": 50
  }],
  "totalAmount": 500,
  "deliveryAddress": "123 Main St"
}
```

### Update Order Status
```http
PATCH /api/orders/:orderId/status
Authorization: Bearer TOKEN
```

**Request:**
```json
{
  "status": "confirmed"
}
```

## 🤖 ML Services (Farmers only)

### Hardware Messages
```http
GET /api/ml/hardware-messages?page=1&limit=10
Authorization: Bearer TOKEN
```

### Soil Reports
```http
GET /api/ml/soil-reports?page=1&limit=10
Authorization: Bearer TOKEN
```

### Disease Detection
```http
POST /api/ml/disease-detection
Authorization: Bearer TOKEN
Content-Type: multipart/form-data
```

**Form Data:**
- `image` - Image file
- `cropType` - Type of crop

## 📍 Location (Vendors)

### Update Location
```http
POST /api/location/update
Authorization: Bearer TOKEN
```

**Request:**
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

### Nearby Vendors
```http
GET /api/location/nearby-vendors?lat=28.6139&lng=77.2090&radius=5000
Authorization: Bearer TOKEN
```

## 🔔 Notifications

### Get Notifications
```http
GET /api/notifications?page=1&limit=20
Authorization: Bearer TOKEN
```

### Mark as Read
```http
PATCH /api/notifications/:notificationId/read
Authorization: Bearer TOKEN
```

## Error Responses

All endpoints return consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed errors"]
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error