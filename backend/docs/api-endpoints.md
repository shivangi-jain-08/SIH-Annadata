# API Endpoints

Complete reference for all API endpoints with examples.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Authentication has been simplified for development. All endpoints are publicly accessible:
```javascript
headers: {
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
    }
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
```

### Update Profile
```http
PUT /api/users/profile
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
```

**Query Parameters:**
- `category` - Filter by category
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name

### Search Products
```http
GET /api/products/search?q=tomato
```

### Get Products by Category
```http
GET /api/products/category/vegetables
```

### Create Product
```http
POST /api/products
```

**Request:**
```json
{
  "name": "Fresh Tomatoes",
  "description": "Organic tomatoes",
  "price": 50,
  "availableQuantity": 100,
  "unit": "kg",
  "category": "vegetables",
  "minimumOrderQuantity": 5
}
```

### My Products
```http
GET /api/products/my-products
```

## 📦 Orders

### My Orders
```http
GET /api/orders/my-orders?status=pending
```

### Get Orders by Status
```http
GET /api/orders/status/pending
```

### Get Order Statistics
```http
GET /api/orders/stats
```

### Create Order
```http
POST /api/orders
```

**Request:**
```json
{
  "sellerId": "seller_id",
  "products": [{
    "productId": "product_id",
    "quantity": 10
  }],
  "deliveryAddress": "123 Main St",
  "deliveryLocation": [77.2090, 28.6139],
  "notes": "Please deliver in the morning"
}
```

### Update Order Status
```http
PATCH /api/orders/:orderId/status
```

**Request:**
```json
{
  "status": "confirmed",
  "deliveryDate": "2024-01-15T10:00:00Z"
}
```

### Cancel Order
```http
PATCH /api/orders/:orderId/cancel
```

**Request:**
```json
{
  "reason": "Customer requested cancellation"
}
```

## 🤖 ML Services

### Hardware Messages
```http
GET /api/ml/hardware-messages?limit=10
```

### Latest Hardware Message
```http
GET /api/ml/hardware-messages/latest
```

### Crop Recommendations
```http
GET /api/ml/crop-recommendations?limit=10
```

### Latest Crop Recommendation
```http
GET /api/ml/crop-recommendations/latest
```

### Disease Detection
```http
POST /api/ml/disease-detection
Content-Type: multipart/form-data
```

**Form Data:**
- `image` - Image file
- `cropType` - Type of crop (optional)
- `location` - [longitude, latitude] (optional)

### Disease Reports
```http
GET /api/ml/disease-reports?limit=10
```

### Disease Reports by Farmer
```http
GET /api/ml/disease-reports/farmer/:farmerId
```

### Disease Reports by Disease Name
```http
GET /api/ml/disease-reports/disease/:diseaseName
```

### ML Service Health
```http
GET /api/ml/health
```

## 📍 Location Services

### Update Vendor Location
```http
POST /api/location/update
```

**Request:**
```json
{
  "longitude": 77.2090,
  "latitude": 28.6139
}
```

### Get Nearby Vendors
```http
GET /api/location/nearby-vendors?longitude=77.2090&latitude=28.6139&radius=5000
```

### Get Nearby Consumers
```http
GET /api/location/nearby-consumers?longitude=77.2090&latitude=28.6139&radius=5000
```

### Get Active Vendors
```http
GET /api/location/active-vendors
```

### Go Offline
```http
DELETE /api/location/offline
```

### Get Location Statistics
```http
GET /api/location/stats
```

### Calculate Distance
```http
GET /api/location/distance?lat1=28.6139&lon1=77.2090&lat2=28.6239&lon2=77.2190
```

## 🔔 Notifications

### Get Notifications
```http
GET /api/notifications?page=1&limit=20
```

### Get Notification Statistics
```http
GET /api/notifications/stats
```

### Send General Notification
```http
POST /api/notifications/send
```

**Request:**
```json
{
  "userId": "user_id",
  "type": "system",
  "title": "Notification Title",
  "message": "Notification message",
  "data": {}
}
```

### Send Order Update Notification
```http
POST /api/notifications/order-update
```

**Request:**
```json
{
  "userId": "user_id",
  "orderId": "order_id",
  "status": "confirmed",
  "orderDetails": {}
}
```

### Send Vendor Nearby Notification
```http
POST /api/notifications/vendor-nearby
```

**Request:**
```json
{
  "userId": "user_id",
  "vendorInfo": {
    "vendorId": "vendor_id",
    "name": "Vendor Name",
    "distance": 500
  }
}
```

### Send ML Complete Notification
```http
POST /api/notifications/ml-complete
```

**Request:**
```json
{
  "userId": "user_id",
  "analysisType": "soil",
  "reportId": "report_id"
}
```

### Send System Notification
```http
POST /api/notifications/system
```

**Request:**
```json
{
  "userId": "user_id",
  "title": "System Update",
  "message": "System maintenance scheduled",
  "data": {}
}
```

### Send Test Notification
```http
POST /api/notifications/test
```

**Request:**
```json
{
  "title": "Test Notification",
  "message": "This is a test",
  "type": "system"
}
```

### Mark Notification as Read
```http
PATCH /api/notifications/:notificationId/read
```

### Mark All Notifications as Read
```http
PATCH /api/notifications/mark-all-read
```

### Retry Failed Notifications
```http
POST /api/notifications/retry-failed
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