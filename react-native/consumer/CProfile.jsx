import React, { useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  Alert,
  Share,
  Linking
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from '../Icon'

const { width } = Dimensions.get('window')

const UserDetailItem = ({ icon, label, value, onPress, showChevron = false }) => (
  <TouchableOpacity 
    style={[styles.userDetailItem, onPress && styles.clickableItem]} 
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.detailIcon}>
      <Icon name={icon} size={20} color="#2196F3" />
    </View>
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
    {showChevron && (
      <Icon name="ChevronRight" size={20} color="#999" />
    )}
  </TouchableOpacity>
)

const ProfileStatsCard = ({ icon, title, value, color, onPress }) => (
  <TouchableOpacity style={styles.statsCard} onPress={onPress}>
    <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
      <Icon name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statsValue}>{value}</Text>
    <Text style={styles.statsTitle}>{title}</Text>
  </TouchableOpacity>
)

const OptionItem = ({ icon, title, description, color, onPress, showBadge = false, badgeText = '' }) => (
  <TouchableOpacity style={styles.optionItem} onPress={onPress}>
    <View style={[styles.optionIcon, { backgroundColor: color + '20' }]}>
      <Icon name={icon} size={22} color={color} />
    </View>
    <View style={styles.optionContent}>
      <View style={styles.optionHeader}>
        <Text style={styles.optionTitle}>{title}</Text>
        {showBadge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        )}
      </View>
      <Text style={styles.optionDescription}>{description}</Text>
    </View>
    <Icon name="ChevronRight" size={20} color="#999" />
  </TouchableOpacity>
)

const CProfile = () => {
  const navigation = useNavigation()
  const [userStats] = useState({
    totalOrders: 23,
    favouriteVendors: 8,
    totalSpent: 15750,
    savedAmount: 2340
  })

  // User profile data
  const userProfile = {
    photo: 'https://via.placeholder.com/120x120/2196F3/FFFFFF?text=PS',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 98765 43210',
    address: 'B-204, Green Valley Apartments, Punjabi Bagh, New Delhi - 110026'
  }

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Opening profile edit screen...')
  }

  const handleViewOrders = () => {
    console.log('Navigate to Orders')
    Alert.alert('My Orders', 'Opening orders history...')
  }

  const handleNearbyVendors = () => {
    console.log('Nearby Vendors')
    Alert.alert('Nearby Vendors', 'Finding vendors near your location...')
  }

  const handleTermsAndConditions = () => {
    Alert.alert('Terms and Conditions', 'Opening terms and conditions...')
  }

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Opening privacy policy...')
  }

  const handleContactUs = async () => {
    try {
      const supported = await Linking.canOpenURL('mailto:support@krishika.com')
      if (supported) {
        await Linking.openURL('mailto:support@krishika.com?subject=Support Request&body=Hi, I need help with...')
      } else {
        Alert.alert('Contact Us', 'Email: support@krishika.com\nPhone: +91 1800-123-4567')
      }
    } catch (error) {
      Alert.alert('Contact Us', 'Email: support@krishika.com\nPhone: +91 1800-123-4567')
    }
  }

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out Krishika - Connect directly with farmers and get fresh produce at fair prices! Download now: https://krishimitra.app',
        title: 'Share Krishika',
      })
    } catch (error) {
      console.log('Error sharing:', error)
    }
  }

  const handleNotificationSettings = () => {
    Alert.alert('Notification Settings', 'Manage your notification preferences...')
  }

  const handlePaymentMethods = () => {
    Alert.alert('Payment Methods', 'Manage your saved payment methods...')
  }

  const handleAddresses = () => {
    Alert.alert('Saved Addresses', 'Manage your delivery addresses...')
  }

  const handleHelpCenter = () => {
    Alert.alert('Help Center', 'Opening help and FAQ section...')
  }

  const handleRateApp = () => {
    Alert.alert('Rate App', 'Thank you for rating Krishika!')
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => navigation.navigate('Auth') }
      ]
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="ArrowLeft" size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>My Profile</Text>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditProfile}
        >
          <Icon name="Edit3" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: userProfile.photo }} style={styles.profileImage} />
          <TouchableOpacity style={styles.cameraButton} onPress={handleEditProfile}>
            <Icon name="Camera" size={16} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userProfile.fullName}</Text>
          <Text style={styles.userTitle}>Consumer Member</Text>
          <View style={styles.verifiedBadge}>
            <Icon name="CheckCircle" size={16} color="#4CAF50" />
            <Text style={styles.verifiedText}>Verified Account</Text>
          </View>
        </View>
      </View>

      {/* User Details */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <UserDetailItem
          icon="User"
          label="Full Name"
          value={userProfile.fullName}
          onPress={handleEditProfile}
          showChevron={true}
        />
        
        <UserDetailItem
          icon="Mail"
          label="Email Address"
          value={userProfile.email}
          onPress={handleEditProfile}
          showChevron={true}
        />
        
        <UserDetailItem
          icon="Phone"
          label="Phone Number"
          value={userProfile.phone}
          onPress={handleEditProfile}
          showChevron={true}
        />
        
        <UserDetailItem
          icon="MapPin"
          label="Address"
          value={userProfile.address}
          onPress={handleAddresses}
          showChevron={true}
        />
      </View>

      {/* Profile Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Activity</Text>
        <View style={styles.statsContainer}>
          <ProfileStatsCard
            icon="ShoppingBag"
            title="Total Orders"
            value={userStats.totalOrders}
            color="#2196F3"
            onPress={handleViewOrders}
          />
          <ProfileStatsCard
            icon="Users"
            title="Favorite Vendors"
            value={userStats.favouriteVendors}
            color="#4CAF50"
            onPress={handleNearbyVendors}
          />
          <ProfileStatsCard
            icon="DollarSign"
            title="Total Spent"
            value={`₹${userStats.totalSpent}`}
            color="#FF9800"
            onPress={handleViewOrders}
          />
          <ProfileStatsCard
            icon="TrendingDown"
            title="Amount Saved"
            value={`₹${userStats.savedAmount}`}
            color="#9C27B0"
            onPress={() => Alert.alert('Savings', 'You saved by buying directly from farmers!')}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <OptionItem
          icon="Package"
          title="View Orders"
          description="Check your order history and track deliveries"
          color="#2196F3"
          onPress={handleViewOrders}
          showBadge={userStats.totalOrders > 0}
          badgeText={userStats.totalOrders.toString()}
        />
        
        <OptionItem
          icon="MapPin"
          title="Nearby Vendors"
          description="Find and connect with vendors in your area"
          color="#4CAF50"
          onPress={handleNearbyVendors}
        />
        
        <OptionItem
          icon="CreditCard"
          title="Payment Methods"
          description="Manage your saved payment options"
          color="#FF9800"
          onPress={handlePaymentMethods}
        />
        
        <OptionItem
          icon="Bell"
          title="Notification Settings"
          description="Control your notification preferences"
          color="#9C27B0"
          onPress={handleNotificationSettings}
        />
      </View>

      {/* Support & Legal */}
      <View style={styles.supportSection}>
        <Text style={styles.sectionTitle}>Support & Legal</Text>
        
        <OptionItem
          icon="FileText"
          title="Terms and Conditions"
          description="Read our terms of service"
          color="#607D8B"
          onPress={handleTermsAndConditions}
        />
        
        <OptionItem
          icon="Shield"
          title="Privacy Policy"
          description="Learn how we protect your data"
          color="#795548"
          onPress={handlePrivacyPolicy}
        />
        
        <OptionItem
          icon="MessageCircle"
          title="Contact Us"
          description="Get help or share feedback with our team"
          color="#00BCD4"
          onPress={handleContactUs}
        />
        
        <OptionItem
          icon="HelpCircle"
          title="Help Center"
          description="Find answers to common questions"
          color="#3F51B5"
          onPress={handleHelpCenter}
        />
      </View>

      {/* Additional Options */}
      <View style={styles.additionalSection}>
        <Text style={styles.sectionTitle}>More</Text>
        
        <OptionItem
          icon="Share2"
          title="Share App"
          description="Tell your friends about Krishika"
          color="#E91E63"
          onPress={handleShareApp}
        />
        
        <OptionItem
          icon="Star"
          title="Rate Our App"
          description="Rate us on the app store"
          color="#FFC107"
          onPress={handleRateApp}
        />
        
        <OptionItem
          icon="LogOut"
          title="Logout"
          description="Sign out of your account"
          color="#F44336"
          onPress={handleLogout}
        />
      </View>

      {/* App Info */}
      <View style={styles.appInfoSection}>
        <Text style={styles.appVersion}>Krishika v2.1.0</Text>
        <Text style={styles.appDescription}>
          Connecting farmers and consumers for a sustainable future
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header
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
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },

  // Profile Section
  profileSection: {
    backgroundColor: 'white',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#2196F3',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },

  // Sections
  detailsSection: {
    backgroundColor: 'white',
    marginTop: 10,
    paddingVertical: 20,
  },
  statsSection: {
    backgroundColor: 'white',
    marginTop: 10,
    paddingVertical: 20,
  },
  quickActionsSection: {
    backgroundColor: 'white',
    marginTop: 10,
    paddingVertical: 20,
  },
  supportSection: {
    backgroundColor: 'white',
    marginTop: 10,
    paddingVertical: 20,
  },
  additionalSection: {
    backgroundColor: 'white',
    marginTop: 10,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  // User Details
  userDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  clickableItem: {
    backgroundColor: 'rgba(33, 150, 243, 0.02)',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statsCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 56) / 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Options
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  badgeContainer: {
    backgroundColor: '#F44336',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },

  // App Info
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
})

export default CProfile