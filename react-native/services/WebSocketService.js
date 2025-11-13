import AsyncStorage from '@react-native-async-storage/async-storage'
import API_CONFIG from '../config/api'

class WebSocketService {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.listeners = {}
    this.isConnected = false
    this.heartbeatInterval = null
  }

  // Connect to WebSocket server
  async connect(userRole = 'consumer') {
    try {
      const token = await AsyncStorage.getItem('userToken')
      if (!token) {
        console.error('No auth token found')
        return false
      }

      // Convert HTTP URL to WebSocket URL
      const wsUrl = API_CONFIG.BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://')
      const socketUrl = `${wsUrl}/socket?token=${token}&role=${userRole}`

      console.log('Connecting to WebSocket:', socketUrl)

      this.ws = new WebSocket(socketUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.notifyListeners('connected', { connected: true })
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('WebSocket message received:', data.type)
          this.handleMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.notifyListeners('error', { error })
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.isConnected = false
        this.stopHeartbeat()
        this.notifyListeners('disconnected', { connected: false })
        this.attemptReconnect(userRole)
      }

      return true
    } catch (error) {
      console.error('Error connecting to WebSocket:', error)
      return false
    }
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.ws) {
      this.stopHeartbeat()
      this.ws.close()
      this.ws = null
      this.isConnected = false
    }
  }

  // Attempt to reconnect
  attemptReconnect(userRole) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
      
      setTimeout(() => {
        this.connect(userRole)
      }, this.reconnectDelay)
    } else {
      console.error('Max reconnection attempts reached')
      this.notifyListeners('reconnect_failed', { attempts: this.reconnectAttempts })
    }
  }

  // Send message through WebSocket
  send(type, data) {
    if (this.ws && this.isConnected) {
      const message = JSON.stringify({ type, data })
      this.ws.send(message)
      return true
    } else {
      console.warn('WebSocket not connected')
      return false
    }
  }

  // Handle incoming messages
  handleMessage(message) {
    const { type, data } = message

    switch (type) {
      case 'location_update':
        this.notifyListeners('location_update', data)
        break
      
      case 'vendor_location_update':
        this.notifyListeners('vendor_location_update', data)
        break
      
      case 'consumer_location_update':
        this.notifyListeners('consumer_location_update', data)
        break
      
      case 'order_status_update':
        this.notifyListeners('order_status_update', data)
        break
      
      case 'new_order':
        this.notifyListeners('new_order', data)
        break
      
      case 'pong':
        // Heartbeat response
        break
      
      default:
        console.log('Unknown message type:', type)
        this.notifyListeners(type, data)
    }
  }

  // Subscribe to location updates for nearby vendors
  subscribeToNearbyVendors(latitude, longitude, radius = 10) {
    this.send('subscribe_nearby_vendors', {
      latitude,
      longitude,
      radius
    })
  }

  // Unsubscribe from nearby vendors
  unsubscribeFromNearbyVendors() {
    this.send('unsubscribe_nearby_vendors', {})
  }

  // Subscribe to consumer location for an order (vendor)
  subscribeToOrderConsumerLocation(orderId) {
    this.send('subscribe_order_consumer', {
      orderId
    })
  }

  // Unsubscribe from order consumer location
  unsubscribeFromOrderConsumerLocation(orderId) {
    this.send('unsubscribe_order_consumer', {
      orderId
    })
  }

  // Broadcast location update
  broadcastLocation(location, role) {
    this.send('location_update', {
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      },
      accuracy: location.accuracy,
      heading: location.heading,
      speed: location.speed,
      timestamp: location.timestamp,
      role
    })
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)

    // Return unsubscribe function
    return () => {
      this.off(event, callback)
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
    }
  }

  // Notify all listeners for an event
  notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in ${event} listener:`, error)
        }
      })
    }
  }

  // Start heartbeat to keep connection alive
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send('ping', { timestamp: Date.now() })
      }
    }, 30000) // Every 30 seconds
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected
  }
}

export default new WebSocketService()
