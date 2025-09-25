import React, { useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  Dimensions,
  FlatList
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from '../../Icon'

const { width } = Dimensions.get('window')

const ImageUploadCard = ({ onPress, image, onRemove, index }) => {
  return (
    <View style={styles.imageUploadCard}>
      {image ? (
        <View style={styles.uploadedImageContainer}>
          <Image source={{ uri: image.uri }} style={styles.uploadedImage} />
          <TouchableOpacity style={styles.removeImageButton} onPress={() => onRemove(index)}>
            <Icon name="X" size={16} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadButton} onPress={onPress}>
          <Icon name="Camera" size={32} color="#4CAF50" />
          <Text style={styles.uploadButtonText}>Upload Image</Text>
          <Text style={styles.uploadButtonSubtext}>Tap to add crop image</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const DiseaseResultCard = ({ disease, confidence, description, onViewDetails }) => {
  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#4CAF50'
    if (confidence >= 60) return '#FF9800'
    return '#F44336'
  }

  return (
    <View style={styles.diseaseResultCard}>
      <View style={styles.diseaseHeader}>
        <View style={styles.diseaseInfo}>
          <Text style={styles.diseaseName}>{disease}</Text>
          <View style={styles.confidenceContainer}>
            <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(confidence) }]}>
              <Text style={styles.confidenceText}>{confidence}% Confidence</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.detailsButton} onPress={onViewDetails}>
          <Icon name="ChevronRight" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      <Text style={styles.diseaseDescription}>{description}</Text>
    </View>
  )
}

const PreventiveMeasureItem = ({ measure, category }) => {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Cultural': return 'Leaf'
      case 'Chemical': return 'Flask'
      case 'Biological': return 'Bug'
      case 'Environmental': return 'Sun'
      default: return 'CheckCircle'
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Cultural': return '#4CAF50'
      case 'Chemical': return '#FF9800'
      case 'Biological': return '#9C27B0'
      case 'Environmental': return '#2196F3'
      default: return '#666'
    }
  }

  return (
    <View style={styles.preventiveMeasureItem}>
      <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(category) + '20' }]}>
        <Icon name={getCategoryIcon(category)} size={16} color={getCategoryColor(category)} />
      </View>
      <View style={styles.measureContent}>
        <Text style={styles.measureCategory}>{category}</Text>
        <Text style={styles.measureText}>{measure}</Text>
      </View>
    </View>
  )
}

const DiseaseDetection = () => {
  const navigation = useNavigation()
  const [uploadedImages, setUploadedImages] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [detectionResults, setDetectionResults] = useState(null)
  const [showPreventiveMeasures, setShowPreventiveMeasures] = useState(false)

  // Mock disease detection results
  const mockResults = [
    {
      disease: 'Leaf Spot Disease',
      confidence: 87,
      description: 'A fungal infection causing circular spots on leaves, typically occurring in humid conditions. Can reduce photosynthesis and overall plant health if left untreated.',
      preventiveMeasures: [
        { category: 'Cultural', measure: 'Ensure proper plant spacing for air circulation' },
        { category: 'Cultural', measure: 'Water at soil level to avoid wetting leaves' },
        { category: 'Cultural', measure: 'Remove and destroy infected plant debris' },
        { category: 'Chemical', measure: 'Apply copper-based fungicide every 2 weeks' },
        { category: 'Biological', measure: 'Use beneficial microorganisms like Trichoderma' },
        { category: 'Environmental', measure: 'Improve drainage to reduce soil moisture' }
      ]
    },
    {
      disease: 'Bacterial Blight',
      confidence: 72,
      description: 'A bacterial infection that causes water-soaked lesions on leaves and stems, often leading to wilting and plant death in severe cases.',
      preventiveMeasures: [
        { category: 'Cultural', measure: 'Use disease-resistant crop varieties' },
        { category: 'Cultural', measure: 'Rotate crops to break disease cycle' },
        { category: 'Chemical', measure: 'Apply copper sulfate sprays preventively' },
        { category: 'Environmental', measure: 'Avoid overhead irrigation during humid weather' }
      ]
    }
  ]

  const handleImageUpload = () => {
    // In a real app, this would open image picker
    Alert.alert(
      'Select Image Source',
      'Choose how you want to add the image',
      [
        { text: 'Camera', onPress: () => simulateImageUpload('camera') },
        { text: 'Gallery', onPress: () => simulateImageUpload('gallery') },
        { text: 'Cancel', style: 'cancel' }
      ]
    )
  }

  const simulateImageUpload = (source) => {
    // Mock image upload simulation
    const mockImage = {
      uri: `https://via.placeholder.com/200x200/4CAF50/FFFFFF?text=Crop+${uploadedImages.length + 1}`,
      type: 'image/jpeg',
      name: `crop_image_${Date.now()}.jpg`
    }

    setUploadedImages(prev => [...prev, mockImage])
  }

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    // Clear results when images are removed
    if (uploadedImages.length <= 1) {
      setDetectionResults(null)
      setShowPreventiveMeasures(false)
    }
  }

  const handleDetectDisease = () => {
    if (uploadedImages.length === 0) {
      Alert.alert('No Images', 'Please upload at least one crop image before detection.')
      return
    }

    setIsAnalyzing(true)
    setDetectionResults(null)
    setShowPreventiveMeasures(false)

    // Simulate AI analysis delay
    setTimeout(() => {
      setDetectionResults(mockResults)
      setIsAnalyzing(false)
    }, 3000)
  }

  const handleViewPreventiveMeasures = (disease) => {
    setShowPreventiveMeasures(true)
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="ArrowLeft" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Disease Detection</Text>
            <Text style={styles.headerSubtitle}>AI-powered crop disease identification</Text>
          </View>
        </View>
      </View>

      {/* Image Upload Section */}
      <View style={styles.uploadSection}>
        <Text style={styles.sectionTitle}>Upload Crop Images</Text>
        <Text style={styles.sectionSubtitle}>
          Take clear photos of affected plant parts for accurate detection
        </Text>

        <View style={styles.imagesGrid}>
          {/* Uploaded Images */}
          {uploadedImages.map((image, index) => (
            <ImageUploadCard
              key={index}
              image={image}
              onRemove={removeImage}
              index={index}
            />
          ))}
          
          {/* Add More Button */}
          {uploadedImages.length < 4 && (
            <ImageUploadCard onPress={handleImageUpload} />
          )}
        </View>

        {uploadedImages.length > 0 && (
          <View style={styles.imageCounter}>
            <Icon name="Image" size={16} color="#666" />
            <Text style={styles.imageCounterText}>
              {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} uploaded
            </Text>
          </View>
        )}
      </View>

      {/* Detection Button */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[styles.detectButton, uploadedImages.length === 0 && styles.disabledButton]}
          onPress={handleDetectDisease}
          disabled={isAnalyzing || uploadedImages.length === 0}
        >
          {isAnalyzing ? (
            <>
              <Icon name="Loader" size={20} color="white" />
              <Text style={styles.buttonText}>Analyzing Images...</Text>
            </>
          ) : (
            <>
              <Icon name="Search" size={20} color="white" />
              <Text style={styles.buttonText}>Detect Disease</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Detection Results */}
      {detectionResults && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Detection Results</Text>
          <Text style={styles.sectionSubtitle}>
            AI analysis of your crop images
          </Text>

          {detectionResults.map((result, index) => (
            <DiseaseResultCard
              key={index}
              disease={result.disease}
              confidence={result.confidence}
              description={result.description}
              onViewDetails={() => handleViewPreventiveMeasures(result)}
            />
          ))}
        </View>
      )}

      {/* Preventive Measures */}
      {showPreventiveMeasures && detectionResults && (
        <View style={styles.preventiveMeasuresSection}>
          <View style={styles.preventiveHeader}>
            <Icon name="Shield" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Preventive Measures</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Recommended actions to prevent and control identified diseases
          </Text>

          {detectionResults[0].preventiveMeasures.map((measure, index) => (
            <PreventiveMeasureItem
              key={index}
              measure={measure.measure}
              category={measure.category}
            />
          ))}

          {/* Additional Tips */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Icon name="Lightbulb" size={20} color="#FF9800" />
              <Text style={styles.tipsTitle}>Pro Tips</Text>
            </View>
            <Text style={styles.tipsText}>
              • Regular monitoring helps early detection{'\n'}
              • Maintain proper plant nutrition for disease resistance{'\n'}
              • Keep farming tools clean to prevent spread{'\n'}
              • Document treatment results for future reference
            </Text>
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
    backgroundColor: '#F44336',
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

  // Upload Section
  uploadSection: {
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
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageUploadCard: {
    width: (width - 52) / 2,
    height: 120,
    borderRadius: 12,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 8,
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  uploadedImageContainer: {
    flex: 1,
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
  imageCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingVertical: 8,
  },
  imageCounterText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },

  // Button Section
  buttonSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  detectButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },

  // Results Section
  resultsSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  diseaseResultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  diseaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  confidenceContainer: {
    alignSelf: 'flex-start',
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  detailsButton: {
    padding: 8,
  },
  diseaseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // Preventive Measures Section
  preventiveMeasuresSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  preventiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  preventiveMeasureItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  measureContent: {
    flex: 1,
  },
  measureCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  measureText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },

  // Tips Card
  tipsCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginLeft: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#F57C00',
    lineHeight: 22,
  },
})

export default DiseaseDetection