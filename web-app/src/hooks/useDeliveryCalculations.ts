import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from './useLocation';

interface DeliveryCalculation {
  distance: number;
  estimatedTime: string;
  deliveryFee: number;
  isWithinRange: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface DeliverySettings {
  baseFee: number;
  feePerKm: number;
  freeDeliveryThreshold: number;
  maxDeliveryDistance: number;
  baseDeliveryTime: number; // minutes
  timePerKm: number; // additional minutes per km
  rushHourMultiplier: number;
  weatherDelayMinutes: number;
}

interface VendorLocation {
  latitude: number;
  longitude: number;
  deliveryRadius?: number;
  acceptingOrders?: boolean;
}

const DEFAULT_SETTINGS: DeliverySettings = {
  baseFee: 20,
  feePerKm: 5,
  freeDeliveryThreshold: 500, // Free delivery for orders above ₹500
  maxDeliveryDistance: 10000, // 10km
  baseDeliveryTime: 15, // 15 minutes base
  timePerKm: 3, // 3 minutes per km
  rushHourMultiplier: 1.5,
  weatherDelayMinutes: 10
};

export function useDeliveryCalculations(settings: Partial<DeliverySettings> = {}) {
  const { location: consumerLocation } = useLocation();
  const [deliverySettings] = useState<DeliverySettings>({ ...DEFAULT_SETTINGS, ...settings });
  const [weatherConditions, setWeatherConditions] = useState<'normal' | 'rain' | 'storm'>('normal');
  const [trafficConditions, setTrafficConditions] = useState<'light' | 'moderate' | 'heavy'>('light');

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  }, []);

  // Check if current time is rush hour
  const isRushHour = useCallback((): boolean => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Weekend rush hours are different
    if (day === 0 || day === 6) {
      return (hour >= 11 && hour <= 14) || (hour >= 19 && hour <= 21);
    }
    
    // Weekday rush hours
    return (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20);
  }, []);

  // Calculate delivery fee based on distance and order value
  const calculateDeliveryFee = useCallback((distance: number, orderValue: number = 0): number => {
    if (orderValue >= deliverySettings.freeDeliveryThreshold) {
      return 0;
    }
    
    const distanceKm = distance / 1000;
    const baseFee = deliverySettings.baseFee;
    const distanceFee = Math.max(0, (distanceKm - 0.5)) * deliverySettings.feePerKm;
    
    let totalFee = baseFee + distanceFee;
    
    // Rush hour surcharge
    if (isRushHour()) {
      totalFee *= deliverySettings.rushHourMultiplier;
    }
    
    // Weather surcharge
    if (weatherConditions === 'rain') {
      totalFee *= 1.2;
    } else if (weatherConditions === 'storm') {
      totalFee *= 1.5;
    }
    
    return Math.round(totalFee);
  }, [deliverySettings, isRushHour, weatherConditions]);

  // Calculate estimated delivery time
  const calculateDeliveryTime = useCallback((distance: number): string => {
    const distanceKm = distance / 1000;
    let baseTime = deliverySettings.baseDeliveryTime;
    let travelTime = distanceKm * deliverySettings.timePerKm;
    
    // Traffic adjustments
    switch (trafficConditions) {
      case 'moderate':
        travelTime *= 1.3;
        break;
      case 'heavy':
        travelTime *= 1.8;
        break;
    }
    
    // Rush hour adjustment
    if (isRushHour()) {
      travelTime *= deliverySettings.rushHourMultiplier;
    }
    
    // Weather delays
    if (weatherConditions === 'rain') {
      baseTime += deliverySettings.weatherDelayMinutes;
    } else if (weatherConditions === 'storm') {
      baseTime += deliverySettings.weatherDelayMinutes * 2;
    }
    
    const totalMinutes = Math.round(baseTime + travelTime);
    const minTime = Math.max(10, totalMinutes - 5);
    const maxTime = totalMinutes + 10;
    
    return `${minTime}-${maxTime} minutes`;
  }, [deliverySettings, trafficConditions, isRushHour, weatherConditions]);

  // Determine delivery priority based on distance and conditions
  const calculatePriority = useCallback((distance: number): 'high' | 'medium' | 'low' => {
    if (distance <= 1000) return 'high';
    if (distance <= 3000) return 'medium';
    return 'low';
  }, []);

  // Main calculation function
  const calculateDelivery = useCallback((vendorLocation: VendorLocation, orderValue: number = 0): DeliveryCalculation | null => {
    if (!consumerLocation) {
      return null;
    }
    
    const distance = calculateDistance(
      consumerLocation.latitude,
      consumerLocation.longitude,
      vendorLocation.latitude,
      vendorLocation.longitude
    );
    
    const isWithinRange = distance <= (vendorLocation.deliveryRadius || deliverySettings.maxDeliveryDistance);
    
    return {
      distance,
      estimatedTime: calculateDeliveryTime(distance),
      deliveryFee: calculateDeliveryFee(distance, orderValue),
      isWithinRange,
      priority: calculatePriority(distance)
    };
  }, [consumerLocation, calculateDistance, calculateDeliveryTime, calculateDeliveryFee, calculatePriority, deliverySettings.maxDeliveryDistance]);

  // Calculate for multiple vendors
  const calculateMultipleDeliveries = useCallback((vendors: (VendorLocation & { id: string })[], orderValue: number = 0) => {
    return vendors
      .map(vendor => ({
        vendorId: vendor.id,
        ...vendor,
        delivery: calculateDelivery(vendor, orderValue)
      }))
      .filter(result => result.delivery !== null)
      .sort((a, b) => {
        // Sort by priority first, then by distance
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const aPriority = priorityOrder[a.delivery!.priority];
        const bPriority = priorityOrder[b.delivery!.priority];
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        return a.delivery!.distance - b.delivery!.distance;
      });
  }, [calculateDelivery]);

  // Get delivery zones for visualization
  const getDeliveryZones = useMemo(() => {
    if (!consumerLocation) return [];
    
    return [
      {
        center: consumerLocation,
        radius: 1000,
        color: 'green',
        label: 'High Priority Zone',
        fee: calculateDeliveryFee(500),
        time: calculateDeliveryTime(500)
      },
      {
        center: consumerLocation,
        radius: 3000,
        color: 'yellow',
        label: 'Medium Priority Zone',
        fee: calculateDeliveryFee(2000),
        time: calculateDeliveryTime(2000)
      },
      {
        center: consumerLocation,
        radius: deliverySettings.maxDeliveryDistance,
        color: 'red',
        label: 'Low Priority Zone',
        fee: calculateDeliveryFee(5000),
        time: calculateDeliveryTime(5000)
      }
    ];
  }, [consumerLocation, calculateDeliveryFee, calculateDeliveryTime, deliverySettings.maxDeliveryDistance]);

  // Update conditions (could be connected to weather/traffic APIs)
  const updateConditions = useCallback((weather: typeof weatherConditions, traffic: typeof trafficConditions) => {
    setWeatherConditions(weather);
    setTrafficConditions(traffic);
  }, []);

  // Get delivery insights
  const getDeliveryInsights = useCallback((distance: number, orderValue: number = 0) => {
    const delivery = calculateDelivery({ latitude: 0, longitude: 0 }, orderValue);
    if (!delivery) return null;
    
    const insights = [];
    
    if (orderValue > 0 && orderValue < deliverySettings.freeDeliveryThreshold) {
      const needed = deliverySettings.freeDeliveryThreshold - orderValue;
      insights.push({
        type: 'tip',
        message: `Add ₹${needed} more for free delivery!`,
        action: 'increase_order'
      });
    }
    
    if (isRushHour()) {
      insights.push({
        type: 'warning',
        message: 'Rush hour surcharge applies',
        action: 'wait_for_off_peak'
      });
    }
    
    if (weatherConditions !== 'normal') {
      insights.push({
        type: 'info',
        message: `Weather delays expected due to ${weatherConditions}`,
        action: 'plan_accordingly'
      });
    }
    
    if (distance > 5000) {
      insights.push({
        type: 'warning',
        message: 'Long distance delivery - consider nearby vendors',
        action: 'find_closer_vendor'
      });
    }
    
    return insights;
  }, [calculateDelivery, deliverySettings.freeDeliveryThreshold, isRushHour, weatherConditions]);

  return {
    // Core functions
    calculateDelivery,
    calculateMultipleDeliveries,
    calculateDistance,
    calculateDeliveryFee,
    calculateDeliveryTime,
    
    // Utilities
    getDeliveryZones,
    getDeliveryInsights,
    updateConditions,
    
    // Current conditions
    weatherConditions,
    trafficConditions,
    isRushHour: isRushHour(),
    
    // Settings
    deliverySettings,
    
    // Status
    hasLocation: !!consumerLocation
  };
}

// Hook for vendor-specific delivery calculations
export function useVendorDeliveryCalculations(vendorLocation: VendorLocation | null, settings?: Partial<DeliverySettings>) {
  const { calculateDelivery, calculateDeliveryFee, calculateDeliveryTime, getDeliveryInsights } = useDeliveryCalculations(settings);
  
  const calculateForOrder = useCallback((orderValue: number = 0) => {
    if (!vendorLocation) return null;
    return calculateDelivery(vendorLocation, orderValue);
  }, [vendorLocation, calculateDelivery]);
  
  const getOrderInsights = useCallback((orderValue: number = 0) => {
    if (!vendorLocation) return null;
    const delivery = calculateDelivery(vendorLocation, orderValue);
    if (!delivery) return null;
    return getDeliveryInsights(delivery.distance, orderValue);
  }, [vendorLocation, calculateDelivery, getDeliveryInsights]);
  
  return {
    calculateForOrder,
    getOrderInsights,
    calculateDeliveryFee,
    calculateDeliveryTime,
    isAvailable: !!vendorLocation
  };
}

export default useDeliveryCalculations;