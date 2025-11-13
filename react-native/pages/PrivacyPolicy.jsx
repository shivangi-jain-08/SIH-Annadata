import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from '../Icon'

const PrivacyPolicy = () => {
  const navigation = useNavigation()

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
        
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.updateDate}>Last Updated: October 15, 2025</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.intro}>
            At Annadata, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          
          <Text style={styles.subTitle}>Personal Information:</Text>
          <Text style={styles.paragraph}>
            • Name, email address, and phone number
          </Text>
          <Text style={styles.paragraph}>
            • Delivery addresses and location data
          </Text>
          <Text style={styles.paragraph}>
            • Profile photo (optional)
          </Text>
          <Text style={styles.paragraph}>
            • Payment information (processed securely by third-party providers)
          </Text>

          <Text style={styles.subTitle}>Usage Information:</Text>
          <Text style={styles.paragraph}>
            • Device information (model, operating system, unique device identifiers)
          </Text>
          <Text style={styles.paragraph}>
            • App usage data and browsing history within the app
          </Text>
          <Text style={styles.paragraph}>
            • Transaction history and order details
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the collected information to:
          </Text>
          <Text style={styles.paragraph}>
            • Facilitate transactions between farmers, vendors, and consumers
          </Text>
          <Text style={styles.paragraph}>
            • Process and deliver your orders
          </Text>
          <Text style={styles.paragraph}>
            • Provide customer support and respond to your inquiries
          </Text>
          <Text style={styles.paragraph}>
            • Send notifications about order status and updates
          </Text>
          <Text style={styles.paragraph}>
            • Improve our services and user experience
          </Text>
          <Text style={styles.paragraph}>
            • Detect and prevent fraud or unauthorized activities
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Location Information</Text>
          <Text style={styles.paragraph}>
            We collect and use your location data to:
          </Text>
          <Text style={styles.paragraph}>
            • Show nearby vendors and farmers
          </Text>
          <Text style={styles.paragraph}>
            • Calculate delivery distances and costs
          </Text>
          <Text style={styles.paragraph}>
            • Provide accurate delivery services
          </Text>
          <Text style={styles.paragraph}>
            • Send proximity-based notifications (with your consent)
          </Text>
          <Text style={styles.note}>
            You can control location permissions through your device settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Information Sharing</Text>
          <Text style={styles.paragraph}>
            We may share your information with:
          </Text>
          <Text style={styles.paragraph}>
            • Vendors and farmers to fulfill your orders
          </Text>
          <Text style={styles.paragraph}>
            • Payment processors to handle transactions
          </Text>
          <Text style={styles.paragraph}>
            • Delivery partners for order fulfillment
          </Text>
          <Text style={styles.paragraph}>
            • Service providers who assist in operating our platform
          </Text>
          <Text style={styles.paragraph}>
            • Law enforcement when required by law
          </Text>
          <Text style={styles.note}>
            We do not sell your personal information to third parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement industry-standard security measures to protect your data:
          </Text>
          <Text style={styles.paragraph}>
            • Encryption of sensitive data in transit and at rest
          </Text>
          <Text style={styles.paragraph}>
            • Secure authentication and authorization processes
          </Text>
          <Text style={styles.paragraph}>
            • Regular security audits and updates
          </Text>
          <Text style={styles.paragraph}>
            • Access controls and monitoring systems
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <Text style={styles.paragraph}>
            • Access your personal data
          </Text>
          <Text style={styles.paragraph}>
            • Update or correct your information
          </Text>
          <Text style={styles.paragraph}>
            • Delete your account and associated data
          </Text>
          <Text style={styles.paragraph}>
            • Opt-out of marketing communications
          </Text>
          <Text style={styles.paragraph}>
            • Control location tracking and notifications
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Cookies and Tracking</Text>
          <Text style={styles.paragraph}>
            We use cookies and similar technologies to:
          </Text>
          <Text style={styles.paragraph}>
            • Remember your preferences and settings
          </Text>
          <Text style={styles.paragraph}>
            • Analyze app performance and user behavior
          </Text>
          <Text style={styles.paragraph}>
            • Provide personalized content and recommendations
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Transaction records are kept for accounting and tax purposes as required by law.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our services are not intended for users under the age of 18. We do not knowingly collect personal information from children.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy in the app and updating the "Last Updated" date.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions or concerns about this Privacy Policy, please contact us:
          </Text>
          <Text style={styles.contactInfo}>Email: privacy@annadata.com</Text>
          <Text style={styles.contactInfo}>Phone: +91 1800-123-4567</Text>
          <Text style={styles.contactInfo}>Address: Annadata Technologies, New Delhi, India</Text>
        </View>

        <View style={styles.footer}>
          <Icon name="Shield" size={32} color="#4CAF50" />
          <Text style={styles.footerText}>
            Your privacy and security are our top priorities
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  updateDate: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  intro: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 8,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
    marginBottom: 8,
  },
  note: {
    fontSize: 14,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 15,
    color: '#2196F3',
    lineHeight: 24,
    marginBottom: 4,
  },
  footer: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#388E3C',
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
})

export default PrivacyPolicy
