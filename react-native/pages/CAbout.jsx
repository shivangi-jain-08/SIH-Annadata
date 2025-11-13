import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from '../Icon'

const CAbout = () => {
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="ArrowLeft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Annadata</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* App Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Icon name="Package" size={48} color="#4CAF50" />
          </View>
          <Text style={styles.appName}>Annadata</Text>
          <Text style={styles.appTagline}>Connecting Farmers with Consumers</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>
            Annadata is committed to revolutionizing the agricultural supply chain by directly 
            connecting farmers with consumers. We eliminate middlemen, ensuring fair prices for 
            farmers and fresh, quality produce for consumers.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Icon name="MapPin" size={24} color="#2196F3" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Real-time Location Tracking</Text>
              <Text style={styles.featureText}>
                Track nearby vendors and farmers in real-time for quick and convenient purchases
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Icon name="ShoppingCart" size={24} color="#2196F3" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Direct Marketplace</Text>
              <Text style={styles.featureText}>
                Buy directly from farmers and vendors without any middlemen
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Icon name="TrendingUp" size={24} color="#2196F3" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Fair Pricing</Text>
              <Text style={styles.featureText}>
                Transparent pricing ensures farmers get fair compensation and consumers get value
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Icon name="Bell" size={24} color="#2196F3" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Smart Notifications</Text>
              <Text style={styles.featureText}>
                Get notified when vendors with your favorite products are nearby
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Icon name="Shield" size={24} color="#2196F3" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Quality Assurance</Text>
              <Text style={styles.featureText}>
                All products are verified for quality and freshness
              </Text>
            </View>
          </View>
        </View>

        {/* Technology */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technology Stack</Text>
          <Text style={styles.sectionText}>
            Built with React Native for cross-platform mobile experience, powered by Node.js 
            backend, and using real-time WebSocket connections for live location tracking and 
            instant notifications.
          </Text>
        </View>

        {/* Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Team</Text>
          <Text style={styles.sectionText}>
            Developed by a passionate team dedicated to empowering farmers and improving access 
            to fresh agricultural products. Our team combines expertise in agriculture, 
            technology, and user experience design.
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          <View style={styles.contactItem}>
            <Icon name="Mail" size={20} color="#666" />
            <Text style={styles.contactText}>support@annadata.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Icon name="Phone" size={20} color="#666" />
            <Text style={styles.contactText}>+91-XXXX-XXXXXX</Text>
          </View>
          <View style={styles.contactItem}>
            <Icon name="Globe" size={20} color="#666" />
            <Text style={styles.contactText}>www.annadata.com</Text>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Annadata. All rights reserved.</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ in India</Text>
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
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#999',
  },
})

export default CAbout
