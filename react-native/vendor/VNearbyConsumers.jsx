import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Dimensions,
  PermissionsAndroid,
  Platform,
  Modal,
  ScrollView
} from 'react-native'
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps'
import * as Location from 'expo-location'
import { useNavigation } from '@react-navigation/native'
import Icon from '../Icon'
import VendorService from '../services/VendorService'
import LocationService from '../services/LocationService'

const { width, height } = Dimensions.get('window')

const VNearbyConsumers = () => {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false)
  const [vendorLocation, setVendorLocation] = useState(null)
  const [consumers, setConsumers] = useState([])
  const [selectedConsumer, setSelectedConsumer] = useState(null)
  const [routeCoordinates, setRouteCoordinates] = useState([])
  const [mapRegion, setMapRegion] = useState(null)
  const [showRoutes, setShowRoutes] = useState(false)
  const [shortestPath, setShortestPath] = useState(null)
  const [totalDistance, setTotalDistance] = useState(0)
  const [demoMode, setDemoMode] = useState(true)
  const [movingConsumers, setMovingConsumers] = useState({})
  const [isInitialized, setIsInitialized] = useState(false)
  const [pendingRequests, setPendingRequests] = useState([])
  const [acceptedConsumers, setAcceptedConsumers] = useState([])
  const [currentRequestModal, setCurrentRequestModal] = useState(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [allPotentialConsumers, setAllPotentialConsumers] = useState([])
  const [requestSequenceIndex, setRequestSequenceIndex] = useState(0)
  const [sequenceActive, setSequenceActive] = useState(false)

  // Dijkstra's Algorithm Implementation
  const dijkstraAlgorithm = (graph, start, end) => {
    const distances = {}
    const previous = {}
    const unvisited = new Set()
    
    // Initialize distances
    Object.keys(graph).forEach(node => {
      distances[node] = node === start ? 0 : Infinity
      previous[node] = null
      unvisited.add(node)
    })
    
    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let current = null
      let minDistance = Infinity
      
      unvisited.forEach(node => {
        if (distances[node] < minDistance) {
          minDistance = distances[node]
          current = node
        }
      })
      
      if (current === null) break
      
      unvisited.delete(current)
      
      // Check if we reached the end
      if (current === end) break
      
      // Update distances to neighbors
      if (graph[current]) {
        Object.keys(graph[current]).forEach(neighbor => {
          if (unvisited.has(neighbor)) {
            const alt = distances[current] + graph[current][neighbor]
            if (alt < distances[neighbor]) {
              distances[neighbor] = alt
              previous[neighbor] = current
            }
          }
        })
      }
    }
    
    // Reconstruct path
    const path = []
    let current = end
    
    while (current !== null) {
      path.unshift(current)
      current = previous[current]
    }
    
    return {
      distance: distances[end],
      path: path.length > 1 ? path : []
    }
  }

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (coord1, coord2) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Build graph for Dijkstra's algorithm
  const buildLocationGraph = (vendorLoc, consumerLocs) => {
    const graph = {}
    const locations = [{ id: 'vendor', ...vendorLoc }, ...consumerLocs]
    
    locations.forEach(loc1 => {
      graph[loc1.id] = {}
      locations.forEach(loc2 => {
        if (loc1.id !== loc2.id) {
          const distance = calculateDistance(
            { latitude: loc1.latitude, longitude: loc1.longitude },
            { latitude: loc2.latitude, longitude: loc2.longitude }
          )
          graph[loc1.id][loc2.id] = distance
        }
      })
    })
    
    return graph
  }

  // Find optimal route using Dijkstra's algorithm
  const findOptimalRoute = (vendorLoc, consumerLocs) => {
    if (!vendorLoc || consumerLocs.length === 0) return null
    
    const graph = buildLocationGraph(vendorLoc, consumerLocs)
    let totalDist = 0
    const fullPath = ['vendor']
    const visitedConsumers = new Set()
    let currentLocation = 'vendor'
    
    // Visit each consumer using shortest path
    while (visitedConsumers.size < consumerLocs.length) {
      let nearestConsumer = null
      let shortestDistance = Infinity
      
      consumerLocs.forEach(consumer => {
        if (!visitedConsumers.has(consumer.id)) {
          const result = dijkstraAlgorithm(graph, currentLocation, consumer.id)
          if (result.distance < shortestDistance) {
            shortestDistance = result.distance
            nearestConsumer = consumer.id
          }
        }
      })
      
      if (nearestConsumer) {
        const result = dijkstraAlgorithm(graph, currentLocation, nearestConsumer)
        totalDist += result.distance
        fullPath.push(nearestConsumer)
        visitedConsumers.add(nearestConsumer)
        currentLocation = nearestConsumer
      } else {
        break
      }
    }
    
    return {
      path: fullPath,
      totalDistance: totalDist
    }
  }

  // Convert path to coordinates for map display
  const pathToCoordinates = (path, vendorLoc, consumerLocs) => {
    const coordinates = []
    const allLocations = { vendor: vendorLoc, ...Object.fromEntries(consumerLocs.map(c => [c.id, c])) }
    
    path.forEach(locationId => {
      const loc = allLocations[locationId]
      if (loc) {
        coordinates.push({
          latitude: loc.latitude,
          longitude: loc.longitude
        })
      }
    })
    
    return coordinates
  }

  // Request location permissions
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs location permission to show nearby consumers.',
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
      console.error('Permission request error:', error)
      return false
    }
  }

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission()
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Location permission is required to show nearby consumers.')
        return null
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }
    } catch (error) {
      console.error('Error getting location:', error)
      Alert.alert('Location Error', 'Could not get current location')
      return null
    }
  }

  // Generate demo consumers with some moving (but don't show them initially)
  const generateDemoConsumers = (vendorLoc) => {
    const demoData = [
      {
        id: 'consumer_0',
        name: 'Raj Kumar',
        address: '500m North - Main Road',
        latitude: vendorLoc.latitude + 0.005,
        longitude: vendorLoc.longitude + 0.003,
        orderCount: 3,
        totalValue: 5500,
        phone: '+91 9876543210',
        isMoving: false,
        hasRequest: true,
        orderDetails: {
          orderId: 'ORD-001',
          items: ['Tomatoes 5kg', 'Onions 3kg', 'Potatoes 4kg'],
          totalAmount: 850,
          deliveryTime: '30 mins'
        }
      },
      {
        id: 'consumer_1',
        name: 'Priya Sharma',
        address: '450m South - Market Street',
        latitude: vendorLoc.latitude - 0.004,
        longitude: vendorLoc.longitude + 0.005,
        orderCount: 2,
        totalValue: 3200,
        phone: '+91 9876543211',
        isMoving: true,
        moveSpeed: 0.0001,
        hasRequest: true,
        orderDetails: {
          orderId: 'ORD-002',
          items: ['Carrots 2kg', 'Cabbage 1pc', 'Spinach 1kg'],
          totalAmount: 420,
          deliveryTime: '25 mins'
        }
      },
      {
        id: 'consumer_2',
        name: 'Amit Patel',
        address: '650m East - Residential Area',
        latitude: vendorLoc.latitude + 0.006,
        longitude: vendorLoc.longitude - 0.004,
        orderCount: 5,
        totalValue: 8900,
        phone: '+91 9876543212',
        isMoving: true,
        moveSpeed: 0.00008,
        hasRequest: true,
        orderDetails: {
          orderId: 'ORD-003',
          items: ['Fresh Fruits Mix 3kg', 'Green Beans 2kg'],
          totalAmount: 1200,
          deliveryTime: '35 mins'
        }
      },
      {
        id: 'consumer_3',
        name: 'Sneha Gupta',
        address: '300m West - Park Lane',
        latitude: vendorLoc.latitude - 0.003,
        longitude: vendorLoc.longitude - 0.006,
        orderCount: 1,
        totalValue: 1500,
        phone: '+91 9876543213',
        isMoving: false,
        hasRequest: true,
        orderDetails: {
          orderId: 'ORD-004',
          items: ['Cauliflower 1pc', 'Peas 1kg'],
          totalAmount: 280,
          deliveryTime: '20 mins'
        }
      },
      {
        id: 'consumer_4',
        name: 'Vikram Singh',
        address: '700m Northeast - Commercial Complex',
        latitude: vendorLoc.latitude + 0.002,
        longitude: vendorLoc.longitude + 0.007,
        orderCount: 4,
        totalValue: 6700,
        phone: '+91 9876543214',
        isMoving: true,
        moveSpeed: 0.00012,
        hasRequest: true,
        orderDetails: {
          orderId: 'ORD-005',
          items: ['Lettuce 500g', 'Cucumber 1kg', 'Bell Peppers 500g'],
          totalAmount: 560,
          deliveryTime: '40 mins'
        }
      }
    ]

    return demoData.map(consumer => ({
      ...consumer,
      distance: calculateDistance(vendorLoc, {
        latitude: consumer.latitude,
        longitude: consumer.longitude
      })
    }))
  }

  // Animate moving consumers (only those already visible)
  useEffect(() => {
    if (!demoMode || consumers.length === 0) return

    const interval = setInterval(() => {
      setConsumers(prevConsumers => 
        prevConsumers.map(consumer => {
          if (consumer.isMoving && vendorLocation) {
            // Move consumer along a circular path
            const angle = (Date.now() / 10000) * consumer.moveSpeed * 360
            const radius = 0.004
            const newLat = vendorLocation.latitude + radius * Math.sin(angle * Math.PI / 180)
            const newLng = vendorLocation.longitude + radius * Math.cos(angle * Math.PI / 180)
            
            return {
              ...consumer,
              latitude: newLat,
              longitude: newLng,
              distance: calculateDistance(vendorLocation, {
                latitude: newLat,
                longitude: newLng
              })
            }
          }
          return consumer
        })
      )
      
      // Also update allPotentialConsumers to keep moving consumers in sync
      setAllPotentialConsumers(prevAll =>
        prevAll.map(consumer => {
          if (consumer.isMoving && vendorLocation) {
            const angle = (Date.now() / 10000) * consumer.moveSpeed * 360
            const radius = 0.004
            const newLat = vendorLocation.latitude + radius * Math.sin(angle * Math.PI / 180)
            const newLng = vendorLocation.longitude + radius * Math.cos(angle * Math.PI / 180)
            
            return {
              ...consumer,
              latitude: newLat,
              longitude: newLng,
              distance: calculateDistance(vendorLocation, {
                latitude: newLat,
                longitude: newLng
              })
            }
          }
          return consumer
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [demoMode, vendorLocation, consumers.length])

  // Sequential nudge connection requests - one consumer at a time
  useEffect(() => {
    if (!demoMode || !isInitialized || !vendorLocation) return

    // Start sequence after 5 seconds
    const startTimer = setTimeout(() => {
      setSequenceActive(true)
    }, 5000)

    return () => clearTimeout(startTimer)
  }, [demoMode, isInitialized, vendorLocation])

  // Handle sequential consumer requests
  useEffect(() => {
    if (!sequenceActive || !demoMode || requestSequenceIndex >= 5) return

    const sendNextRequest = () => {
      if (allPotentialConsumers.length > requestSequenceIndex) {
        const nextConsumer = allPotentialConsumers[requestSequenceIndex]
        
        // Add consumer to visible list
        setConsumers(prev => [...prev, nextConsumer])
        
        // Show the modal for this request
        setCurrentRequestModal(nextConsumer)
        setShowRequestModal(true)
        setPendingRequests(prev => [...prev, nextConsumer])
      }
    }

    // Send request immediately when sequence index changes
    sendNextRequest()
  }, [sequenceActive, requestSequenceIndex, demoMode, allPotentialConsumers])

  // Handle accepting a nudge request
  const handleAcceptRequest = (consumer) => {
    setAcceptedConsumers(prev => [...prev, consumer])
    setPendingRequests(prev => prev.filter(r => r.id !== consumer.id))
    setShowRequestModal(false)
    setCurrentRequestModal(null)

    // Recalculate route with all accepted consumers
    if (vendorLocation) {
      const allAccepted = [...acceptedConsumers, consumer]
      const optimalRoute = findOptimalRoute(vendorLocation, allAccepted)
      if (optimalRoute) {
        setShortestPath(optimalRoute.path)
        setTotalDistance(optimalRoute.totalDistance)
        const routeCoords = pathToCoordinates(optimalRoute.path, vendorLocation, allAccepted)
        setRouteCoordinates(routeCoords)
        setShowRoutes(true)
      }
    }

    Alert.alert(
      'Request Accepted',
      `Connection established with ${consumer.name}. Route updated with new delivery point.`,
      [{ text: 'OK' }]
    )

    // Wait 5 seconds before sending next request
    if (requestSequenceIndex < 4) {
      setTimeout(() => {
        setRequestSequenceIndex(prev => prev + 1)
      }, 5000)
    }
  }

  // Handle declining a nudge request
  const handleDeclineRequest = (consumer) => {
    setPendingRequests(prev => prev.filter(r => r.id !== consumer.id))
    setShowRequestModal(false)
    setCurrentRequestModal(null)

    Alert.alert(
      'Request Declined',
      `Connection request from ${consumer.name} has been declined.`,
      [{ text: 'OK' }]
    )

    // Wait 5 seconds before sending next request
    if (requestSequenceIndex < 4) {
      setTimeout(() => {
        setRequestSequenceIndex(prev => prev + 1)
      }, 5000)
    }
  }

  // Toggle demo mode
  const toggleDemoMode = async () => {
    if (demoMode) {
      // Turning OFF demo mode - load real consumers
      setDemoMode(false)
      setConsumers([])
      setRouteCoordinates([])
      setShortestPath(null)
      setTotalDistance(0)
      setSequenceActive(false)
      setRequestSequenceIndex(0)
      setAllPotentialConsumers([])
      setAcceptedConsumers([])
      setPendingRequests([])
      
      // Try to load real consumers
      await loadRealConsumers()
    } else {
      // Turning ON demo mode - reset and start sequence
      setDemoMode(true)
      setConsumers([])
      setRouteCoordinates([])
      setShortestPath(null)
      setTotalDistance(0)
      setSequenceActive(false)
      setRequestSequenceIndex(0)
      setAcceptedConsumers([])
      setPendingRequests([])
      
      if (vendorLocation) {
        const demoConsumers = generateDemoConsumers(vendorLocation)
        setAllPotentialConsumers(demoConsumers)
      }
    }
  }

  // Load real consumers from API
  const loadRealConsumers = async () => {
    if (!vendorLocation) return

    try {
      setLoading(true)
      const response = await VendorService.getNearbyConsumers(vendorLocation)
      
      if (response.success && response.data.length > 0) {
        const consumersData = response.data.map((consumer, index) => ({
          id: `consumer_${consumer.id || index}`,
          name: consumer.name || `Consumer ${index + 1}`,
          address: consumer.address || 'Unknown Address',
          latitude: consumer.latitude || (vendorLocation.latitude + (Math.random() - 0.5) * 0.01),
          longitude: consumer.longitude || (vendorLocation.longitude + (Math.random() - 0.5) * 0.01),
          orderCount: consumer.activeOrders || Math.floor(Math.random() * 5) + 1,
          totalValue: consumer.orderValue || Math.floor(Math.random() * 10000) + 1000,
          distance: consumer.distance || calculateDistance(vendorLocation, {
            latitude: consumer.latitude || (vendorLocation.latitude + (Math.random() - 0.5) * 0.01),
            longitude: consumer.longitude || (vendorLocation.longitude + (Math.random() - 0.5) * 0.01)
          }),
          phone: consumer.phone || '+91 9876543210',
          isMoving: false
        }))

        setConsumers(consumersData)

        // Calculate optimal route
        const optimalRoute = findOptimalRoute(vendorLocation, consumersData)
        if (optimalRoute) {
          setShortestPath(optimalRoute.path)
          setTotalDistance(optimalRoute.totalDistance)
          const routeCoords = pathToCoordinates(optimalRoute.path, vendorLocation, consumersData)
          setRouteCoordinates(routeCoords)
        }
      } else {
        Alert.alert(
          'No Consumers Found',
          'No consumers with active orders found nearby. Would you like to enable demo mode?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Enable Demo', onPress: () => setDemoMode(true) }
          ]
        )
      }
    } catch (error) {
      console.error('Error loading real consumers:', error)
      Alert.alert(
        'Error Loading Consumers',
        'Could not load nearby consumers. Would you like to enable demo mode?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable Demo', onPress: () => setDemoMode(true) }
        ]
      )
    } finally {
      setLoading(false)
    }
  }

  // Load nearby consumers with active orders
  const loadNearbyConsumers = async () => {
    try {
      // Set default location immediately to avoid long loading
      const defaultLocation = {
        latitude: 28.6139,
        longitude: 77.2090
      }
      
      setVendorLocation(defaultLocation)
      setMapRegion({
        ...defaultLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02
      })
      
      // Initialize with demo mode - start with 0 consumers
      if (!isInitialized) {
        const demoConsumers = generateDemoConsumers(defaultLocation)
        setAllPotentialConsumers(demoConsumers)
        setConsumers([]) // Start with empty list
        setIsInitialized(true)
      }
      
      setLoading(false)

      // Get vendor's actual location in background and update
      getCurrentLocation().then(currentLocation => {
        if (currentLocation) {
          const locationToUse = currentLocation
          setVendorLocation(locationToUse)
          setMapRegion({
            ...locationToUse,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02
          })
          
          // Regenerate demo consumers around actual location (but keep them hidden)
          if (demoMode && allPotentialConsumers.length === 0) {
            const demoConsumers = generateDemoConsumers(locationToUse)
            setAllPotentialConsumers(demoConsumers)
          }
        }
      }).catch(error => {
        console.error('Background location fetch error:', error)
        // Keep using default location
      })
    } catch (error) {
      console.error('Error in loadNearbyConsumers:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNearbyConsumers()
  }, [])

  const handleConsumerSelect = (consumer) => {
    setSelectedConsumer(consumer)
  }

  const handleCallConsumer = (phone) => {
    Alert.alert(
      'Call Consumer',
      `Do you want to call ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {
          // In a real app, use Linking.openURL(`tel:${phone}`)
          Alert.alert('Calling...', `Dialing ${phone}`)
        }}
      ]
    )
  }

  const toggleRoutes = () => {
    setShowRoutes(!showRoutes)
  }

  const ConsumerListItem = ({ consumer }) => (
    <TouchableOpacity 
      style={[
        styles.consumerItem,
        selectedConsumer?.id === consumer.id && styles.selectedConsumerItem,
        acceptedConsumers.find(ac => ac.id === consumer.id) && styles.acceptedConsumerItem
      ]}
      onPress={() => handleConsumerSelect(consumer)}
    >
      <View style={styles.consumerInfo}>
        <View style={styles.consumerNameRow}>
          <Text style={styles.consumerName}>{consumer.name}</Text>
          {consumer.isMoving && (
            <View style={styles.movingBadge}>
              <Icon name="Navigation" size={10} color="white" />
              <Text style={styles.movingBadgeText}>Moving</Text>
            </View>
          )}
          {acceptedConsumers.find(ac => ac.id === consumer.id) && (
            <View style={styles.acceptedBadge}>
              <Icon name="CheckCircle" size={10} color="white" />
              <Text style={styles.acceptedBadgeText}>Connected</Text>
            </View>
          )}
        </View>
        <Text style={styles.consumerAddress}>{consumer.address}</Text>
        <View style={styles.consumerStats}>
          <View style={styles.statItem}>
            <Icon name="ShoppingBag" size={12} color="#FF9800" />
            <Text style={styles.statText}>{consumer.orderCount} orders</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="MapPin" size={12} color="#2196F3" />
            <Text style={styles.statText}>{consumer.distance.toFixed(1)} km</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.callButton}
        onPress={() => handleCallConsumer(consumer.phone)}
      >
        <Icon name="Phone" size={16} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  // Nudge Request Modal Component
  const NudgeRequestModal = () => {
    if (!currentRequestModal) return null

    return (
      <Modal
        visible={showRequestModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => handleDeclineRequest(currentRequestModal)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIcon}>
                <Icon name="Bell" size={24} color="#FF9800" />
              </View>
              <Text style={styles.modalTitle}>New Nudge Connection Request</Text>
              <Text style={styles.modalSubtitle}>A customer nearby wants to connect</Text>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Customer Info */}
              <View style={styles.customerInfoSection}>
                <View style={styles.customerInfoRow}>
                  <Icon name="User" size={20} color="#333" />
                  <Text style={styles.customerName}>{currentRequestModal.name}</Text>
                </View>
                <View style={styles.customerInfoRow}>
                  <Icon name="MapPin" size={16} color="#666" />
                  <Text style={styles.customerAddress}>{currentRequestModal.address}</Text>
                </View>
                <View style={styles.customerInfoRow}>
                  <Icon name="Navigation" size={16} color="#2196F3" />
                  <Text style={styles.customerDistance}>
                    {currentRequestModal.distance.toFixed(1)} km away
                  </Text>
                </View>
              </View>

              {/* Order Details */}
              <View style={styles.orderDetailsSection}>
                <View style={styles.sectionHeader}>
                  <Icon name="ShoppingBag" size={18} color="#FF9800" />
                  <Text style={styles.sectionTitle}>Order Details</Text>
                </View>
                
                <View style={styles.orderInfoRow}>
                  <Text style={styles.orderLabel}>Order ID:</Text>
                  <Text style={styles.orderValue}>{currentRequestModal.orderDetails.orderId}</Text>
                </View>

                <View style={styles.orderItemsContainer}>
                  <Text style={styles.orderItemsTitle}>Items:</Text>
                  {currentRequestModal.orderDetails.items.map((item, index) => (
                    <View key={index} style={styles.orderItem}>
                      <Icon name="Circle" size={6} color="#666" />
                      <Text style={styles.orderItemText}>{item}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.orderSummaryRow}>
                  <View style={styles.orderSummaryItem}>
                    <Icon name="DollarSign" size={16} color="#4CAF50" />
                    <Text style={styles.orderSummaryLabel}>Total Amount</Text>
                    <Text style={styles.orderSummaryValue}>₹{currentRequestModal.orderDetails.totalAmount}</Text>
                  </View>
                  <View style={styles.orderSummaryItem}>
                    <Icon name="Clock" size={16} color="#2196F3" />
                    <Text style={styles.orderSummaryLabel}>Delivery Time</Text>
                    <Text style={styles.orderSummaryValue}>{currentRequestModal.orderDetails.deliveryTime}</Text>
                  </View>
                </View>
              </View>

              {/* Accepted Connections Info */}
              {acceptedConsumers.length > 0 && (
                <View style={styles.acceptedInfoSection}>
                  <View style={styles.acceptedInfoHeader}>
                    <Icon name="Link" size={16} color="#4CAF50" />
                    <Text style={styles.acceptedInfoText}>
                      You have {acceptedConsumers.length} active connection{acceptedConsumers.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Text style={styles.acceptedInfoSubtext}>
                    Accepting this will add to your delivery route
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.declineButton}
                onPress={() => handleDeclineRequest(currentRequestModal)}
              >
                <Icon name="XCircle" size={20} color="#F44336" />
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={() => handleAcceptRequest(currentRequestModal)}
              >
                <Icon name="CheckCircle" size={20} color="white" />
                <Text style={styles.acceptButtonText}>Accept Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>Finding nearby consumers...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Nudge Request Modal */}
      <NudgeRequestModal />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="ArrowLeft" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Nearby Consumers</Text>
          <Text style={styles.headerSubtitle}>
            {consumers.length} consumer{consumers.length !== 1 ? 's' : ''} {demoMode ? '(Demo)' : 'with active orders'}
            {acceptedConsumers.length > 0 && ` • ${acceptedConsumers.length} connected`}
          </Text>
        </View>
        <TouchableOpacity style={styles.routeButton} onPress={toggleRoutes}>
          <Icon name={showRoutes ? "EyeOff" : "Eye"} size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Demo Mode Toggle */}
      <View style={styles.demoModeContainer}>
        <TouchableOpacity 
          style={[styles.demoButton, demoMode && styles.demoButtonActive]} 
          onPress={toggleDemoMode}
          disabled={loading}
        >
          <Icon name={demoMode ? "PlayCircle" : "Database"} size={18} color={demoMode ? "#4CAF50" : "#2196F3"} />
          <Text style={[styles.demoButtonText, demoMode && styles.demoButtonTextActive]}>
            {demoMode ? 'Demo Mode Active' : 'Real Data Mode'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.switchModeButton}
          onPress={toggleDemoMode}
          disabled={loading}
        >
          <Icon name="RefreshCw" size={16} color="#FF9800" />
          <Text style={styles.switchModeText}>
            {demoMode ? 'Load Real Consumers' : 'Enable Demo'}
          </Text>
        </TouchableOpacity>
        {demoMode && (
          <View style={styles.demoIndicator}>
            <View style={styles.demoIndicatorDot} />
            <Text style={styles.demoIndicatorText}>Live Simulation</Text>
          </View>
        )}
      </View>

      {/* Map Section */}
      <View style={styles.mapContainer}>
        {mapRegion && (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={mapRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {/* Vendor Location Marker */}
            {vendorLocation && (
              <Marker
                coordinate={vendorLocation}
                title="Your Location"
                description="Vendor Location"
                pinColor="#FF9800"
              >
                <View style={styles.vendorMarker}>
                  <Icon name="Store" size={20} color="white" />
                </View>
              </Marker>
            )}

            {/* Consumer Markers */}
            {consumers.map((consumer) => {
              const isAccepted = acceptedConsumers.find(ac => ac.id === consumer.id)
              
              return (
                <Marker
                  key={consumer.id}
                  coordinate={{
                    latitude: consumer.latitude,
                    longitude: consumer.longitude
                  }}
                  title={consumer.name}
                  description={`${consumer.orderCount} active orders${consumer.isMoving ? ' • Moving' : ''}${isAccepted ? ' • Connected' : ''}`}
                  onPress={() => handleConsumerSelect(consumer)}
                >
                  <View style={[
                    styles.consumerMarker,
                    selectedConsumer?.id === consumer.id && styles.selectedMarker,
                    consumer.isMoving && styles.movingMarker,
                    isAccepted && styles.acceptedMarker
                  ]}>
                    <Icon name="User" size={16} color="white" />
                    {consumer.isMoving && (
                      <View style={styles.movingIndicator} />
                    )}
                    {isAccepted && (
                      <View style={styles.connectedIndicator}>
                        <Icon name="Check" size={8} color="white" />
                      </View>
                    )}
                  </View>
                </Marker>
              )
            })}

            {/* Optimal Route Polyline */}
            {showRoutes && routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#4CAF50"
                strokeWidth={3}
                lineDashPattern={[5, 5]}
              />
            )}
          </MapView>
        )}

        {/* Route Info Overlay */}
        {showRoutes && shortestPath && (
          <View style={styles.routeInfoOverlay}>
            <View style={styles.routeInfo}>
              <Icon name="Route" size={16} color="#4CAF50" />
              <Text style={styles.routeText}>
                Optimal Route: {totalDistance.toFixed(1)} km
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Consumer List */}
      <View style={styles.consumerListContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {demoMode ? 'Demo Consumers' : 'Consumers with Active Orders'}
          </Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={demoMode ? loadNearbyConsumers : loadRealConsumers}
            disabled={loading}
          >
            <Icon name="RefreshCw" size={16} color="#FF9800" />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={consumers}
          renderItem={({ item }) => <ConsumerListItem consumer={item} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },

  // Header Styles
  header: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  routeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },

  // Demo Mode Styles
  demoModeContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  demoButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginLeft: 8,
  },
  demoButtonTextActive: {
    color: '#4CAF50',
  },
  switchModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  switchModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
    marginLeft: 8,
  },
  demoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  demoIndicatorText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },

  // Map Styles
  mapContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  vendorMarker: {
    backgroundColor: '#FF9800',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: 'white',
  },
  consumerMarker: {
    backgroundColor: '#2196F3',
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: 'white',
    position: 'relative',
  },
  selectedMarker: {
    backgroundColor: '#4CAF50',
    transform: [{ scale: 1.2 }],
  },
  movingMarker: {
    backgroundColor: '#FF9800',
  },
  acceptedMarker: {
    backgroundColor: '#4CAF50',
  },
  movingIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },
  connectedIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 1,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeInfoOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
  },
  routeInfo: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  routeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },

  // Consumer List Styles
  consumerListContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  listContent: {
    padding: 20,
  },
  consumerItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedConsumerItem: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  acceptedConsumerItem: {
    backgroundColor: '#E8F5E9',
  },
  consumerInfo: {
    flex: 1,
  },
  consumerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  consumerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  movingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  movingBadgeText: {
    fontSize: 9,
    color: 'white',
    fontWeight: '600',
    marginLeft: 3,
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  acceptedBadgeText: {
    fontSize: 9,
    color: 'white',
    fontWeight: '600',
    marginLeft: 3,
  },
  consumerAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  consumerStats: {
    flexDirection: 'row',
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  callButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 10,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    backgroundColor: '#FFF3E0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  modalHeaderIcon: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 12,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  modalContent: {
    maxHeight: 400,
  },
  customerInfoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  customerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  customerAddress: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  customerDistance: {
    fontSize: 14,
    color: '#2196F3',
    marginLeft: 8,
    fontWeight: '500',
  },
  orderDetailsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  orderItemsContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  orderItemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginLeft: 10,
  },
  orderItemText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  orderSummaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  orderSummaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  orderSummaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  acceptedInfoSection: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    margin: 20,
    borderRadius: 10,
  },
  acceptedInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  acceptedInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  acceptedInfoSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    marginLeft: 24,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  declineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#F44336',
    backgroundColor: 'white',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 8,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
})

export default VNearbyConsumers