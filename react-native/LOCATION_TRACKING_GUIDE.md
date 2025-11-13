# Live Location Tracking System - Implementation Guide

## Overview

This document explains the bidirectional live location tracking system implemented for the Annadata platform, enabling real-time location sharing between consumers and vendors.

## System Architecture

### Frontend (React Native)
- **LocationTrackingService.js**: Manages GPS tracking and location updates
- **WebSocketService.js**: Handles real-time communication via Socket.io
- **CVendorMap.jsx**: Consumer screen showing vendor locations
- **VNearbyConsumers.jsx**: Vendor screen showing consumer locations (for confirmed orders)

### Backend (Node.js + Express)
- **Socket.io Server**: Real-time bidirectional communication
- **User Location Endpoints**: REST API for location updates
- **Order Location Endpoints**: REST API for order-based location sharing

## Location Tracking Logic

### For Consumers:
1. **View All Vendors**: Consumers can see real-time locations of all nearby vendors
2. **Continuous Updates**: Vendor locations update automatically as they move
3. **No Restrictions**: Consumers don't need to place an order to see vendor locations
4. **Features**:
   - See vendors on map with distance calculations
   - View vendor products on marker tap
   - Real-time position updates every 5 seconds or 10 meters

### For Vendors:
1. **Always Share Location**: Vendors share their location continuously when app is open
2. **See Consumer Location**: Vendors can ONLY see consumer location AFTER order placement
3. **Order-Based Visibility**: Consumer location visible only for confirmed/in_transit orders
4. **Features**:
   - Background location tracking (requires permission)
   - Automatic location broadcast to nearby consumers
   - Consumer location visible in order details

## Implementation Details

### 1. LocationTrackingService.js

```javascript
// Start tracking for consumers
await LocationTrackingService.startTracking('consumer', (location) => {
  console.log('Consumer location updated:', location);
});

// Start tracking for vendors (includes background permission)
await LocationTrackingService.startTracking('vendor', (location) => {
  console.log('Vendor location updated:', location);
});

// Get nearby vendors (consumers only)
const vendors = await LocationTrackingService.getNearbyVendors(latitude, longitude, radius);

// Get consumer location for order (vendors only, after order confirmed)
const consumerLocation = await LocationTrackingService.getConsumerLocationForOrder(orderId);

// Share location for specific order (consumers)
await LocationTrackingService.shareLocationForOrder(orderId, location);
```

### 2. WebSocketService.js

```javascript
// Connect to WebSocket
await WebSocketService.connect('consumer'); // or 'vendor'

// Subscribe to nearby vendor updates (consumers)
WebSocketService.subscribeToNearbyVendors(latitude, longitude, radius);

// Subscribe to consumer location for order (vendors)
WebSocketService.subscribeToOrderConsumerLocation(orderId);

// Broadcast location update
WebSocketService.broadcastLocation(location, 'vendor');

// Listen for location updates
WebSocketService.on('vendor_location_update', (data) => {
  console.log('Vendor location updated:', data);
});

WebSocketService.on('consumer_location_update', (data) => {
  console.log('Consumer location updated:', data);
});
```

### 3. CVendorMap.jsx - Consumer Map Screen

**Features:**
- Real-time GPS tracking of consumer location
- Display all nearby vendors on map
- Vendor markers with distance indicators
- Product display on vendor marker tap
- Haversine distance calculation for accuracy

**Usage:**
```jsx
// Navigate from CBuy screen
navigation.navigate('CVendorMap');
```

**Key Components:**
- User location marker (blue circle with 50m radius)
- Vendor markers (store icon)
- Product horizontal scroll on vendor selection
- Map controls (center on user, fit all vendors)

### 4. Backend API Endpoints

#### Location Tracking Endpoints
```
POST /api/users/update-location
- Updates user location with tracking data
- Broadcasts vendor location to consumers via Socket.io

GET /api/users/nearby-vendors?lat=X&lng=Y&radius=Z
- Returns list of vendors within radius (km)
- Used by consumers to find vendors
```

#### Order-Based Location Endpoints
```
GET /api/orders/:orderId/consumer-location
- Vendor endpoint to get consumer location
- Only works for confirmed/in_transit orders
- Requires vendor to be seller of the order

POST /api/orders/:orderId/share-location
- Consumer endpoint to share location for order
- Updates consumer location and notifies vendor
- Broadcasts via Socket.io to vendor
```

### 5. Socket.io Events

#### Vendor Events (Emitted by Vendor)
- `vendor-location-update`: Broadcast vendor location to consumers
- `vendor-online`: Notify consumers vendor is online
- `vendor-offline`: Notify consumers vendor went offline

#### Consumer Events (Received by Consumer)
- `vendor-location-updated`: Receive vendor location updates
- `vendor-online`: Notification when vendor comes online
- `vendor-offline`: Notification when vendor goes offline

#### Order-Based Events
- `consumer-location-update`: Vendor receives consumer location for their order
- `location-update-confirmed`: Confirmation of location update

## Permission Requirements

### iOS (Info.plist)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby vendors and track deliveries</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Vendors need background location to share location with consumers</string>
```

### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
```

## Data Flow

### Consumer Viewing Vendors:
1. Consumer opens CVendorMap screen
2. LocationTrackingService starts GPS tracking
3. WebSocketService connects and subscribes to nearby vendors
4. Backend sends list of vendors within radius
5. Map displays vendor markers with real-time updates
6. Consumer taps vendor → products load from backend

### Vendor Shares Location:
1. Vendor app starts (background permission requested)
2. LocationTrackingService starts with 'vendor' role
3. Location updates every 5 seconds or 10 meters
4. Each update sent to backend via REST API
5. Backend broadcasts to consumers via Socket.io
6. Consumers see vendor marker move on map

### Order-Based Location Sharing:
1. Consumer places order with vendor
2. Order status changes to 'confirmed'
3. Consumer location automatically shared for order
4. Vendor can now access consumer location
5. Real-time updates via Socket.io
6. Vendor sees consumer location on map/order screen

## Configuration

### React Native (config/api.js)
```javascript
const LOCAL_IP = '10.238.29.239'; // Your machine IP
const API_CONFIG = {
  BASE_URL: `http://${LOCAL_IP}:3000/api`,
  ENDPOINTS: {
    USERS: '/users',
    ORDERS: '/orders',
    // ... other endpoints
  }
};
```

### Backend (.env)
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/annadata
SOCKET_IO_ENABLED=true
CORS_ORIGIN=http://localhost:3000,http://localhost:8081
```

## Testing Guide

### 1. Test Consumer View:
```bash
# Start backend server
cd backend
npm start

# Start React Native app
cd react-native
npm start

# Open app on device/emulator
# Navigate to CBuy → Tap "Find Nearby Vendors"
# Should see map with your location and nearby vendors
```

### 2. Test Vendor Location Broadcast:
```bash
# Login as vendor
# App should request background location permission
# Move device/emulator location
# Consumers should see vendor marker move
```

### 3. Test Order-Based Location:
```bash
# As consumer: Place order with vendor
# Order status should be 'confirmed'
# As vendor: View order details
# Should see consumer location on map
```

## Troubleshooting

### Issue: Location not updating
**Solution:**
- Check location permissions granted
- Verify GPS is enabled on device
- Check backend is running and accessible
- Verify WebSocket connection established

### Issue: Vendors not showing on map
**Solution:**
- Ensure vendors have shared location
- Check radius parameter (increase if needed)
- Verify vendor role in database
- Check backend logs for errors

### Issue: Consumer location not visible to vendor
**Solution:**
- Verify order status is 'confirmed' or 'in_transit'
- Check vendor is seller for the order
- Ensure consumer location is being shared
- Check Socket.io connection

### Issue: WebSocket not connecting
**Solution:**
- Verify backend Socket.io is initialized
- Check CORS settings in backend
- Ensure correct WebSocket URL (ws:// not wss://)
- Check authentication token is valid

## Performance Considerations

1. **Location Update Frequency**:
   - Default: 5 seconds or 10 meters
   - Adjust in LocationTrackingService config
   - Trade-off: Battery vs. accuracy

2. **WebSocket Connection**:
   - Automatic reconnection on disconnect
   - Max 5 reconnection attempts
   - Heartbeat every 30 seconds

3. **Distance Calculation**:
   - Haversine formula for accuracy
   - Calculated client-side to reduce server load
   - Results in kilometers

4. **Battery Optimization**:
   - Use significant location changes for vendors
   - Stop tracking when app in background (consumers)
   - Background tracking only for vendors (when enabled)

## Security Considerations

1. **Location Privacy**:
   - Consumer location only shared for confirmed orders
   - Vendors can't see random consumer locations
   - Location data encrypted in transit (use HTTPS in production)

2. **Authentication**:
   - All endpoints require valid JWT token
   - Socket.io authenticated with token
   - Role-based access control enforced

3. **Data Retention**:
   - Location updates stored in database
   - Consider implementing data retention policy
   - Allow users to delete location history

## Future Enhancements

1. **Geofencing**:
   - Notify vendors when consumer enters delivery zone
   - Auto-update order status based on location

2. **Route Optimization**:
   - Calculate best route for vendors with multiple deliveries
   - Integrate with Google Maps Directions API

3. **Location History**:
   - Track delivery routes for analytics
   - Display historical paths on map

4. **Offline Support**:
   - Cache last known locations
   - Queue location updates when offline
   - Sync when connection restored

## Support

For issues or questions:
1. Check logs in backend/logs/
2. Enable debug mode in LocationTrackingService
3. Use Chrome DevTools for WebSocket debugging
4. Check React Native debugger for client logs

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintained by**: Annadata Development Team
