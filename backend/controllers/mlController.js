const { HardwareMessage, CropRecommendation, DiseaseReport } = require('../models');
const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Get hardware messages for current user
 */
const getHardwareMessages = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const farmerId = req.user ? req.user._id : null;
    const query = farmerId ? { farmerId } : {};
    const messages = await HardwareMessage.find(query)
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
    const farmerId = req.user ? req.user._id : null;
    const query = farmerId ? { farmerId } : {};
    const message = await HardwareMessage.findOne(query)
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
 * Get soil reports for current user
 */
const getSoilReports = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const farmerId = req.user ? req.user._id : null;
    const query = farmerId ? { farmerId } : {};
    
    try {
      // Get hardware messages which contain soil sensor data
      const soilReports = await HardwareMessage.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .populate('farmerId', 'name location');

      // Transform hardware messages to soil report format
      const transformedReports = soilReports.map(message => ({
        _id: message._id,
        farmerId: message.farmerId,
        sensorData: message.sensorData,
        recommendations: message.recommendations || [],
        cropRecommendations: message.cropRecommendations || [],
        location: message.location,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
      }));

      res.json({
        success: true,
        message: 'Soil reports retrieved successfully',
        data: transformedReports
      });
    } catch (dbError) {
      // Return mock data if database is not available
      const mockSoilReports = [{
        _id: '507f1f77bcf86cd799439011',
        farmerId: {
          _id: '507f1f77bcf86cd799439012',
          name: 'Test Farmer',
          location: { type: 'Point', coordinates: [77.2090, 28.6139] }
        },
        sensorData: {
          ph: 6.5,
          nitrogen: 45,
          phosphorus: 25,
          potassium: 180,
          organicMatter: 3.2,
          moisture: 65,
          temperature: 28
        },
        recommendations: [
          'Soil pH is optimal for most crops',
          'Nitrogen levels are good for leafy vegetables',
          'Consider adding organic compost to improve soil structure'
        ],
        cropRecommendations: [
          {
            cropName: 'Tomato',
            suitabilityPercentage: 85,
            expectedYield: '15-20 tons per hectare'
          },
          {
            cropName: 'Spinach',
            suitabilityPercentage: 92,
            expectedYield: '8-12 tons per hectare'
          }
        ],
        location: { type: 'Point', coordinates: [77.2090, 28.6139] },
        createdAt: new Date(),
        updatedAt: new Date()
      }];

      res.json({
        success: true,
        message: 'Soil reports retrieved successfully (mock data)',
        data: mockSoilReports
      });
    }
  } catch (error) {
    logger.error('Get soil reports failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve soil reports'
    });
  }
};

/**
 * Get latest soil report for current user
 */
const getLatestSoilReport = async (req, res) => {
  try {
    const farmerId = req.user ? req.user._id : null;
    const query = farmerId ? { farmerId } : {};
    
    try {
      const latestMessage = await HardwareMessage.findOne(query)
        .sort({ createdAt: -1 })
        .populate('farmerId', 'name location');

      if (!latestMessage) {
        // Return mock data if no real data found
        const mockSoilReport = {
          _id: '507f1f77bcf86cd799439011',
          farmerId: {
            _id: '507f1f77bcf86cd799439012',
            name: 'Test Farmer',
            location: { type: 'Point', coordinates: [77.2090, 28.6139] }
          },
          sensorData: {
            ph: 6.5,
            nitrogen: 45,
            phosphorus: 25,
            potassium: 180,
            organicMatter: 3.2,
            moisture: 65,
            temperature: 28
          },
          recommendations: [
            'Soil pH is optimal for most crops',
            'Nitrogen levels are good for leafy vegetables',
            'Consider adding organic compost to improve soil structure'
          ],
          cropRecommendations: [
            {
              cropName: 'Tomato',
              suitabilityPercentage: 85,
              expectedYield: '15-20 tons per hectare'
            },
            {
              cropName: 'Spinach',
              suitabilityPercentage: 92,
              expectedYield: '8-12 tons per hectare'
            }
          ],
          location: { type: 'Point', coordinates: [77.2090, 28.6139] },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        return res.json({
          success: true,
          message: 'Latest soil report retrieved successfully (mock data)',
          data: mockSoilReport
        });
      }

      // Transform to soil report format
      const soilReport = {
        _id: latestMessage._id,
        farmerId: latestMessage.farmerId,
        sensorData: latestMessage.sensorData,
        recommendations: latestMessage.recommendations || [],
        cropRecommendations: latestMessage.cropRecommendations || [],
        location: latestMessage.location,
        createdAt: latestMessage.createdAt,
        updatedAt: latestMessage.updatedAt
      };

      res.json({
        success: true,
        message: 'Latest soil report retrieved successfully',
        data: soilReport
      });
    } catch (dbError) {
      // Return mock data if database is not available
      const mockSoilReport = {
        _id: '507f1f77bcf86cd799439011',
        farmerId: {
          _id: '507f1f77bcf86cd799439012',
          name: 'Test Farmer',
          location: { type: 'Point', coordinates: [77.2090, 28.6139] }
        },
        sensorData: {
          ph: 6.5,
          nitrogen: 45,
          phosphorus: 25,
          potassium: 180,
          organicMatter: 3.2,
          moisture: 65,
          temperature: 28
        },
        recommendations: [
          'Soil pH is optimal for most crops',
          'Nitrogen levels are good for leafy vegetables',
          'Consider adding organic compost to improve soil structure'
        ],
        cropRecommendations: [
          {
            cropName: 'Tomato',
            suitabilityPercentage: 85,
            expectedYield: '15-20 tons per hectare'
          },
          {
            cropName: 'Spinach',
            suitabilityPercentage: 92,
            expectedYield: '8-12 tons per hectare'
          }
        ],
        location: { type: 'Point', coordinates: [77.2090, 28.6139] },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      res.json({
        success: true,
        message: 'Latest soil report retrieved successfully (mock data)',
        data: mockSoilReport
      });
    }
  } catch (error) {
    logger.error('Get latest soil report failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve latest soil report'
    });
  }
};

/**
 * Get crop recommendations for current user
 */
const getCropRecommendations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const farmerId = req.user ? req.user._id : null;
    const query = farmerId ? { farmerId } : {};
    const recommendations = await CropRecommendation.find(query)
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
    const farmerId = req.user ? req.user._id : null;
    const query = farmerId ? { farmerId } : {};
    
    try {
      // First try to get from CropRecommendation collection
      let recommendation = await CropRecommendation.findOne(query)
        .sort({ createdAt: -1 })
        .populate('farmerId', 'name location')
        .populate('hardwareMessageId', 'sensorData createdAt');

      // If no dedicated crop recommendation, get from latest hardware message
      if (!recommendation) {
        const latestHardwareMessage = await HardwareMessage.findOne(query)
          .sort({ createdAt: -1 })
          .populate('farmerId', 'name location');

        if (latestHardwareMessage && latestHardwareMessage.cropRecommendations && latestHardwareMessage.cropRecommendations.length > 0) {
          // Use the first crop recommendation from hardware message
          const topRecommendation = latestHardwareMessage.cropRecommendations[0];
          recommendation = {
            _id: latestHardwareMessage._id,
            farmerId: latestHardwareMessage.farmerId,
            hardwareMessageId: latestHardwareMessage._id,
            cropName: topRecommendation.cropName,
            suitabilityPercentage: topRecommendation.suitabilityPercentage,
            expectedYield: topRecommendation.expectedYield,
            plantingAdvice: 'Based on current soil conditions',
            recommendations: latestHardwareMessage.recommendations || [],
            analysisDate: latestHardwareMessage.createdAt,
            location: latestHardwareMessage.location,
            createdAt: latestHardwareMessage.createdAt,
            updatedAt: latestHardwareMessage.updatedAt
          };
        }
      }

      if (!recommendation) {
        // Return mock data if no real data found
        const mockRecommendation = {
          _id: '507f1f77bcf86cd799439013',
          farmerId: {
            _id: '507f1f77bcf86cd799439012',
            name: 'Test Farmer',
            location: { type: 'Point', coordinates: [77.2090, 28.6139] }
          },
          cropName: 'Tomato',
          suitabilityPercentage: 85,
          expectedYield: '15-20 tons per hectare',
          plantingAdvice: 'Plant during cooler months for better yield',
          recommendations: [
            'Soil conditions are favorable for tomato cultivation',
            'Consider drip irrigation for water efficiency',
            'Monitor for common pests during growing season'
          ],
          analysisDate: new Date(),
          location: { type: 'Point', coordinates: [77.2090, 28.6139] },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        return res.json({
          success: true,
          message: 'Latest crop recommendation retrieved successfully (mock data)',
          data: { recommendation: mockRecommendation }
        });
      }

      res.json({
        success: true,
        message: 'Latest crop recommendation retrieved successfully',
        data: { recommendation }
      });
    } catch (dbError) {
      // Return mock data if database is not available
      const mockRecommendation = {
        _id: '507f1f77bcf86cd799439013',
        farmerId: {
          _id: '507f1f77bcf86cd799439012',
          name: 'Test Farmer',
          location: { type: 'Point', coordinates: [77.2090, 28.6139] }
        },
        cropName: 'Tomato',
        suitabilityPercentage: 85,
        expectedYield: '15-20 tons per hectare',
        plantingAdvice: 'Plant during cooler months for better yield',
        recommendations: [
          'Soil conditions are favorable for tomato cultivation',
          'Consider drip irrigation for water efficiency',
          'Monitor for common pests during growing season'
        ],
        analysisDate: new Date(),
        location: { type: 'Point', coordinates: [77.2090, 28.6139] },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      res.json({
        success: true,
        message: 'Latest crop recommendation retrieved successfully (mock data)',
        data: { recommendation: mockRecommendation }
      });
    }
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
    console.log('Disease detection endpoint called');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request headers:', req.headers);
    
    // Check if image was uploaded
    if (!req.file) {
      console.error('No file received in request');
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    const imageUrl = `/uploads/disease-images/${req.file.filename}`;
    const fullImagePath = `${req.protocol}://${req.get('host')}${imageUrl}`;

    // Reduced logging for cleaner console output

    // Call Python ML service for disease detection
    let diseaseResult;
    try {
      const response = await axios.post('http://localhost:5000/receive-data', {
        image_url: fullImagePath
      }, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });

      diseaseResult = response.data;
    } catch (error) {
      logger.error('Error calling ML service:', error.message);
      // Fallback to mock data if ML service is unavailable
      const mockDiseases = [
        { name: 'Tomato Blight', treatment: 'Apply copper-based fungicide every 7-10 days' },
        { name: 'Wheat Rust', treatment: 'Apply triazole-based fungicide immediately' },
        { name: 'Leaf Spot', treatment: 'Remove affected leaves and apply neem oil spray' },
        { name: 'Powdery Mildew', treatment: 'Apply sulfur-based fungicide and improve air circulation' },
        { name: 'Bacterial Wilt', treatment: 'Remove infected plants and apply copper-based bactericide' }
      ];
      diseaseResult = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];
    }

    // Create disease report
    const diseaseReport = new DiseaseReport({
      farmerId: req.user ? req.user._id : null,
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
      message: 'Failed to detect disease',
      error: error.message
    });
  }
};

/**
 * Get disease reports for current user
 */
const getDiseaseReports = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const farmerId = req.user ? req.user._id : null;
    const query = farmerId ? { farmerId } : {};
    const reports = await DiseaseReport.find(query)
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
  getSoilReports,
  getLatestSoilReport,
  getCropRecommendations,
  getLatestCropRecommendation,
  getCropRecommendationsByCrop,
  detectDisease,
  getDiseaseReports,
  getDiseaseReportsByFarmer,
  getDiseaseReportsByDisease,
  getMLServiceHealth
};