import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Alert, TouchableOpacity } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Icon from '../Icon'
import AsyncStorage from '@react-native-async-storage/async-storage'
import WeatherService from '../services/weatherService'
import OrdersService from '../services/ordersService'
import CropHealthService from '../services/CropHealthService'
import CropHealthNotificationService from '../services/CropHealthNotificationService'
import { useNavigation } from '@react-navigation/native'

const { width } = Dimensions.get('window')

const CircularProgress = ({ percentage, size = 100, strokeWidth = 8, color = '#4CAF50' }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E0E0E0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.progressText}>
        <Text style={[styles.percentageText, { color }]}>{percentage}%</Text>
      </View>
    </View>
  )
}

const LinearProgress = ({ percentage, height = 8, color = '#2196F3', backgroundColor = '#E0E0E0' }) => {
  return (
    <View style={[styles.linearProgressContainer, { height, backgroundColor, borderRadius: height / 2 }]}>
      <View 
        style={[
          styles.linearProgressBar, 
          { 
            width: `${percentage}%`, 
            height, 
            backgroundColor: color, 
            borderRadius: height / 2 
          }
        ]} 
      />
    </View>
  )
}

const QuickActionCard = ({ icon, title, onPress, color = '#4CAF50' }) => {
  return (
    <TouchableOpacity style={[styles.quickActionCard, { borderLeftColor: color }]} onPress={onPress}>
      <Icon name={icon} size={24} color={color} />
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  )
}

const Dashboard = () => {
  const navigation = useNavigation()
  const [greeting, setGreeting] = useState('')
  const [userData, setUserData] = useState(null)
  
  // Weather data states
  const [weatherData, setWeatherData] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [weatherError, setWeatherError] = useState(null)
  
  // Orders data states
  const [ordersData, setOrdersData] = useState(null)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState(null)
  
  // Calculated dashboard metrics
  const [activeOrders, setActiveOrders] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  
  // Crop health data from Gemini analysis
  const [cropHealth, setCropHealth] = useState(85)
  const [cropHealthStatus, setCropHealthStatus] = useState('Good')
  const [cropHealthDescription, setCropHealthDescription] = useState('Your crops are in excellent condition with optimal growth parameters.')
  const [isHealthDataFresh, setIsHealthDataFresh] = useState(false)

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours()
      
      if (currentHour < 12) {
        setGreeting('Good Morning')
      } else if (currentHour < 17) {
        setGreeting('Good Afternoon')
      } else {
        setGreeting('Good Evening')
      }
    }

    updateGreeting()
    loadUserData()
    loadOrdersData()
    loadCropHealthData()

    // Listen for navigation focus to reload crop health data
    const focusUnsubscribe = navigation.addListener('focus', () => {
      console.log('Dashboard focused, reloading crop health data...')
      loadCropHealthData()
    })

    // Subscribe to crop health updates from other pages
    const healthUpdateUnsubscribe = CropHealthNotificationService.subscribe((updateData) => {
      console.log('Received crop health update in Dashboard:', updateData)
      // Automatically reload health data when updated from another page
      loadCropHealthData()
    })
    
    return () => {
      focusUnsubscribe()
      healthUpdateUnsubscribe()
    }
  }, [navigation])

  // Load user data from AsyncStorage and fetch weather
  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData')
      if (storedUserData) {
        const user = JSON.parse(storedUserData)
        setUserData(user)
        
        // Extract coordinates from user location
        if (user.location && user.location.coordinates) {
          const [longitude, latitude] = user.location.coordinates
          console.log('User coordinates:', { latitude, longitude })
          await fetchWeatherData(latitude, longitude)
        } else {
          // Fallback coordinates (Ludhiana, Punjab) if no user location
          await fetchWeatherData(30.8408, 75.8573)
        }
      } else {
        // Default coordinates for Ludhiana, Punjab
        await fetchWeatherData(30.8408, 75.8573)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      // Default coordinates for Ludhiana, Punjab
      await fetchWeatherData(30.8408, 75.8573)
    }
  }

  // Fetch weather data from OpenWeatherMap API
  const fetchWeatherData = async (latitude, longitude) => {
    try {
      setWeatherLoading(true)
      setWeatherError(null)
      
      console.log('Fetching weather for coordinates:', { latitude, longitude })
      const weather = await WeatherService.getCurrentWeather(latitude, longitude)
      
      console.log('Weather data received:', weather)
      setWeatherData(weather)
    } catch (error) {
      console.error('Weather fetch error:', error)
      setWeatherError(error.message)
      
      // Set fallback weather data
      setWeatherData({
        temperature: 28,
        weatherCondition: 'Partly Cloudy',
        rainProbability: 35,
        condition: 'Partly Cloudy',
        city: 'Ludhiana',
        humidity: 65,
        windSpeed: 5.2,
        weatherIcon: 'CloudSun',
        weatherColor: '#42A5F5'
      })
    } finally {
      setWeatherLoading(false)
    }
  }

  // Load orders data from backend
  const loadOrdersData = async () => {
    try {
      setOrdersLoading(true)
      setOrdersError(null)
      
      console.log('Fetching orders data...')
      
      // Fetch user's orders as seller (farmer selling crops)
      const response = await OrdersService.getUserOrders('seller')
      
      if (response.success && response.data && response.data.orders) {
        const orders = response.data.orders
        console.log('Orders data received:', orders)
        
        setOrdersData(orders)
        
        // Calculate metrics from real data
        const metrics = OrdersService.getDashboardMetrics(orders)
        
        setActiveOrders(metrics.activeOrders)
        setTotalRevenue(metrics.totalRevenue)
        
        console.log('Dashboard metrics calculated:', metrics)
      } else {
        throw new Error(response.message || 'Failed to fetch orders')
      }
    } catch (error) {
      console.error('Orders fetch error:', error)
      setOrdersError(error.message)
      
      // Use mock data as fallback for demonstration
      console.log('Using mock orders data as fallback')
      const mockOrders = OrdersService.generateMockOrderData()
      setOrdersData(mockOrders)
      
      const mockMetrics = OrdersService.getDashboardMetrics(mockOrders)
      setActiveOrders(mockMetrics.activeOrders)
      setTotalRevenue(mockMetrics.totalRevenue)
      
      console.log('Mock dashboard metrics:', mockMetrics)
    } finally {
      setOrdersLoading(false)
    }
  }

  // Get user name for greeting
  const getUserName = () => {
    if (userData && userData.name) {
      return userData.name.split(' ')[0] // First name only
    }
    return 'Farmer'
  }

  // Load crop health data from CropHealthService
  const loadCropHealthData = async () => {
    try {
      console.log('Loading crop health data...')
      const healthInfo = await CropHealthService.getDashboardHealthInfo()
      
      setCropHealth(healthInfo.percentage)
      setCropHealthStatus(healthInfo.status)
      setCropHealthDescription(healthInfo.description)
      setIsHealthDataFresh(healthInfo.isDataFresh)
      
      console.log('Crop health data loaded:', healthInfo)
    } catch (error) {
      console.error('Error loading crop health data:', error)
      
      // Keep default values on error
      setCropHealth(85)
      setCropHealthStatus('Good')
      setCropHealthDescription('Your crops are in excellent condition with optimal growth parameters.')
      setIsHealthDataFresh(false)
    }
  }

  // Render weather loading state
  const renderWeatherLoading = () => (
    <View style={styles.weatherLoadingContainer}>
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text style={styles.weatherLoadingText}>Loading weather data...</Text>
    </View>
  )

  // Render weather error state
  const renderWeatherError = () => (
    <View style={styles.weatherErrorContainer}>
      <Icon name="AlertCircle" size={24} color="#FF4444" />
      <Text style={styles.weatherErrorText}>Unable to load weather data</Text>
      <Text style={styles.weatherErrorSubtext}>Using default values</Text>
    </View>
  )

  // Navigation handlers for Quick Actions
  const handleViewOrders = () => {
    console.log('Navigating to Orders')
    navigation.navigate('Orders')
  }

  const handleCropRecommendation = () => {
    console.log('Navigating to CropRecommendation')
    navigation.navigate('CropRecommendation')
  }

  const handleDiseaseDetection = () => {
    console.log('Navigating to DiseaseDetection')
    navigation.navigate('DiseaseDetection')
  }

  const handleParameterAnalysis = () => {
    console.log('Navigating to ParameterAnalysis')
    navigation.navigate('ParameterAnalysis')
  }

  // Refresh all dashboard data
  const refreshDashboard = async () => {
    console.log('Refreshing dashboard data...')
    await Promise.all([
      loadUserData(),
      loadOrdersData(),
      loadCropHealthData()
    ])
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.greetingText}>{greeting}, {getUserName()}!</Text>
            <Text style={styles.subText}>
              {userData?.address ? `${userData.address}` : 'Welcome to your farm dashboard'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={refreshDashboard}
            disabled={weatherLoading || ordersLoading}
          >
            <Icon 
              name="RefreshCw" 
              size={20} 
              color="white" 
              style={{
                transform: [{ 
                  rotate: (weatherLoading || ordersLoading) ? '360deg' : '0deg' 
                }]
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weather Data Section */}
      <View style={styles.weatherSection}>
        <View style={styles.weatherCard}>
          <View style={styles.weatherHeader}>
            {weatherLoading ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
              <Icon 
                name={weatherData?.weatherIcon || 'CloudSun'} 
                size={28} 
                color={weatherData?.weatherColor || '#42A5F5'} 
              />
            )}
            <Text style={styles.weatherTitle}>
              {weatherData?.city ? `Weather in ${weatherData.city}` : 'Weather Today'}
            </Text>
          </View>
          
          {weatherLoading ? (
            renderWeatherLoading()
          ) : weatherError && !weatherData ? (
            renderWeatherError()
          ) : (
            <View style={styles.weatherContent}>
              <Text style={styles.temperatureText}>
                {weatherData?.temperature || 28}°C
              </Text>
              <Text style={styles.conditionText}>
                {weatherData?.weatherCondition || weatherData?.description || 'Partly Cloudy'}
              </Text>
              
              <View style={styles.weatherDetailsRow}>
                <View style={styles.weatherDetail}>
                  <Icon name="Droplets" size={16} color="#2196F3" />
                  <Text style={styles.weatherDetailText}>
                    Humidity: {weatherData?.humidity || 65}%
                  </Text>
                </View>
                <View style={styles.weatherDetail}>
                  <Icon name="Wind" size={16} color="#4CAF50" />
                  <Text style={styles.weatherDetailText}>
                    Wind: {weatherData?.windSpeed || 5.2} m/s
                  </Text>
                </View>
              </View>
              
              <View style={styles.rainSection}>
                <Text style={styles.rainLabel}>Rain Probability</Text>
                <LinearProgress 
                  percentage={weatherData?.rainProbability || 35} 
                  height={6} 
                  color="#2196F3" 
                />
                <Text style={styles.rainPercentage}>
                  {weatherData?.rainProbability || 35}%
                </Text>
              </View>

              {weatherData?.sunrise && weatherData?.sunset && (
                <View style={styles.sunTimesRow}>
                  <View style={styles.sunTime}>
                    <Icon name="Sunrise" size={16} color="#FFB74D" />
                    <Text style={styles.sunTimeText}>
                      {WeatherService.formatTime(weatherData.sunrise)}
                    </Text>
                  </View>
                  <View style={styles.sunTime}>
                    <Icon name="Sunset" size={16} color="#FF6B35" />
                    <Text style={styles.sunTimeText}>
                      {WeatherService.formatTime(weatherData.sunset)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Crop Health Section */}
      <View style={styles.cropHealthSection}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon 
              name="Activity" 
              size={24} 
              color={CropHealthService.getHealthColor(cropHealth)} 
            />
            <View style={styles.healthHeaderInfo}>
              <Text style={styles.cardTitle}>Crop Health Analysis</Text>
              <View style={styles.healthStatusContainer}>
                <Text style={[
                  styles.healthStatusText, 
                  { color: CropHealthService.getHealthColor(cropHealth) }
                ]}>
                  {cropHealthStatus}
                </Text>
                {!isHealthDataFresh && (
                  <View style={styles.staleDataIndicator}>
                    <Icon name="Clock" size={12} color="#FF9800" />
                    <Text style={styles.staleDataText}>Outdated</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.cropHealthContent}>
            <CircularProgress 
              percentage={cropHealth} 
              size={100} 
              strokeWidth={8} 
              color={CropHealthService.getHealthColor(cropHealth)} 
            />
            <View style={styles.cropHealthInfo}>
              <Text style={styles.cropHealthDescription}>
                {cropHealthDescription}
              </Text>
              <View style={styles.healthActions}>
                <TouchableOpacity 
                  style={styles.updateHealthButton}
                  onPress={() => navigation.navigate('CropRecommendation')}
                >
                  <Icon name="Refresh" size={16} color="#4CAF50" />
                  <Text style={styles.updateHealthText}>
                    {isHealthDataFresh ? 'View Details' : 'Update Analysis'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Order Information Section */}
      <View style={styles.orderInfoSection}>
        <View style={styles.orderInfoGrid}>
          <View style={[styles.card, styles.orderCard]}>
            <View style={styles.cardHeader}>
              <Icon name="DollarSign" size={24} color="#FF6B35" />
              <Text style={styles.cardTitle}>Revenue</Text>
            </View>
            {ordersLoading ? (
              <View style={styles.orderLoadingContainer}>
                <ActivityIndicator size="small" color="#FF6B35" />
                <Text style={styles.orderLoadingText}>Loading...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.revenueAmount}>
                  {OrdersService.formatCurrency(totalRevenue)}
                </Text>
                <Text style={styles.revenueLabel}>
                  {ordersError ? 'Demo Data' : 'From Delivered Orders'}
                </Text>
              </>
            )}
          </View>

          <View style={[styles.card, styles.orderCard]}>
            <View style={styles.cardHeader}>
              <Icon name="Package" size={24} color="#9C27B0" />
              <Text style={styles.cardTitle}>Orders</Text>
            </View>
            {ordersLoading ? (
              <View style={styles.orderLoadingContainer}>
                <ActivityIndicator size="small" color="#9C27B0" />
                <Text style={styles.orderLoadingText}>Loading...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.orderAmount}>{activeOrders}</Text>
                <Text style={styles.orderLabel}>
                  {ordersError ? 'Demo Data' : 'Pending + Confirmed + Transit'}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Quick Actions Section */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionCard 
            icon="ShoppingCart" 
            title="View Orders" 
            color="#FF6B35"
            onPress={handleViewOrders}
          />
          <QuickActionCard 
            icon="Leaf" 
            title="Crop Recommendation" 
            color="#4CAF50"
            onPress={handleCropRecommendation}
          />
          <QuickActionCard 
            icon="Search" 
            title="Disease Detection" 
            color="#F44336"
            onPress={handleDiseaseDetection}
          />
          <QuickActionCard 
            icon="ChartBar" 
            title="Parameter Analysis" 
            color="#2196F3"
            onPress={handleParameterAnalysis}
          />
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 10,
    marginLeft: 15,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  // Weather Section
  weatherSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  weatherCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  weatherContent: {
    alignItems: 'center',
  },
  temperatureText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  conditionText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  rainSection: {
    width: '100%',
    alignItems: 'center',
  },
  rainLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  rainPercentage: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 5,
    fontWeight: '600',
  },
  
  // Weather loading and error states
  weatherLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  weatherLoadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  weatherErrorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  weatherErrorText: {
    fontSize: 14,
    color: '#FF4444',
    marginTop: 8,
    fontWeight: '600',
  },
  weatherErrorSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  
  // Weather details
  weatherDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  weatherDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  
  // Sun times
  sunTimesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 5,
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  sunTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sunTimeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500'
  },
  
  // Linear Progress
  linearProgressContainer: {
    width: '80%',
    borderRadius: 4,
  },
  linearProgressBar: {
    borderRadius: 4,
  },
  
  // Crop Health Section
  cropHealthSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  cropHealthContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  cropHealthInfo: {
    flex: 1,
  },
  cropHealthDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  // Order Information Section
  orderInfoSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  orderInfoGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  orderCard: {
    flex: 1,
    alignItems: 'center',
  },
  revenueAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 5,
  },
  revenueLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginBottom: 5,
  },
  
  // Quick Actions Section
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  quickActionsGrid: {
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 15,
  },
  
  // Common Card Styles
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  
  // Enhanced Health Header
  healthHeaderInfo: {
    flex: 1,
    marginLeft: 8,
  },
  healthStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  healthStatusText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  staleDataIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  staleDataText: {
    fontSize: 10,
    color: '#FF9800',
    marginLeft: 2,
    fontWeight: '500',
  },
  
  // Health Actions
  healthActions: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  updateHealthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  updateHealthText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  orderLabel: {
    fontSize: 14,
    color: '#666',
  },
  
  // Order loading states
  orderLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  orderLoadingText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  
  // Progress Text (for circular progress)
  progressText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default Dashboard