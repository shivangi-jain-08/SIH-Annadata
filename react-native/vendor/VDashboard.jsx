import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from '../Icon'
import VendorService from '../services/VendorService'
import UserService from '../services/UserService'
import OrderService from '../services/OrderService'

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
  const navigation = useNavigation()
  
  // State for vendor data
  const [vendorData, setVendorData] = useState([]);
  const [vendorStats, setVendorStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [vendorName, setVendorName] = useState('Vendor');
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [sellingOrders, setSellingOrders] = useState([]);

  // Load vendor's purchase orders from farmers (vendor as buyer)
  const loadPurchaseOrders = async () => {
    try {
      const fetchedOrders = await OrderService.getMyOrders();
      console.log('Loaded purchase orders:', fetchedOrders);
      setPurchaseOrders(fetchedOrders || []);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
      setPurchaseOrders([]);
    }
  };

  // Load vendor's selling orders to consumers (vendor as seller)
  const loadSellingOrders = async () => {
    try {
      const fetchedOrders = await VendorService.getVendorOrders('selling');
      console.log('Loaded selling orders:', fetchedOrders);
      setSellingOrders(fetchedOrders || []);
    } catch (error) {
      console.error('Error loading selling orders:', error);
      setSellingOrders([]);
    }
  };

  // Load user data (vendor name)
  const loadUserData = async () => {
    try {
      const currentUser = await UserService.getCurrentUser();
      if (currentUser) {
        const formattedUser = UserService.formatUserData(currentUser);
        setVendorName(formattedUser.fullName || 'Vendor');
      } else {
        // Try to fetch fresh data from API
        const userData = await UserService.fetchUserProfile();
        if (userData) {
          const formattedUser = UserService.formatUserData(userData);
          setVendorName(formattedUser.fullName || 'Vendor');
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Keep default "Vendor" name on error
    }
  };

  // Load vendor dashboard data (business stats from selling to consumers)
  const loadVendorData = async () => {
    try {
      setError(null);
      
      // Load vendor's selling orders (orders where vendor is the seller to consumers)
      const response = await VendorService.getVendorOrders('selling');
      
      // Ensure ordersData is an array
      const ordersArray = Array.isArray(response) ? response : [];
      setVendorData(ordersArray);
      setSellingOrders(ordersArray);
      
      // Calculate metrics from selling orders
      const metrics = VendorService.calculateVendorMetrics(ordersArray);
      
      // Set stats for display - showing sales to consumers
      const stats = [
        { 
          title: 'Total Sales', 
          value: VendorService.formatCurrency(metrics.totalRevenue), 
          change: metrics.revenueGrowth, 
          icon: 'DollarSign', 
          color: '#4CAF50' 
        },
        { 
          title: 'Active Sales', 
          value: metrics.activeOrders.toString(), 
          change: metrics.activeOrdersGrowth, 
          icon: 'ShoppingBag', 
          color: '#FF9800' 
        }
      ];
      
      setVendorStats(stats);
    } catch (err) {
      console.error('Error loading vendor data:', err);
      setError(err.message || 'Failed to load data');
      
      // Set empty stats on error
      setVendorStats([
        { title: 'Total Sales', value: '₹0', change: 0, icon: 'DollarSign', color: '#4CAF50' },
        { title: 'Active Sales', value: '0', change: 0, icon: 'ShoppingBag', color: '#FF9800' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadUserData(), loadVendorData(), loadPurchaseOrders(), loadSellingOrders()]);
    setRefreshing(false);
  };

  // Load data on component mount
  useEffect(() => {
    loadUserData();
    loadVendorData();
    loadPurchaseOrders();
    loadSellingOrders();
  }, []);

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
    navigation.navigate('VNearbyConsumers')
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

  const handleViewAllOrders = () => {
    navigation.navigate('My Orders')
  }

  const handleOrderPress = (order) => {
    // Navigate to order details or open modal
    Alert.alert(
      'Order Details',
      `Order #${order._id?.slice(-6).toUpperCase()}\nStatus: ${order.status}\nAmount: ₹${order.totalAmount}`,
      [{ text: 'OK' }]
    )
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      confirmed: '#2196F3',
      processing: '#9C27B0',
      shipped: '#3F51B5',
      in_transit: '#3F51B5',
      delivered: '#4CAF50',
      cancelled: '#F44336',
    }
    return colors[status] || '#666'
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'Clock',
      confirmed: 'CheckCircle',
      processing: 'Loader',
      shipped: 'Truck',
      in_transit: 'Truck',
      delivered: 'Package',
      cancelled: 'XCircle',
    }
    return icons[status] || 'ShoppingBag'
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
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
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.vendorName}>{vendorName}</Text>
            <Text style={styles.headerSubtitle}>Manage your crop business efficiently</Text>
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={handleNotifications}>
            <Icon name="Bell" size={24} color="white" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Business Overview Section */}
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

      {/* My Orders Section */}
      <View style={styles.ordersSection}>
        <View style={styles.ordersSectionHeader}>
          <Text style={styles.sectionTitle}>My Orders from Farmers</Text>
          <TouchableOpacity onPress={handleViewAllOrders}>
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        {/* Order Status Overview */}
        <View style={styles.ordersOverview}>
          <View style={styles.orderStatusCard}>
            <View style={[styles.orderStatusIcon, { backgroundColor: '#FFF3E0' }]}>
              <Icon name="Clock" size={24} color="#FF9800" />
            </View>
            <Text style={styles.orderStatusCount}>
              {Array.isArray(purchaseOrders) ? purchaseOrders.filter(order => order.status === 'pending').length : 0}
            </Text>
            <Text style={styles.orderStatusLabel}>Pending</Text>
          </View>

          <View style={styles.orderStatusCard}>
            <View style={[styles.orderStatusIcon, { backgroundColor: '#E3F2FD' }]}>
              <Icon name="CheckCircle" size={24} color="#2196F3" />
            </View>
            <Text style={styles.orderStatusCount}>
              {Array.isArray(purchaseOrders) ? purchaseOrders.filter(order => order.status === 'confirmed').length : 0}
            </Text>
            <Text style={styles.orderStatusLabel}>Confirmed</Text>
          </View>

          <View style={styles.orderStatusCard}>
            <View style={[styles.orderStatusIcon, { backgroundColor: '#F3E5F5' }]}>
              <Icon name="Loader" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.orderStatusCount}>
              {Array.isArray(purchaseOrders) ? purchaseOrders.filter(order => order.status === 'processing').length : 0}
            </Text>
            <Text style={styles.orderStatusLabel}>Processing</Text>
          </View>

          <View style={styles.orderStatusCard}>
            <View style={[styles.orderStatusIcon, { backgroundColor: '#E8F5E9' }]}>
              <Icon name="Package" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.orderStatusCount}>
              {Array.isArray(purchaseOrders) ? purchaseOrders.filter(order => order.status === 'delivered').length : 0}
            </Text>
            <Text style={styles.orderStatusLabel}>Delivered</Text>
          </View>
        </View>

        {/* Recent Orders List */}
        <View style={styles.recentOrdersList}>
          {Array.isArray(purchaseOrders) && purchaseOrders.length > 0 ? (
            purchaseOrders.slice(0, 5).map((order, index) => (
              <TouchableOpacity 
                key={order._id || index} 
                style={styles.orderItem}
                onPress={() => handleOrderPress(order)}
              >
                <View style={styles.orderItemLeft}>
                  <View style={[
                    styles.orderItemIcon, 
                    { backgroundColor: getStatusColor(order.status) + '20' }
                  ]}>
                    <Icon 
                      name={getStatusIcon(order.status)} 
                      size={18} 
                      color={getStatusColor(order.status)} 
                    />
                  </View>
                  <View style={styles.orderItemContent}>
                    <Text style={styles.orderItemTitle}>
                      Order #{order._id?.slice(-6).toUpperCase() || 'N/A'}
                    </Text>
                    <Text style={styles.orderItemSubtitle}>
                      {order.sellerId?.name || order.farmer?.name || 'Farmer'}
                    </Text>
                    <Text style={styles.orderItemTime}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </Text>
                  </View>
                </View>
                <View style={styles.orderItemRight}>
                  <Text style={styles.orderItemAmount}>
                    ₹{order.totalAmount?.toLocaleString('en-IN') || '0'}
                  </Text>
                  <View style={[
                    styles.orderStatusBadge,
                    { backgroundColor: getStatusColor(order.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.orderStatusBadgeText,
                      { color: getStatusColor(order.status) }
                    ]}>
                      {order.status?.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noOrdersContainer}>
              <Icon name="ShoppingBag" size={48} color="#ccc" />
              <Text style={styles.noOrdersText}>No orders yet</Text>
              <Text style={styles.noOrdersSubtext}>
                Your purchase orders from farmers will appear here
              </Text>
            </View>
          )}
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
  errorText: {
    fontSize: 12,
    color: '#FFF9C4',
    marginTop: 5,
    fontStyle: 'italic',
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

  // My Orders Section
  ordersSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  ordersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
  },
  ordersOverview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  orderStatusCard: {
    backgroundColor: 'white',
    width: (width - 52) / 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderStatusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderStatusCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderStatusLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  recentOrdersList: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderItemContent: {
    flex: 1,
  },
  orderItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  orderItemSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  orderItemTime: {
    fontSize: 11,
    color: '#999',
  },
  orderItemRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  orderItemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  orderStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  orderStatusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  noOrdersContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noOrdersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  noOrdersSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
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

  // No Activity Styles
  noActivityContainer: {
    alignItems: 'center',
    padding: 30,
  },
  noActivityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 10,
  },
  noActivitySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
})

export default VDashboard