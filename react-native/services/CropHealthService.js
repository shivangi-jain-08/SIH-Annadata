import AsyncStorage from '@react-native-async-storage/async-storage';

const CROP_HEALTH_KEY = 'cropHealthData';

class CropHealthService {
  /**
   * Store crop health data in AsyncStorage
   * @param {Object} healthData - The crop health analysis from Gemini
   */
  static async storeCropHealth(healthData) {
    try {
      const cropHealthData = {
        ...healthData,
        lastUpdated: new Date().toISOString(),
        timestamp: Date.now()
      };

      await AsyncStorage.setItem(CROP_HEALTH_KEY, JSON.stringify(cropHealthData));
      
      console.log('Crop health data stored successfully:', cropHealthData);
      return true;
    } catch (error) {
      console.error('Error storing crop health data:', error);
      return false;
    }
  }

  /**
   * Retrieve crop health data from AsyncStorage
   * @returns {Object|null} - The stored crop health data or null if not found
   */
  static async getCropHealth() {
    try {
      const storedData = await AsyncStorage.getItem(CROP_HEALTH_KEY);
      
      if (storedData) {
        const cropHealthData = JSON.parse(storedData);
        
        // Check if data is less than 24 hours old
        const isDataFresh = this.isDataFresh(cropHealthData.timestamp);
        
        return {
          ...cropHealthData,
          isDataFresh
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving crop health data:', error);
      return null;
    }
  }

  /**
   * Get crop health percentage for display in other components
   * @returns {number} - The crop health percentage (0-100)
   */
  static async getCropHealthPercentage() {
    try {
      const healthData = await this.getCropHealth();
      
      if (healthData && healthData.healthScore) {
        return healthData.healthScore;
      }
      
      // Return default value if no data available
      return 75; // Default health percentage
    } catch (error) {
      console.error('Error getting crop health percentage:', error);
      return 75; // Default fallback
    }
  }

  /**
   * Get crop health status for display
   * @returns {string} - The crop health status
   */
  static async getCropHealthStatus() {
    try {
      const healthData = await this.getCropHealth();
      
      if (healthData && healthData.healthStatus) {
        return healthData.healthStatus;
      }
      
      // Return default status if no data available
      return 'Good';
    } catch (error) {
      console.error('Error getting crop health status:', error);
      return 'Good'; // Default fallback
    }
  }

  /**
   * Get formatted crop health info for dashboard display
   * @returns {Object} - Formatted health info
   */
  static async getDashboardHealthInfo() {
    try {
      const healthData = await this.getCropHealth();
      
      if (healthData) {
        return {
          percentage: healthData.healthScore || 75,
          status: healthData.healthStatus || 'Good',
          description: healthData.analysis?.overview || 'Your crops are showing good growth indicators.',
          lastUpdated: healthData.lastUpdated,
          isDataFresh: healthData.isDataFresh,
          keyInsights: healthData.analysis?.keyInsights || [],
          recommendations: healthData.analysis?.recommendations || []
        };
      }
      
      // Return default data
      return {
        percentage: 75,
        status: 'Good',
        description: 'Your crops are showing good growth indicators.',
        lastUpdated: new Date().toISOString(),
        isDataFresh: false,
        keyInsights: [
          'Soil conditions are within acceptable ranges',
          'Temperature and humidity levels are suitable',
          'Regular monitoring recommended'
        ],
        recommendations: [
          'Continue current farming practices',
          'Monitor weather conditions regularly',
          'Ensure proper irrigation schedule'
        ]
      };
    } catch (error) {
      console.error('Error getting dashboard health info:', error);
      
      // Return default fallback data
      return {
        percentage: 75,
        status: 'Good',
        description: 'Your crops are showing good growth indicators.',
        lastUpdated: new Date().toISOString(),
        isDataFresh: false,
        keyInsights: [
          'Soil conditions are within acceptable ranges',
          'Temperature and humidity levels are suitable',
          'Regular monitoring recommended'
        ],
        recommendations: [
          'Continue current farming practices',
          'Monitor weather conditions regularly',
          'Ensure proper irrigation schedule'
        ]
      };
    }
  }

  /**
   * Clear stored crop health data
   */
  static async clearCropHealth() {
    try {
      await AsyncStorage.removeItem(CROP_HEALTH_KEY);
      console.log('Crop health data cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing crop health data:', error);
      return false;
    }
  }

  /**
   * Check if the stored data is fresh (less than 24 hours old)
   * @param {number} timestamp - The timestamp when data was stored
   * @returns {boolean} - True if data is fresh, false otherwise
   */
  static isDataFresh(timestamp) {
    if (!timestamp) return false;
    
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    return (now - timestamp) < twentyFourHours;
  }

  /**
   * Get health color based on percentage
   * @param {number} percentage - Health percentage
   * @returns {string} - Color hex code
   */
  static getHealthColor(percentage) {
    if (percentage >= 85) return '#4CAF50'; // Excellent - Green
    if (percentage >= 70) return '#8BC34A'; // Good - Light Green
    if (percentage >= 55) return '#FF9800'; // Fair - Orange
    if (percentage >= 40) return '#FF5722'; // Poor - Red Orange
    return '#F44336'; // Critical - Red
  }

  /**
   * Get health status text based on percentage
   * @param {number} percentage - Health percentage
   * @returns {string} - Status text
   */
  static getHealthStatusFromPercentage(percentage) {
    if (percentage >= 85) return 'Excellent';
    if (percentage >= 70) return 'Good';
    if (percentage >= 55) return 'Fair';
    if (percentage >= 40) return 'Poor';
    return 'Critical';
  }

  /**
   * Subscribe to crop health updates (for future real-time updates)
   * @param {Function} callback - Callback function to call when data changes
   */
  static subscribeToCropHealthUpdates(callback) {
    // This could be implemented with EventEmitter or similar for real-time updates
    // For now, return a simple unsubscribe function
    return () => {
      console.log('Unsubscribed from crop health updates');
    };
  }

  /**
   * Force refresh crop health data by clearing cache
   */
  static async forceRefresh() {
    try {
      await this.clearCropHealth();
      console.log('Crop health cache cleared for refresh');
      return true;
    } catch (error) {
      console.error('Error forcing refresh:', error);
      return false;
    }
  }

  /**
   * Check if crop health analysis is available
   * @returns {boolean} - True if health data exists
   */
  static async hasHealthData() {
    try {
      const healthData = await this.getCropHealth();
      return healthData !== null;
    } catch (error) {
      console.error('Error checking health data availability:', error);
      return false;
    }
  }

  /**
   * Get crop health trend (if multiple data points available in future)
   * @returns {string} - Trend direction: 'improving', 'declining', 'stable'
   */
  static async getHealthTrend() {
    try {
      // For now, return stable as we only store one data point
      // In future, this could compare multiple historical data points
      const healthData = await this.getCropHealth();
      
      if (healthData && healthData.isDataFresh) {
        return 'stable';
      }
      
      return 'unknown';
    } catch (error) {
      console.error('Error getting health trend:', error);
      return 'unknown';
    }
  }
}

export default CropHealthService;