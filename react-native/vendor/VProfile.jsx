import React, { useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert,
  Linking,
  Share
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from '../Icon'

const UserDetailItem = ({ icon, label, value, iconColor = '#666' }) => {
  return (
    <View style={styles.userDetailItem}>
      <View style={styles.detailIconContainer}>
        <Icon name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  )
}

const OptionItem = ({ icon, title, description, onPress, iconColor = '#666', showChevron = true }) => {
  return (
    <TouchableOpacity style={styles.optionItem} onPress={onPress}>
      <View style={[styles.optionIconContainer, { backgroundColor: iconColor + '20' }]}>
        <Icon name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>
        {description && <Text style={styles.optionDescription}>{description}</Text>}
      </View>
      {showChevron && (
        <Icon name="ChevronRight" size={20} color="#999" />
      )}
    </TouchableOpacity>
  )
}

const BusinessStatsCard = ({ label, value, icon, color }) => {
  return (
    <View style={styles.businessStatsCard}>
      <View style={[styles.businessStatsIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <View style={styles.businessStatsContent}>
        <Text style={styles.businessStatsValue}>{value}</Text>
        <Text style={styles.businessStatsLabel}>{label}</Text>
      </View>
    </View>
  )
}

const VProfile = () => {
  const navigation = useNavigation()

  // Mock vendor data
  const vendorData = {
    photo: 'https://via.placeholder.com/120/FF9800/FFFFFF?text=AK',
    fullName: 'Amit Kumar',
    role: 'Vendor',
    email: 'amit.kumar@vendor.com',
    phoneNumber: '+91 9876543210',
    businessName: 'Kumar Agro Trading',
    location: 'Delhi, India'
  }

  // Mock business stats
  const businessStats = [
    { label: 'Products', value: '15', icon: 'Package', color: '#4CAF50' },
    { label: 'Customers', value: '248', icon: 'Users', color: '#2196F3' },
    { label: 'Orders', value: '127', icon: 'ShoppingBag', color: '#FF9800' },
    { label: 'Rating', value: '4.8', icon: 'Star', color: '#F44336' },
  ]

  const handleNearbyCustomers = () => {
    console.log('Nearby Customers')
    Alert.alert(
      'Nearby Customers',
      'Searching for customers in your area...',
      [{ text: 'OK' }]
    )
  }

  const handleTermsAndConditions = () => {
    Alert.alert(
      'Terms and Conditions',
      'Opening Terms and Conditions...',
      [{ text: 'OK' }]
    )
  }

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'Opening Privacy Policy...',
      [{ text: 'OK' }]
    )
  }

  const handleContactUs = () => {
    Alert.alert(
      'Contact Us',
      'Choose how you want to contact us:',
      [
        { text: 'Call Support', onPress: () => Linking.openURL('tel:+911234567890') },
        { text: 'Email Support', onPress: () => Linking.openURL('mailto:support@annadata.com') },
        { text: 'Cancel', style: 'cancel' }
      ]
    )
  }

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Profile editing functionality coming soon!',
      [{ text: 'OK' }]
    )
  }

  const handleBusinessSettings = () => {
    Alert.alert(
      'Business Settings',
      'Manage your business preferences and settings.',
      [{ text: 'OK' }]
    )
  }

  const handleShareBusiness = async () => {
    try {
      await Share.share({
        message: `Check out ${vendorData.businessName} on Annadata! Quality crops and excellent service. Contact: ${vendorData.phoneNumber}`,
        title: 'Share Business Profile'
      })
    } catch (error) {
      Alert.alert('Error', 'Could not share business profile')
    }
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => navigation.navigate('Auth'), style: 'destructive' }
      ]
    )
  }

  const profileOptions = [
    {
      icon: 'MapPin',
      title: 'Nearby Customers',
      description: 'Find customers in your area',
      onPress: handleNearbyCustomers,
      iconColor: '#4CAF50'
    },
    {
      icon: 'FileText',
      title: 'Terms and Conditions',
      description: 'Read our terms of service',
      onPress: handleTermsAndConditions,
      iconColor: '#2196F3'
    },
    {
      icon: 'Shield',
      title: 'Privacy Policy',
      description: 'Learn about data privacy and security',
      onPress: handlePrivacyPolicy,
      iconColor: '#9C27B0'
    },
    {
      icon: 'MessageCircle',
      title: 'Contact Us',
      description: 'Get help and support',
      onPress: handleContactUs,
      iconColor: '#FF9800'
    }
  ]

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="ArrowLeft" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Manage your vendor account</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Icon name="Pen" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Vendor Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: vendorData.photo }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Icon name="Camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.fullName}>{vendorData.fullName}</Text>
              <View style={styles.roleBadge}>
                <Icon name="Store" size={14} color="#FF9800" />
                <Text style={styles.roleText}>VENDOR</Text>
              </View>
            </View>
            <Text style={styles.businessName}>{vendorData.businessName}</Text>
            <Text style={styles.profileLocation}>{vendorData.location}</Text>
          </View>
        </View>

        {/* Business Stats */}
        <View style={styles.businessStatsContainer}>
          {businessStats.map((stat, index) => (
            <BusinessStatsCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </View>

        {/* User Details */}
        <View style={styles.userDetails}>
          <UserDetailItem
            icon="Mail"
            label="Email Address"
            value={vendorData.email}
            iconColor="#2196F3"
          />
          <UserDetailItem
            icon="Phone"
            label="Phone Number"
            value={vendorData.phoneNumber}
            iconColor="#4CAF50"
          />
          <UserDetailItem
            icon="Building"
            label="Business"
            value={vendorData.businessName}
            iconColor="#FF9800"
          />
          <UserDetailItem
            icon="MapPin"
            label="Location"
            value={vendorData.location}
            iconColor="#9C27B0"
          />
        </View>
      </View>

      {/* Main Options Section */}
      <View style={styles.optionsSection}>
        <Text style={styles.sectionTitle}>Customer & Support</Text>
        <View style={styles.optionsContainer}>
          {profileOptions.map((option, index) => (
            <OptionItem
              key={index}
              icon={option.icon}
              title={option.title}
              description={option.description}
              onPress={option.onPress}
              iconColor={option.iconColor}
            />
          ))}
        </View>
      </View>

      {/* Business Options */}
      <View style={styles.businessSection}>
        <Text style={styles.sectionTitle}>Business</Text>
        <View style={styles.optionsContainer}>
          <OptionItem
            icon="Settings"
            title="Business Settings"
            description="Manage business preferences and policies"
            onPress={handleBusinessSettings}
            iconColor="#666"
          />
          <OptionItem
            icon="Share2"
            title="Share Business"
            description="Share your business profile with others"
            onPress={handleShareBusiness}
            iconColor="#4CAF50"
          />
          <OptionItem
            icon="ChartBar"
            title="Analytics"
            description="View business performance and insights"
            onPress={() => Alert.alert('Analytics', 'Business analytics coming soon!')}
            iconColor="#2196F3"
          />
        </View>
      </View>

      {/* Account Options */}
      <View style={styles.accountSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.optionsContainer}>
          <OptionItem
            icon="Headphones"
            title="Help & Support"
            description="FAQ and troubleshooting for vendors"
            onPress={() => Alert.alert('Help', 'Vendor help section coming soon!')}
            iconColor="#FF9800"
          />
          <OptionItem
            icon="Bell"
            title="Notifications"
            description="Manage notification preferences"
            onPress={() => Alert.alert('Notifications', 'Notification settings coming soon!')}
            iconColor="#9C27B0"
          />
          <OptionItem
            icon="LogOut"
            title="Logout"
            description="Sign out of your vendor account"
            onPress={handleLogout}
            iconColor="#F44336"
          />
        </View>
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Annadata Vendor v1.0.0</Text>
        <Text style={styles.versionSubtext}>Empowering agricultural commerce</Text>
      </View>
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
    backgroundColor: '#FF9800',
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
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    marginTop: 2,
  },

  // Profile Card Styles
  profileCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: -10,
    borderRadius: 20,
    padding: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#FF9800',
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
    marginLeft: 4,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF9800',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 14,
    color: '#666',
  },

  // Business Stats
  businessStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  businessStatsCard: {
    alignItems: 'center',
    flex: 1,
  },
  businessStatsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  businessStatsContent: {
    alignItems: 'center',
  },
  businessStatsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  businessStatsLabel: {
    fontSize: 12,
    color: '#666',
  },

  // User Details Styles
  userDetails: {
    gap: 15,
  },
  userDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  // Options Section Styles
  optionsSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  businessSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  accountSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  optionsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },

  // Version Container
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#999',
  },
})

export default VProfile