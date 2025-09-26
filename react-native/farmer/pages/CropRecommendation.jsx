import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native'
import Icon from '../../Icon'
import { useNavigation } from '@react-navigation/native'
import HardwareService from '../../services/HardwareService'
import CropHealthService from '../../services/CropHealthService'
import CropHealthNotificationService from '../../services/CropHealthNotificationService'

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

const CropHealthCard = ({ analysis }) => {
  if (!analysis) return null

  const getHealthColor = (status) => {
    switch (status) {
      case 'Excellent': return '#4CAF50'
      case 'Good': return '#8BC34A'
      case 'Fair': return '#FF9800'
      case 'Poor': return '#FF5722'
      case 'Critical': return '#F44336'
      default: return '#666'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 85) return '#4CAF50'
    if (score >= 70) return '#8BC34A'
    if (score >= 55) return '#FF9800'
    if (score >= 40) return '#FF5722'
    return '#F44336'
  }

  return (
    <View style={styles.healthCard}>
      <View style={styles.healthHeader}>
        <Icon name="Activity" size={24} color={getHealthColor(analysis.healthStatus)} />
        <Text style={styles.healthTitle}>Crop Health Analysis</Text>
      </View>
      
      <View style={styles.healthScoreContainer}>
        <View style={styles.scoreCircle}>
          <Text style={[styles.healthScore, { color: getScoreColor(analysis.healthScore) }]}>
            {analysis.healthScore}
          </Text>
          <Text style={styles.scoreLabel}>Health Score</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[styles.healthStatus, { color: getHealthColor(analysis.healthStatus) }]}>
            {analysis.healthStatus}
          </Text>
          <Text style={styles.healthOverview}>{analysis.analysis?.overview}</Text>
        </View>
      </View>

      {analysis.analysis?.keyInsights && (
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>Key Insights:</Text>
          {analysis.analysis.keyInsights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <Icon name="CheckCircle" size={14} color="#4CAF50" />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>
      )}

      {analysis.analysis?.recommendations && (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>Recommendations:</Text>
          {analysis.analysis.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationPoint}>
              <Icon name="ArrowRight" size={14} color="#FF9800" />
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const HardwareMessageCard = ({ message, index }) => {
  if (!message || !message.sensorData) return null

  const sensorSummary = HardwareService.getSensorSummary(message.sensorData)
  const timeAgo = HardwareService.formatDate(message.createdAt)

  return (
    <View style={styles.hardwareMessageCard}>
      <View style={styles.messageHeader}>
        <Icon name="Database" size={20} color="#2196F3" />
        <Text style={styles.messageTitle}>Sensor Reading #{index + 1}</Text>
        <Text style={styles.messageTime}>{timeAgo}</Text>
      </View>
      
      <View style={styles.sensorDataGrid}>
        <View style={styles.sensorDataItem}>
          <Text style={styles.sensorLabel}>pH</Text>
          <Text style={styles.sensorValue}>{sensorSummary.ph}</Text>
        </View>
        <View style={styles.sensorDataItem}>
          <Text style={styles.sensorLabel}>N</Text>
          <Text style={styles.sensorValue}>{sensorSummary.nitrogen} ppm</Text>
        </View>
        <View style={styles.sensorDataItem}>
          <Text style={styles.sensorLabel}>P</Text>
          <Text style={styles.sensorValue}>{sensorSummary.phosphorus} ppm</Text>
        </View>
        <View style={styles.sensorDataItem}>
          <Text style={styles.sensorLabel}>K</Text>
          <Text style={styles.sensorValue}>{sensorSummary.potassium} ppm</Text>
        </View>
        <View style={styles.sensorDataItem}>
          <Text style={styles.sensorLabel}>Temp</Text>
          <Text style={styles.sensorValue}>{sensorSummary.temperature}°C</Text>
        </View>
        <View style={styles.sensorDataItem}>
          <Text style={styles.sensorLabel}>Humidity</Text>
          <Text style={styles.sensorValue}>{sensorSummary.humidity}%</Text>
        </View>
      </View>
    </View>
  )
}

const CropRecommendation = () => {
  const navigation = useNavigation();

  // State management
  const [isConnected, setIsConnected] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)

  // Data state
  const [parameters, setParameters] = useState({
    nitrogen: 0.0,
    phosphorus: 0.0,
    potassium: 0.0,
    temperature: 0.0,
    humidity: 0.0,
    phLevel: 0.0,
    rainfall: 0.0
  })
  
  const [hardwareMessages, setHardwareMessages] = useState([])
  const [cropRecommendations, setCropRecommendations] = useState([])
  const [cropHealthAnalysis, setCropHealthAnalysis] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [lastDataFetch, setLastDataFetch] = useState(null)

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

  // Load initial data on component mount
  useEffect(() => {
    loadAllData()
  }, [])

  // Function to load all data from database
  const loadAllData = async () => {
    setIsFetchingData(true)
    try {
      await Promise.all([
        fetchHardwareMessages(),
        fetchCropRecommendations()
      ])
      setLastDataFetch(new Date())
    } catch (error) {
      console.error('Error loading data:', error)
      Alert.alert('Error', 'Failed to load some data. Using cached information.')
    } finally {
      setIsFetchingData(false)
    }
  }

  // Function to fetch hardware messages from database
  const fetchHardwareMessages = async () => {
    try {
      const messages = await HardwareService.getLatestHardwareMessages(5)
      setHardwareMessages(messages)
      
      // Update parameters with latest sensor data
      if (messages && messages.length > 0) {
        const latestMessage = messages[0]
        if (latestMessage.sensorData) {
          setParameters({
            nitrogen: latestMessage.sensorData.nitrogen || 0.0,
            phosphorus: latestMessage.sensorData.phosphorus || 0.0,
            potassium: latestMessage.sensorData.potassium || 0.0,
            temperature: latestMessage.sensorData.temperature || 0.0,
            humidity: latestMessage.sensorData.humidity || 0.0,
            phLevel: latestMessage.sensorData.ph || 0.0,
            rainfall: latestMessage.sensorData.rainfall || 0.0
          })
        }
      }
      
      return messages
    } catch (error) {
      console.error('Error fetching hardware messages:', error)
      throw error
    }
  }

  // Function to fetch crop recommendations from database
  const fetchCropRecommendations = async () => {
    try {
      const recommendations = await HardwareService.getLatestCropRecommendations(5)
      setCropRecommendations(recommendations)
      return recommendations
    } catch (error) {
      console.error('Error fetching crop recommendations:', error)
      throw error
    }
  }

  // Function to analyze crop health with Gemini
  const analyzeCropHealth = async () => {
    if (hardwareMessages.length === 0 || cropRecommendations.length === 0) {
      Alert.alert('No Data', 'Please fetch hardware and crop recommendation data first.')
      return
    }

    setIsLoading(true)
    try {
      const analysis = await HardwareService.analyzeCropHealthWithGemini(
        hardwareMessages,
        cropRecommendations
      )
      
      setCropHealthAnalysis(analysis)
      
      // Store the crop health data for use in other pages
      const healthStored = await CropHealthService.storeCropHealth(analysis)
      
      if (healthStored) {
        console.log('Crop health data stored successfully for cross-page access')
        
        // Notify other pages about the health update
        CropHealthNotificationService.notifyHealthUpdate(analysis)
      } else {
        console.warn('Failed to store crop health data')
      }
      
      // Format recommendations for display
      const formattedRecommendations = cropRecommendations.length > 0 
        ? cropRecommendations[0].recommendations?.map(rec => ({
            crop: rec.cropName,
            suitability: rec.suitabilityScore >= 80 ? 'High' : rec.suitabilityScore >= 60 ? 'Medium' : 'Low',
            reason: `Suitability score: ${rec.suitabilityScore}%. ${
              rec.suitabilityScore >= 80 
                ? 'Excellent match for current soil conditions.' 
                : rec.suitabilityScore >= 60 
                ? 'Good match with some considerations needed.'
                : 'May require significant soil improvements.'
            }`
          })) || []
        : mockRecommendations

      setRecommendations(formattedRecommendations)
      setShowRecommendations(true)
      
      // Show success message with health info
      const notificationMessage = CropHealthNotificationService.getNotificationMessage(analysis)
      Alert.alert(
        'Analysis Complete', 
        `${notificationMessage}\n\nThe updated health data is now available on your Dashboard and Crops pages.`,
        [{ text: 'OK' }]
      )
      
    } catch (error) {
      console.error('Error analyzing crop health:', error)
      Alert.alert('Analysis Error', 'Failed to analyze crop health. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Function to refresh all data
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadAllData()
    } finally {
      setRefreshing(false)
    }
  }

  // Function to fetch dummy data (keeping for backward compatibility)
  const handleFetchDummyData = async () => {
    await loadAllData()
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
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
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
        {/* Fetch Data Button */}
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
              <Text style={styles.buttonText}>Fetch Latest Data</Text>
            </>
          )}
        </TouchableOpacity>
        
        {lastDataFetch && (
          <View style={styles.lastUpdateContainer}>
            <Icon name="Clock" size={14} color="#666" />
            <Text style={styles.lastUpdateText}>
              Last updated: {HardwareService.formatDate(lastDataFetch)}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={analyzeCropHealth}
          disabled={isLoading || !isConnected}
        >
          {isLoading ? (
            <>
              <Icon name="Loader" size={20} color="white" />
              <Text style={styles.buttonText}>Analyzing with Gemini...</Text>
            </>
          ) : (
            <>
              <Icon name="Brain" size={20} color="white" />
              <Text style={styles.buttonText}>Analyze Crop Health</Text>
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

      {/* Crop Health Analysis Section */}
      {cropHealthAnalysis && (
        <View style={styles.analysisSection}>
          <CropHealthCard analysis={cropHealthAnalysis} />
        </View>
      )}

      {/* Hardware Messages Section */}
      {hardwareMessages.length > 0 && (
        <View style={styles.hardwareSection}>
          <View style={styles.sectionHeader}>
            <Icon name="Database" size={24} color="#2196F3" />
            <Text style={styles.sectionTitle}>Recent Sensor Data</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Latest readings from IoT sensors in your field
          </Text>
          
          <View style={styles.hardwareMessagesList}>
            {hardwareMessages.slice(0, 3).map((message, index) => (
              <HardwareMessageCard
                key={message._id || index}
                message={message}
                index={index}
              />
            ))}
          </View>
        </View>
      )}

      {/* Crop Recommendations Section */}
      {cropRecommendations.length > 0 && (
        <View style={styles.cropRecommendationsSection}>
          <View style={styles.sectionHeader}>
            <Icon name="Leaf" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Database Crop Recommendations</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            ML-generated suggestions based on your soil parameters
          </Text>
          
          <View style={styles.dbRecommendationsList}>
            {cropRecommendations.map((recGroup, groupIndex) => (
              <View key={recGroup._id || groupIndex} style={styles.recommendationGroup}>
                <Text style={styles.recommendationGroupHeader}>
                  Analysis from {HardwareService.formatDate(recGroup.createdAt)}
                </Text>
                {recGroup.recommendations?.map((rec, index) => (
                  <View key={index} style={styles.dbRecommendationItem}>
                    <View style={styles.cropNameContainer}>
                      <Icon name="Leaf" size={16} color="#4CAF50" />
                      <Text style={styles.dbCropName}>{rec.cropName}</Text>
                    </View>
                    <View style={styles.suitabilityScoreContainer}>
                      <Text style={[
                        styles.suitabilityScore,
                        { color: rec.suitabilityScore >= 80 ? '#4CAF50' : rec.suitabilityScore >= 60 ? '#FF9800' : '#F44336' }
                      ]}>
                        {rec.suitabilityScore}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* AI Recommendations Section */}
      {showRecommendations && recommendations.length > 0 && (
        <View style={styles.recommendationsSection}>
          <View style={styles.recommendationsHeader}>
            <Icon name="Target" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>AI-Powered Recommendations</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Gemini AI analysis based on current soil and environmental conditions
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

      {/* Empty State */}
      {!isFetchingData && !isLoading && hardwareMessages.length === 0 && cropRecommendations.length === 0 && (
        <View style={styles.emptyState}>
          <Icon name="Database" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No sensor data available</Text>
          <Text style={styles.emptyStateSubtext}>
            Fetch the latest data from your IoT sensors to get started
          </Text>
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

  // Last Update Container
  lastUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    alignSelf: 'center',
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  // Analysis Section
  analysisSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },

  // Health Card Styles
  healthCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  healthScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreCircle: {
    alignItems: 'center',
    marginRight: 20,
  },
  healthScore: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusContainer: {
    flex: 1,
  },
  healthStatus: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  healthOverview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  insightsContainer: {
    marginBottom: 15,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  recommendationsContainer: {
    marginTop: 5,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  recommendationPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },

  // Hardware Messages Section
  hardwareSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  hardwareMessagesList: {
    gap: 12,
  },
  hardwareMessageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  sensorDataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sensorDataItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    width: '30%',
  },
  sensorLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  sensorValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  // Crop Recommendations Section
  cropRecommendationsSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  dbRecommendationsList: {
    gap: 15,
  },
  recommendationGroup: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recommendationGroupHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  dbRecommendationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cropNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dbCropName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
  },
  suitabilityScoreContainer: {
    alignItems: 'center',
  },
  suitabilityScore: {
    fontSize: 16,
    fontWeight: '600',
  },

  // AI Recommendations Section
  recommendationsSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
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

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
})

export default CropRecommendation