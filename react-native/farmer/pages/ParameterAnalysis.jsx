import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import Svg, { Line, Circle, Text as SvgText, Polyline } from 'react-native-svg'
import Icon from '../../Icon'

const { width } = Dimensions.get('window')

const ParameterCard = ({ icon, label, value, unit, color, status, recommendation }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Optimal': return '#4CAF50'
      case 'Good': return '#8BC34A'
      case 'Warning': return '#FF9800'
      case 'Critical': return '#F44336'
      default: return '#666'
    }
  }

  return (
    <View style={styles.parameterCard}>
      <View style={styles.parameterHeader}>
        <Icon name={icon} size={20} color={color} />
        <Text style={styles.parameterLabel}>{label}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
      <View style={styles.parameterValue}>
        <Text style={[styles.valueText, { color }]}>{value}</Text>
        <Text style={styles.unitText}>{unit}</Text>
      </View>
      <Text style={styles.recommendationText}>{recommendation}</Text>
    </View>
  )
}

const HistoryGraph = ({ data, label, color, unit }) => {
  const chartWidth = width - 60
  const chartHeight = 120
  const padding = 20

  if (!data || data.length === 0) return null

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * (chartWidth - 2 * padding)
    const y = chartHeight - padding - ((point.value - minValue) / range) * (chartHeight - 2 * padding)
    return `${x},${y}`
  }).join(' ')

  return (
    <View style={styles.graphContainer}>
      <Text style={styles.graphTitle}>{label} Trend ({unit})</Text>
      <Svg width={chartWidth} height={chartHeight} style={styles.graph}>
        {/* Grid lines */}
        <Line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={chartHeight - padding}
          stroke="#E0E0E0"
          strokeWidth="1"
        />
        <Line
          x1={padding}
          y1={chartHeight - padding}
          x2={chartWidth - padding}
          y2={chartHeight - padding}
          stroke="#E0E0E0"
          strokeWidth="1"
        />
        
        {/* Data line */}
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        
        {/* Data points */}
        {data.map((point, index) => {
          const x = padding + (index / (data.length - 1)) * (chartWidth - 2 * padding)
          const y = chartHeight - padding - ((point.value - minValue) / range) * (chartHeight - 2 * padding)
          return (
            <Circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill={color}
            />
          )
        })}
        
        {/* Y-axis labels */}
        <SvgText
          x={padding - 10}
          y={padding + 5}
          fontSize="10"
          fill="#666"
          textAnchor="end"
        >
          {maxValue.toFixed(1)}
        </SvgText>
        <SvgText
          x={padding - 10}
          y={chartHeight - padding + 3}
          fontSize="10"
          fill="#666"
          textAnchor="end"
        >
          {minValue.toFixed(1)}
        </SvgText>
      </Svg>
    </View>
  )
}

const ParameterAnalysis = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const [selectedParameter, setSelectedParameter] = useState('nitrogen')
  
  // Get parameters from navigation params
  const { parameters, parameterConfig } = route.params || {}
  
  // Last saved parameters (mock data - in real app would come from storage/database)
  const lastSavedParameters = {
    nitrogen: 42.8,
    phosphorus: 35.2,
    potassium: 39.6,
    temperature: 24.7,
    humidity: 62.4,
    phLevel: 6.5,
    rainfall: 118.2
  }
  
  // Default parameter configuration if not passed
  const defaultParameterConfig = [
    { key: 'nitrogen', label: 'Nitrogen', unit: 'ppm', icon: 'Atom', color: '#2196F3' },
    { key: 'phosphorus', label: 'Phosphorus', unit: 'ppm', icon: 'Zap', color: '#FF9800' },
    { key: 'potassium', label: 'Potassium', unit: 'ppm', icon: 'Circle', color: '#9C27B0' },
    { key: 'temperature', label: 'Temperature', unit: '°C', icon: 'Thermometer', color: '#F44336' },
    { key: 'humidity', label: 'Humidity', unit: '%', icon: 'Droplets', color: '#00BCD4' },
    { key: 'phLevel', label: 'pH Level', unit: '', icon: 'Flask', color: '#795548' },
    { key: 'rainfall', label: 'Rainfall', unit: 'mm', icon: 'CloudRain', color: '#607D8B' }
  ]
  
  // Use passed parameters or fall back to last saved parameters
  const currentParameters = parameters || lastSavedParameters
  const currentConfig = parameterConfig || defaultParameterConfig
  
  // Check if we're showing last saved data
  const isShowingLastSaved = !parameters

  // Mock historical data for the last 7 days
  const generateHistoricalData = (baseValue, paramKey) => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const variation = (Math.random() - 0.5) * (baseValue * 0.3) // 30% variation
      const value = Math.max(0, baseValue + variation)
      data.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: value
      })
    }
    return data
  }

  // Generate historical data for all parameters
  const historicalData = {
    nitrogen: generateHistoricalData(currentParameters.nitrogen, 'nitrogen'),
    phosphorus: generateHistoricalData(currentParameters.phosphorus, 'phosphorus'),
    potassium: generateHistoricalData(currentParameters.potassium, 'potassium'),
    temperature: generateHistoricalData(currentParameters.temperature, 'temperature'),
    humidity: generateHistoricalData(currentParameters.humidity, 'humidity'),
    phLevel: generateHistoricalData(currentParameters.phLevel, 'phLevel'),
    rainfall: generateHistoricalData(currentParameters.rainfall, 'rainfall')
  }
  
  // Analysis logic for each parameter
  const getParameterAnalysis = (key, value) => {
    switch (key) {
      case 'nitrogen':
        if (value >= 40 && value <= 60) return { status: 'Optimal', recommendation: 'Nitrogen levels are perfect for most crops.' }
        if (value >= 30 && value < 40) return { status: 'Good', recommendation: 'Consider light nitrogen fertilizer application.' }
        if (value >= 20 && value < 30) return { status: 'Warning', recommendation: 'Nitrogen deficiency detected. Apply nitrogen-rich fertilizer.' }
        return { status: 'Critical', recommendation: 'Severe nitrogen imbalance. Immediate correction needed.' }
      
      case 'phosphorus':
        if (value >= 30 && value <= 50) return { status: 'Optimal', recommendation: 'Phosphorus levels support healthy root development.' }
        if (value >= 20 && value < 30) return { status: 'Good', recommendation: 'Phosphorus levels are adequate for most crops.' }
        if (value >= 10 && value < 20) return { status: 'Warning', recommendation: 'Low phosphorus. Consider phosphate fertilizer.' }
        return { status: 'Critical', recommendation: 'Phosphorus deficiency affects root growth and flowering.' }
      
      case 'potassium':
        if (value >= 35 && value <= 55) return { status: 'Optimal', recommendation: 'Potassium levels enhance disease resistance.' }
        if (value >= 25 && value < 35) return { status: 'Good', recommendation: 'Potassium levels are sufficient for plant health.' }
        if (value >= 15 && value < 25) return { status: 'Warning', recommendation: 'Moderate potassium deficiency detected.' }
        return { status: 'Critical', recommendation: 'Low potassium affects fruit quality and plant vigor.' }
      
      case 'temperature':
        if (value >= 20 && value <= 30) return { status: 'Optimal', recommendation: 'Temperature is ideal for most crop growth.' }
        if (value >= 15 && value < 20) return { status: 'Good', recommendation: 'Temperature suitable for cool-season crops.' }
        if (value >= 10 && value < 15) return { status: 'Warning', recommendation: 'Temperature may limit growth of warm-season crops.' }
        return { status: 'Critical', recommendation: 'Temperature stress may affect crop development.' }
      
      case 'humidity':
        if (value >= 50 && value <= 70) return { status: 'Optimal', recommendation: 'Humidity levels reduce disease pressure.' }
        if (value >= 40 && value < 50) return { status: 'Good', recommendation: 'Humidity is acceptable for most crops.' }
        if (value >= 30 && value < 40) return { status: 'Warning', recommendation: 'Low humidity may increase irrigation needs.' }
        return { status: 'Critical', recommendation: 'Humidity levels may stress plants and reduce yields.' }
      
      case 'phLevel':
        if (value >= 6.0 && value <= 7.5) return { status: 'Optimal', recommendation: 'pH level allows optimal nutrient uptake.' }
        if (value >= 5.5 && value < 6.0) return { status: 'Good', recommendation: 'Slightly acidic but suitable for most crops.' }
        if (value >= 5.0 && value < 5.5) return { status: 'Warning', recommendation: 'Acidic soil may limit nutrient availability.' }
        return { status: 'Critical', recommendation: 'pH adjustment needed for proper nutrient uptake.' }
      
      case 'rainfall':
        if (value >= 100 && value <= 150) return { status: 'Optimal', recommendation: 'Rainfall supports healthy crop growth.' }
        if (value >= 75 && value < 100) return { status: 'Good', recommendation: 'Adequate rainfall with minimal irrigation needed.' }
        if (value >= 50 && value < 75) return { status: 'Warning', recommendation: 'Supplemental irrigation may be beneficial.' }
        return { status: 'Critical', recommendation: 'Insufficient rainfall requires active irrigation management.' }
      
      default:
        return { status: 'Good', recommendation: 'Parameter within acceptable range.' }
    }
  }

  // Calculate overall health score
  const calculateOverallHealth = () => {
    let totalScore = 0
    let criticalIssues = []
    let warnings = []
    let recommendations = []

    currentConfig && currentConfig.forEach(param => {
      const analysis = getParameterAnalysis(param.key, currentParameters[param.key])
      
      switch (analysis.status) {
        case 'Optimal':
          totalScore += 100
          break
        case 'Good':
          totalScore += 80
          break
        case 'Warning':
          totalScore += 60
          warnings.push(param.label)
          break
        case 'Critical':
          totalScore += 30
          criticalIssues.push(param.label)
          break
      }
    })

    const overallScore = Math.round(totalScore / (currentConfig?.length || 7))
    
    // Generate specific recommendations
    if (criticalIssues.length > 0) {
      recommendations.push(`Critical attention needed for: ${criticalIssues.join(', ')}`)
    }
    if (warnings.length > 0) {
      recommendations.push(`Monitor closely: ${warnings.join(', ')}`)
    }
    
    // Add general recommendations based on score
    if (overallScore >= 90) {
      recommendations.push('Excellent soil conditions! Maintain current management practices.')
      recommendations.push('Consider high-value crops that require optimal conditions.')
    } else if (overallScore >= 70) {
      recommendations.push('Good soil health with room for improvement.')
      recommendations.push('Focus on addressing warning parameters for better yields.')
    } else if (overallScore >= 50) {
      recommendations.push('Moderate soil conditions requiring attention.')
      recommendations.push('Consider soil amendments and irrigation adjustments.')
    } else {
      recommendations.push('Poor soil conditions need immediate intervention.')
      recommendations.push('Consult agricultural expert for comprehensive soil management plan.')
    }

    // Add data source specific recommendations
    if (isShowingLastSaved) {
      recommendations.push('Consider taking fresh measurements for updated analysis.')
      recommendations.push('Regular monitoring helps track soil condition changes.')
    }

    return {
      score: overallScore,
      status: overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : overallScore >= 40 ? 'Fair' : 'Poor',
      criticalIssues,
      warnings,
      recommendations
    }
  }

  const overallHealth = calculateOverallHealth()

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="ArrowLeft" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Parameter Analysis</Text>
            <Text style={styles.headerSubtitle}>
              {isShowingLastSaved 
                ? 'Analysis based on last saved parameters' 
                : 'Detailed analysis of soil and environmental conditions'}
            </Text>
          </View>
        </View>
        
        {/* Data Source Indicator */}
        {isShowingLastSaved && (
          <View style={styles.dataSourceIndicator}>
            <Icon name="Database" size={16} color="#FFC107" />
            <Text style={styles.dataSourceText}>
              Showing last saved parameters from previous session
            </Text>
          </View>
        )}
      </View>

      {/* Analysis Section */}
      <View style={styles.analysisSection}>
        <Text style={styles.sectionTitle}>Detailed Parameter Analysis</Text>
        <Text style={styles.sectionSubtitle}>
          Analysis based on optimal ranges for agricultural conditions
        </Text>
        
        <View style={styles.parametersGrid}>
          {currentConfig && currentConfig.map((param) => {
            const analysis = getParameterAnalysis(param.key, currentParameters[param.key])
            return (
              <ParameterCard
                key={param.key}
                icon={param.icon}
                label={param.label}
                value={currentParameters[param.key].toFixed(1)}
                unit={param.unit}
                color={param.color}
                status={analysis.status}
                recommendation={analysis.recommendation}
              />
            )
          })}
        </View>
      </View>

      {/* Historical Data Graph Section */}
      <View style={styles.graphSection}>
        <Text style={styles.sectionTitle}>Historical Trends</Text>
        <Text style={styles.sectionSubtitle}>
          Parameter trends over the last 7 days
        </Text>
        
        {/* Parameter Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.parameterSelector}>
          {currentConfig && currentConfig.map((param) => (
            <TouchableOpacity
              key={param.key}
              style={[
                styles.parameterTab,
                selectedParameter === param.key && styles.selectedParameterTab
              ]}
              onPress={() => setSelectedParameter(param.key)}
            >
              <Icon name={param.icon} size={16} color={selectedParameter === param.key ? 'white' : param.color} />
              <Text style={[
                styles.parameterTabText,
                selectedParameter === param.key && styles.selectedParameterTabText
              ]}>
                {param.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selected Parameter Graph */}
        {currentConfig && (
          <HistoryGraph
            data={historicalData[selectedParameter]}
            label={currentConfig.find(p => p.key === selectedParameter)?.label}
            color={currentConfig.find(p => p.key === selectedParameter)?.color}
            unit={currentConfig.find(p => p.key === selectedParameter)?.unit}
          />
        )}
      </View>

      {/* Enhanced Summary Section */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Overall Assessment</Text>
        
        {/* Health Score Card */}
        <View style={styles.healthScoreCard}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreNumber}>{overallHealth.score}</Text>
            <Text style={styles.scoreLabel}>Health Score</Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusTitle, { 
              color: overallHealth.status === 'Excellent' ? '#4CAF50' : 
                     overallHealth.status === 'Good' ? '#8BC34A' :
                     overallHealth.status === 'Fair' ? '#FF9800' : '#F44336'
            }]}>
              {overallHealth.status}
            </Text>
            <Text style={styles.statusDescription}>Soil Health Status</Text>
          </View>
        </View>

        {/* Issues and Warnings */}
        {(overallHealth.criticalIssues.length > 0 || overallHealth.warnings.length > 0) && (
          <View style={styles.issuesCard}>
            <View style={styles.issuesHeader}>
              <Icon name="AlertTriangle" size={20} color="#FF9800" />
              <Text style={styles.issuesTitle}>Attention Required</Text>
            </View>
            
            {overallHealth.criticalIssues.length > 0 && (
              <View style={styles.issuesList}>
                <Text style={styles.criticalLabel}>Critical Issues:</Text>
                <Text style={styles.criticalText}>{overallHealth.criticalIssues.join(', ')}</Text>
              </View>
            )}
            
            {overallHealth.warnings.length > 0 && (
              <View style={styles.issuesList}>
                <Text style={styles.warningLabel}>Warnings:</Text>
                <Text style={styles.warningText}>{overallHealth.warnings.join(', ')}</Text>
              </View>
            )}
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.recommendationsCard}>
          <View style={styles.recommendationsHeader}>
            <Icon name="Lightbulb" size={20} color="#4CAF50" />
            <Text style={styles.recommendationsTitle}>Recommendations</Text>
          </View>
          
          {overallHealth.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Icon name="ChevronRight" size={14} color="#666" />
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
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
  
  // Header Styles
  header: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  dataSourceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.4)',
  },
  dataSourceText: {
    fontSize: 14,
    color: '#FFC107',
    marginLeft: 6,
    fontWeight: '500',
  },

  // Analysis Section
  analysisSection: {
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
    gap: 15,
  },
  parameterCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  parameterValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  unitText: {
    fontSize: 16,
    color: '#999',
    marginLeft: 6,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Summary Section
  summarySection: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 30,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryContent: {
    marginLeft: 15,
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },

  // Graph Section
  graphSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  parameterSelector: {
    marginBottom: 15,
  },
  parameterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedParameterTab: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  parameterTabText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  selectedParameterTabText: {
    color: 'white',
  },
  graphContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  graph: {
    alignSelf: 'center',
  },

  // Enhanced Summary Styles
  healthScoreCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scoreContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
  },

  // Issues Card
  issuesCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  issuesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  issuesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginLeft: 8,
  },
  issuesList: {
    marginBottom: 8,
  },
  criticalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 4,
  },
  criticalText: {
    fontSize: 14,
    color: '#F44336',
    lineHeight: 20,
  },
  warningLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#FF9800',
    lineHeight: 20,
  },

  // Recommendations Card
  recommendationsCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#388E3C',
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
})

export default ParameterAnalysis