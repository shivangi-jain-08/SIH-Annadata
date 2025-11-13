import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from '../Icon'

const FAQItem = ({ question, answer, isExpanded, onPress }) => (
  <TouchableOpacity 
    style={styles.faqItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.faqHeader}>
      <Text style={styles.faqQuestion}>{question}</Text>
      <Icon 
        name={isExpanded ? "ChevronUp" : "ChevronDown"} 
        size={20} 
        color="#2196F3" 
      />
    </View>
    {isExpanded && (
      <Text style={styles.faqAnswer}>{answer}</Text>
    )}
  </TouchableOpacity>
)

const CategoryButton = ({ title, icon, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.categoryButton, isActive && styles.activeCategoryButton]}
    onPress={onPress}
  >
    <Icon name={icon} size={18} color={isActive ? 'white' : '#666'} />
    <Text style={[styles.categoryText, isActive && styles.activeCategoryText]}>
      {title}
    </Text>
  </TouchableOpacity>
)

const HelpCenter = () => {
  const navigation = useNavigation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFAQ, setExpandedFAQ] = useState(null)

  const categories = [
    { id: 'all', title: 'All', icon: 'List' },
    { id: 'orders', title: 'Orders', icon: 'ShoppingBag' },
    { id: 'payment', title: 'Payment', icon: 'CreditCard' },
    { id: 'delivery', title: 'Delivery', icon: 'Truck' },
    { id: 'account', title: 'Account', icon: 'User' },
  ]

  const faqs = [
    {
      category: 'orders',
      question: 'How do I place an order?',
      answer: 'Browse products, add items to cart, and proceed to checkout. Enter your delivery address and payment details to complete the order.'
    },
    {
      category: 'orders',
      question: 'Can I cancel my order?',
      answer: 'Yes, you can cancel your order before it is confirmed by the vendor. Go to My Orders, select the order, and tap "Cancel Order".'
    },
    {
      category: 'orders',
      question: 'How do I track my order?',
      answer: 'Go to My Orders, select your order, and tap "Track Order" to see real-time status and location updates.'
    },
    {
      category: 'payment',
      question: 'What payment methods are accepted?',
      answer: 'We accept UPI, credit/debit cards, net banking, and cash on delivery (where available).'
    },
    {
      category: 'payment',
      question: 'Is my payment information secure?',
      answer: 'Yes, all payment information is encrypted and processed through secure payment gateways. We do not store your card details.'
    },
    {
      category: 'payment',
      question: 'How do refunds work?',
      answer: 'Refunds are processed within 5-7 business days to your original payment method after order cancellation or return approval.'
    },
    {
      category: 'delivery',
      question: 'What are the delivery charges?',
      answer: 'Delivery charges vary based on distance and order value. Many vendors offer free delivery above a minimum order value.'
    },
    {
      category: 'delivery',
      question: 'How long does delivery take?',
      answer: 'Delivery times vary by vendor and location, typically 1-3 days. Check estimated delivery time during checkout.'
    },
    {
      category: 'delivery',
      question: 'Can I change my delivery address?',
      answer: 'You can change the delivery address before the order is confirmed. Contact the vendor immediately if already confirmed.'
    },
    {
      category: 'account',
      question: 'How do I update my profile?',
      answer: 'Go to Profile > Edit Profile to update your name, email, phone number, and other details.'
    },
    {
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'On the login screen, tap "Forgot Password" and follow the instructions sent to your registered email.'
    },
    {
      category: 'account',
      question: 'Can I delete my account?',
      answer: 'Yes, contact support at support@annadata.com to request account deletion. All your data will be permanently removed.'
    },
    {
      category: 'orders',
      question: 'What is the return policy?',
      answer: 'Returns are accepted within 24 hours of delivery for quality issues. Contact the vendor through order chat for returns.'
    },
    {
      category: 'account',
      question: 'How do I contact customer support?',
      answer: 'Tap "Contact Us" in Profile or email support@annadata.com. For order-specific issues, use the order chat feature.'
    },
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleEmailSupport = async () => {
    const email = 'support@annadata.com'
    const subject = 'Help Request'
    const body = 'Hi, I need help with...'
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    const canOpen = await Linking.canOpenURL(url)
    if (canOpen) {
      await Linking.openURL(url)
    }
  }

  const handlePhoneSupport = async () => {
    const phoneNumber = 'tel:+911800-123-4567'
    const canOpen = await Linking.canOpenURL(phoneNumber)
    if (canOpen) {
      await Linking.openURL(phoneNumber)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="ArrowLeft" size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Help Center</Text>
        
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="Search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for help..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="X" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(category => (
          <CategoryButton
            key={category.id}
            title={category.title}
            icon={category.icon}
            isActive={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
          />
        ))}
      </ScrollView>

      {/* FAQs */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Frequently Asked Questions ({filteredFAQs.length})
          </Text>
          
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isExpanded={expandedFAQ === index}
                onPress={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="Search" size={48} color="#E0E0E0" />
              <Text style={styles.emptyText}>No FAQs found</Text>
              <Text style={styles.emptySubtext}>
                Try a different search term or category
              </Text>
            </View>
          )}
        </View>

        {/* Contact Support */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Still need help?</Text>
          <Text style={styles.supportSubtitle}>Our support team is here for you</Text>
          
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={handleEmailSupport}
          >
            <View style={styles.supportIcon}>
              <Icon name="Mail" size={24} color="#2196F3" />
            </View>
            <View style={styles.supportContent}>
              <Text style={styles.supportLabel}>Email Support</Text>
              <Text style={styles.supportValue}>support@annadata.com</Text>
            </View>
            <Icon name="ChevronRight" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.supportButton}
            onPress={handlePhoneSupport}
          >
            <View style={styles.supportIcon}>
              <Icon name="Phone" size={24} color="#4CAF50" />
            </View>
            <View style={styles.supportContent}>
              <Text style={styles.supportLabel}>Call Support</Text>
              <Text style={styles.supportValue}>+91 1800-123-4567</Text>
            </View>
            <Icon name="ChevronRight" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.supportButton}
            onPress={() => {
              /* Open chat or WhatsApp */
            }}
          >
            <View style={styles.supportIcon}>
              <Icon name="MessageCircle" size={24} color="#FF9800" />
            </View>
            <View style={styles.supportContent}>
              <Text style={styles.supportLabel}>Live Chat</Text>
              <Text style={styles.supportValue}>Chat with us in real-time</Text>
            </View>
            <Icon name="ChevronRight" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Available 24/7 to assist you
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  categoriesContainer: {
    maxHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  activeCategoryButton: {
    backgroundColor: '#2196F3',
    elevation: 2,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
  },
  activeCategoryText: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  supportSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  supportSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportContent: {
    flex: 1,
  },
  supportLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  supportValue: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
})

export default HelpCenter
