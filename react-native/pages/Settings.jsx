import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
  Linking,
  AsyncStorage
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import Icon from '../Icon'

const Settings = () => {
  const navigation = useNavigation()
  
  // Settings State
  const [settings, setSettings] = useState({
    // Notification Settings
    pushNotifications: true,
    weatherAlerts: true,
    diseaseAlerts: true,
    orderUpdates: true,
    marketingNotifications: false,
    
    // App Preferences
    darkMode: false,
    language: 'English',
    temperatureUnit: 'Celsius',
    distanceUnit: 'Kilometers',
    
    // Privacy Settings
    locationAccess: true,
    dataCollection: true,
    personalizedAds: false,
    
    // Advanced Settings
    autoBackup: true,
    offlineMode: true,
    highQualityImages: true,
    dataSaver: false,
  })

  // Load settings from AsyncStorage on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings')
      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings))
      setSettings(newSettings)
    } catch (error) {
      console.error('Error saving settings:', error)
      Alert.alert('Error', 'Failed to save settings. Please try again.')
    }
  }

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    saveSettings(newSettings)
  }

  const handleLanguageChange = () => {
    const languages = ['English', 'Hindi', 'Punjabi', 'Tamil', 'Telugu', 'Gujarati']
    const currentIndex = languages.indexOf(settings.language)
    const nextIndex = (currentIndex + 1) % languages.length
    updateSetting('language', languages[nextIndex])
  }

  const handleTemperatureUnitChange = () => {
    const newUnit = settings.temperatureUnit === 'Celsius' ? 'Fahrenheit' : 'Celsius'
    updateSetting('temperatureUnit', newUnit)
  }

  const handleDistanceUnitChange = () => {
    const newUnit = settings.distanceUnit === 'Kilometers' ? 'Miles' : 'Kilometers'
    updateSetting('distanceUnit', newUnit)
  }

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultSettings = {
              pushNotifications: true,
              weatherAlerts: true,
              diseaseAlerts: true,
              orderUpdates: true,
              marketingNotifications: false,
              darkMode: false,
              language: 'English',
              temperatureUnit: 'Celsius',
              distanceUnit: 'Kilometers',
              locationAccess: true,
              dataCollection: true,
              personalizedAds: false,
              autoBackup: true,
              offlineMode: true,
              highQualityImages: true,
              dataSaver: false,
            }
            saveSettings(defaultSettings)
            Alert.alert('Success', 'Settings have been reset to default values.')
          }
        }
      ]
    )
  }

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear temporary files and cached data. The app may take longer to load initially.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            // Simulate cache clearing
            Alert.alert('Success', 'Cache cleared successfully!')
          }
        }
      ]
    )
  }

  const handleBackupData = () => {
    Alert.alert(
      'Backup Data',
      'Your profile and app data will be backed up to the cloud.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Backup',
          onPress: () => {
            // Simulate backup process
            Alert.alert('Success', 'Data backup completed successfully!')
          }
        }
      ]
    )
  }

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onPress, 
    type = 'switch', 
    iconColor = '#666',
    showChevron = false 
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={type === 'button' ? onPress : null}
      disabled={type === 'switch'}
    >
      <View style={[styles.settingIcon, { backgroundColor: iconColor + '20' }]}>
        <Icon name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.settingAction}>
        {type === 'switch' ? (
          <Switch
            value={value}
            onValueChange={onPress}
            trackColor={{ false: '#E0E0E0', true: '#4CAF5080' }}
            thumbColor={value ? '#4CAF50' : '#999'}
          />
        ) : type === 'value' ? (
          <TouchableOpacity style={styles.valueContainer} onPress={onPress}>
            <Text style={styles.settingValue}>{value}</Text>
            <Icon name="ChevronRight" size={16} color="#999" />
          </TouchableOpacity>
        ) : (
          showChevron && <Icon name="ChevronRight" size={20} color="#999" />
        )}
      </View>
    </TouchableOpacity>
  )

  const SectionHeader = ({ title, subtitle }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  )

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
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetSettings}
        >
          <Icon name="RotateCcw" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <SectionHeader
          title="Notifications"
          subtitle="Manage your notification preferences"
        />
        <View style={styles.settingsSection}>
          <SettingItem
            icon="Bell"
            title="Push Notifications"
            subtitle="Receive app notifications"
            value={settings.pushNotifications}
            onPress={(value) => updateSetting('pushNotifications', value)}
            iconColor="#4CAF50"
          />
          <SettingItem
            icon="Cloud"
            title="Weather Alerts"
            subtitle="Get weather warnings and updates"
            value={settings.weatherAlerts}
            onPress={(value) => updateSetting('weatherAlerts', value)}
            iconColor="#2196F3"
          />
          <SettingItem
            icon="AlertTriangle"
            title="Disease Alerts"
            subtitle="Crop disease detection notifications"
            value={settings.diseaseAlerts}
            onPress={(value) => updateSetting('diseaseAlerts', value)}
            iconColor="#FF9800"
          />
          <SettingItem
            icon="ShoppingCart"
            title="Order Updates"
            subtitle="Order status and delivery notifications"
            value={settings.orderUpdates}
            onPress={(value) => updateSetting('orderUpdates', value)}
            iconColor="#9C27B0"
          />
          <SettingItem
            icon="Mail"
            title="Marketing Notifications"
            subtitle="Promotional offers and news"
            value={settings.marketingNotifications}
            onPress={(value) => updateSetting('marketingNotifications', value)}
            iconColor="#607D8B"
          />
        </View>

        {/* App Preferences Section */}
        <SectionHeader
          title="App Preferences"
          subtitle="Customize your app experience"
        />
        <View style={styles.settingsSection}>
          <SettingItem
            icon="Moon"
            title="Dark Mode"
            subtitle="Switch to dark theme"
            value={settings.darkMode}
            onPress={(value) => updateSetting('darkMode', value)}
            iconColor="#424242"
          />
          <SettingItem
            icon="Globe"
            title="Language"
            subtitle="Choose your preferred language"
            value={settings.language}
            onPress={handleLanguageChange}
            type="value"
            iconColor="#4CAF50"
          />
          <SettingItem
            icon="Thermometer"
            title="Temperature Unit"
            subtitle="Display temperature in"
            value={settings.temperatureUnit}
            onPress={handleTemperatureUnitChange}
            type="value"
            iconColor="#FF5722"
          />
          <SettingItem
            icon="Map"
            title="Distance Unit"
            subtitle="Measure distances in"
            value={settings.distanceUnit}
            onPress={handleDistanceUnitChange}
            type="value"
            iconColor="#00BCD4"
          />
        </View>

        {/* Privacy & Security Section */}
        <SectionHeader
          title="Privacy & Security"
          subtitle="Control your data and privacy"
        />
        <View style={styles.settingsSection}>
          <SettingItem
            icon="MapPin"
            title="Location Access"
            subtitle="Allow app to access your location"
            value={settings.locationAccess}
            onPress={(value) => updateSetting('locationAccess', value)}
            iconColor="#E91E63"
          />
          <SettingItem
            icon="Database"
            title="Data Collection"
            subtitle="Help improve app with usage data"
            value={settings.dataCollection}
            onPress={(value) => updateSetting('dataCollection', value)}
            iconColor="#3F51B5"
          />
          <SettingItem
            icon="Target"
            title="Personalized Ads"
            subtitle="Show ads based on your interests"
            value={settings.personalizedAds}
            onPress={(value) => updateSetting('personalizedAds', value)}
            iconColor="#FF9800"
          />
        </View>

        {/* Advanced Settings Section */}
        <SectionHeader
          title="Advanced"
          subtitle="Technical and data settings"
        />
        <View style={styles.settingsSection}>
          <SettingItem
            icon="HardDrive"
            title="Auto Backup"
            subtitle="Automatically backup your data"
            value={settings.autoBackup}
            onPress={(value) => updateSetting('autoBackup', value)}
            iconColor="#4CAF50"
          />
          <SettingItem
            icon="WifiOff"
            title="Offline Mode"
            subtitle="Enable offline functionality"
            value={settings.offlineMode}
            onPress={(value) => updateSetting('offlineMode', value)}
            iconColor="#795548"
          />
          <SettingItem
            icon="Image"
            title="High Quality Images"
            subtitle="Use high resolution images"
            value={settings.highQualityImages}
            onPress={(value) => updateSetting('highQualityImages', value)}
            iconColor="#9C27B0"
          />
          <SettingItem
            icon="Wifi"
            title="Data Saver"
            subtitle="Reduce data usage"
            value={settings.dataSaver}
            onPress={(value) => updateSetting('dataSaver', value)}
            iconColor="#FF5722"
          />
        </View>

        {/* Action Buttons Section */}
        <SectionHeader
          title="Data Management"
          subtitle="Manage your app data and storage"
        />
        <View style={styles.settingsSection}>
          <SettingItem
            icon="Upload"
            title="Backup Data"
            subtitle="Backup your profile and app data"
            type="button"
            onPress={handleBackupData}
            iconColor="#4CAF50"
            showChevron={true}
          />
          <SettingItem
            icon="Trash2"
            title="Clear Cache"
            subtitle="Free up storage space"
            type="button"
            onPress={handleClearCache}
            iconColor="#FF9800"
            showChevron={true}
          />
        </View>

        {/* Support Section */}
        <SectionHeader
          title="Support"
          subtitle="Get help and information"
        />
        <View style={styles.settingsSection}>
          <SettingItem
            icon="HelpCircle"
            title="Help & FAQ"
            subtitle="Find answers to common questions"
            type="button"
            onPress={() => navigation.navigate('FAQ')}
            iconColor="#2196F3"
            showChevron={true}
          />
          <SettingItem
            icon="MessageCircle"
            title="Contact Support"
            subtitle="Get help from our team"
            type="button"
            onPress={() => navigation.navigate('Contact')}
            iconColor="#4CAF50"
            showChevron={true}
          />
          <SettingItem
            icon="FileText"
            title="Terms & Conditions"
            subtitle="Read our terms of service"
            type="button"
            onPress={() => navigation.navigate('Terms')}
            iconColor="#607D8B"
            showChevron={true}
          />
          <SettingItem
            icon="Shield"
            title="Privacy Policy"
            subtitle="Learn about data privacy"
            type="button"
            onPress={() => navigation.navigate('Privacy')}
            iconColor="#9C27B0"
            showChevron={true}
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appVersion}>Annadata v1.0.0</Text>
          <Text style={styles.appBuild}>Build 2025.09.26</Text>
          <Text style={styles.appCopyright}>© 2025 Annadata Technologies</Text>
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
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },

  // Container
  scrollContainer: {
    flex: 1,
  },

  // Section Styles
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },

  settingsSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  // Setting Item Styles
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
    marginRight: 8,
  },

  // App Info Section
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 40,
  },
  appVersion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  appBuild: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#999',
  },
})

export default Settings