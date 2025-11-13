import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
  Platform
} from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps'
import { useNavigation, useRoute } from '@react-navigation/native'
import * as Location from 'expo-location'
import Icon from '../Icon'
import ProductService from '../services/ProductService'
import LocationTrackingService from '../services/LocationTrackingService'
import WebSocketService from '../services/WebSocketService'

const { width, height } = Dimensions.get('window')

const CVendorMap = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const mapRef = useRef(null)
  
  const { vendors = [] } = route.params || {}
  
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [vendorProducts, setVendorProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [initialRegion, setInitialRegion] = useState({
    latitude: 28.6139, // Default to Delhi coordinates
    longitude: 77.2090,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })
  const [loading, setLoading] = useState(true)
  const [locationPermission, setLocationPermission] = useState(false)
  const [vendorsWithLocations, setVendorsWithLocations] = useState([])
  const [trackingLocation, setTrackingLocation] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
  const [demoVendors, setDemoVendors] = useState([])
  const [liveVendors, setLiveVendors] = useState([])
  const [wsConnected, setWsConnected] = useState(false)
  
  // Location tracking subscription
  const locationSubscription = useRef(null)
  const wsLocationSubscription = useRef(null)
  const wsVendorSubscription = useRef(null)
  const wsConnectionSubscription = useRef(null)
  const demoMovementInterval = useRef(null)

  useEffect(() => {
    initializeLocation()
    return () => {
      // Cleanup on unmount
      cleanupServices()
    }
  }, [])

  useEffect(() => {
    if (userLocation && vendors.length > 0) {
      loadVendorLocations()
    }
  }, [userLocation, vendors])

  const initializeLocation = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync()
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show your current location on the map.',
          [{ text: 'OK' }]
        )
        setLocationPermission(false)
        setLoading(false)
        // Still show map with default location
        return
      }

      setLocationPermission(true)

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }

      setUserLocation(userCoords)
      setInitialRegion(userCoords)
      setLoading(false)

      // Initialize WebSocket connection (optional, won't block if it fails)
      initializeWebSocket()

      console.log('Location initialized successfully')
    } catch (error) {
      console.error('Error initializing location:', error)
      setLoading(false)
      // Show map with default location even if location fails
      setUserLocation({
        latitude: 28.6139,
        longitude: 77.2090,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      })
    }
  }

  const initializeWebSocket = async () => {
    try {
      // Connect to WebSocket (non-blocking)
      const connected = await WebSocketService.connect('consumer')
      
      if (connected) {
        setWsConnected(true)

        // Subscribe to WebSocket events
        wsConnectionSubscription.current = WebSocketService.on('connected', () => {
          console.log('WebSocket connected event')
          setWsConnected(true)
        })

        wsLocationSubscription.current = WebSocketService.on('disconnected', () => {
          console.log('WebSocket disconnected event')
          setWsConnected(false)
        })

        wsVendorSubscription.current = WebSocketService.on('vendor_location_update', handleVendorLocationUpdate)

        console.log('WebSocket services initialized')
      } else {
        console.log('WebSocket connection failed, continuing without real-time updates')
      }
    } catch (error) {
      console.error('Error initializing WebSocket:', error)
      // Continue without WebSocket - not critical
    }
  }

  const initializeServices = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync()
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show nearby vendors and your current location.',
          [{ text: 'OK' }]
        )
        setLocationPermission(false)
        setLoading(false)
        return
      }

      setLocationPermission(true)

      // Connect to WebSocket
      await WebSocketService.connect('consumer')

      // Subscribe to WebSocket events
      wsLocationSubscription.current = WebSocketService.on('location_update', handleLocationUpdate)
      wsVendorSubscription.current = WebSocketService.on('vendor_location_update', handleVendorLocationUpdate)

      // Start location tracking using LocationTrackingService
      await LocationTrackingService.startTracking('consumer', (location) => {
        const newCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }
        
        setUserLocation(newCoords)
        
        // Update vendor distances when user location changes
        if (vendorsWithLocations.length > 0) {
          updateVendorDistances(newCoords)
        }

        // Subscribe to nearby vendors via WebSocket
        WebSocketService.subscribeToNearbyVendors(
          location.coords.latitude,
          location.coords.longitude,
          10 // 10km radius
        )

        // Broadcast location via WebSocket
        WebSocketService.broadcastLocation(location.coords, 'consumer')
      })

      setTrackingLocation(true)
      setLoading(false)

      console.log('Services initialized successfully')
    } catch (error) {
      console.error('Error initializing services:', error)
      Alert.alert('Error', 'Failed to initialize location services')
      setLoading(false)
    }
  }

  const cleanupServices = () => {
    // Stop location tracking
    if (locationSubscription.current) {
      locationSubscription.current.remove()
      locationSubscription.current = null
    }

    // Stop demo vendor movement
    if (demoMovementInterval.current) {
      clearInterval(demoMovementInterval.current)
      demoMovementInterval.current = null
    }

    // Unsubscribe from WebSocket if connected
    if (wsConnected) {
      try {
        WebSocketService.unsubscribeFromNearbyVendors()
      } catch (error) {
        console.log('Error unsubscribing from vendors:', error)
      }
    }

    // Remove event listeners
    if (wsLocationSubscription.current) {
      wsLocationSubscription.current()
    }
    if (wsVendorSubscription.current) {
      wsVendorSubscription.current()
    }
    if (wsConnectionSubscription.current) {
      wsConnectionSubscription.current()
    }

    // Disconnect WebSocket
    try {
      WebSocketService.disconnect()
    } catch (error) {
      console.log('Error disconnecting WebSocket:', error)
    }
  }

  const handleLocationUpdate = (data) => {
    console.log('Location update received:', data)
  }

  const handleVendorLocationUpdate = (data) => {
    console.log('Vendor location update:', data)
    
    // Update live vendor location in real-time
    if (data && data.userId && data.location) {
      const [longitude, latitude] = data.location.coordinates
      
      setLiveVendors(prevVendors => {
        const exists = prevVendors.find(v => v.id === data.userId)
        
        if (exists) {
          // Update existing vendor location
          return prevVendors.map(vendor => {
            if (vendor.id === data.userId) {
              return {
                ...vendor,
                coordinate: { latitude, longitude },
                lastUpdated: new Date(data.timestamp),
                isLive: true
              }
            }
            return vendor
          })
        } else {
          // Add new live vendor
          const newVendor = {
            id: data.userId,
            name: data.userName || 'Live Vendor',
            coordinate: { latitude, longitude },
            distance: userLocation ? `${calculateRealDistance(
              userLocation.latitude,
              userLocation.longitude,
              latitude,
              longitude
            ).toFixed(1)} km` : 'Calculating...',
            rating: 4.5,
            reviews: 50,
            image: `https://via.placeholder.com/80x80/4CAF50/FFFFFF?text=${(data.userName || 'V').charAt(0)}`,
            verified: true,
            organic: false,
            totalProducts: 0,
            responseTime: '< 2h',
            successRate: 95,
            isLive: true,
            lastUpdated: new Date(data.timestamp)
          }
          return [...prevVendors, newVendor]
        }
      })

      // Recalculate distances
      if (userLocation) {
        updateVendorDistances(userLocation)
      }
    }
  }

  // Toggle demo mode with 5 simulated vendors
  const toggleDemoMode = () => {
    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location services first')
      return
    }

    if (!demoMode) {
      // Create 5 demo vendors around user location
      const demos = generateDemoVendors(userLocation)
      setDemoVendors(demos)
      setDemoMode(true)
      
      // Start simulating vendor movement
      startDemoVendorMovement()
      
      Alert.alert('Demo Mode', '5 demo vendors added. Watch some of them move!', [{ text: 'OK' }])
    } else {
      // Stop demo mode
      setDemoVendors([])
      setDemoMode(false)
      
      // Stop movement simulation
      if (demoMovementInterval.current) {
        clearInterval(demoMovementInterval.current)
        demoMovementInterval.current = null
      }
      
      Alert.alert('Demo Mode', 'Demo vendors removed', [{ text: 'OK' }])
    }
  }

  // Generate 5 demo vendors near user location
  const generateDemoVendors = (baseLocation) => {
    const vendors = [
      {
        id: 'demo_1',
        name: 'Green Valley Farms (Moving)',
        isMoving: true,
        speedKmH: 30,
        color: '#4CAF50',
        direction: 0 // Degrees
      },
      {
        id: 'demo_2',
        name: 'Organic Harvest (Stationary)',
        isMoving: false,
        color: '#FF9800'
      },
      {
        id: 'demo_3',
        name: 'Fresh Farm Direct (Moving)',
        isMoving: true,
        speedKmH: 20,
        color: '#2196F3',
        direction: 90
      },
      {
        id: 'demo_4',
        name: 'Natural Foods Co. (Stationary)',
        isMoving: false,
        color: '#9C27B0'
      },
      {
        id: 'demo_5',
        name: 'Farm Fresh Express (Moving)',
        isMoving: true,
        speedKmH: 25,
        color: '#F44336',
        direction: 180
      }
    ]

    return vendors.map((vendor, index) => {
      // Create vendors in a circle around user
      const angle = (index * 72) * (Math.PI / 180) // 360/5 = 72 degrees apart
      const distance = 0.02 // About 2km
      
      const latitude = baseLocation.latitude + (distance * Math.cos(angle))
      const longitude = baseLocation.longitude + (distance * Math.sin(angle))

      return {
        ...vendor,
        coordinate: { latitude, longitude },
        startCoordinate: { latitude, longitude },
        distance: `${calculateRealDistance(
          baseLocation.latitude,
          baseLocation.longitude,
          latitude,
          longitude
        ).toFixed(1)} km`,
        rating: 4.2 + (Math.random() * 0.6),
        reviews: Math.floor(Math.random() * 100) + 20,
        image: `https://via.placeholder.com/80x80/${vendor.color.substring(1)}/FFFFFF?text=${vendor.name.charAt(0)}`,
        verified: true,
        organic: index % 2 === 0,
        totalProducts: Math.floor(Math.random() * 30) + 10,
        responseTime: '< 2h',
        successRate: 92 + Math.floor(Math.random() * 8),
        isDemo: true
      }
    })
  }

  // Simulate vendor movement for demo
  const startDemoVendorMovement = () => {
    demoMovementInterval.current = setInterval(() => {
      setDemoVendors(prevVendors => {
        return prevVendors.map(vendor => {
          if (!vendor.isMoving || !userLocation) return vendor

          // Move vendor along a path
          const speedInDegrees = (vendor.speedKmH / 111) / 3600 // Convert km/h to degrees per second
          const moveDistance = speedInDegrees * 5 // Movement every 5 seconds

          // Calculate new position based on direction
          const radians = (vendor.direction || 0) * (Math.PI / 180)
          const newLat = vendor.coordinate.latitude + (moveDistance * Math.cos(radians))
          const newLon = vendor.coordinate.longitude + (moveDistance * Math.sin(radians))

          // Change direction randomly every now and then
          const newDirection = Math.random() > 0.9 ? 
            (vendor.direction + (Math.random() * 90 - 45)) % 360 : 
            vendor.direction

          const newCoordinate = {
            latitude: newLat,
            longitude: newLon
          }

          const newDistance = calculateRealDistance(
            userLocation.latitude,
            userLocation.longitude,
            newLat,
            newLon
          )

          return {
            ...vendor,
            coordinate: newCoordinate,
            direction: newDirection,
            distance: `${newDistance.toFixed(1)} km`
          }
        })
      })
    }, 5000) // Update every 5 seconds
  }

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show nearby vendors and your current location.',
          [{ text: 'OK' }]
        )
        setLocationPermission(false)
        setLoading(false)
        return
      }

      setLocationPermission(true)
      await getCurrentLocation()
      startLocationTracking()
    } catch (error) {
      console.error('Error requesting location permission:', error)
      Alert.alert('Error', 'Failed to get location permission')
      setLoading(false)
    }
  }

  const getCurrentLocation = async () => {
    try {
      const location = await LocationTrackingService.getCurrentLocation()

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }

      setUserLocation(userCoords)
      setInitialRegion(userCoords)
      setLoading(false)

      console.log('User location obtained:', userCoords)
    } catch (error) {
      console.error('Error getting current location:', error)
      Alert.alert('Error', 'Failed to get your current location')
      setLoading(false)
    }
  }

  const startLocationTracking = async () => {
    try {
      setTrackingLocation(true)
      
      // Start watching position with high accuracy
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const newCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }
          
          setUserLocation(newCoords)
          
          // Recalculate distances to vendors
          if (vendorsWithLocations.length > 0) {
            updateVendorDistances(newCoords)
          }
        }
      )

      console.log('Location tracking started')
    } catch (error) {
      console.error('Error starting location tracking:', error)
      setTrackingLocation(false)
    }
  }

  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove()
      locationSubscription.current = null
      setTrackingLocation(false)
      console.log('Location tracking stopped')
    }
  }

  const loadVendorLocations = async () => {
    try {
      const vendorsWithCoords = vendors.map((vendor, index) => {
        // Try to get real coordinates from vendor data
        let coordinate = null
        
        if (vendor.location?.coordinates && Array.isArray(vendor.location.coordinates)) {
          // GeoJSON format: [longitude, latitude]
          coordinate = {
            latitude: vendor.location.coordinates[1],
            longitude: vendor.location.coordinates[0]
          }
        } else if (vendor.coordinate) {
          coordinate = vendor.coordinate
        } else {
          // Generate mock coordinates around user location
          const offset = 0.05
          coordinate = {
            latitude: userLocation.latitude + (Math.random() - 0.5) * offset * 2,
            longitude: userLocation.longitude + (Math.random() - 0.5) * offset * 2
          }
        }

        // Calculate distance from user
        const distance = calculateRealDistance(
          userLocation.latitude,
          userLocation.longitude,
          coordinate.latitude,
          coordinate.longitude
        )

        return {
          ...vendor,
          coordinate,
          distance: `${distance.toFixed(1)} km`
        }
      })

      // Sort by distance
      vendorsWithCoords.sort((a, b) => {
        const distA = parseFloat(a.distance)
        const distB = parseFloat(b.distance)
        return distA - distB
      })

      setVendorsWithLocations(vendorsWithCoords)
      
      // Fit map to show all vendors after a short delay
      setTimeout(() => {
        fitMapToVendors(vendorsWithCoords)
      }, 500)
    } catch (error) {
      console.error('Error loading vendor locations:', error)
    }
  }

  const updateVendorDistances = (newUserLocation) => {
    const updatedVendors = vendorsWithLocations.map(vendor => {
      const distance = calculateRealDistance(
        newUserLocation.latitude,
        newUserLocation.longitude,
        vendor.coordinate.latitude,
        vendor.coordinate.longitude
      )
      
      return {
        ...vendor,
        distance: `${distance.toFixed(1)} km`
      }
    })

    // Re-sort by distance
    updatedVendors.sort((a, b) => {
      const distA = parseFloat(a.distance)
      const distB = parseFloat(b.distance)
      return distA - distB
    })

    setVendorsWithLocations(updatedVendors)
  }

  // Haversine formula to calculate real distance
  const calculateRealDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    
    return distance
  }

  const toRadians = (degrees) => {
    return degrees * (Math.PI / 180)
  }

  const fitMapToVendors = (vendorsList) => {
    if (vendorsList.length === 0 || !mapRef.current || !userLocation) return

    const coordinates = [
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      ...vendorsList.map(v => v.coordinate)
    ]
    
    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: {
        top: 100,
        right: 50,
        bottom: selectedVendor ? 450 : 250,
        left: 50
      },
      animated: true
    })
  }

  const handleMarkerPress = async (vendor) => {
    setSelectedVendor(vendor)
    setLoadingProducts(true)
    
    // Animate map to center on vendor
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: vendor.coordinate.latitude,
        longitude: vendor.coordinate.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500)
    }

    // Load vendor's products
    try {
      const result = await ProductService.getVendorProducts()
      
      if (result.success && result.data) {
        // Filter products for this specific vendor
        const vendorProducts = result.data.filter(product => 
          product.sellerId && 
          typeof product.sellerId === 'object' &&
          product.sellerId._id === vendor.id
        )
        
        setVendorProducts(vendorProducts)
        console.log(`Loaded ${vendorProducts.length} products for vendor ${vendor.name}`)
      }
    } catch (error) {
      console.error('Error loading vendor products:', error)
      Alert.alert('Error', 'Failed to load vendor products')
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleGetDirections = (vendor) => {
    // Open directions in external map app
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q='
    })
    const latLng = `${vendor.coordinate.latitude},${vendor.coordinate.longitude}`
    const label = vendor.name
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    })

    Alert.alert(
      'Get Directions',
      `Open directions to ${vendor.name} in Maps?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Maps',
          onPress: () => {
            // Linking.openURL(url)
            Alert.alert('Navigation', `Directions to ${vendor.name}\nDistance: ${vendor.distance}`)
          }
        }
      ]
    )
  }

  const handleViewProducts = (vendor) => {
    navigation.goBack()
    // Pass vendor filter to Buy screen
    setTimeout(() => {
      navigation.setParams({ vendorFilter: vendor.name })
    }, 100)
  }

  const handleViewProductDetail = (product) => {
    navigation.navigate('CProductDetail', { productId: product._id })
  }

  const handleCenterOnUser = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.animateToRegion(userLocation, 1000)
    }
  }

  const handleCenterOnVendors = () => {
    fitMapToVendors(vendorsWithLocations)
  }

  const toggleLocationTracking = () => {
    if (trackingLocation) {
      stopLocationTracking()
    } else {
      startLocationTracking()
    }
  }

  const getProductImage = (product) => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0]
    }
    if (product.image) return product.image
    if (product.imageUrl) return product.imageUrl
    
    const colors = {
      vegetables: '4CAF50',
      fruits: 'F44336',
      grains: 'FF9800',
      pulses: '9C27B0',
      spices: 'FFC107'
    }
    const color = colors[product.category?.toLowerCase()] || '2196F3'
    return `https://via.placeholder.com/80x80/${color}/FFFFFF?text=${product.name?.charAt(0) || 'P'}`
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="ArrowLeft" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Nearby Vendors</Text>
          <Text style={styles.headerSubtitle}>
            {vendorsWithLocations.length + demoVendors.length + liveVendors.length} vendors
            {liveVendors.length > 0 && ` • ${liveVendors.length} live`}
            {demoMode && ` • Demo mode`}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.trackingButton, trackingLocation && styles.trackingButtonActive]}
          onPress={toggleLocationTracking}
        >
          <Icon name={trackingLocation ? "Navigation" : "Navigation2"} size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Getting your location...</Text>
            <Text style={styles.loadingSubtext}>Please allow location access</Text>
          </View>
        ) : !locationPermission ? (
          <View style={styles.loadingContainer}>
            <Icon name="MapPinOff" size={48} color="#999" />
            <Text style={styles.loadingText}>Location Permission Required</Text>
            <Text style={styles.loadingSubtext}>Enable location to see nearby vendors</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={requestLocationPermission}
            >
              <Text style={styles.retryButtonText}>Enable Location</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={initialRegion}
              showsUserLocation={true}
              showsMyLocationButton={false}
              showsCompass={true}
              followsUserLocation={trackingLocation}
            >
              {/* User location with accuracy circle */}
              {userLocation && (
                <>
                  <Circle
                    center={{
                      latitude: userLocation.latitude,
                      longitude: userLocation.longitude
                    }}
                    radius={50} // 50 meters accuracy circle
                    fillColor="rgba(33, 150, 243, 0.2)"
                    strokeColor="rgba(33, 150, 243, 0.8)"
                    strokeWidth={2}
                  />
                  <Marker
                    coordinate={{
                      latitude: userLocation.latitude,
                      longitude: userLocation.longitude
                    }}
                    title="You are here"
                    description={trackingLocation ? "Live tracking enabled" : "Your current location"}
                  >
                    <View style={styles.userMarker}>
                      <View style={styles.userMarkerDot} />
                    </View>
                  </Marker>
                </>
              )}

              {/* Vendor markers - Static vendors from params */}
              {vendorsWithLocations.map((vendor) => (
                <Marker
                  key={vendor.id}
                  coordinate={vendor.coordinate}
                  onPress={() => handleMarkerPress(vendor)}
                  title={vendor.name}
                  description={`${vendor.distance} away • ${vendor.totalProducts} products`}
                >
                  <View style={styles.markerContainer}>
                    <View style={[
                      styles.marker,
                      selectedVendor?.id === vendor.id && styles.selectedMarker
                    ]}>
                      <Icon name="Store" size={20} color="white" />
                    </View>
                    {vendor.verified && (
                      <View style={styles.verifiedIndicator}>
                        <Icon name="CheckCircle" size={12} color="#4CAF50" />
                      </View>
                    )}
                  </View>
                </Marker>
              ))}

              {/* Demo vendors */}
              {demoVendors.map((vendor) => (
                <Marker
                  key={vendor.id}
                  coordinate={vendor.coordinate}
                  onPress={() => handleMarkerPress(vendor)}
                  title={vendor.name}
                  description={vendor.isMoving ? `Moving • ${vendor.distance} away` : `Stationary • ${vendor.distance} away`}
                >
                  <View style={styles.markerContainer}>
                    <View style={[
                      styles.marker,
                      { backgroundColor: vendor.color },
                      selectedVendor?.id === vendor.id && styles.selectedMarker
                    ]}>
                      <Icon name={vendor.isMoving ? "Truck" : "Store"} size={20} color="white" />
                    </View>
                    {vendor.isMoving && (
                      <View style={styles.movingIndicator}>
                        <Icon name="Navigation" size={10} color="#2196F3" />
                      </View>
                    )}
                  </View>
                </Marker>
              ))}

              {/* Live vendors from WebSocket */}
              {liveVendors.map((vendor) => (
                <Marker
                  key={vendor.id}
                  coordinate={vendor.coordinate}
                  onPress={() => handleMarkerPress(vendor)}
                  title={vendor.name + ' (Live)'}
                  description={`Live tracking • ${vendor.distance} away`}
                >
                  <View style={styles.markerContainer}>
                    <View style={[
                      styles.marker,
                      styles.liveVendorMarker,
                      selectedVendor?.id === vendor.id && styles.selectedMarker
                    ]}>
                      <Icon name="Radio" size={20} color="white" />
                    </View>
                    <View style={styles.livePulse} />
                  </View>
                </Marker>
              ))}
            </MapView>

            {/* Demo Mode Toggle Button */}
            <View style={styles.demoToggleContainer}>
              <TouchableOpacity 
                style={[styles.demoToggleButton, demoMode && styles.demoToggleButtonActive]}
                onPress={toggleDemoMode}
              >
                <Icon name={demoMode ? "ToggleRight" : "ToggleLeft"} size={20} color={demoMode ? "#4CAF50" : "#999"} />
                <Text style={[styles.demoToggleText, demoMode && styles.demoToggleTextActive]}>
                  Demo Mode {demoMode ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
              {wsConnected && (
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>Live</Text>
                </View>
              )}
            </View>

            {/* Map controls */}
            <View style={styles.mapControls}>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handleCenterOnUser}
              >
                <Icon name="Crosshair" size={20} color="#2196F3" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handleCenterOnVendors}
              >
                <Icon name="Compass" size={20} color="#2196F3" />
              </TouchableOpacity>
            </View>

            {/* Distance indicator */}
            {userLocation && vendorsWithLocations.length > 0 && (
              <View style={styles.distanceIndicator}>
                <Icon name="MapPin" size={16} color="#666" />
                <Text style={styles.distanceText}>
                  Nearest vendor: {vendorsWithLocations[0]?.distance} away
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Vendor info card with products */}
      {selectedVendor && (
        <View style={styles.vendorInfoContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => {
              setSelectedVendor(null)
              setVendorProducts([])
            }}
          >
            <Icon name="X" size={20} color="#666" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.vendorCard}>
              <Image 
                source={{ uri: selectedVendor.image }} 
                style={styles.vendorImage} 
              />
              
              <View style={styles.vendorInfo}>
                <View style={styles.vendorHeader}>
                  <Text style={styles.vendorName}>{selectedVendor.name}</Text>
                  {selectedVendor.verified && (
                    <View style={styles.verifiedBadge}>
                      <Icon name="CheckCircle" size={14} color="#4CAF50" />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  )}
                </View>

                <View style={styles.vendorLocation}>
                  <Icon name="MapPin" size={14} color="#666" />
                  <Text style={styles.locationText}>{selectedVendor.location}</Text>
                </View>

                <View style={styles.vendorStats}>
                  <View style={styles.statItem}>
                    <Icon name="Star" size={14} color="#FFD700" />
                    <Text style={styles.statText}>{selectedVendor.rating}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Icon name="Navigation" size={14} color="#666" />
                    <Text style={styles.statText}>{selectedVendor.distance}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Icon name="Package" size={14} color="#666" />
                    <Text style={styles.statText}>{vendorProducts.length} items</Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.directionsButton}
                    onPress={() => handleGetDirections(selectedVendor)}
                  >
                    <Icon name="Navigation" size={16} color="white" />
                    <Text style={styles.buttonText}>Directions</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.callButton}
                    onPress={() => Alert.alert('Call', `Calling ${selectedVendor.name}`)}
                  >
                    <Icon name="Phone" size={16} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Vendor Products Section */}
            <View style={styles.productsSection}>
              <Text style={styles.productsSectionTitle}>
                Available Products ({vendorProducts.length})
              </Text>
              
              {loadingProducts ? (
                <View style={styles.productsLoading}>
                  <ActivityIndicator size="small" color="#2196F3" />
                  <Text style={styles.productsLoadingText}>Loading products...</Text>
                </View>
              ) : vendorProducts.length === 0 ? (
                <View style={styles.noProducts}>
                  <Icon name="Package" size={32} color="#CCC" />
                  <Text style={styles.noProductsText}>No products available</Text>
                </View>
              ) : (
                <FlatList
                  data={vendorProducts}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.productCard}
                      onPress={() => handleViewProductDetail(item)}
                    >
                      <Image 
                        source={{ uri: getProductImage(item) }} 
                        style={styles.productImage}
                      />
                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text style={styles.productPrice}>
                          ₹{item.price}/{item.unit}
                        </Text>
                        <View style={styles.productStock}>
                          <Icon name="Package" size={12} color="#666" />
                          <Text style={styles.productStockText}>
                            {item.availableQuantity} {item.unit}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity style={styles.addToCartMini}>
                        <Icon name="ShoppingCart" size={14} color="white" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={styles.productsListContainer}
                />
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Vendor list at bottom when no vendor selected */}
      {!selectedVendor && vendorsWithLocations.length > 0 && (
        <View style={styles.vendorListContainer}>
          <Text style={styles.listTitle}>
            {trackingLocation ? '📍 Live tracking - Tap vendor to see products' : 'Tap on a marker to view details'}
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.vendorScrollList}
          >
            {vendorsWithLocations.map((vendor) => (
              <TouchableOpacity
                key={vendor.id}
                style={styles.vendorListCard}
                onPress={() => handleMarkerPress(vendor)}
              >
                <Image source={{ uri: vendor.image }} style={styles.listVendorImage} />
                <View style={styles.listVendorInfo}>
                  <Text style={styles.listVendorName} numberOfLines={1}>
                    {vendor.name}
                  </Text>
                  <View style={styles.listVendorStats}>
                    <Icon name="Star" size={12} color="#FFD700" />
                    <Text style={styles.listStatText}>{vendor.rating}</Text>
                    <Text style={styles.listDivider}>•</Text>
                    <Icon name="Navigation" size={10} color="#666" />
                    <Text style={styles.listStatText}>{vendor.distance}</Text>
                  </View>
                  {vendor.verified && (
                    <View style={styles.listVerifiedBadge}>
                      <Icon name="CheckCircle" size={10} color="#4CAF50" />
                      <Text style={styles.listVerifiedText}>Verified</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header
  header: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  listButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },
  trackingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },
  trackingButtonActive: {
    backgroundColor: '#4CAF50',
  },

  // Map
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Markers
  markerContainer: {
    position: 'relative',
  },
  marker: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  selectedMarker: {
    backgroundColor: '#2196F3',
    transform: [{ scale: 1.2 }],
  },
  verifiedIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
  movingIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
  liveVendorMarker: {
    backgroundColor: '#FF5722',
  },
  livePulse: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#FF5722',
    opacity: 0.5,
  },
  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    borderWidth: 3,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
  },

  // Map controls
  mapControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    gap: 12,
  },
  controlButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  distanceIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontWeight: '600',
  },

  // Demo toggle
  demoToggleContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  demoToggleButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  demoToggleButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  demoToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  demoToggleTextActive: {
    color: '#4CAF50',
  },
  liveIndicator: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5722',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF5722',
  },

  // Vendor info card
  vendorInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    padding: 6,
  },
  vendorCard: {
    flexDirection: 'row',
  },
  vendorImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  vendorLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  vendorStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  directionsButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  productsButton: {
    backgroundColor: '#E3F2FD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 6,
  },
  productsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginLeft: 6,
  },
  callButton: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Products Section
  productsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  productsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  productsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  productsLoadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  noProducts: {
    alignItems: 'center',
    padding: 30,
  },
  noProductsText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  productsListContainer: {
    paddingBottom: 10,
  },
  productCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    width: 140,
    marginRight: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#E0E0E0',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    height: 36,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 6,
  },
  productStock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productStockText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  addToCartMini: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#2196F3',
    borderRadius: 16,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Vendor list (horizontal scroll)
  vendorListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  listTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  vendorScrollList: {
    paddingHorizontal: 20,
  },
  vendorListCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 140,
    flexDirection: 'column',
    alignItems: 'center',
  },
  listVendorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  listVendorInfo: {
    alignItems: 'center',
  },
  listVendorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  listVendorStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listStatText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  listDivider: {
    fontSize: 11,
    color: '#999',
    marginHorizontal: 4,
  },
  listVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  listVerifiedText: {
    fontSize: 9,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 3,
  },
})

export default CVendorMap
