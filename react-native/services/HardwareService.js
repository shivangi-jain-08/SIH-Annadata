import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.115.87.239:3000/api';

class HardwareService {
  /**
   * Get authentication token from AsyncStorage
   */
  static async getAuthToken() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Get current user ID from AsyncStorage
   */
  static async getCurrentUserId() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        return user._id || user.id;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  }

  /**
   * Fetch latest hardware messages for the current farmer
   */
  static async getLatestHardwareMessages(limit = 5) {
    try {
      const token = await this.getAuthToken();
      const userId = await this.getCurrentUserId();

      if (!token || !userId) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/hardware/messages?limit=${limit}&farmerId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If API endpoint doesn't exist, return mock data
        if (response.status === 404) {
          return this.getMockHardwareMessages();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.warn('Error fetching hardware messages, using mock data:', error.message);
      return this.getMockHardwareMessages();
    }
  }

  /**
   * Fetch latest crop recommendations for the current farmer
   */
  static async getLatestCropRecommendations(limit = 5) {
    try {
      const token = await this.getAuthToken();
      const userId = await this.getCurrentUserId();

      if (!token || !userId) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/crop/recommendations?limit=${limit}&farmerId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If API endpoint doesn't exist, return mock data
        if (response.status === 404) {
          return this.getMockCropRecommendations();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.warn('Error fetching crop recommendations, using mock data:', error.message);
      return this.getMockCropRecommendations();
    }
  }

  /**
   * Send data to Gemini for crop health analysis
   */
  static async analyzeCropHealthWithGemini(hardwareData, cropRecommendations) {
    try {
      // Format the data for Gemini analysis
      const analysisPrompt = this.formatDataForGeminiAnalysis(hardwareData, cropRecommendations);
      
      const token = await this.getAuthToken();

      const response = await fetch(`${API_BASE_URL}/ai/analyze-crop-health`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: analysisPrompt,
          hardwareData: hardwareData,
          cropRecommendations: cropRecommendations
        }),
      });

      if (!response.ok) {
        // If API endpoint doesn't exist, return mock analysis
        if (response.status === 404) {
          return this.getMockCropHealthAnalysis(hardwareData, cropRecommendations);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.warn('Error analyzing with Gemini, using mock analysis:', error.message);
      return this.getMockCropHealthAnalysis(hardwareData, cropRecommendations);
    }
  }

  /**
   * Format hardware and crop data for Gemini analysis
   */
  static formatDataForGeminiAnalysis(hardwareData, cropRecommendations) {
    const latestHardware = hardwareData[0] || {};
    const sensorData = latestHardware.sensorData || {};

    return `Analyze the crop health based on the following agricultural data:

SENSOR DATA:
- pH Level: ${sensorData.ph || 'N/A'}
- Nitrogen: ${sensorData.nitrogen || 'N/A'} ppm
- Phosphorus: ${sensorData.phosphorus || 'N/A'} ppm
- Potassium: ${sensorData.potassium || 'N/A'} ppm
- Humidity: ${sensorData.humidity || 'N/A'}%
- Temperature: ${sensorData.temperature || 'N/A'}°C
- Rainfall: ${sensorData.rainfall || 'N/A'} mm

CROP RECOMMENDATIONS:
${cropRecommendations.map(rec => 
  `- ${rec.recommendations?.map(r => `${r.cropName} (${r.suitabilityScore}% suitable)`).join(', ') || 'No recommendations'}`
).join('\n')}

Please provide:
1. Overall crop health score (0-100)
2. Health status (Excellent, Good, Fair, Poor, Critical)
3. Key insights about soil conditions
4. Recommendations for improvement
5. Potential risks or concerns
6. Optimal crops for current conditions

Format the response as a comprehensive analysis with actionable insights for farmers.`;
  }

  /**
   * Get mock hardware messages for testing
   */
  static getMockHardwareMessages() {
    return [
      {
        _id: 'hw_001',
        farmerId: 'farmer_001',
        sensorData: {
          ph: 6.8,
          nitrogen: 45.2,
          phosphorus: 38.7,
          potassium: 42.1,
          humidity: 68.3,
          rainfall: 125.4,
          temperature: 26.5
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'hw_002',
        farmerId: 'farmer_001',
        sensorData: {
          ph: 6.9,
          nitrogen: 44.8,
          phosphorus: 39.2,
          potassium: 41.5,
          humidity: 71.2,
          rainfall: 132.1,
          temperature: 25.8
        },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'hw_003',
        farmerId: 'farmer_001',
        sensorData: {
          ph: 6.7,
          nitrogen: 46.1,
          phosphorus: 37.9,
          potassium: 43.2,
          humidity: 65.7,
          rainfall: 118.9,
          temperature: 27.2
        },
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  /**
   * Get mock crop recommendations for testing
   */
  static getMockCropRecommendations() {
    return [
      {
        _id: 'crop_001',
        farmerId: 'farmer_001',
        hardwareMessageId: 'hw_001',
        recommendations: [
          { cropName: 'Rice', suitabilityScore: 92 },
          { cropName: 'Maize', suitabilityScore: 88 },
          { cropName: 'Wheat', suitabilityScore: 75 },
          { cropName: 'Cotton', suitabilityScore: 68 },
          { cropName: 'Sugarcane', suitabilityScore: 45 }
        ],
        processingTime: 1250,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'crop_002',
        farmerId: 'farmer_001',
        hardwareMessageId: 'hw_002',
        recommendations: [
          { cropName: 'Rice', suitabilityScore: 90 },
          { cropName: 'Maize', suitabilityScore: 85 },
          { cropName: 'Wheat', suitabilityScore: 78 },
          { cropName: 'Cotton', suitabilityScore: 72 },
          { cropName: 'Sugarcane', suitabilityScore: 48 }
        ],
        processingTime: 980,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  /**
   * Generate mock crop health analysis
   */
  static getMockCropHealthAnalysis(hardwareData, cropRecommendations) {
    const latestHardware = hardwareData[0] || {};
    const sensorData = latestHardware.sensorData || {};
    
    // Calculate health score based on sensor data
    const healthScore = this.calculateHealthScore(sensorData);
    const healthStatus = this.getHealthStatus(healthScore);

    return {
      healthScore: healthScore,
      healthStatus: healthStatus,
      analysis: {
        overview: `Based on current sensor readings, your crop health is ${healthStatus.toLowerCase()} with a score of ${healthScore}/100.`,
        soilConditions: {
          ph: this.analyzePH(sensorData.ph),
          nutrients: this.analyzeNutrients(sensorData),
          moisture: this.analyzeMoisture(sensorData.humidity, sensorData.rainfall),
          temperature: this.analyzeTemperature(sensorData.temperature)
        },
        keyInsights: [
          `pH level of ${sensorData.ph || 'N/A'} is ${sensorData.ph > 7 ? 'slightly alkaline' : sensorData.ph < 6.5 ? 'acidic' : 'optimal'} for most crops`,
          `Nitrogen levels at ${sensorData.nitrogen || 'N/A'} ppm are ${sensorData.nitrogen > 40 ? 'adequate' : 'below optimal'}`,
          `Current humidity of ${sensorData.humidity || 'N/A'}% is ${sensorData.humidity > 70 ? 'high' : sensorData.humidity < 50 ? 'low' : 'good'} for plant growth`,
          `Temperature at ${sensorData.temperature || 'N/A'}°C is ${sensorData.temperature > 30 ? 'high' : sensorData.temperature < 20 ? 'low' : 'suitable'} for cultivation`
        ],
        recommendations: [
          healthScore < 60 ? 'Consider soil amendments to improve nutrient balance' : 'Maintain current farming practices',
          sensorData.ph < 6.5 ? 'Apply lime to raise pH levels' : sensorData.ph > 7.5 ? 'Add organic matter to lower pH' : 'pH levels are optimal',
          sensorData.nitrogen < 40 ? 'Apply nitrogen-rich fertilizers' : 'Nitrogen levels are adequate',
          sensorData.humidity < 50 ? 'Increase irrigation frequency' : sensorData.humidity > 80 ? 'Improve drainage' : 'Moisture levels are good'
        ],
        risks: [
          healthScore < 50 ? 'Poor soil conditions may affect crop yield' : null,
          sensorData.ph < 6 || sensorData.ph > 8 ? 'pH imbalance may affect nutrient uptake' : null,
          sensorData.temperature > 35 ? 'High temperature stress may affect plant growth' : null,
          sensorData.humidity > 85 ? 'High humidity may increase disease risk' : null
        ].filter(risk => risk !== null),
        optimalCrops: this.getOptimalCrops(cropRecommendations),
        lastUpdated: new Date().toISOString()
      }
    };
  }

  /**
   * Calculate overall health score based on sensor data
   */
  static calculateHealthScore(sensorData) {
    let score = 0;
    let factors = 0;

    // pH score (optimal range 6.0-7.5)
    if (sensorData.ph !== undefined) {
      if (sensorData.ph >= 6.0 && sensorData.ph <= 7.5) {
        score += 20;
      } else if (sensorData.ph >= 5.5 && sensorData.ph <= 8.0) {
        score += 15;
      } else {
        score += 5;
      }
      factors++;
    }

    // Nitrogen score (optimal above 40 ppm)
    if (sensorData.nitrogen !== undefined) {
      if (sensorData.nitrogen >= 40) {
        score += 20;
      } else if (sensorData.nitrogen >= 30) {
        score += 15;
      } else {
        score += 5;
      }
      factors++;
    }

    // Phosphorus score (optimal above 30 ppm)
    if (sensorData.phosphorus !== undefined) {
      if (sensorData.phosphorus >= 30) {
        score += 15;
      } else if (sensorData.phosphorus >= 20) {
        score += 10;
      } else {
        score += 5;
      }
      factors++;
    }

    // Potassium score (optimal above 35 ppm)
    if (sensorData.potassium !== undefined) {
      if (sensorData.potassium >= 35) {
        score += 15;
      } else if (sensorData.potassium >= 25) {
        score += 10;
      } else {
        score += 5;
      }
      factors++;
    }

    // Temperature score (optimal 20-30°C)
    if (sensorData.temperature !== undefined) {
      if (sensorData.temperature >= 20 && sensorData.temperature <= 30) {
        score += 15;
      } else if (sensorData.temperature >= 15 && sensorData.temperature <= 35) {
        score += 10;
      } else {
        score += 5;
      }
      factors++;
    }

    // Humidity score (optimal 50-70%)
    if (sensorData.humidity !== undefined) {
      if (sensorData.humidity >= 50 && sensorData.humidity <= 70) {
        score += 15;
      } else if (sensorData.humidity >= 40 && sensorData.humidity <= 80) {
        score += 10;
      } else {
        score += 5;
      }
      factors++;
    }

    return factors > 0 ? Math.round(score / factors * 5) : 50; // Scale to 100
  }

  /**
   * Get health status based on score
   */
  static getHealthStatus(score) {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Critical';
  }

  /**
   * Analyze pH levels
   */
  static analyzePH(ph) {
    if (!ph) return 'pH data not available';
    if (ph < 6.0) return 'Acidic - may limit nutrient availability';
    if (ph > 7.5) return 'Alkaline - may cause nutrient deficiencies';
    return 'Optimal pH range for most crops';
  }

  /**
   * Analyze nutrient levels
   */
  static analyzeNutrients(sensorData) {
    const nutrients = [];
    
    if (sensorData.nitrogen < 40) nutrients.push('Low nitrogen');
    if (sensorData.phosphorus < 30) nutrients.push('Low phosphorus');
    if (sensorData.potassium < 35) nutrients.push('Low potassium');
    
    if (nutrients.length === 0) {
      return 'Nutrient levels are adequate';
    }
    
    return `Deficiencies detected: ${nutrients.join(', ')}`;
  }

  /**
   * Analyze moisture conditions
   */
  static analyzeMoisture(humidity, rainfall) {
    if (!humidity && !rainfall) return 'Moisture data not available';
    
    let analysis = '';
    
    if (humidity < 50) {
      analysis += 'Low humidity may cause water stress. ';
    } else if (humidity > 80) {
      analysis += 'High humidity may increase disease risk. ';
    } else {
      analysis += 'Humidity levels are good. ';
    }
    
    if (rainfall < 100) {
      analysis += 'Low rainfall - irrigation may be needed.';
    } else if (rainfall > 200) {
      analysis += 'High rainfall - ensure proper drainage.';
    } else {
      analysis += 'Rainfall is adequate.';
    }
    
    return analysis;
  }

  /**
   * Analyze temperature conditions
   */
  static analyzeTemperature(temperature) {
    if (!temperature) return 'Temperature data not available';
    
    if (temperature < 15) return 'Low temperature may slow plant growth';
    if (temperature > 35) return 'High temperature may cause heat stress';
    return 'Temperature is suitable for most crops';
  }

  /**
   * Get optimal crops from recommendations
   */
  static getOptimalCrops(cropRecommendations) {
    if (!cropRecommendations || cropRecommendations.length === 0) {
      return ['Rice', 'Wheat', 'Maize']; // Default crops
    }
    
    const latestRec = cropRecommendations[0];
    if (latestRec.recommendations) {
      return latestRec.recommendations
        .filter(rec => rec.suitabilityScore >= 70)
        .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
        .map(rec => rec.cropName)
        .slice(0, 3);
    }
    
    return ['Rice', 'Wheat', 'Maize'];
  }

  /**
   * Format date for display
   */
  static formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  }

  /**
   * Get sensor data summary for display
   */
  static getSensorSummary(sensorData) {
    if (!sensorData) return 'No sensor data available';
    
    return {
      ph: sensorData.ph?.toFixed(1) || 'N/A',
      nitrogen: sensorData.nitrogen?.toFixed(1) || 'N/A',
      phosphorus: sensorData.phosphorus?.toFixed(1) || 'N/A',
      potassium: sensorData.potassium?.toFixed(1) || 'N/A',
      humidity: sensorData.humidity?.toFixed(1) || 'N/A',
      temperature: sensorData.temperature?.toFixed(1) || 'N/A',
      rainfall: sensorData.rainfall?.toFixed(1) || 'N/A'
    };
  }
}

export default HardwareService;