import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import ApiClient from '@/services/api';
import { Location, VendorsResponse } from '@/types/api';

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLocation);
        setLocationError(null);
      },
      (error) => {
        setLocationError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, []);

  const updateLocation = useCallback(async (newLocation: Location) => {
    try {
      await ApiClient.updateLocation(newLocation);
      setLocation(newLocation);
      return true;
    } catch (error) {
      console.error('Update location failed:', error);
      throw error;
    }
  }, []);

  const goOffline = useCallback(async () => {
    try {
      await ApiClient.goOffline();
      return true;
    } catch (error) {
      console.error('Go offline failed:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    location,
    locationError,
    getCurrentLocation,
    requestLocation: getCurrentLocation, // Alias for consistency
    updateLocation,
    goOffline,
  };
}

export function useNearbyVendors(location: Location | null, radius = 5000) {
  const {
    data: vendorsResponse,
    loading,
    error,
    refetch,
  } = useApi<VendorsResponse>(
    () => location ? ApiClient.getNearbyVendors(location, radius) : Promise.resolve({ success: true, data: { vendors: [] } }),
    [location, radius],
    { immediate: !!location }
  );

  const vendors = vendorsResponse?.data?.vendors || [];

  return {
    vendors,
    loading,
    error,
    refetch,
  };
}

export function useActiveVendors() {
  const {
    data: vendorsResponse,
    loading,
    error,
    refetch,
  } = useApi<VendorsResponse>(
    () => ApiClient.getActiveVendors(),
    []
  );

  const vendors = vendorsResponse?.data?.vendors || [];

  return {
    vendors,
    loading,
    error,
    refetch,
  };
}

export function useLocationStats() {
  const {
    data: statsResponse,
    loading,
    error,
    refetch,
  } = useApi(
    () => ApiClient.getLocationStats(),
    []
  );

  const stats = statsResponse?.data || {};

  return {
    stats,
    loading,
    error,
    refetch,
  };
}