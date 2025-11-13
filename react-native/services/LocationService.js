// Location Service for handling location-related operations
import * as Location from 'expo-location'
import { Alert, Platform, PermissionsAndroid } from 'react-native'

class LocationService {

  // Request location permissions
  static async requestLocationPermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs location permission to show nearby consumers and optimize routes.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        )
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync()
        return status === 'granted'
      }
    } catch (error) {
      console.error('LocationService: Permission request error:', error)
      return false
    }
  }

  // Get current location with high accuracy
  static async getCurrentLocation() {
    try {
      const hasPermission = await this.requestLocationPermission()
      if (!hasPermission) {
        Alert.alert(
          'Permission Required', 
          'Location permission is required to show nearby consumers and optimize delivery routes.'
        )
        return null
      }

      // Check if location services are enabled
      const enabled = await Location.hasServicesEnabledAsync()
      if (!enabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services to use this feature.'
        )
        return null
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      })

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp
      }
    } catch (error) {
      console.error('LocationService: Error getting location:', error)
      
      if (error.code === 'E_LOCATION_TIMEOUT') {
        Alert.alert('Timeout', 'Location request timed out. Please try again.')
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        Alert.alert('Location Unavailable', 'Could not determine your location.')
      } else {
        Alert.alert('Location Error', 'Could not get current location')
      }
      
      return null
    }
  }

  // Calculate distance between two coordinates using Haversine formula
  static calculateDistance(coord1, coord2) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c // Distance in kilometers
  }

  // Calculate bearing (direction) from one point to another
  static calculateBearing(start, end) {
    const startLat = start.latitude * Math.PI / 180
    const startLng = start.longitude * Math.PI / 180
    const endLat = end.latitude * Math.PI / 180
    const endLng = end.longitude * Math.PI / 180
    
    const dLng = endLng - startLng
    
    const y = Math.sin(dLng) * Math.cos(endLat)
    const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng)
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI
    bearing = (bearing + 360) % 360 // Normalize to 0-360
    
    return bearing
  }

  // Get compass direction from bearing
  static getCompassDirection(bearing) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    const index = Math.round(bearing / 22.5) % 16
    return directions[index]
  }

  // Format distance for display
  static formatDistance(distanceKm) {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)}km`
    } else {
      return `${Math.round(distanceKm)}km`
    }
  }

  // Estimate travel time based on distance (assuming average speed)
  static estimateTravelTime(distanceKm, mode = 'driving') {
    let avgSpeedKmh
    
    switch (mode) {
      case 'walking':
        avgSpeedKmh = 5
        break
      case 'cycling':
        avgSpeedKmh = 15
        break
      case 'driving':
      default:
        avgSpeedKmh = 30 // Considering city traffic
        break
    }
    
    const timeHours = distanceKm / avgSpeedKmh
    const timeMinutes = Math.round(timeHours * 60)
    
    if (timeMinutes < 60) {
      return `${timeMinutes} min`
    } else {
      const hours = Math.floor(timeMinutes / 60)
      const minutes = timeMinutes % 60
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
  }

  // Find consumers within a specific radius
  static filterConsumersByRadius(vendorLocation, consumers, radiusKm = 10) {
    if (!vendorLocation || !consumers) return []
    
    return consumers.filter(consumer => {
      const distance = this.calculateDistance(vendorLocation, {
        latitude: consumer.latitude,
        longitude: consumer.longitude
      })
      return distance <= radiusKm
    }).map(consumer => ({
      ...consumer,
      distance: this.calculateDistance(vendorLocation, {
        latitude: consumer.latitude,
        longitude: consumer.longitude
      }),
      bearing: this.calculateBearing(vendorLocation, {
        latitude: consumer.latitude,
        longitude: consumer.longitude
      }),
      direction: this.getCompassDirection(this.calculateBearing(vendorLocation, {
        latitude: consumer.latitude,
        longitude: consumer.longitude
      })),
      estimatedTime: this.estimateTravelTime(this.calculateDistance(vendorLocation, {
        latitude: consumer.latitude,
        longitude: consumer.longitude
      }))
    }))
  }

  // Get map region to fit all locations
  static getMapRegion(locations, padding = 0.01) {
    if (!locations || locations.length === 0) {
      return {
        latitude: 28.6139,
        longitude: 77.2090,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      }
    }

    const latitudes = locations.map(loc => loc.latitude)
    const longitudes = locations.map(loc => loc.longitude)
    
    const minLat = Math.min(...latitudes)
    const maxLat = Math.max(...latitudes)
    const minLng = Math.min(...longitudes)
    const maxLng = Math.max(...longitudes)
    
    const centerLat = (minLat + maxLat) / 2
    const centerLng = (minLng + maxLng) / 2
    const latDelta = Math.max((maxLat - minLat) + padding, 0.01)
    const lngDelta = Math.max((maxLng - minLng) + padding, 0.01)
    
    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta
    }
  }

  // Geocode address to coordinates (placeholder - requires external service)
  static async geocodeAddress(address) {
    try {
      // This would typically use a geocoding service like Google Maps API
      // For now, returning mock coordinates based on Delhi area
      console.log('LocationService: Geocoding address:', address)
      
      // Mock geocoding - in real app, use actual geocoding service
      return {
        latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
        longitude: 77.2090 + (Math.random() - 0.5) * 0.1,
        formattedAddress: address
      }
    } catch (error) {
      console.error('LocationService: Geocoding error:', error)
      return null
    }
  }

  // Reverse geocode coordinates to address using expo-location
  static async reverseGeocode(latitude, longitude) {
    try {
      console.log('LocationService: Reverse geocoding:', latitude, longitude)
      
      // Use expo-location's reverse geocoding
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      })
      
      if (results && results.length > 0) {
        const location = results[0]
        
        // Build formatted address
        const addressParts = []
        if (location.name) addressParts.push(location.name)
        if (location.street) addressParts.push(location.street)
        if (location.streetNumber) addressParts.push(location.streetNumber)
        
        const formattedAddress = addressParts.join(', ') || `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        
        return {
          street: location.street || location.name || formattedAddress,
          city: location.city || location.subregion || '',
          state: location.region || '',
          country: location.country || 'India',
          postalCode: location.postalCode || '',
          district: location.district || '',
          subregion: location.subregion || '',
          formattedAddress: formattedAddress,
          coordinates: [longitude, latitude] // GeoJSON format
        }
      }
      
      // Fallback if no results
      return {
        street: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        city: '',
        state: '',
        country: 'India',
        postalCode: '',
        formattedAddress: `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        coordinates: [longitude, latitude]
      }
    } catch (error) {
      console.error('LocationService: Reverse geocoding error:', error)
      // Return basic location info on error
      return {
        street: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        city: '',
        state: '',
        country: 'India',
        postalCode: '',
        formattedAddress: `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        coordinates: [longitude, latitude]
      }
    }
  }

  // Check if location is within delivery area
  static isWithinDeliveryArea(location, deliveryCenter, maxDistanceKm = 50) {
    const distance = this.calculateDistance(location, deliveryCenter)
    return distance <= maxDistanceKm
  }

  // Generate route waypoints for multiple destinations
  static generateRouteWaypoints(startLocation, destinations) {
    if (!startLocation || !destinations || destinations.length === 0) {
      return []
    }

    const waypoints = [startLocation]
    
    // Simple nearest neighbor approach for waypoint ordering
    let remainingDestinations = [...destinations]
    let currentLocation = startLocation
    
    while (remainingDestinations.length > 0) {
      let nearestIndex = 0
      let nearestDistance = Infinity
      
      remainingDestinations.forEach((destination, index) => {
        const distance = this.calculateDistance(currentLocation, {
          latitude: destination.latitude,
          longitude: destination.longitude
        })
        
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = index
        }
      })
      
      const nearestDestination = remainingDestinations.splice(nearestIndex, 1)[0]
      waypoints.push({
        latitude: nearestDestination.latitude,
        longitude: nearestDestination.longitude
      })
      currentLocation = {
        latitude: nearestDestination.latitude,
        longitude: nearestDestination.longitude
      }
    }
    
    return waypoints
  }
}

export default LocationService