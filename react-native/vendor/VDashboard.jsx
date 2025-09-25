import React, { useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Alert 
} from 'react-native'
import Icon from '../Icon'

const { width } = Dimensions.get('window')

const StatsCard = ({ title, value, change, icon, color }) => {
  const isPositive = change > 0
  
  return (
    <View style={styles.statsCard}>
      <View style={styles.statsHeader}>
        <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
          <Icon name={icon} size={22} color={color} />
        </View>
        <View style={styles.statsChange}>
          <Icon 
            name={isPositive ? "TrendingUp" : "TrendingDown"} 
            size={14} 
            color={isPositive ? '#4CAF50' : '#F44336'} 
          />
          <Text style={[styles.changeText, { color: isPositive ? '#4CAF50' : '#F44336' }]}>
            {isPositive ? '+' : ''}{change}%
          </Text>
        </View>
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
  )
}

const ActionCard = ({ title, description, icon, color, onPress, buttonText }) => {
  return (
    <View style={styles.actionCard}>
      <View style={styles.actionHeader}>
        <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
          <Icon name={icon} size={28} color={color} />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionDescription}>{description}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.actionButton, { backgroundColor: color }]} 
        onPress={onPress}
      >
        <Text style={styles.actionButtonText}>{buttonText}</Text>
        <Icon name="ArrowRight" size={16} color="white" />
      </TouchableOpacity>
    </View>
  )
}

const QuickActionButton = ({ icon, title, color, onPress }) => {
  return (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  )
}

const VDashboard = () => {
  // Mock vendor statistics
  const vendorStats = [
    { 
      title: 'Total Revenue', 
      value: '₹3,25,000', 
      change: 15.2, 
      icon: 'DollarSign', 
      color: '#4CAF50' 
    },
    { 
      title: 'Active Orders', 
      value: '24', 
      change: 8.5, 
      icon: 'ShoppingBag', 
      color: '#FF9800' 
    }
  ]

  const handleBuyFromFarmers = () => {
    Alert.alert(
      'Buy Crops from Farmers',
      'Redirecting to farmer marketplace...',
      [{ text: 'OK' }]
    )
  }

  const handleSellToConsumers = () => {
    Alert.alert(
      'Sell Crops to Consumers',
      'Opening consumer marketplace...',
      [{ text: 'OK' }]
    )
  }

  const handleNearbyConsumers = () => {
    console.log('Nearby Consumer')
    Alert.alert(
      'Find Nearby Consumers',
      'Searching for consumers in your area...',
      [{ text: 'OK' }]
    )
  }

  const handleInventory = () => {
    Alert.alert('Inventory', 'Opening inventory management...')
  }

  const handleAnalytics = () => {
    Alert.alert('Analytics', 'Opening detailed analytics...')
  }

  const handleNotifications = () => {
    Alert.alert('Notifications', 'Opening notifications...')
  }

  const handleProfile = () => {
    Alert.alert('Profile', 'Opening profile settings...')
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.vendorName}>Vendor Name</Text>
            <Text style={styles.headerSubtitle}>Manage your crop business efficiently</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={handleNotifications}>
            <Icon name="Bell" size={24} color="white" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Business Overview</Text>
        <View style={styles.statsGrid}>
          {vendorStats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionButton
            icon="Package"
            title="Inventory"
            color="#9C27B0"
            onPress={handleInventory}
          />
          <QuickActionButton
            icon="ChartBar"
            title="Analytics"
            color="#FF5722"
            onPress={handleAnalytics}
          />
          <QuickActionButton
            icon="User"
            title="Profile"
            color="#607D8B"
            onPress={handleProfile}
          />
        </View>
      </View>

      {/* Main Actions Section */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Business Operations</Text>
        
        {/* Buy from Farmers */}
        <ActionCard
          title="Buy Crops from Farmers"
          description="Source fresh crops directly from local farmers at competitive prices"
          icon="ShoppingCart"
          color="#4CAF50"
          onPress={handleBuyFromFarmers}
          buttonText="Browse Farmers"
        />

        {/* Sell to Consumers */}
        <ActionCard
          title="Sell Crops to Consumers"
          description="Connect with consumers and sell your quality crops online"
          icon="Store"
          color="#FF9800"
          onPress={handleSellToConsumers}
          buttonText="Start Selling"
        />
      </View>

      {/* Nearby Consumers Section */}
      <View style={styles.nearbySection}>
        <View style={styles.nearbySectionHeader}>
          <View style={styles.nearbySectionIcon}>
            <Icon name="MapPin" size={24} color="#2196F3" />
          </View>
          <View style={styles.nearbySectionContent}>
            <Text style={styles.sectionTitle}>Find Nearby Consumers</Text>
            <Text style={styles.sectionSubtitle}>
              Discover potential customers in your local area
            </Text>
          </View>
        </View>

        <View style={styles.nearbyCard}>
          <View style={styles.nearbyCardContent}>
            <View style={styles.nearbyStats}>
              <View style={styles.nearbyStatItem}>
                <Text style={styles.nearbyStatNumber}>45</Text>
                <Text style={styles.nearbyStatLabel}>Consumers</Text>
              </View>
              <View style={styles.nearbyStatDivider} />
              <View style={styles.nearbyStatItem}>
                <Text style={styles.nearbyStatNumber}>5km</Text>
                <Text style={styles.nearbyStatLabel}>Radius</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.findConsumersButton} 
              onPress={handleNearbyConsumers}
            >
              <Icon name="Search" size={20} color="white" />
              <Text style={styles.findConsumersButtonText}>Find Consumers</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Recent Activity Section */}
      <View style={styles.recentActivitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#4CAF5020' }]}>
              <Icon name="Check" size={16} color="#4CAF50" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Order #VND001 completed</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#FF980020' }]}>
              <Icon name="Plus" size={16} color="#FF9800" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>New consumer registered nearby</Text>
              <Text style={styles.activityTime}>5 hours ago</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#2196F320' }]}>
              <Icon name="Truck" size={16} color="#2196F3" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Shipment dispatched to Delhi</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>
        </View>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  notificationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },

  // Stats Section
  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    flex: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 14,
    color: '#666',
  },

  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },

  // Actions Section
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },

  // Nearby Section
  nearbySection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  nearbySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  nearbySectionIcon: {
    marginRight: 12,
  },
  nearbySectionContent: {
    flex: 1,
  },
  nearbyCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  nearbyCardContent: {
    alignItems: 'center',
  },
  nearbyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  nearbyStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  nearbyStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  nearbyStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  nearbyStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  findConsumersButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 160,
  },
  findConsumersButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },

  // Recent Activity
  recentActivitySection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
})

export default VDashboard