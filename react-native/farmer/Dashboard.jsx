import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Icon from '../Icon'

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
    <View style={[styles.quickActionCard, { borderLeftColor: color }]}>
      <Icon name={icon} size={24} color={color} />
      <Text style={styles.quickActionText}>{title}</Text>
    </View>
  )
}

const Dashboard = () => {
  const [greeting, setGreeting] = useState('')
  
  // Mock data
  const [temperature] = useState(28)
  const [weatherCondition] = useState('Partly Cloudy') // Sunny, Cloudy, Partly Cloudy, Rainy
  const [rainProbability] = useState(35)
  const [cropHealth] = useState(85)
  const [totalRevenue] = useState(45000)
  const [activeOrders] = useState(12)

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
  }, [])

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Sunny':
        return 'Sun'
      case 'Cloudy':
        return 'Cloud'
      case 'Partly Cloudy':
        return 'CloudSun'
      case 'Rainy':
        return 'CloudRain'
      default:
        return 'Sun'
    }
  }

  const getWeatherColor = (condition) => {
    switch (condition) {
      case 'Sunny':
        return '#FFB74D'
      case 'Cloudy':
        return '#90A4AE'
      case 'Partly Cloudy':
        return '#42A5F5'
      case 'Rainy':
        return '#5C6BC0'
      default:
        return '#FFB74D'
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.greetingText}>{greeting}!</Text>
        <Text style={styles.subText}>Welcome to your farm dashboard</Text>
      </View>

      {/* Weather Data Section */}
      <View style={styles.weatherSection}>
        <View style={styles.weatherCard}>
          <View style={styles.weatherHeader}>
            <Icon name={getWeatherIcon(weatherCondition)} size={28} color={getWeatherColor(weatherCondition)} />
            <Text style={styles.weatherTitle}>Weather Today</Text>
          </View>
          
          <View style={styles.weatherContent}>
            <Text style={styles.temperatureText}>{temperature}°C</Text>
            <Text style={styles.conditionText}>{weatherCondition}</Text>
            
            <View style={styles.rainSection}>
              <Text style={styles.rainLabel}>Rain Probability</Text>
              <LinearProgress 
                percentage={rainProbability} 
                height={6} 
                color="#2196F3" 
              />
              <Text style={styles.rainPercentage}>{rainProbability}%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Crop Health Section */}
      <View style={styles.cropHealthSection}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="Activity" size={24} color="#4CAF50" />
            <Text style={styles.cardTitle}>Crop Health Analysis</Text>
          </View>
          <View style={styles.cropHealthContent}>
            <CircularProgress 
              percentage={cropHealth} 
              size={100} 
              strokeWidth={8} 
              color="#4CAF50" 
            />
            <View style={styles.cropHealthInfo}>
              <Text style={styles.cropHealthDescription}>
                Your crops are in excellent condition with optimal growth parameters. 
                Soil moisture and nutrient levels are well-balanced.
              </Text>
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
            <Text style={styles.revenueAmount}>₹{totalRevenue.toLocaleString()}</Text>
            <Text style={styles.revenueLabel}>Total Revenue</Text>
          </View>

          <View style={[styles.card, styles.orderCard]}>
            <View style={styles.cardHeader}>
              <Icon name="Package" size={24} color="#9C27B0" />
              <Text style={styles.cardTitle}>Orders</Text>
            </View>
            <Text style={styles.orderAmount}>{activeOrders}</Text>
            <Text style={styles.orderLabel}>Active Orders</Text>
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
          />
          <QuickActionCard 
            icon="Leaf" 
            title="Crop Recommendation" 
            color="#4CAF50"
          />
          <QuickActionCard 
            icon="Search" 
            title="Disease Detection" 
            color="#F44336"
          />
          <QuickActionCard 
            icon="ChartBar" 
            title="Parameter Analysis" 
            color="#2196F3"
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
  orderLabel: {
    fontSize: 14,
    color: '#666',
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