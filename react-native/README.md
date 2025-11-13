# 🌾 Annadata - Farm to Consumer Marketplace

<div align="center">

![Annadata Logo](https://img.shields.io/badge/Annadata-Farm%20to%20Consumer-4CAF50?style=for-the-badge&logo=leaf)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

**Connecting Farmers Directly with Consumers**

*Eliminating middlemen, ensuring fair prices, delivering freshness*

[Features](#-features) • [Installation](#-installation) • [Architecture](#-architecture) • [User Roles](#-user-roles) • [Screenshots](#-screenshots)

</div>

---

## 📖 About

**Annadata** is a revolutionary mobile application that bridges the gap between farmers and consumers by creating a direct, transparent marketplace. Built with React Native and Expo, the app provides real-time location tracking, instant notifications, and seamless ordering to ensure fresh produce reaches consumers while farmers receive fair compensation.

### 🎯 Mission

Empower farmers with technology and provide consumers with access to fresh, quality agricultural products at fair prices by eliminating intermediaries and creating a transparent supply chain.

---

## ✨ Features

### 👨‍🌾 For Farmers
- **📦 Product Management**: List and manage agricultural products with images, prices, and descriptions
- **📊 Sales Analytics**: Track sales performance, revenue, and popular products
- **💰 Fair Pricing**: Set your own prices without middleman interference
- **📱 Order Notifications**: Real-time alerts for new orders
- **🚜 Inventory Tracking**: Monitor stock levels and update availability

### 🛒 For Consumers
- **🗺️ Real-time Vendor Tracking**: See nearby vendors and farmers on an interactive map
- **🔔 Smart Notifications**: Get alerts when vendors with your favorite products are nearby
- **🛍️ Easy Ordering**: Browse products, add to cart, and checkout seamlessly
- **📍 Location-based Discovery**: Find fresh produce based on your current location
- **💳 Multiple Payment Options**: Cash, UPI, and digital wallet support
- **📦 Order Tracking**: Monitor your order status from placement to delivery
- **⭐ Reviews & Ratings**: Share feedback and help others make informed decisions

### 🚚 For Vendors
- **📍 Location Services**: Share real-time location with nearby consumers
- **📊 Proximity Analytics**: See potential customers in your area
- **🔄 Route Optimization**: Plan efficient delivery routes
- **💼 Order Management**: Accept, process, and fulfill orders efficiently
- **📈 Performance Metrics**: Track sales, customer reach, and delivery efficiency

### 🌟 Common Features
- **🔐 Secure Authentication**: JWT-based authentication with Firebase integration
- **💬 In-app Messaging**: Direct communication between buyers and sellers
- **🌍 Multi-language Support**: Accessible to diverse user groups
- **🎨 Modern UI/UX**: Intuitive design with smooth animations
- **📱 Offline Support**: Core features work without internet connectivity
- **🔄 Real-time Updates**: WebSocket-powered live data synchronization

---

## 🏗️ Architecture

### Tech Stack

```
Frontend (Mobile)
├── React Native (0.71+)
├── Expo (SDK 48+)
├── React Navigation (6.x)
├── React Native Maps
├── Socket.io Client
├── AsyncStorage
└── Lucide React Native (Icons)

Backend Integration
├── Node.js REST API
├── WebSocket (Socket.io)
├── JWT Authentication
└── Firebase Cloud Messaging
```

### Project Structure

```
react-native/
├── 📱 App.js                      # Root component
├── 🧭 navigation/
│   ├── StackNavigation.jsx       # Main navigation stack
│   └── TabNavigation.jsx         # Bottom tab navigation
├── 👨‍🌾 farmer/                    # Farmer-specific screens
│   ├── FDashboard.jsx            # Farmer dashboard
│   ├── FProducts.jsx             # Product management
│   ├── FOrders.jsx               # Order management
│   └── FProfile.jsx              # Farmer profile
├── 🛒 consumer/                   # Consumer-specific screens
│   ├── CDashboard.jsx            # Consumer home
│   ├── CVendorMap.jsx            # Real-time vendor map
│   ├── COrders.jsx               # Order history
│   ├── CProfile.jsx              # Consumer profile
│   ├── CEditProfile.jsx          # Profile editing
│   └── CAddresses.jsx            # Address management
├── 🚚 vendor/                     # Vendor-specific screens
│   ├── VDashboard.jsx            # Vendor dashboard
│   ├── VOrders.jsx               # Order processing
│   └── VProfile.jsx              # Vendor profile
├── 📄 pages/                      # Shared pages
│   ├── TermsAndConditions.jsx    # Legal terms
│   ├── PrivacyPolicy.jsx         # Privacy policy
│   ├── HelpCenter.jsx            # FAQ & support
│   └── CAbout.jsx                # About the app
├── 🧩 components/                 # Reusable components
│   ├── ScreenWrapper.jsx         # Layout wrapper
│   └── ChatBot.jsx               # AI assistant
├── ⚙️ services/                   # API & business logic
│   ├── UserService.js            # User management
│   ├── OrderService.js           # Order operations
│   ├── LocationTrackingService.js # GPS tracking
│   └── WebSocketService.js       # Real-time communication
├── 🎨 assets/                     # Images & fonts
└── 📝 config/                     # Configuration files
    └── api.js                     # API endpoints
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** (for Android) or **Xcode** (for iOS)
- **Backend Server** (See [backend README](../backend/README.md))

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/shivangi-jain-08/SIH-Annadata.git
   cd SIH-Annadata/react-native
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure API endpoints**
   
   Update `config/api.js` with your backend URL:
   ```javascript
   export const API_BASE_URL = 'http://your-backend-url:3000/api';
   export const SOCKET_URL = 'http://your-backend-url:3000';
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

5. **Run on device/emulator**
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go app

---

## 👥 User Roles

### 🌾 Farmer
Farmers can list their products, manage inventory, track sales, and receive orders directly from consumers.

**Key Screens:**
- Dashboard with sales overview
- Product catalog management
- Order processing
- Analytics and insights

### 🛒 Consumer
Consumers can discover nearby vendors, browse products, place orders, and track deliveries in real-time.

**Key Screens:**
- Interactive vendor map
- Product marketplace
- Shopping cart & checkout
- Order tracking
- Profile & settings

### 🚚 Vendor
Mobile vendors can share their location, display products, and serve customers in their vicinity.

**Key Screens:**
- Location sharing
- Order management
- Route planning
- Sales dashboard

---

## 📱 Screenshots

### Consumer Experience
<div align="center">

| Dashboard | Vendor Map | Orders | Profile |
|-----------|------------|--------|---------|
| ![Dashboard](https://via.placeholder.com/200x400?text=Dashboard) | ![Map](https://via.placeholder.com/200x400?text=Vendor+Map) | ![Orders](https://via.placeholder.com/200x400?text=Orders) | ![Profile](https://via.placeholder.com/200x400?text=Profile) |

</div>

### Farmer Experience
<div align="center">

| Dashboard | Products | Orders | Analytics |
|-----------|----------|--------|-----------|
| ![Dashboard](https://via.placeholder.com/200x400?text=Farmer+Dashboard) | ![Products](https://via.placeholder.com/200x400?text=Products) | ![Orders](https://via.placeholder.com/200x400?text=Orders) | ![Analytics](https://via.placeholder.com/200x400?text=Analytics) |

</div>

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
API_BASE_URL=http://localhost:3000/api
SOCKET_URL=http://localhost:3000

# Firebase Configuration (Optional)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id

# Maps Configuration
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Feature Flags
ENABLE_CHAT_BOT=true
ENABLE_LOCATION_TRACKING=true
```

### App Configuration

Edit `app.json` for app metadata:

```json
{
  "expo": {
    "name": "Annadata",
    "slug": "annadata",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4CAF50"
    }
  }
}
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
# or
yarn test
```

### Test Coverage
```bash
npm run test:coverage
```

### E2E Testing
```bash
npm run test:e2e
```

---

## 📦 Building for Production

### Android APK
```bash
expo build:android
# or
eas build --platform android
```

### iOS IPA
```bash
expo build:ios
# or
eas build --platform ios
```

### Generate App Bundle (AAB)
```bash
eas build --platform android --profile production
```

---

## 🔌 API Integration

### Authentication Flow

```javascript
import UserService from './services/UserService';

// Login
const { user, token } = await UserService.login(email, password);

// Register
const newUser = await UserService.register(userData);

// Get Current User
const user = await UserService.getCurrentUser();
```

### Order Management

```javascript
import OrderService from './services/OrderService';

// Get My Orders
const orders = await OrderService.getMyOrders();

// Create Order
const order = await OrderService.createOrder(orderData);

// Track Order
const orderDetails = await OrderService.getOrderById(orderId);
```

### Real-time Location

```javascript
import LocationTrackingService from './services/LocationTrackingService';

// Start Tracking
await LocationTrackingService.startTracking();

// Get Nearby Vendors
const vendors = await LocationTrackingService.getNearbyVendors();

// Stop Tracking
await LocationTrackingService.stopTracking();
```

---

## 🎨 Design System

### Color Palette

```javascript
const colors = {
  primary: '#4CAF50',      // Green - Agriculture
  secondary: '#2196F3',    // Blue - Trust
  accent: '#FF9800',       // Orange - Energy
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
};
```

### Typography

```javascript
const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 28, fontWeight: 'bold' },
  h3: { fontSize: 24, fontWeight: '600' },
  h4: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 14, fontWeight: 'normal' },
  small: { fontSize: 12, fontWeight: 'normal' },
};
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Code Style

- Follow React Native best practices
- Use functional components with hooks
- Write meaningful commit messages
- Add comments for complex logic
- Maintain consistent formatting (Prettier)

---

## 🐛 Troubleshooting

### Common Issues

**Metro bundler not starting:**
```bash
npm start -- --reset-cache
```

**Module not found errors:**
```bash
rm -rf node_modules
npm install
```

**iOS build fails:**
```bash
cd ios
pod install
cd ..
```

**Android build fails:**
```bash
cd android
./gradlew clean
cd ..
```

---

## 📚 Documentation

- [API Documentation](../backend/docs/api-endpoints.md)
- [Authentication Guide](../backend/docs/authentication.md)
- [Frontend Integration](../backend/docs/frontend-integration.md)
- [Location Tracking Guide](./LOCATION_TRACKING_GUIDE.md)

---

## 🔐 Security

- All API requests use JWT authentication
- User data encrypted in AsyncStorage
- HTTPS enforced for production
- Regular security audits
- Data privacy compliance (GDPR)

---

## 📊 Performance

- **App Size**: ~50MB (Android), ~45MB (iOS)
- **Startup Time**: <2s on modern devices
- **Frame Rate**: 60fps for smooth animations
- **Memory Usage**: <150MB average
- **Offline Support**: Core features available offline

---

## 🌍 Localization

Supported languages:
- 🇮🇳 Hindi
- 🇬🇧 English
- 🇮🇳 Tamil
- 🇮🇳 Telugu
- 🇮🇳 Marathi

Add more languages in `i18n/locales/`

---

## 📞 Support

- **Email**: support@annadata.com
- **Phone**: +91-XXXX-XXXXXX
- **Website**: [www.annadata.com](https://www.annadata.com)
- **Issues**: [GitHub Issues](https://github.com/shivangi-jain-08/SIH-Annadata/issues)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Farmers** - For their invaluable feedback
- **React Native Community** - For amazing libraries
- **Expo Team** - For simplifying development
- **Contributors** - For making this project better

---

## 🚀 Roadmap

### Version 1.1 (Q1 2026)
- [ ] Voice search in regional languages
- [ ] AI-powered crop recommendation
- [ ] Weather integration
- [ ] Advanced analytics dashboard

### Version 1.2 (Q2 2026)
- [ ] Video product demonstrations
- [ ] Live chat with vendors
- [ ] Loyalty rewards program
- [ ] Social sharing features

### Version 2.0 (Q3 2026)
- [ ] Marketplace expansion
- [ ] Subscription services
- [ ] Farm management tools
- [ ] Community forums

---

<div align="center">

**Made with ❤️ in India**

*Empowering Farmers, Nourishing Communities*

[![GitHub stars](https://img.shields.io/github/stars/shivangi-jain-08/SIH-Annadata?style=social)](https://github.com/shivangi-jain-08/SIH-Annadata)
[![GitHub forks](https://img.shields.io/github/forks/shivangi-jain-08/SIH-Annadata?style=social)](https://github.com/shivangi-jain-08/SIH-Annadata/fork)
[![GitHub issues](https://img.shields.io/github/issues/shivangi-jain-08/SIH-Annadata)](https://github.com/shivangi-jain-08/SIH-Annadata/issues)

</div>
