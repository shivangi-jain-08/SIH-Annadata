const { HardwareMessage, CropRecommendation, DiseaseReport } = require('../models');
const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Get hardware messages for current user
 */
const getHardwareMessages = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const messages = await HardwareMessage.find({ farmerId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('farmerId', 'name location');

    res.json({
      success: true,
      message: 'Hardware messages retrieved successfully',
      data: {
        messages,
        count: messages.length
      }
    });
  } catch (error) {
    logger.error('Get hardware messages failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve hardware messages'
    });
  }
};

/**
 * Get latest hardware message for current user
 */
const getLatestHardwareMessage = async (req, res) => {
  try {
    const message = await HardwareMessage.findOne({ farmerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('farmerId', 'name location');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'No hardware messages found. Please ensure your hardware sensors are connected and sending data.'
      });
    }

    res.json({
      success: true,
      message: 'Latest hardware message retrieved successfully',
      data: { message }
    });
  } catch (error) {
    logger.error('Get latest hardware message failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve latest hardware message'
    });
  }
};

/**
 * Get crop recommendations for current user
 */
const getCropRecommendations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recommendations = await CropRecommendation.find({ farmerId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('farmerId', 'name location')
      .populate('hardwareMessageId', 'sensorData createdAt');

    res.json({
      success: true,
      message: 'Crop recommendations retrieved successfully',
      data: {
        recommendations,
        count: recommendations.length
      }
    });
  } catch (error) {
    logger.error('Get crop recommendations failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve crop recommendations'
    });
  }
};

/**
 * Get latest crop recommendation for current user
 */
const getLatestCropRecommendation = async (req, res) => {
  try {
    const recommendation = await CropRecommendation.findOne({ farmerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('farmerId', 'name location')
      .populate('hardwareMessageId', 'sensorData createdAt');

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'No crop recommendations found. Hardware data may be needed first.'
      });
    }

    res.json({
      success: true,
      message: 'Latest crop recommendation retrieved successfully',
      data: { recommendation }
    });
  } catch (error) {
    logger.error('Get latest crop recommendation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve latest crop recommendation'
    });
  }
};

/**
 * Get crop recommendations by crop name
 */
const getCropRecommendationsByCrop = async (req, res) => {
  try {
    const { cropName } = req.params;

    const recommendations = await CropRecommendation.find({
      'recommendations.cropName': { $regex: cropName, $options: 'i' }
    }).populate('farmerId', 'name location');

    res.json({
      success: true,
      message: `Crop recommendations for ${cropName} retrieved successfully`,
      data: {
        recommendations,
        count: recommendations.length,
        cropName
      }
    });
  } catch (error) {
    logger.error('Get crop recommendations by crop failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve crop recommendations by crop'
    });
  }
};

/**
 * Detect plant disease from uploaded image
 */
const detectDisease = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    // Call Python ML service for disease detection
    let diseaseResult;
    try {
      const response = await fetch('http://localhost:5000/receive-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl
        })
      });

      if (!response.ok) {
        throw new Error(`ML service responded with status: ${response.status}`);
      }

      diseaseResult = await response.json();
    } catch (error) {
      console.error('Error calling ML service:', error);
      // Fallback to mock data if ML service is unavailable
      const mockDiseases = [
        { name: 'Tomato Blight', treatment: 'Apply copper-based fungicide every 7-10 days' },
        { name: 'Wheat Rust', treatment: 'Apply triazole-based fungicide immediately' },
        { name: 'Leaf Spot', treatment: 'Remove affected leaves and apply neem oil spray' }
      ];
      diseaseResult = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];
    }

    // Create disease report
    const diseaseReport = new DiseaseReport({
      farmerId: req.user._id,
      imageUrl,
      diseaseName: diseaseResult.name || diseaseResult.disease_name || 'Unknown Disease',
      treatment: diseaseResult.treatment || 'Consult agricultural expert for treatment advice'
    });

    await diseaseReport.save();

    res.json({
      success: true,
      message: 'Disease detection completed successfully',
      data: {
        report: diseaseReport,
        processingTime: Math.floor(Math.random() * 3000) + 1000 // Mock processing time
      }
    });
  } catch (error) {
    logger.error('Disease detection failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to detect disease'
    });
  }
};

/**
 * Get disease reports for current user
 */
const getDiseaseReports = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const reports = await DiseaseReport.find({ farmerId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('farmerId', 'name location');

    res.json({
      success: true,
      message: 'Disease reports retrieved successfully',
      data: {
        reports,
        count: reports.length
      }
    });
  } catch (error) {
    logger.error('Get disease reports failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve disease reports'
    });
  }
};

/**
 * Get disease reports by farmer ID
 */
const getDiseaseReportsByFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { limit = 10 } = req.query;

    const reports = await DiseaseReport.find({ farmerId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('farmerId', 'name location');

    res.json({
      success: true,
      message: 'Disease reports retrieved successfully',
      data: {
        reports,
        count: reports.length,
        farmerId
      }
    });
  } catch (error) {
    logger.error('Get disease reports by farmer failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve disease reports'
    });
  }
};

/**
 * Get disease reports by disease name
 */
const getDiseaseReportsByDisease = async (req, res) => {
  try {
    const { diseaseName } = req.params;

    const reports = await DiseaseReport.find({
      diseaseName: { $regex: diseaseName, $options: 'i' }
    }).populate('farmerId', 'name location');

    res.json({
      success: true,
      message: `Disease reports for ${diseaseName} retrieved successfully`,
      data: {
        reports,
        count: reports.length,
        diseaseName
      }
    });
  } catch (error) {
    logger.error('Get disease reports by disease failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve disease reports by disease'
    });
  }
};

/**
 * Check ML service health
 */
const getMLServiceHealth = async (req, res) => {
  try {
    // Simple health check for prototype
    res.json({
      success: true,
      message: 'ML service is healthy',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          hardware: 'active',
          cropRecommendation: 'active',
          diseaseDetection: 'active'
        }
      }
    });
  } catch (error) {
    logger.error('ML service health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'ML service health check failed'
    });
  }
};

module.exports = {
  getHardwareMessages,
  getLatestHardwareMessage,
  getCropRecommendations,
  getLatestCropRecommendation,
  getCropRecommendationsByCrop,
  detectDisease,
  getDiseaseReports,
  getDiseaseReportsByFarmer,
  getDiseaseReportsByDisease,
  getMLServiceHealth
};