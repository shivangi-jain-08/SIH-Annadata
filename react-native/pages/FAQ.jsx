import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import Icon from '../Icon'

const FAQ = () => {
  const navigation = useNavigation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedItems, setExpandedItems] = useState(new Set())

  // FAQ Categories
  const categories = [
    { id: 'all', name: 'All Questions', icon: 'List' },
    { id: 'app-usage', name: 'App Usage', icon: 'Smartphone' },
    { id: 'disease-detection', name: 'Disease Detection', icon: 'Search' },
    { id: 'weather', name: 'Weather', icon: 'Cloud' },
    { id: 'orders', name: 'Orders', icon: 'ShoppingCart' },
    { id: 'technical', name: 'Technical', icon: 'Settings' },
    { id: 'account', name: 'Account', icon: 'User' },
  ]

  // FAQ Data
  const faqData = [
    // App Usage
    {
      id: 1,
      category: 'app-usage',
      question: 'How do I get started with Annadata?',
      answer: 'Getting started is easy! First, download and install the app from the Play Store. Create your account using your phone number or email. Complete your profile with basic information like your location and farming interests. Once set up, explore the dashboard to access weather updates, disease detection, crop recommendations, and marketplace features.'
    },
    {
      id: 2,
      category: 'app-usage',
      question: 'What are the main features of Annadata?',
      answer: 'Annadata offers comprehensive farming solutions including:\n• Real-time weather forecasting\n• AI-powered crop disease detection\n• Personalized crop recommendations\n• Agricultural marketplace for buying/selling\n• Parameter analysis for soil and environmental factors\n• Order management and tracking\n• Expert consultation and support'
    },
    {
      id: 3,
      category: 'app-usage',
      question: 'Is Annadata free to use?',
      answer: 'Annadata offers both free and premium features. Basic features like weather updates, disease detection (limited scans), and marketplace browsing are free. Premium features include unlimited AI scans, advanced analytics, priority support, and detailed crop recommendations. Check our pricing page for current subscription options.'
    },

    // Disease Detection
    {
      id: 4,
      category: 'disease-detection',
      question: 'How accurate is the AI disease detection?',
      answer: 'Our AI disease detection system has an accuracy rate of over 95% for common crop diseases. It uses advanced machine learning models trained on thousands of crop images. However, we recommend consulting with agricultural experts for critical decisions and consider the AI results as a helpful diagnostic tool.'
    },
    {
      id: 5,
      category: 'disease-detection',
      question: 'What crops are supported for disease detection?',
      answer: 'Currently, we support disease detection for major crops including:\n• Rice (Paddy)\n• Wheat\n• Maize (Corn)\n• Cotton\n• Sugarcane\n• Tomato\n• Potato\n• Onion\n• Soybean\n• Mustard\n\nWe continuously add support for more crops based on user demand and regional requirements.'
    },
    {
      id: 6,
      category: 'disease-detection',
      question: 'How do I take a good photo for disease detection?',
      answer: 'For best results:\n• Take photos in good natural lighting\n• Focus clearly on the affected plant parts\n• Capture close-up images of symptoms\n• Avoid shadows or extreme angles\n• Include some healthy parts for comparison\n• Take multiple photos from different angles\n• Ensure the image is not blurry or dark'
    },
    {
      id: 7,
      category: 'disease-detection',
      question: 'What should I do after disease detection?',
      answer: 'After getting disease detection results:\n1. Review the identified disease and confidence score\n2. Read the detailed treatment recommendations\n3. Check suggested organic and chemical solutions\n4. Consult with local agricultural experts if needed\n5. Monitor the crop after treatment\n6. Use our tracking feature to record treatment progress'
    },

    // Weather
    {
      id: 8,
      category: 'weather',
      question: 'How accurate are the weather forecasts?',
      answer: 'We use data from reliable meteorological services including OpenWeatherMap and local weather stations. Our forecasts are accurate for up to 7 days with hourly updates. For longer-term planning, we provide seasonal trends and historical weather patterns specific to your location.'
    },
    {
      id: 9,
      category: 'weather',
      question: 'Can I get weather alerts for my farm?',
      answer: 'Yes! Enable push notifications in settings to receive:\n• Severe weather warnings (storms, hail, extreme temperatures)\n• Rainfall predictions for irrigation planning\n• Frost warnings for crop protection\n• Optimal spraying conditions\n• Harvest weather windows\n\nCustomize alert preferences based on your specific crops and farming activities.'
    },
    {
      id: 10,
      category: 'weather',
      question: 'Why is my location weather not showing correctly?',
      answer: 'This usually happens due to:\n• Location permissions not granted to the app\n• GPS services disabled on your device\n• Poor internet connectivity\n• Incorrect location set in profile settings\n\nTo fix: Go to Settings > Location > Allow Annadata to access your location. You can also manually set your location in the app if GPS is not accurate.'
    },

    // Orders
    {
      id: 11,
      category: 'orders',
      question: 'How do I place an order for agricultural products?',
      answer: 'To place an order:\n1. Browse the marketplace or search for specific products\n2. Select the item and choose quantity\n3. Add to cart and proceed to checkout\n4. Enter delivery address and payment details\n5. Confirm your order\n6. Track order status in the Orders section\n\nWe offer both online payment and cash on delivery options.'
    },
    {
      id: 12,
      category: 'orders',
      question: 'What is your return policy?',
      answer: 'We offer returns within 7 days of delivery for:\n• Damaged or defective products\n• Wrong items delivered\n• Quality issues with seeds or fertilizers\n\nLive plants and perishable items have a 24-hour return window. Contact our support team with order details and photos for quick resolution. Refunds are processed within 3-5 business days.'
    },
    {
      id: 13,
      category: 'orders',
      question: 'How can I track my order?',
      answer: 'Track your orders easily:\n1. Go to Profile > My Orders\n2. Find your order and tap "Track Order"\n3. View real-time status updates\n4. Get delivery notifications\n5. Contact delivery partner directly\n\nYou will also receive SMS and email updates at each stage of delivery.'
    },

    // Technical
    {
      id: 14,
      category: 'technical',
      question: 'The app is running slowly. What should I do?',
      answer: 'To improve app performance:\n• Close other apps running in background\n• Restart the Annadata app\n• Check for app updates in Play Store\n• Clear app cache in device settings\n• Ensure stable internet connection\n• Restart your device if issues persist\n• Contact support if problems continue'
    },
    {
      id: 15,
      category: 'technical',
      question: 'I\'m having trouble logging in. What should I do?',
      answer: 'Login issues can be resolved by:\n• Checking your internet connection\n• Verifying your phone number/email is correct\n• Using "Forgot Password" if needed\n• Clearing app cache and data\n• Updating to the latest app version\n• Ensuring your account is not suspended\n\nIf issues persist, contact our support team with your registered details.'
    },
    {
      id: 16,
      category: 'technical',
      question: 'Can I use Annadata offline?',
      answer: 'Some features work offline:\n• Previously loaded weather data\n• Saved disease detection results\n• Downloaded crop guides\n• Cached product information\n\nHowever, real-time features like weather updates, AI disease detection, and marketplace require internet connection. We recommend syncing data when connected for the best experience.'
    },

    // Account
    {
      id: 17,
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'To update your profile:\n1. Go to Profile section\n2. Tap "Edit Profile" button\n3. Update your information (name, phone, email, address)\n4. Add or change your profile photo\n5. Update farming preferences and crop interests\n6. Save changes\n\nKeep your location accurate for better weather and local recommendations.'
    },
    {
      id: 18,
      category: 'account',
      question: 'How do I delete my account?',
      answer: 'To delete your account:\n1. Go to Profile > Settings\n2. Scroll down to "Delete Account"\n3. Read the data deletion policy\n4. Confirm account deletion\n5. Your data will be permanently removed within 30 days\n\nNote: This action is irreversible. All your data, orders, and saved information will be lost.'
    },
    {
      id: 19,
      category: 'account',
      question: 'Is my personal data secure?',
      answer: 'Yes, we take data security seriously:\n• All data is encrypted during transmission and storage\n• We follow strict privacy policies\n• No personal data is shared without consent\n• Regular security audits and updates\n• Compliance with data protection regulations\n\nRead our Privacy Policy for detailed information about data handling and your rights.'
    },
    {
      id: 20,
      category: 'account',
      question: 'Can I use multiple devices with one account?',
      answer: 'Yes, you can access your Annadata account from multiple devices:\n• Login with the same credentials on any device\n• Data syncs automatically across devices\n• Orders and history are accessible everywhere\n• Disease detection results are saved to your account\n• Weather preferences sync across devices\n\nFor security, we recommend logging out from shared devices.'
    }
  ]

  // Filter FAQs based on search and category
  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Toggle FAQ item expansion
  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const CategoryButton = ({ category }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Icon
        name={category.icon}
        size={16}
        color={selectedCategory === category.id ? '#4CAF50' : '#666'}
      />
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === category.id && styles.categoryButtonTextActive
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  )

  const FAQItem = ({ faq }) => {
    const isExpanded = expandedItems.has(faq.id)
    
    return (
      <View style={styles.faqItem}>
        <TouchableOpacity
          style={styles.faqHeader}
          onPress={() => toggleExpanded(faq.id)}
        >
          <View style={styles.faqQuestionContainer}>
            <Text style={styles.faqQuestion}>{faq.question}</Text>
          </View>
          <Icon
            name={isExpanded ? "ChevronUp" : "ChevronDown"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.faqAnswerContainer}>
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="ArrowLeft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Frequently Asked Questions</Text>
          <Text style={styles.heroSubtitle}>
            Find answers to common questions about Annadata features and functionality
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Icon name="Search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search questions..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery ? (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Icon name="X" size={18} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {categories.map(category => (
              <CategoryButton key={category.id} category={category} />
            ))}
          </ScrollView>
        </View>

        {/* FAQ List */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>
            {filteredFAQs.length} Question{filteredFAQs.length !== 1 ? 's' : ''} Found
          </Text>
          
          {filteredFAQs.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Icon name="HelpCircle" size={48} color="#ccc" />
              <Text style={styles.noResultsText}>No questions found</Text>
              <Text style={styles.noResultsSubtext}>
                Try adjusting your search or browse different categories
              </Text>
            </View>
          ) : (
            <View style={styles.faqList}>
              {filteredFAQs.map(faq => (
                <FAQItem key={faq.id} faq={faq} />
              ))}
            </View>
          )}
        </View>

        {/* Contact Support */}
        <View style={styles.supportSection}>
          <View style={styles.supportCard}>
            <Icon name="MessageCircle" size={32} color="#4CAF50" />
            <Text style={styles.supportTitle}>Still have questions?</Text>
            <Text style={styles.supportSubtitle}>
              Can't find what you're looking for? Our support team is here to help!
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => navigation.navigate('Contact')}
            >
              <Icon name="Mail" size={20} color="white" />
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Quick Tips</Text>
          <View style={styles.tipCard}>
            <Icon name="Lightbulb" size={24} color="#FF9800" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Getting Better Results</Text>
              <Text style={styles.tipText}>
                For the best experience with disease detection, take clear photos in good lighting and focus on the affected plant parts.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <Icon name="Smartphone" size={24} color="#2196F3" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>App Performance</Text>
              <Text style={styles.tipText}>
                Keep your app updated and ensure good internet connectivity for real-time features like weather and marketplace.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <Icon name="MapPin" size={24} color="#E91E63" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Location Accuracy</Text>
              <Text style={styles.tipText}>
                Enable GPS and keep your location updated in profile settings for accurate weather forecasts and local recommendations.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 15,
  },
  placeholder: {
    width: 40,
  },

  // Container
  scrollContainer: {
    flex: 1,
  },

  // Hero Section
  heroSection: {
    backgroundColor: 'white',
    padding: 30,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Search Section
  searchSection: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },
  clearButton: {
    padding: 5,
  },

  // Categories Section
  categoriesSection: {
    padding: 20,
    backgroundColor: 'white',
  },
  categoriesContainer: {
    paddingVertical: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryButtonActive: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },

  // FAQ Section
  faqSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  faqList: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  faqQuestionContainer: {
    flex: 1,
    marginRight: 15,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22,
  },
  faqAnswerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // No Results
  noResultsContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Support Section
  supportSection: {
    padding: 20,
  },
  supportCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  supportSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Tips Section
  tipsSection: {
    padding: 20,
    paddingBottom: 40,
  },
  tipCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tipContent: {
    flex: 1,
    marginLeft: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
})

export default FAQ