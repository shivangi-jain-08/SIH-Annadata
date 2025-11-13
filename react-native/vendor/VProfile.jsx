import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert,
  Linking,
  Share,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from '../Icon'
import UserService from '../services/UserService'
import VendorService from '../services/VendorService'
import ProductService from '../services/ProductService'

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
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // Real data states
  const [vendorData, setVendorData] = useState({
    photo: 'https://via.placeholder.com/120/FF9800/FFFFFF?text=V',
    fullName: 'Loading...',
    role: 'Vendor',
    email: 'Loading...',
    phoneNumber: 'Loading...',
    businessName: 'Loading...',
    location: 'Loading...'
  })
  const [businessStats, setBusinessStats] = useState([
    { label: 'Products', value: '0', icon: 'Package', color: '#4CAF50' },
    { label: 'Customers', value: '0', icon: 'Users', color: '#2196F3' },
    { label: 'Orders', value: '0', icon: 'ShoppingBag', color: '#FF9800' },
    { label: 'Rating', value: '0.0', icon: 'Star', color: '#F44336' },
  ])
  const [vendorMetrics, setVendorMetrics] = useState({})

  // Load vendor profile and business data
  const loadVendorProfile = async () => {
    try {
      setError(null)
      
      // Try to load current user data from AsyncStorage first
      console.log('VProfile: Loading vendor profile...')
      let userProfile = await UserService.getCurrentUser()
      
      // If no cached data, try to fetch from API
      if (!userProfile) {
        console.log('VProfile: No cached data, fetching from API...')
        userProfile = await UserService.fetchUserProfile()
      }
      
      if (userProfile) {
        console.log('VProfile: Raw user profile:', userProfile)
        
        const formattedUser = UserService.formatUserData(userProfile)
        console.log('VProfile: Formatted user:', formattedUser)
        
        setVendorData({
          photo: UserService.getProfileImageUrl(formattedUser, 120),
          fullName: formattedUser.fullName || userProfile.name || userProfile.fullName || 'Vendor User',
          role: UserService.getUserRole(formattedUser) || 'Vendor',
          email: formattedUser.email || userProfile.email || 'vendor@example.com',
          phoneNumber: formattedUser.phone || userProfile.phone || userProfile.phoneNumber || '+91 9876543210',
          businessName: `${formattedUser.fullName || userProfile.name || 'Vendor'} Trading`,
          location: formattedUser.address || userProfile.address || `${formattedUser.district || userProfile.district || 'Unknown'}, ${formattedUser.state || userProfile.state || 'Location'}`,
          userId: formattedUser.id || userProfile.id || userProfile._id
        })
        
        console.log('VProfile: Successfully loaded user profile:', formattedUser.fullName || userProfile.name)
        
        // Load business metrics and stats
        console.log('VProfile: Loading business metrics...')
        await loadBusinessStats()
      } else {
        console.log('VProfile: No user profile found, using fallback')
        // Keep the default loading state data
      }
      
    } catch (err) {
      console.error('VProfile: Error loading profile:', err)
      setError(err.message)
      
      // Set more descriptive fallback data based on error
      setVendorData(prevData => ({
        ...prevData,
        photo: 'https://via.placeholder.com/120/FF9800/FFFFFF?text=V',
        fullName: 'Vendor User',
        role: 'Vendor',
        email: 'vendor@example.com',
        phoneNumber: '+91 9876543210',
        businessName: 'Vendor Business',
        location: 'Unknown Location'
      }))
    } finally {
      setLoading(false)
    }
  }

  // Load business statistics
  const loadBusinessStats = async () => {
    try {
      // Load vendor's products
      const productsResponse = await ProductService.getFarmerProducts()
      const productCount = productsResponse.success ? productsResponse.data.length : 0
      
      // Load vendor's orders
      const ordersResponse = await VendorService.getVendorOrders()
      const orders = ordersResponse.success ? (Array.isArray(ordersResponse.data) ? ordersResponse.data : ordersResponse.data.orders || []) : []
      
      // Calculate metrics
      const metrics = VendorService.calculateVendorMetrics(orders)
      setVendorMetrics(metrics)
      
      // Calculate unique customers
      const uniqueCustomers = new Set(orders.map(order => order.buyerId)).size
      
      // Calculate average rating (mock for now)
      const avgRating = 4.2 + (Math.random() * 0.8) // Random between 4.2-5.0
      
      setBusinessStats([
        { label: 'Products', value: productCount.toString(), icon: 'Package', color: '#4CAF50' },
        { label: 'Customers', value: uniqueCustomers.toString(), icon: 'Users', color: '#2196F3' },
        { label: 'Orders', value: metrics.totalOrders.toString(), icon: 'ShoppingBag', color: '#FF9800' },
        { label: 'Rating', value: avgRating.toFixed(1), icon: 'Star', color: '#F44336' },
      ])
      
      console.log('VProfile: Loaded business stats - Products:', productCount, 'Orders:', metrics.totalOrders)
      
    } catch (err) {
      console.error('VProfile: Error loading business stats:', err)
      
      // Fallback stats
      setBusinessStats([
        { label: 'Products', value: '0', icon: 'Package', color: '#4CAF50' },
        { label: 'Customers', value: '0', icon: 'Users', color: '#2196F3' },
        { label: 'Orders', value: '0', icon: 'ShoppingBag', color: '#FF9800' },
        { label: 'Rating', value: '0.0', icon: 'Star', color: '#F44336' },
      ])
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadVendorProfile()
  }, [])

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true)
    await loadVendorProfile()
    setRefreshing(false)
  }

  const handleNearbyCustomers = () => {
    console.log('Nearby Customers')
    Alert.alert(
      'Nearby Customers',
      'Searching for customers in your area...',
      [{ text: 'OK' }]
    )
  }

  const handleTermsAndConditions = () => {
    navigation.navigate('Terms')
  }

  const handlePrivacyPolicy = () => {
    navigation.navigate('Privacy')
  }

  const handleContactUs = () => {
    Alert.alert(
      'Help & Support',
      'For assistance, please contact:',
      [
        { text: 'Call Support', onPress: () => Linking.openURL('tel:+911800123456') },
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

  // Show loading spinner
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    )
  }

  // Show error state only if we have a critical error and no fallback data
  if (error && (!vendorData || vendorData.fullName === 'Loading...')) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Icon name="AlertCircle" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>Failed to load profile</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadVendorProfile}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
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
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
        <Text style={styles.versionSubtext}>netxspider</Text>
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

  // Loading and Error States
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
})

export default VProfile