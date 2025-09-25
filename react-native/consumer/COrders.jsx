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
  RefreshControl
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from '../Icon'

const { width } = Dimensions.get('window')

const OrderStatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return { backgroundColor: '#E8F5E8', color: '#4CAF50' }
      case 'in transit':
        return { backgroundColor: '#E3F2FD', color: '#2196F3' }
      case 'processing':
        return { backgroundColor: '#FFF3E0', color: '#FF9800' }
      case 'cancelled':
        return { backgroundColor: '#FFEBEE', color: '#F44336' }
      case 'pending':
        return { backgroundColor: '#F3E5F5', color: '#9C27B0' }
      default:
        return { backgroundColor: '#F5F5F5', color: '#666' }
    }
  }

  const statusStyle = getStatusStyle()

  return (
    <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
      <Text style={[styles.statusText, { color: statusStyle.color }]}>{status}</Text>
    </View>
  )
}

const OrderCard = ({ order, onPress, onTrack, onReorder, onSupport }) => {
  return (
    <TouchableOpacity style={styles.orderCard} onPress={() => onPress(order)}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{order.id}</Text>
          <Text style={styles.orderDate}>{order.date}</Text>
        </View>
        <OrderStatusBadge status={order.status} />
      </View>

      <View style={styles.vendorInfo}>
        <Image source={{ uri: order.vendor.image }} style={styles.vendorImage} />
        <View style={styles.vendorDetails}>
          <Text style={styles.vendorName}>{order.vendor.name}</Text>
          <View style={styles.vendorLocation}>
            <Icon name="MapPin" size={12} color="#666" />
            <Text style={styles.locationText}>{order.vendor.location}</Text>
          </View>
        </View>
        <View style={styles.orderAmount}>
          <Text style={styles.totalAmount}>₹{order.total}</Text>
          <Text style={styles.itemCount}>{order.items.length} items</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>{item.quantity}kg</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.orderActions}>
        {order.status.toLowerCase() === 'delivered' && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onReorder(order)}
          >
            <Icon name="RefreshCw" size={14} color="#4CAF50" />
            <Text style={styles.actionButtonText}>Reorder</Text>
          </TouchableOpacity>
        )}
        
        {['in transit', 'processing'].includes(order.status.toLowerCase()) && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onTrack(order)}
          >
            <Icon name="Truck" size={14} color="#2196F3" />
            <Text style={styles.actionButtonText}>Track</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onSupport(order)}
        >
          <Icon name="MessageCircle" size={14} color="#FF9800" />
          <Text style={styles.actionButtonText}>Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => onPress(order)}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Icon name="ChevronRight" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {order.rating && (
        <View style={styles.orderRating}>
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon 
                key={star}
                name="Star" 
                size={14} 
                color={star <= order.rating ? "#FFD700" : "#E0E0E0"} 
              />
            ))}
          </View>
          <Text style={styles.ratingText}>You rated this order</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const FilterTab = ({ title, count, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.filterTab, isActive && styles.activeFilterTab]}
    onPress={onPress}
  >
    <Text style={[styles.filterTabText, isActive && styles.activeFilterTabText]}>
      {title}
    </Text>
    {count > 0 && (
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    )}
  </TouchableOpacity>
)

const EmptyState = ({ status }) => (
  <View style={styles.emptyState}>
    <Icon name="Package" size={64} color="#E0E0E0" />
    <Text style={styles.emptyTitle}>No {status} Orders</Text>
    <Text style={styles.emptyMessage}>
      {status === 'all' 
        ? "You haven't placed any orders yet. Start shopping to see your orders here!"
        : `You don't have any ${status.toLowerCase()} orders at the moment.`
      }
    </Text>
  </View>
)

const COrders = () => {
  const navigation = useNavigation()
  const [activeFilter, setActiveFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  // Sample order data
  const orders = [
    {
      id: 'ORD001',
      date: '25 Sept, 2025',
      status: 'Delivered',
      total: 450,
      vendor: {
        name: 'Green Valley Farms',
        location: 'Punjabi Bagh, Delhi',
        image: 'https://via.placeholder.com/60x60/4CAF50/FFFFFF?text=GV'
      },
      items: [
        { name: 'Tomatoes', quantity: 5, image: 'https://via.placeholder.com/40x40/F44336/FFFFFF?text=T' },
        { name: 'Potatoes', quantity: 10, image: 'https://via.placeholder.com/40x40/8BC34A/FFFFFF?text=P' },
        { name: 'Onions', quantity: 3, image: 'https://via.placeholder.com/40x40/9C27B0/FFFFFF?text=O' }
      ],
      rating: 5,
      deliveredDate: '23 Sept, 2025'
    },
    {
      id: 'ORD002',
      date: '24 Sept, 2025',
      status: 'In Transit',
      total: 280,
      vendor: {
        name: 'Organic Harvest Co.',
        location: 'Lajpat Nagar, Delhi',
        image: 'https://via.placeholder.com/60x60/FF9800/FFFFFF?text=OH'
      },
      items: [
        { name: 'Carrots', quantity: 4, image: 'https://via.placeholder.com/40x40/FF9800/FFFFFF?text=C' },
        { name: 'Beans', quantity: 2, image: 'https://via.placeholder.com/40x40/4CAF50/FFFFFF?text=B' }
      ],
      estimatedDelivery: '26 Sept, 2025'
    },
    {
      id: 'ORD003',
      date: '23 Sept, 2025',
      status: 'Processing',
      total: 350,
      vendor: {
        name: 'Fresh Farm Direct',
        location: 'Karol Bagh, Delhi',
        image: 'https://via.placeholder.com/60x60/2196F3/FFFFFF?text=FF'
      },
      items: [
        { name: 'Corn', quantity: 6, image: 'https://via.placeholder.com/40x40/FFC107/FFFFFF?text=C' },
        { name: 'Spinach', quantity: 2, image: 'https://via.placeholder.com/40x40/4CAF50/FFFFFF?text=S' }
      ]
    },
    {
      id: 'ORD004',
      date: '20 Sept, 2025',
      status: 'Delivered',
      total: 520,
      vendor: {
        name: 'Green Valley Farms',
        location: 'Punjabi Bagh, Delhi',
        image: 'https://via.placeholder.com/60x60/4CAF50/FFFFFF?text=GV'
      },
      items: [
        { name: 'Cauliflower', quantity: 3, image: 'https://via.placeholder.com/40x40/FFF/666?text=CF' },
        { name: 'Broccoli', quantity: 2, image: 'https://via.placeholder.com/40x40/4CAF50/FFFFFF?text=BR' },
        { name: 'Capsicum', quantity: 4, image: 'https://via.placeholder.com/40x40/4CAF50/FFFFFF?text=CP' }
      ],
      rating: 4,
      deliveredDate: '21 Sept, 2025'
    },
    {
      id: 'ORD005',
      date: '18 Sept, 2025',
      status: 'Cancelled',
      total: 180,
      vendor: {
        name: 'Local Farmers Market',
        location: 'Rohini, Delhi',
        image: 'https://via.placeholder.com/60x60/9E9E9E/FFFFFF?text=LF'
      },
      items: [
        { name: 'Lettuce', quantity: 2, image: 'https://via.placeholder.com/40x40/4CAF50/FFFFFF?text=L' }
      ],
      cancelReason: 'Product not available'
    },
    {
      id: 'ORD006',
      date: '15 Sept, 2025',
      status: 'Delivered',
      total: 390,
      vendor: {
        name: 'Organic Harvest Co.',
        location: 'Lajpat Nagar, Delhi',
        image: 'https://via.placeholder.com/60x60/FF9800/FFFFFF?text=OH'
      },
      items: [
        { name: 'Apples', quantity: 5, image: 'https://via.placeholder.com/40x40/F44336/FFFFFF?text=A' },
        { name: 'Bananas', quantity: 3, image: 'https://via.placeholder.com/40x40/FFC107/FFFFFF?text=B' }
      ],
      rating: 5,
      deliveredDate: '16 Sept, 2025'
    }
  ]

  const filterCounts = {
    all: orders.length,
    processing: orders.filter(order => order.status.toLowerCase() === 'processing').length,
    'in transit': orders.filter(order => order.status.toLowerCase() === 'in transit').length,
    delivered: orders.filter(order => order.status.toLowerCase() === 'delivered').length,
    cancelled: orders.filter(order => order.status.toLowerCase() === 'cancelled').length
  }

  const filteredOrders = activeFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === activeFilter)

  const handleOrderPress = (order) => {
    Alert.alert('Order Details', `Viewing details for Order #${order.id}`)
  }

  const handleTrackOrder = (order) => {
    Alert.alert('Track Order', `Tracking Order #${order.id}`)
  }

  const handleReorder = (order) => {
    Alert.alert('Reorder', `Reordering items from Order #${order.id}`)
  }

  const handleSupport = (order) => {
    Alert.alert('Support', `Getting support for Order #${order.id}`)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false)
      Alert.alert('Refreshed', 'Order history has been updated')
    }, 2000)
  }

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
        
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>My Orders</Text>
          <Text style={styles.headerSubtitle}>{orders.length} total orders</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => Alert.alert('Search', 'Search orders functionality')}
        >
          <Icon name="Search" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Order Summary Cards */}
      <View style={styles.summaryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <Icon name="Package" size={24} color="#2196F3" />
            <Text style={styles.summaryNumber}>{orders.length}</Text>
            <Text style={styles.summaryLabel}>Total Orders</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Icon name="Check" size={24} color="#4CAF50" />
            <Text style={styles.summaryNumber}>{filterCounts.delivered}</Text>
            <Text style={styles.summaryLabel}>Delivered</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Icon name="Clock" size={24} color="#FF9800" />
            <Text style={styles.summaryNumber}>
              {filterCounts.processing + filterCounts['in transit']}
            </Text>
            <Text style={styles.summaryLabel}>In Progress</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Icon name="DollarSign" size={24} color="#9C27B0" />
            <Text style={styles.summaryNumber}>
              ₹{orders.reduce((total, order) => total + order.total, 0)}
            </Text>
            <Text style={styles.summaryLabel}>Total Spent</Text>
          </View>
        </ScrollView>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterTab
            title="All"
            count={filterCounts.all}
            isActive={activeFilter === 'all'}
            onPress={() => setActiveFilter('all')}
          />
          <FilterTab
            title="Processing"
            count={filterCounts.processing}
            isActive={activeFilter === 'processing'}
            onPress={() => setActiveFilter('processing')}
          />
          <FilterTab
            title="In Transit"
            count={filterCounts['in transit']}
            isActive={activeFilter === 'in transit'}
            onPress={() => setActiveFilter('in transit')}
          />
          <FilterTab
            title="Delivered"
            count={filterCounts.delivered}
            isActive={activeFilter === 'delivered'}
            onPress={() => setActiveFilter('delivered')}
          />
          <FilterTab
            title="Cancelled"
            count={filterCounts.cancelled}
            isActive={activeFilter === 'cancelled'}
            onPress={() => setActiveFilter('cancelled')}
          />
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView 
        style={styles.ordersContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
          />
        }
      >
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={handleOrderPress}
              onTrack={handleTrackOrder}
              onReorder={handleReorder}
              onSupport={handleSupport}
            />
          ))
        ) : (
          <EmptyState status={activeFilter} />
        )}
      </ScrollView>
    </View>
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
    flex: 1,
    marginLeft: 16,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  searchButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },

  // Summary Cards
  summaryContainer: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingLeft: 20,
  },
  summaryCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },

  // Filter Tabs
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
  },
  activeFilterTab: {
    backgroundColor: '#2196F3',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterTabText: {
    color: 'white',
  },
  countBadge: {
    backgroundColor: '#666',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  countText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },

  // Orders Container
  ordersContainer: {
    flex: 1,
    padding: 20,
  },

  // Order Card
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Vendor Info
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vendorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  vendorDetails: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  vendorLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  orderAmount: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // Order Items
  orderItems: {
    marginBottom: 16,
  },
  orderItem: {
    alignItems: 'center',
    marginRight: 12,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 6,
  },
  itemName: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  itemQuantity: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },

  // Order Actions
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginLeft: 4,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginRight: 4,
  },

  // Order Rating
  orderRating: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
})

export default COrders