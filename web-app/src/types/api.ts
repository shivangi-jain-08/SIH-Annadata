// User types
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'farmer' | 'vendor' | 'consumer';
  address?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  notificationPreferences?: {
    proximityNotifications: {
      enabled: boolean;
      radius: number;
      quietHours: {
        enabled: boolean;
        start: string;
        end: string;
      };
      notificationTypes: {
        sound: boolean;
        visual: boolean;
        vibration: boolean;
      };
      vendorTypes: string[];
      minimumRating: number;
    };
    doNotDisturb: boolean;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'farmer' | 'vendor' | 'consumer';
  address: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

// Product types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  availableQuantity: number;
  unit: string;
  category: string;
  minimumOrderQuantity: number;
  sellerId: string;
  images?: string[];
  createdAt: Date;
}

export interface ProductData {
  name: string;
  description: string;
  price: number;
  availableQuantity: number;
  unit: string;
  category: string;
  minimumOrderQuantity: number;
}

export interface ProductFilters {
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
  };
}

// Order types
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  buyerId: string | { _id: string; name: string; phone: string };
  sellerId: string | { _id: string; name: string; phone: string };
  products: OrderItem[];
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  total: number;
  totalAmount: number; // Alias for total
  deliveryAddress: string;
  deliveryLocation?: [number, number];
  notes?: string;
  createdAt: Date;
}

export interface OrderData {
  sellerId: string;
  products: OrderItem[];
  deliveryAddress: string;
  deliveryLocation?: [number, number];
  notes?: string;
}

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
  };
}

// ML types
export interface SoilData {
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  moisture: number;
  temperature: number;
  organicMatter: number;
}

export interface CropRecommendation {
  cropName: string;
  suitabilityPercentage: number;
  expectedYield: number;
  recommendations?: string[];
}

export interface SoilReport {
  _id: string;
  farmerId: string;
  sensorData: SoilData;
  cropRecommendations: CropRecommendation[];
  recommendations: string[];
  createdAt: Date;
}

export interface CropRecommendationsResponse {
  success: boolean;
  data: {
    recommendations?: CropRecommendation[];
    recommendation?: CropRecommendation;
    count?: number;
  };
}

export interface DiseaseDetection {
  _id: string;
  farmerId: string;
  imagePath?: string;
  imageUrl?: string;
  diseaseName: string;
  confidence?: number;
  treatment: string;
  treatments?: string[]; // Array of treatments
  severity?: string; // Disease severity
  preventionTips?: string[]; // Prevention tips
  cropType?: string;
  createdAt: Date;
}

export interface DiseaseDetectionResponse {
  success: boolean;
  data: {
    report: DiseaseDetection;
    processingTime?: number;
  };
}

// Location types
export interface Location {
  longitude: number;
  latitude: number;
}

export interface Vendor {
  _id: string;
  name: string;
  phone: string;
  distance?: number;
  location: [number, number];
  products?: string[];
  rating?: number;
  isOnline?: boolean;
}

export interface VendorsResponse {
  success: boolean;
  data: {
    vendors: Vendor[];
  };
}

// Notification types
export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
  };
}

// Generic API response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}