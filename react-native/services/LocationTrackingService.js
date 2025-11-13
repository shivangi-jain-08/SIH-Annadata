import * as Location from 'expo-location'
import AsyncStorage from '@react-native-async-storage/async-storage'
import API_CONFIG, { apiRequest } from '../config/api'

class LocationTrackingService {
  constructor() {
    this.locationSubscription = null
    this.isTracking = false
    this.updateInterval = 5000 // 5 seconds
    this.distanceInterval = 10 // 10 meters
    this.listeners = []
  }

  // Get authorization header
  async getAuthHeader() {
    try {
      const token = await AsyncStorage.getItem('userToken')
      return token ? { Authorization: `Bearer ${token}` } : {}
    } catch (error) {
      console.error('Error getting auth header:', error)
      return {}
    }
  }

  // Request location permission
  async requestPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      return status === 'granted'
    } catch (error) {
      console.error('Error requesting location permission:', error)
      return false
    }
  }

  // Request background location permission (for vendors)
  async requestBackgroundPermission() {
    try {
      const { status } = await Location.requestBackgroundPermissionsAsync()
      return status === 'granted'
    } catch (error) {
      console.error('Error requesting background location permission:', error)
      return false
    }
  }

  // Get current location
  async getCurrentLocation() {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      })

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp
      }
    } catch (error) {
      console.error('Error getting current location:', error)
      return null
    }
  }

  // Start location tracking
  async startTracking(userRole = 'consumer', updateCallback = null) {
    try {
      if (this.isTracking) {
        console.log('Location tracking already active')
        return true
      }

      const hasPermission = await this.requestPermission()
      if (!hasPermission) {
        console.error('Location permission denied')
        return false
      }

      // For vendors, also request background permission
      if (userRole === 'vendor') {
        await this.requestBackgroundPermission()
      }

      this.isTracking = true

      // Start watching position
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: this.updateInterval,
          distanceInterval: this.distanceInterval,
        },
        async (location) => {
          const locationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            heading: location.coords.heading,
            speed: location.coords.speed,
            timestamp: location.timestamp
          }

          // Save location locally
          await this.saveLocationLocally(locationData)

          // Update server with new location
          await this.updateLocationOnServer(locationData, userRole)

          // Notify listeners
          this.notifyListeners(locationData)

          // Call update callback if provided
          if (updateCallback) {
            updateCallback(locationData)
          }

          console.log(`Location updated for ${userRole}:`, locationData)
        }
      )

      console.log(`Location tracking started for ${userRole}`)
      return true
    } catch (error) {
      console.error('Error starting location tracking:', error)
      this.isTracking = false
      return false
    }
  }

  // Stop location tracking
  stopTracking() {
    if (this.locationSubscription) {
      this.locationSubscription.remove()
      this.locationSubscription = null
      this.isTracking = false
      console.log('Location tracking stopped')
    }
  }

  // Save location locally
  async saveLocationLocally(location) {
    try {
      await AsyncStorage.setItem('LAST_LOCATION', JSON.stringify(location))
    } catch (error) {
      console.error('Error saving location locally:', error)
    }
  }

  // Get last saved location
  async getLastLocation() {
    try {
      const location = await AsyncStorage.getItem('LAST_LOCATION')
      return location ? JSON.parse(location) : null
    } catch (error) {
      console.error('Error getting last location:', error)
      return null
    }
  }

  // Update location on server
  async updateLocationOnServer(location, userRole) {
    try {
      const authHeader = await this.getAuthHeader()
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.USERS}/update-location`, {
        method: 'POST',
        headers: {
          ...authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          accuracy: location.accuracy,
          heading: location.heading,
          speed: location.speed,
          timestamp: location.timestamp,
          role: userRole
        })
      })

      if (!response.success) {
        console.warn('Failed to update location on server:', response.message)
      }

      return response.success
    } catch (error) {
      console.error('Error updating location on server:', error)
      return false
    }
  }

  // Get nearby vendors (for consumers)
  async getNearbyVendors(latitude, longitude, radius = 10) {
    try {
      const authHeader = await this.getAuthHeader()
      
      const response = await apiRequest(
        `${API_CONFIG.ENDPOINTS.USERS}/nearby-vendors?lat=${latitude}&lng=${longitude}&radius=${radius}`,
        {
          method: 'GET',
          headers: authHeader
        }
      )

      if (response.success && response.data) {
        return response.data.vendors || []
      }

      return []
    } catch (error) {
      console.error('Error getting nearby vendors:', error)
      return []
    }
  }

  // Get consumer location for order (for vendors)
  async getConsumerLocationForOrder(orderId) {
    try {
      const authHeader = await this.getAuthHeader()
      
      const response = await apiRequest(
        `${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}/consumer-location`,
        {
          method: 'GET',
          headers: authHeader
        }
      )

      if (response.success && response.data) {
        return response.data.location
      }

      return null
    } catch (error) {
      console.error('Error getting consumer location:', error)
      return null
    }
  }

  // Share location for specific order (consumer)
  async shareLocationForOrder(orderId, location) {
    try {
      const authHeader = await this.getAuthHeader()
      
      const response = await apiRequest(
        `${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}/share-location`,
        {
          method: 'POST',
          headers: {
            ...authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            location: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            },
            timestamp: location.timestamp
          })
        }
      )

      return response.success
    } catch (error) {
      console.error('Error sharing location for order:', error)
      return false
    }
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    
    return distance // in kilometers
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180)
  }

  // Add location update listener
  addListener(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback)
    }
  }

  // Notify all listeners
  notifyListeners(location) {
    this.listeners.forEach(callback => {
      try {
        callback(location)
      } catch (error) {
        console.error('Error in location listener:', error)
      }
    })
  }

  // Get tracking status
  isCurrentlyTracking() {
    return this.isTracking
  }

  // Update tracking configuration
  updateTrackingConfig(timeInterval, distanceInterval) {
    this.updateInterval = timeInterval
    this.distanceInterval = distanceInterval
    
    // Restart tracking if active
    if (this.isTracking) {
      this.stopTracking()
      // Note: Need to call startTracking again with the role
      console.log('Tracking config updated. Restart tracking to apply changes.')
    }
  }
}

export default new LocationTrackingService()
