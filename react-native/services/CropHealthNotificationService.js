// Simple event emitter for crop health updates
class CropHealthNotificationService {
  static listeners = [];

  /**
   * Notify all listeners that crop health data has been updated
   * @param {Object} healthData - The updated crop health data
   */
  static notifyHealthUpdate(healthData) {
    const updateData = {
      timestamp: new Date().toISOString(),
      healthScore: healthData.healthScore,
      healthStatus: healthData.healthStatus,
      isDataFresh: true
    };

    console.log('Notifying crop health update:', updateData);

    // Notify all registered listeners
    this.listeners.forEach(callback => {
      try {
        callback(updateData);
      } catch (error) {
        console.error('Error in crop health notification listener:', error);
      }
    });
  }

  /**
   * Subscribe to crop health updates
   * @param {Function} callback - Function to call when health data is updated
   * @returns {Function} - Unsubscribe function
   */
  static subscribe(callback) {
    console.log('Subscribing to crop health updates');
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
        console.log('Unsubscribed from crop health updates');
      }
    };
  }

  /**
   * Get notification message based on health data
   * @param {Object} healthData - The health data
   * @returns {string} - Notification message
   */
  static getNotificationMessage(healthData) {
    const { healthScore, healthStatus } = healthData;
    
    if (healthScore >= 85) {
      return `Excellent news! Your crops are in ${healthStatus} condition with ${healthScore}% health score.`;
    } else if (healthScore >= 70) {
      return `Your crops are in ${healthStatus} condition with ${healthScore}% health score. Keep up the good work!`;
    } else if (healthScore >= 55) {
      return `Your crops show ${healthStatus} health (${healthScore}%). Consider the provided recommendations.`;
    } else if (healthScore >= 40) {
      return `Attention needed: Your crops have ${healthStatus} health (${healthScore}%). Review the analysis recommendations.`;
    } else {
      return `Critical: Your crops require immediate attention (${healthScore}% health). Please review recommendations urgently.`;
    }
  }

  /**
   * Get notification color based on health score
   * @param {number} healthScore - The health score (0-100)
   * @returns {string} - Color code for notification
   */
  static getNotificationColor(healthScore) {
    if (healthScore >= 85) return '#4CAF50'; // Green
    if (healthScore >= 70) return '#8BC34A'; // Light Green
    if (healthScore >= 55) return '#FF9800'; // Orange
    if (healthScore >= 40) return '#FF5722'; // Red Orange
    return '#F44336'; // Red
  }
}

export default CropHealthNotificationService;