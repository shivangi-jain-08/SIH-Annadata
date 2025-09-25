import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Icon from '../Icon'
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window')

const CircularProgress = ({ percentage, size = 120, strokeWidth = 10, color = '#4CAF50' }) => {
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
        <Text style={styles.progressLabel}>Health</Text>
      </View>
    </View>
  )
}

const StatCard = ({ icon, title, value, unit, color }) => {
  return (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Icon name={icon} size={20} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {unit && <Text style={styles.statUnit}>{unit}</Text>}
    </View>
  )
}

const AdvancedOptionCard = ({ icon, title, description, color, onPress }) => {
  return (
    <TouchableOpacity style={styles.advancedOptionCard} onPress={onPress}>
      <View style={[styles.optionIconContainer, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <Icon name="ChevronRight" size={20} color="#999" />
    </TouchableOpacity>
  )
}

const Crops = () => {
  const [cropHealth] = useState(87) // Mock data
  const navigation = useNavigation();

  // Mock crop statistics
  const cropStats = [
    { icon: 'Thermometer', title: 'Temperature', value: '26', unit: '°C', color: '#FF6B35' },
    { icon: 'Droplets', title: 'Moisture', value: '68', unit: '%', color: '#2196F3' },
    { icon: 'Zap', title: 'pH Level', value: '6.8', unit: '', color: '#9C27B0' },
    { icon: 'Leaf', title: 'Nutrients', value: '92', unit: '%', color: '#4CAF50' },
  ]

  const advancedOptions = [
    {
      icon: 'Lightbulb',
      title: 'Crop Recommendation',
      description: 'Get AI-powered suggestions for optimal crop selection',
      color: '#4CAF50'
    },
    {
      icon: 'Search',
      title: 'Disease Detection',
      description: 'Scan and identify plant diseases using advanced imaging',
      color: '#F44336'
    },
    {
      icon: 'ChartBar',
      title: 'Parameter Analysis',
      description: 'Detailed analysis of soil and environmental factors',
      color: '#2196F3'
    }
  ]

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crops Analytics</Text>
        <Text style={styles.headerSubtitle}>Monitor your crop health and performance</Text>
      </View>

      {/* Crops Analytics Dashboard */}
      <View style={styles.analyticsSection}>
        <Text style={styles.sectionTitle}>Crop Health Overview</Text>
        
        {/* Main Health Circle */}
        <View style={styles.healthContainer}>
          <CircularProgress 
            percentage={cropHealth} 
            size={140} 
            strokeWidth={12} 
            color="#4CAF50" 
          />
          <View style={styles.healthInfo}>
            <Text style={styles.healthStatus}>Excellent</Text>
            <Text style={styles.healthDescription}>
              Your crops are showing strong growth indicators with optimal environmental conditions.
            </Text>
          </View>
        </View>

        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          {cropStats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              unit={stat.unit}
              color={stat.color}
            />
          ))}
        </View>
      </View>

      {/* Advanced Options Section */}
      <View style={styles.advancedSection}>
        <Text style={styles.sectionTitle}>Advanced Options</Text>
        <Text style={styles.sectionSubtitle}>
          Leverage AI and analytics for better crop management
        </Text>
        
        <View style={styles.optionsContainer}>
          {advancedOptions.map((option, index) => (
            <AdvancedOptionCard
              key={index}
              icon={option.icon}
              title={option.title}
              description={option.description}
              color={option.color}
              onPress={() => {
                // Navigation will be implemented later
                if(option.title==='Crop Recommendation'){
                    navigation.navigate('CropRecommendation')
                } else if(option.title==='Parameter Analysis'){
                    navigation.navigate('ParameterAnalysis')
                } else if(option.title==='Disease Detection'){
                    navigation.navigate('DiseaseDetection')
                }
              }}
            />
          ))}
        </View>
      </View>

      {/* Quick Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>Today's Tips</Text>
        <View style={styles.tipCard}>
          <Icon name="Info" size={20} color="#2196F3" />
          <Text style={styles.tipText}>
            Optimal watering time is early morning (6-8 AM) for better nutrient absorption.
          </Text>
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
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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

  // Analytics Section
  analyticsSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  healthContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  healthInfo: {
    alignItems: 'center',
    marginTop: 15,
  },
  healthStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  healthDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  // Progress Components
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // Statistics Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: (width - 52) / 2, // 2 cards per row with margins
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statUnit: {
    fontSize: 12,
    color: '#999',
  },

  // Advanced Options Section
  advancedSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  optionsContainer: {
    gap: 12,
  },
  advancedOptionCard: {
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
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },

  // Tips Section
  tipsSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 30,
  },
  tipCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  tipText: {
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
})

export default Crops