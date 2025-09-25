import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import Icon from '../../Icon'
import { useNavigation } from '@react-navigation/native';

const ParameterCard = ({ icon, label, value, unit, color }) => {
  return (
    <View style={styles.parameterCard}>
      <View style={styles.parameterHeader}>
        <Icon name={icon} size={20} color={color} />
        <Text style={styles.parameterLabel}>{label}</Text>
      </View>
      <View style={styles.parameterValue}>
        <Text style={[styles.valueText, { color }]}>{value}</Text>
        <Text style={styles.unitText}>{unit}</Text>
      </View>
      <View style={styles.bluetoothIndicator}>
        <Icon name="Bluetooth" size={12} color="#2196F3" />
        <Text style={styles.bluetoothText}>IoT Device</Text>
      </View>
    </View>
  )
}

const RecommendationItem = ({ crop, suitability, reason }) => {
  const getSuitabilityColor = (level) => {
    switch (level) {
      case 'High': return '#4CAF50'
      case 'Medium': return '#FF9800'
      case 'Low': return '#F44336'
      default: return '#666'
    }
  }

  return (
    <View style={styles.recommendationItem}>
      <View style={styles.recommendationHeader}>
        <Icon name="Leaf" size={20} color={getSuitabilityColor(suitability)} />
        <View style={styles.recommendationInfo}>
          <Text style={styles.cropName}>{crop}</Text>
          <View style={styles.suitabilityContainer}>
            <Text style={[styles.suitabilityText, { color: getSuitabilityColor(suitability) }]}>
              {suitability} Suitability
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.reasonText}>{reason}</Text>
    </View>
  )
}

const CropRecommendation = () => {
  const navigation = useNavigation();

  const [isConnected, setIsConnected] = useState(true) // Mock IoT connection status
  const [isLoading, setIsLoading] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)

  // Mock IoT sensor data - in real app, this would come from bluetooth device
  const [parameters, setParameters] = useState({
    nitrogen: 0.0,
    phosphorus: 0.0,
    potassium: 0.0,
    temperature: 0.0,
    humidity: 0.0,
    phLevel: 0.0,
    rainfall: 0.0
  })
  
  const [isFetchingData, setIsFetchingData] = useState(false)

  // Mock recommendations data
  const [recommendations, setRecommendations] = useState([])

  const parameterConfig = [
    { key: 'nitrogen', label: 'Nitrogen', unit: 'ppm', icon: 'Atom', color: '#2196F3' },
    { key: 'phosphorus', label: 'Phosphorus', unit: 'ppm', icon: 'Zap', color: '#FF9800' },
    { key: 'potassium', label: 'Potassium', unit: 'ppm', icon: 'Circle', color: '#9C27B0' },
    { key: 'temperature', label: 'Temperature', unit: '°C', icon: 'Thermometer', color: '#F44336' },
    { key: 'humidity', label: 'Humidity', unit: '%', icon: 'Droplets', color: '#00BCD4' },
    { key: 'phLevel', label: 'pH Level', unit: '', icon: 'Flask', color: '#795548' },
    { key: 'rainfall', label: 'Rainfall', unit: 'mm', icon: 'CloudRain', color: '#607D8B' }
  ]

  const mockRecommendations = [
    {
      crop: 'Rice',
      suitability: 'High',
      reason: 'High humidity and adequate rainfall make it ideal for rice cultivation.'
    },
    {
      crop: 'Wheat',
      suitability: 'Medium',
      reason: 'Temperature and pH are suitable, but may need irrigation support.'
    },
    {
      crop: 'Maize',
      suitability: 'High',
      reason: 'Excellent nitrogen levels and temperature range for maize growth.'
    },
    {
      crop: 'Cotton',
      suitability: 'Medium',
      reason: 'Good potassium levels but may require pH adjustment.'
    },
    {
      crop: 'Sugarcane',
      suitability: 'Low',
      reason: 'Current rainfall may be insufficient for optimal sugarcane growth.'
    }
  ]

  // Function to fetch dummy data from IoT device
  const handleFetchDummyData = () => {
    setIsFetchingData(true)
    
    // Simulate IoT data fetching delay
    setTimeout(() => {
      setParameters({
        nitrogen: 45.2 + (Math.random() - 0.5) * 10,
        phosphorus: 38.7 + (Math.random() - 0.5) * 8,
        potassium: 42.1 + (Math.random() - 0.5) * 9,
        temperature: 26.5 + (Math.random() - 0.5) * 4,
        humidity: 68.3 + (Math.random() - 0.5) * 15,
        phLevel: 6.8 + (Math.random() - 0.5) * 1,
        rainfall: 125.4 + (Math.random() - 0.5) * 30
      })
      setIsFetchingData(false)
    }, 1500) // 1.5 second delay to simulate fetching
  }

  const handleGetRecommendations = () => {
    setIsLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      setRecommendations(mockRecommendations)
      setShowRecommendations(true)
      setIsLoading(false)
    }, 2000)
  }

  const handleSaveParameters = () => {
    Alert.alert(
      'Parameters Saved',
      'Current sensor parameters have been saved successfully.',
      [
        { text: 'OK', style: 'default' },
        { 
          text: 'View Analysis',
          style: 'default',
          onPress: () => {
            // Navigate to Parameter Analysis with the 7 parameter values
            navigation.navigate('ParameterAnalysis', {
              parameters: {
                nitrogen: parameters.nitrogen,
                phosphorus: parameters.phosphorus,
                potassium: parameters.potassium,
                temperature: parameters.temperature,
                humidity: parameters.humidity,
                phLevel: parameters.phLevel,
                rainfall: parameters.rainfall
              },
              parameterConfig: parameterConfig
            })
          }
        }
      ]
    )
  }

  const handleReset = () => {
    Alert.alert(
      'Reset Parameters',
      'Are you sure you want to reset to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setParameters({
              nitrogen: 0.0,
              phosphorus: 0.0,
              potassium: 0.0,
              temperature: 0.0,
              humidity: 0.0,
              phLevel: 0.0,
              rainfall: 0.0
            })
            setShowRecommendations(false)
            setRecommendations([])
          }
        }
      ]
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => {
            // Navigation back - replace with actual navigation
            navigation.goBack()
          }}>
            <Icon name="ArrowLeft" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Crop Recommendation</Text>
            <Text style={styles.headerSubtitle}>AI-powered crop suggestions based on soil parameters</Text>
          </View>
        </View>
        
        {/* Connection Status */}
        <View style={[styles.connectionStatus, { backgroundColor: isConnected ? 'rgba(33, 150, 243, 0.2)' : 'rgba(244, 67, 54, 0.2)' }]}>
          <Icon 
            name={isConnected ? "Bluetooth" : "BluetoothOff"} 
            size={16} 
            color={isConnected ? "#2196F3" : "#F44336"} 
          />
          <Text style={[styles.connectionText, { color: isConnected ? "#2196F3" : "#F44336" }]}>
            {isConnected ? "IoT Device Connected" : "IoT Device Disconnected"}
          </Text>
        </View>
      </View>

      {/* Parameters Section */}
      <View style={styles.parametersSection}>
        <Text style={styles.sectionTitle}>Soil & Environmental Parameters</Text>
        <Text style={styles.sectionSubtitle}>
          Data from IoT sensors (Press "Fetch Dummy Data" to update)
        </Text>
        
        <View style={styles.parametersGrid}>
          {parameterConfig.map((param) => (
            <ParameterCard
              key={param.key}
              icon={param.icon}
              label={param.label}
              value={parameters[param.key].toFixed(1)}
              unit={param.unit}
              color={param.color}
            />
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonSection}>
        {/* Fetch Dummy Data Button */}
        <TouchableOpacity 
          style={[styles.button, styles.fetchDataButton]} 
          onPress={handleFetchDummyData}
          disabled={isFetchingData || !isConnected}
        >
          {isFetchingData ? (
            <>
              <Icon name="Loader" size={20} color="white" />
              <Text style={styles.buttonText}>Fetching Data...</Text>
            </>
          ) : (
            <>
              <Icon name="Download" size={20} color="white" />
              <Text style={styles.buttonText}>Fetch Dummy Data</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={handleGetRecommendations}
          disabled={isLoading || !isConnected}
        >
          {isLoading ? (
            <>
              <Icon name="Loader" size={20} color="white" />
              <Text style={styles.buttonText}>Analyzing...</Text>
            </>
          ) : (
            <>
              <Icon name="Lightbulb" size={20} color="white" />
              <Text style={styles.buttonText}>Get Recommendations</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.secondaryButtons}>
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={handleSaveParameters}
            disabled={!isConnected}
          >
            <Icon name="Save" size={18} color="#4CAF50" />
            <Text style={[styles.buttonText, { color: "#4CAF50" }]}>Save Parameters</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={handleReset}
          >
            <Icon name="RotateCcw" size={18} color="#F44336" />
            <Text style={[styles.buttonText, { color: "#F44336" }]}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recommendations Section */}
      {showRecommendations && recommendations.length > 0 && (
        <View style={styles.recommendationsSection}>
          <View style={styles.recommendationsHeader}>
            <Icon name=
            "Target" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Crop Recommendations</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Based on current soil and environmental conditions
          </Text>
          
          <View style={styles.recommendationsList}>
            {recommendations.map((recommendation, index) => (
              <RecommendationItem
                key={index}
                crop={recommendation.crop}
                suitability={recommendation.suitability}
                reason={recommendation.reason}
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  // Header Styles
  header: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    marginRight: 15,
    marginTop: 2,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },

  // Parameters Section
  parametersSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  parametersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  parameterCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: '47%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  parameterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  parameterLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  parameterValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  valueText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  unitText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 4,
  },
  bluetoothIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bluetoothText: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 4,
    fontWeight: '500',
  },

  // Button Section
  buttonSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  fetchDataButton: {
    backgroundColor: '#2196F3',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },

  // Recommendations Section
  recommendationsSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  suitabilityContainer: {
    alignSelf: 'flex-start',
  },
  suitabilityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
})

export default CropRecommendation