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

const RoleBadge = ({ role }) => {
  const getRoleConfig = (role) => {
    switch (role.toLowerCase()) {
      case 'farmer':
        return { color: '#4CAF50', icon: 'Leaf', bg: '#4CAF5020' }
      case 'vendor':
        return { color: '#FF9800', icon: 'Store', bg: '#FF980020' }
      case 'consumer':
        return { color: '#2196F3', icon: 'User', bg: '#2196F320' }
      default:
        return { color: '#666', icon: 'User', bg: '#66666620' }
    }
  }

  const config = getRoleConfig(role)

  return (
    <View style={[styles.roleBadge, { backgroundColor: config.bg }]}>
      <Icon name={config.icon} size={16} color={config.color} />
      <Text style={[styles.roleText, { color: config.color }]}>{role}</Text>
    </View>
  )
}

const Profile = () => {
  const navigation = useNavigation()
  
  // State for user data management
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Load user data from AsyncStorage or API
  const loadUserData = async (forceFresh = false) => {
    try {
      setError(null);
      
      let user;
      if (forceFresh) {
        // Fetch fresh data from API
        user = await UserService.fetchUserProfile();
      } else {
        // Try to get cached data first
        user = await UserService.getCurrentUser();
        if (!user) {
          // If no cached data, fetch from API
          user = await UserService.fetchUserProfile();
        }
      }

      if (user) {
        const formattedUser = UserService.formatUserData(user);
        setUserData(formattedUser);
      } else {
        throw new Error('No user data found');
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err.message);
      
      // Use mock data as fallback
      const mockUser = UserService.generateMockUserData();
      const formattedMockUser = UserService.formatUserData(mockUser);
      setUserData(formattedMockUser);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData(true); // Force fresh data
    setRefreshing(false);
  };

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Generate display data from user data
  const getDisplayUserData = () => {
    if (!userData) return {};
    
    return {
      photo: userData.profileImage || UserService.getAvatarUrl(userData),
      fullName: userData.fullName,
      role: UserService.getUserRole(userData),
      email: userData.email,
      phoneNumber: userData.phone,
      village: userData.village,
      state: userData.state,
      district: userData.district,
      pincode: userData.pincode,
      address: userData.address,
      id: userData.id
    };
  };

  const displayData = getDisplayUserData();

  const handleTermsAndConditions = () => {
    navigation.navigate('Terms');
  }

  const handlePrivacyPolicy = () => {
    navigation.navigate('Privacy');
  }

  const handleContactUs = () => {
    // Alert.alert(
    //   'Contact Us',
    //   'Choose how you want to contact us:',
    //   [
    //     { text: 'Call Support', onPress: () => Linking.openURL('tel:+911234567890') },
    //     { text: 'Email Support', onPress: () => Linking.openURL('mailto:support@annadata.com') },
    //     { text: 'Cancel', style: 'cancel' }
    //   ]
    // )
    navigation.navigate('Contact');
  }

  const handleShareApp = async () => {
    try {
      const shareContent = {
        title: 'Annadata - Smart Farming Companion',
        message: `🌾 Discover Annadata - Your Smart Farming Companion! 🌾

🚀 Transform your farming with AI-powered features:
✅ Crop Disease Detection with 95%+ accuracy
✅ Real-time Weather Forecasts
✅ Personalized Crop Recommendations  
✅ Agricultural Marketplace
✅ Expert Consultations & Support

📱 Download Annadata now and join thousands of farmers revolutionizing agriculture with technology!

#SmartFarming #Agriculture #Technology #Annadata

Download: https://play.google.com/store/apps/annadata`,
        url: 'https://play.google.com/store/apps/annadata'
      }

      await Share.share(shareContent)
    } catch (error) {
      console.error('Share error:', error)
      Alert.alert(
        'Share Error', 
        'Could not share the app at the moment. Please try again later.',
        [{ text: 'OK' }]
      )
    }
  }

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Profile editing functionality coming soon!',
      [{ text: 'OK' }]
    )
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            try {
              await UserService.clearUserData();
              navigation.navigate('Auth');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout properly');
            }
          }, 
          style: 'destructive' 
        }
      ]
    )
  }

  const profileOptions = [
    {
      icon: 'FileText',
      title: 'Terms and Conditions',
      description: 'Read our terms of service',
      onPress: handleTermsAndConditions,
      iconColor: '#4CAF50'
    },
    {
      icon: 'Shield',
      title: 'Privacy Policy',
      description: 'Learn about data privacy and security',
      onPress: handlePrivacyPolicy,
      iconColor: '#2196F3'
    },
    {
      icon: 'MessageCircle',
      title: 'Contact Us',
      description: 'Get help and support',
      onPress: handleContactUs,
      iconColor: '#FF9800'
    },
    {
      icon: 'Share2',
      title: 'Share to a Friend',
      description: 'Spread the word about Annadata\'s smart farming features',
      onPress: handleShareApp,
      iconColor: '#9C27B0'
    }
  ]

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

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
            <Text style={styles.headerSubtitle}>Manage your account information</Text>
            {error && (
              <Text style={styles.errorText}>Using cached data - {error}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Icon name="Pen" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* User Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: displayData.photo }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Icon name="Camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.fullName}>{displayData.fullName || 'Unknown User'}</Text>
              <RoleBadge role={displayData.role || 'User'} />
            </View>
            <Text style={styles.profileEmail}>{displayData.email || 'No email'}</Text>
          </View>
        </View>

        {/* User Details */}
        <View style={styles.userDetails}>
          <UserDetailItem
            icon="Mail"
            label="Email Address"
            value={displayData.email || 'Not provided'}
            iconColor="#2196F3"
          />
          <UserDetailItem
            icon="Phone"
            label="Phone Number"
            value={displayData.phoneNumber || 'Not provided'}
            iconColor="#4CAF50"
          />
          <UserDetailItem
            icon="MapPin"
            label="Village"
            value={displayData.village || 'Not specified'}
            iconColor="#FF9800"
          />
          <UserDetailItem
            icon="Map"
            label="State"
            value={displayData.state || 'Not specified'}
            iconColor="#9C27B0"
          />
          {displayData.district && (
            <UserDetailItem
              icon="Globe"
              label="District"
              value={displayData.district}
              iconColor="#00BCD4"
            />
          )}
          {displayData.pincode && displayData.pincode !== 'Unknown' && (
            <UserDetailItem
              icon="Hash"
              label="PIN Code"
              value={displayData.pincode}
              iconColor="#795548"
            />
          )}
        </View>
      </View>

      {/* Options Section */}
      <View style={styles.optionsSection}>
        <Text style={styles.sectionTitle}>App Settings</Text>
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

      {/* Additional Options */}
      <View style={styles.additionalSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.optionsContainer}>
          <OptionItem
            icon="Settings"
            title="Settings (Beta)"
            description="App preferences and configurations"
            onPress={() => navigation.navigate('Settings')}
            iconColor="#666"
          />
          <OptionItem
            icon="Headphones"
            title="Help & Support"
            description="FAQ and troubleshooting"
            onPress={() => navigation.navigate('FAQ')}
            iconColor="#2196F3"
          />
          <OptionItem
            icon="LogOut"
            title="Logout"
            description="Sign out of your account"
            onPress={handleLogout}
            iconColor="#F44336"
          />
        </View>
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Annadata v1.0.0</Text>
        <Text style={styles.versionSubtext}>Built with ❤️ for farmers</Text>
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
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#4CAF50',
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  profileEmail: {
    fontSize: 16,
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
  additionalSection: {
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

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 5,
    fontStyle: 'italic',
  },
})

export default Profile