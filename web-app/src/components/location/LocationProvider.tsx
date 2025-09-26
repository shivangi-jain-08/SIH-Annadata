import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
// import { useWebSocket } from '@/contexts/WebSocketContext'; // Temporarily disabled
import { useAuth } from '@/contexts/AuthContext';
import ApiClient from '@/services/api';

interface LocationContextType {
  location: { latitude: number; longitude: number } | null;
  permission: 'granted' | 'denied' | 'prompt';
  error: string | null;
  isWatching: boolean;
  requestPermission: () => Promise<void>;
  startWatching: () => void;
  stopWatching: () => void;
  updateLocation: (location: { latitude: number; longitude: number }) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastErrorTime, setLastErrorTime] = useState(0);
  
  // const { updateLocation: wsUpdateLocation } = useWebSocket(); // Temporarily disabled
  const { user } = useAuth();

  // Throttled location update to prevent excessive API calls
  const throttledUpdate = useCallback(
    (() => {
      let lastUpdate = 0;
      const throttleDelay = 5000; // 5 seconds

      return async (newLocation: { latitude: number; longitude: number }) => {
        const now = Date.now();
        if (now - lastUpdate < throttleDelay) {
          return;
        }
        lastUpdate = now;

        try {
          // Update backend
          await ApiClient.updateLocation({
            longitude: newLocation.longitude,
            latitude: newLocation.latitude
          });

          // Update WebSocket (temporarily disabled)
          // wsUpdateLocation(newLocation);

          setLocation(newLocation);
          setError(null);
        } catch (error) {
          console.error('Failed to update location:', error);
          setError(error instanceof Error ? error.message : 'Failed to update location');
        }
      };
    })(),
    [] // Removed wsUpdateLocation dependency
  );

  const handleLocationSuccess = useCallback((position: GeolocationPosition) => {
    const newLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    throttledUpdate(newLocation);
  }, [throttledUpdate]);

  // Define stopWatching first to avoid circular dependency
  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsWatching(false);
    }
  }, [watchId]);

  const handleLocationError = useCallback((error: GeolocationPositionError) => {
    const now = Date.now();
    
    // Prevent error flooding - only log/update error once per 30 seconds
    if (now - lastErrorTime < 30000) {
      return;
    }
    
    setLastErrorTime(now);
    setRetryCount(prev => prev + 1);
    
    let errorMessage = 'Location error occurred';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied. Please enable location services.';
        setPermission('denied');
        stopWatching(); // Stop watching if permission denied
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out.';
        // Stop watching after 3 timeout attempts
        if (retryCount >= 3) {
          stopWatching();
          errorMessage += ' Stopped trying after multiple timeouts.';
        }
        break;
    }
    
    setError(errorMessage);
    console.warn('Geolocation error (throttled):', error.code, errorMessage);
  }, [lastErrorTime, retryCount, stopWatching]);

  const requestPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    try {
      // Check current permission status
      if ('permissions' in navigator) {
        const result = await (navigator as any).permissions.query({ name: 'geolocation' });
        setPermission(result.state as 'granted' | 'denied' | 'prompt');
        
        if (result.state === 'granted') {
          startWatching();
        }
      } else {
        // Fallback: try to get current position
        (navigator as any).geolocation.getCurrentPosition(
          (position: GeolocationPosition) => {
            setPermission('granted');
            handleLocationSuccess(position);
            startWatching();
          },
          (error: GeolocationPositionError) => {
            setPermission('denied');
            handleLocationError(error);
          }
        );
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      setError('Failed to request location permission');
    }
  }, [handleLocationSuccess, handleLocationError]);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation || isWatching) {
      return;
    }

    // Reset retry count when starting fresh
    setRetryCount(0);
    setLastErrorTime(0);

    const id = navigator.geolocation.watchPosition(
      handleLocationSuccess,
      handleLocationError,
      {
        enableHighAccuracy: false, // Use lower accuracy to reduce timeouts
        timeout: 30000, // Longer timeout
        maximumAge: 300000 // 5 minutes - use cached location longer
      }
    );

    setWatchId(id);
    setIsWatching(true);
  }, [isWatching, handleLocationSuccess, handleLocationError]);

  const updateLocation = useCallback(async (newLocation: { latitude: number; longitude: number }) => {
    await throttledUpdate(newLocation);
  }, [throttledUpdate]);

  // Don't auto-start location watching to prevent flooding
  // Location will be requested manually by components that need it
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  const value: LocationContextType = {
    location,
    permission,
    error,
    isWatching,
    requestPermission,
    startWatching,
    stopWatching,
    updateLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationProvider() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationProvider must be used within a LocationProvider');
  }
  return context;
}