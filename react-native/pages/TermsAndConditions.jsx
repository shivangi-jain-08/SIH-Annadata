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

const TermsAndConditions = () => {
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
        
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.updateDate}>Last Updated: October 15, 2025</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using the Annadata application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. User Accounts</Text>
          <Text style={styles.paragraph}>
            • You must provide accurate and complete information when creating an account
          </Text>
          <Text style={styles.paragraph}>
            • You are responsible for maintaining the security of your account
          </Text>
          <Text style={styles.paragraph}>
            • You must notify us immediately of any unauthorized use of your account
          </Text>
          <Text style={styles.paragraph}>
            • One person or entity may not maintain more than one account
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Use of Services</Text>
          <Text style={styles.paragraph}>
            Annadata provides a platform connecting farmers, vendors, and consumers. You agree to:
          </Text>
          <Text style={styles.paragraph}>
            • Use the service only for lawful purposes
          </Text>
          <Text style={styles.paragraph}>
            • Not engage in fraudulent activities
          </Text>
          <Text style={styles.paragraph}>
            • Provide accurate product information (for sellers)
          </Text>
          <Text style={styles.paragraph}>
            • Honor your purchase commitments (for buyers)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Transactions</Text>
          <Text style={styles.paragraph}>
            All transactions conducted through Annadata are between buyers and sellers. While we facilitate these transactions, we are not a party to them. We do not guarantee the quality, safety, or legality of items listed.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Payment Terms</Text>
          <Text style={styles.paragraph}>
            • Payment processing is handled by secure third-party providers
          </Text>
          <Text style={styles.paragraph}>
            • Prices are set by individual sellers
          </Text>
          <Text style={styles.paragraph}>
            • All prices are in Indian Rupees (INR)
          </Text>
          <Text style={styles.paragraph}>
            • Refund policies are subject to individual seller terms
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Delivery</Text>
          <Text style={styles.paragraph}>
            Delivery times and methods are determined by individual vendors. Annadata is not responsible for delays or issues with delivery, though we will assist in resolving disputes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Cancellations and Refunds</Text>
          <Text style={styles.paragraph}>
            • Orders can be cancelled before confirmation by the seller
          </Text>
          <Text style={styles.paragraph}>
            • Refunds are processed according to seller policies
          </Text>
          <Text style={styles.paragraph}>
            • Disputed charges will be reviewed on a case-by-case basis
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All content on Annadata, including but not limited to text, graphics, logos, and software, is the property of Annadata or its licensors and is protected by copyright and other intellectual property laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Privacy</Text>
          <Text style={styles.paragraph}>
            Your use of Annadata is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            Annadata shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Modifications to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these terms at any time. We will notify users of any material changes. Your continued use of the service after such modifications constitutes acceptance of the updated terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these terms or is harmful to other users, us, or third parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Governing Law</Text>
          <Text style={styles.paragraph}>
            These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms and Conditions, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>Email: legal@annadata.com</Text>
          <Text style={styles.contactInfo}>Phone: +91 1800-123-4567</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Annadata, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 15,
    color: '#2196F3',
    lineHeight: 24,
    marginBottom: 4,
  },
  footer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
    textAlign: 'center',
  },
})

export default TermsAndConditions
