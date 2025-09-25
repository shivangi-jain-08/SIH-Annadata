# Database Schema

Complete database schema documentation for all collections.

## Collections Overview

- `users` - User accounts (farmer, vendor, consumer)
- `products` - Marketplace products
- `orders` - Order transactions
- `hardwaremessages` - Sensor data from hardware
- `croprecommendations` - ML-generated crop suggestions
- `diseasereports` - Disease detection results
- `notifications` - Push notifications

## 1. User Model

**Collection**: `users`

```javascript
{
  _id: ObjectId,
  email: String, // unique, required
  password: String, // hashed with bcrypt
  role: String, // 'farmer', 'vendor', 'consumer'
  name: String, // required
  phone: String, // unique, required
  location: {
    type: 'Point',
    coordinates: [longitude, latitude] // [Number, Number]
  },
  address: String,
  isActive: Boolean, // default: true
  createdAt: Date,
  updatedAt: Date
}
```

**Sample:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "farmer@annadata.com",
  "role": "farmer",
  "name": "Harpreet Singh Dhillon",
  "phone": "+919876543210",
  "location": {
    "type": "Point",
    "coordinates": [75.8573, 30.8408]
  },
  "address": "Village Khanna, Ludhiana, Punjab, India",
  "isActive": true
}
```

## 2. Product Model

**Collection**: `products`

```javascript
{
  _id: ObjectId,
  sellerId: ObjectId, // ref: 'User'
  name: String, // required
  description: String,
  category: String, // 'vegetables', 'fruits', 'grains', etc.
  price: Number, // required
  unit: String, // 'kg', 'gram', 'piece', etc.
  availableQuantity: Number, // required
  minimumOrderQuantity: Number, // default: 1
  images: [String], // image URLs
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  isActive: Boolean, // default: true
  harvestDate: Date,
  expiryDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Sample:**

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "sellerId": "507f1f77bcf86cd799439011",
  "name": "Fresh Tomatoes",
  "description": "Organic red tomatoes",
  "category": "vegetables",
  "price": 40,
  "unit": "kg",
  "availableQuantity": 100,
  "minimumOrderQuantity": 5,
  "isActive": true
}
```

## 3. Order Model

**Collection**: `orders`

```javascript
{
  _id: ObjectId,
  buyerId: ObjectId, // ref: 'User'
  sellerId: ObjectId, // ref: 'User'
  products: [{
    productId: ObjectId, // ref: 'Product'
    name: String,
    quantity: Number,
    price: Number,
    unit: String
  }],
  totalAmount: Number, // required
  status: String, // 'pending', 'confirmed', 'delivered', etc.
  deliveryAddress: String,
  deliveryLocation: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  deliveryDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 4. Hardware Message Model

**Collection**: `hardwaremessages`

```javascript
{
  _id: ObjectId,
  farmerId: ObjectId, // ref: 'User'
  sensorData: {
    ph: Number, // 0-14
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    humidity: Number, // 0-100
    rainfall: Number,
    temperature: Number // -50 to 70
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 5. Crop Recommendation Model

**Collection**: `croprecommendations`

```javascript
{
  _id: ObjectId,
  farmerId: ObjectId, // ref: 'User'
  hardwareMessageId: ObjectId, // ref: 'HardwareMessage'
  recommendations: [{
    cropName: String, // required
    suitabilityScore: Number // 0-100
  }],
  processingTime: Number, // milliseconds
  createdAt: Date,
  updatedAt: Date
}
```

## 6. Disease Report Model

**Collection**: `diseasereports`

```javascript
{
  _id: ObjectId,
  farmerId: ObjectId, // ref: 'User'
  imageUrl: String, // required
  diseaseName: String, // required
  treatment: String, // required
  createdAt: Date,
  updatedAt: Date
}
```

## 7. Notification Model

**Collection**: `notifications`

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // ref: 'User'
  title: String, // required
  message: String, // required
  type: String, // 'order_update', 'vendor_nearby', 'ml_complete', 'system'
  isRead: Boolean, // default: false
  data: Object, // additional data
  createdAt: Date,
  updatedAt: Date
}
```

## Database Connection

**MongoDB Atlas URI:**

```
mongodb+srv://myselfshivangi08:indiA_1234@cluster1.goeqstp.mongodb.net/annadata
```

## Sample Login Credentials

- **Farmer**: `farmer@annadata.com` / `Password123`
- **Vendor**: `vendor1@annadata.com` / `Password123`
- **Consumer**: `consumer1@annadata.com` / `Password123`

## Notes

1. **Location Format**: All coordinates use `[longitude, latitude]` format
2. **ObjectIds**: 24-character hex strings
3. **Timestamps**: ISO 8601 format
4. **Validation**: Required fields enforced at database level
5. **Indexes**: Optimized for location queries and searches
