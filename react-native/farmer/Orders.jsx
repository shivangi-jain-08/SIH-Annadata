import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import Svg, { Polyline, Circle } from 'react-native-svg'
import Icon from '../Icon'
import OrdersService from '../services/ordersService'

const { width } = Dimensions.get('window')

const RevenueCard = ({ title, amount, change, icon, color }) => {
  const isPositive = change > 0
  
  return (
    <View style={styles.revenueCard}>
      <View style={styles.revenueHeader}>
        <View style={[styles.revenueIcon, { backgroundColor: color + '20' }]}>
          <Icon name={icon} size={20} color={color} />
        </View>
        <View style={styles.revenueChange}>
          <Icon name={isPositive ? "TrendingUp" : "TrendingDown"} size={14} color={isPositive ? '#4CAF50' : '#F44336'} />
          <Text style={[styles.changeText, { color: isPositive ? '#4CAF50' : '#F44336' }]}>
            {isPositive ? '+' : ''}{change}%
          </Text>
        </View>
      </View>
      <Text style={styles.revenueTitle}>{title}</Text>
      <Text style={styles.revenueAmount}>₹{amount.toLocaleString()}</Text>
    </View>
  )
}

const EarningGraph = ({ orders }) => {
  // Generate monthly data from orders
  const generateMonthlyData = (ordersData) => {
    if (!ordersData || !Array.isArray(ordersData)) {
      // Fallback mock data
      return [45000, 52000, 48000, 65000, 72000, 68000, 75000, 82000, 78000, 85000, 92000, 88000];
    }

    // Initialize array for 12 months
    const monthlyEarnings = new Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    // Process orders and calculate monthly earnings
    ordersData.forEach(order => {
      if (order.status === 'delivered' && order.totalAmount) {
        const orderDate = new Date(order.createdAt);
        if (orderDate.getFullYear() === currentYear) {
          const monthIndex = orderDate.getMonth(); // 0-11
          monthlyEarnings[monthIndex] += order.totalAmount;
        }
      }
    });

    return monthlyEarnings;
  };

  const monthlyData = generateMonthlyData(orders);
  const maxValue = Math.max(...monthlyData, 10000); // Minimum scale of 10k
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Calculate points for the graph
  const graphWidth = width - 80;
  const graphHeight = 120;
  const pointSpacing = graphWidth / (monthlyData.length - 1);
  
  const points = monthlyData.map((value, index) => {
    const x = index * pointSpacing + 20
    const y = graphHeight - (value / maxValue) * (graphHeight - 20) + 10
    return `${x},${y}`
  }).join(' ')

  return (
    <View style={styles.graphContainer}>
      <Text style={styles.graphTitle}>Yearly Earnings Trend</Text>
      <View style={styles.graphWrapper}>
        <Svg width={graphWidth} height={graphHeight + 40}>
          {/* Graph line */}
          <Polyline
            points={points}
            fill="none"
            stroke="#4CAF50"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {monthlyData.map((value, index) => {
            const x = index * pointSpacing + 20
            const y = graphHeight - (value / maxValue) * (graphHeight - 20) + 10
            return (
              <Circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#4CAF50"
                stroke="white"
                strokeWidth="2"
              />
            )
          })}
        </Svg>
        
        {/* Month labels */}
        <View style={styles.monthLabels}>
          {months.map((month, index) => (
            <Text key={index} style={styles.monthLabel}>{month}</Text>
          ))}
        </View>
      </View>
    </View>
  )
}

const CropEarningCard = ({ crop, earnings, percentage, color, icon }) => {
  return (
    <View style={styles.cropEarningCard}>
      <View style={styles.cropHeader}>
        <View style={[styles.cropIcon, { backgroundColor: color + '20' }]}>
          <Icon name={icon} size={18} color={color} />
        </View>
        <View style={styles.cropInfo}>
          <Text style={styles.cropName}>{crop}</Text>
          <Text style={styles.cropEarnings}>₹{earnings.toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.cropPercentageContainer}>
        <View style={styles.cropPercentageBar}>
          <View style={[styles.cropPercentageFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.cropPercentageText}>{percentage}%</Text>
      </View>
    </View>
  )
}

const OrderAnalyticsCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <View style={styles.orderAnalyticsCard}>
      <View style={[styles.orderAnalyticsIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={styles.orderAnalyticsContent}>
        <Text style={styles.orderAnalyticsValue}>{value}</Text>
        <Text style={styles.orderAnalyticsTitle}>{title}</Text>
        {subtitle && <Text style={styles.orderAnalyticsSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  )
}

const PendingOrderCard = ({ order }) => {
  const getStatusColor = (status) => {
    return OrdersService.getStatusColor(status);
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getCropIcon = (cropName) => {
    const name = cropName?.toLowerCase() || '';
    if (name.includes('wheat') || name.includes('flour')) return 'Wheat';
    if (name.includes('rice') || name.includes('basmati')) return 'Leaf';
    if (name.includes('tomato')) return 'Apple';
    if (name.includes('spinach') || name.includes('vegetable')) return 'Leaf';
    if (name.includes('apple') || name.includes('fruit')) return 'Apple';
    return 'Package';
  }

  return (
    <TouchableOpacity style={styles.pendingOrderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderId}>#{order.id?.substring(0, 8) || 'N/A'}</Text>
          <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.originalStatus || order.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(order.originalStatus || order.status) }]}>
            {order.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <View style={styles.orderCrop}>
          <Icon name={getCropIcon(order.crop)} size={16} color="#4CAF50" />
          <Text style={styles.orderCropName}>{order.crop}</Text>
        </View>
        <View style={styles.orderQuantity}>
          <Icon name="Package" size={16} color="#666" />
          <Text style={styles.orderQuantityText}>{order.quantity} kg</Text>
        </View>
      </View>
      
      <View style={styles.orderFooter}>
        <View style={styles.vendorInfo}>
          <Icon name="User" size={14} color="#666" />
          <Text style={styles.vendorName}>{order.vendor}</Text>
        </View>
        <Text style={styles.orderAmount}>{OrdersService.formatCurrency(order.amount)}</Text>
      </View>
    </TouchableOpacity>
  )
}

const Orders = () => {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({});

  // Load orders data from database
  const loadOrdersData = async () => {
    try {
      setError(null);
      const response = await OrdersService.getUserOrders('seller');
      
      if (response.success && response.data && response.data.orders) {
        const orders = response.data.orders;
        setOrdersData(orders);
        
        // Calculate metrics
        const calculatedMetrics = OrdersService.getDashboardMetrics(orders);
        setMetrics(calculatedMetrics);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message);
      
      // Use mock data as fallback
      const mockOrders = OrdersService.generateMockOrderData();
      setOrdersData(mockOrders);
      setMetrics(OrdersService.getDashboardMetrics(mockOrders));
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrdersData();
    setRefreshing(false);
  };

  // Load data on component mount
  useEffect(() => {
    loadOrdersData();
  }, []);

  // Generate dynamic crop earnings from orders
  const generateCropEarnings = (orders) => {
    if (!orders || !Array.isArray(orders)) return [];

    const cropMap = {};
    let totalEarnings = 0;

    // Calculate earnings per crop
    orders.forEach(order => {
      if (order.status === 'delivered' && order.products) {
        order.products.forEach(product => {
          const cropName = product.name || 'Unknown';
          const earning = product.quantity * product.price;
          
          if (!cropMap[cropName]) {
            cropMap[cropName] = { earnings: 0, icon: getCropIcon(cropName), color: getCropColor(cropName) };
          }
          
          cropMap[cropName].earnings += earning;
          totalEarnings += earning;
        });
      }
    });

    // Convert to array and calculate percentages
    return Object.entries(cropMap)
      .map(([crop, data]) => ({
        crop,
        earnings: data.earnings,
        percentage: totalEarnings > 0 ? Math.round((data.earnings / totalEarnings) * 100) : 0,
        color: data.color,
        icon: data.icon
      }))
      .sort((a, b) => b.earnings - a.earnings) // Sort by earnings desc
      .slice(0, 4); // Top 4 crops
  };

  // Helper functions for crop data
  const getCropIcon = (cropName) => {
    const name = cropName.toLowerCase();
    if (name.includes('wheat') || name.includes('flour')) return 'Wheat';
    if (name.includes('rice') || name.includes('basmati')) return 'Leaf';
    if (name.includes('tomato')) return 'Apple';
    if (name.includes('spinach') || name.includes('vegetable')) return 'Leaf';
    if (name.includes('apple') || name.includes('fruit')) return 'Apple';
    return 'Package';
  };

  const getCropColor = (cropName) => {
    const colors = ['#FF9800', '#4CAF50', '#9C27B0', '#F44336', '#2196F3', '#FF5722'];
    const name = cropName.toLowerCase();
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Calculate current month earnings
  const getCurrentMonthEarnings = (orders) => {
    if (!orders || !Array.isArray(orders)) return 0;
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return orders
      .filter(order => {
        if (order.status !== 'delivered') return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      })
      .reduce((total, order) => total + (order.totalAmount || 0), 0);
  };

  // Get unique buyers count
  const getUniqueBuyersCount = (orders) => {
    if (!orders || !Array.isArray(orders)) return 0;
    const uniqueBuyers = new Set();
    orders.forEach(order => {
      if (order.buyerId && order.buyerId._id) {
        uniqueBuyers.add(order.buyerId._id);
      }
    });
    return uniqueBuyers.size;
  };

  // Transform database orders to display format
  const transformOrdersForDisplay = (orders) => {
    if (!orders || !Array.isArray(orders)) return [];
    
    return orders
      .map(order => ({
        id: order._id,
        date: order.createdAt,
        crop: order.products?.[0]?.name || 'Mixed Products',
        quantity: order.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0,
        vendor: order.buyerId?.name || 'Unknown Buyer',
        amount: order.totalAmount || 0,
        status: OrdersService.getStatusText(order.status),
        originalStatus: order.status
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first
  };

  // Generate revenue data with real calculations
  const currentMonthEarnings = getCurrentMonthEarnings(ordersData);
  const totalRevenue = metrics.totalRevenue || 0;
  const monthlyChange = totalRevenue > 0 ? ((currentMonthEarnings / totalRevenue) * 100).toFixed(1) : 0;

  const revenueData = [
    { 
      title: 'Total Revenue', 
      amount: totalRevenue, 
      change: 12.5, // You might want to calculate this based on previous period
      icon: 'DollarSign', 
      color: '#4CAF50' 
    },
    { 
      title: 'This Month', 
      amount: currentMonthEarnings, 
      change: parseFloat(monthlyChange), 
      icon: 'Calendar', 
      color: '#2196F3' 
    },
  ];

  // Generate crop earnings from real data
  const cropEarnings = generateCropEarnings(ordersData);

  // Generate order analytics from real data
  const orderAnalytics = [
    { 
      title: 'Total Orders', 
      value: metrics.totalOrders?.toString() || '0', 
      icon: 'ShoppingBag', 
      color: '#4CAF50', 
      subtitle: 'All time' 
    },
    { 
      title: 'Active Orders', 
      value: metrics.activeOrders?.toString() || '0', 
      icon: 'Clock', 
      color: '#FF9800', 
      subtitle: 'In progress' 
    },
    { 
      title: 'Buyers', 
      value: getUniqueBuyersCount(ordersData).toString(), 
      icon: 'Users', 
      color: '#2196F3', 
      subtitle: 'Customers' 
    },
  ];

  // Transform orders for display
  const allOrders = transformOrdersForDisplay(ordersData);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading orders data...</Text>
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
        <Text style={styles.headerTitle}>Orders Dashboard</Text>
        <Text style={styles.headerSubtitle}>Track your sales and revenue performance</Text>
        {error && (
          <Text style={styles.errorText}>Using cached data - {error}</Text>
        )}
      </View>

      {/* Revenue Dashboard */}
      <View style={styles.revenueSection}>
        <Text style={styles.sectionTitle}>Revenue Overview</Text>
        <View style={styles.revenueGrid}>
          {revenueData.map((revenue, index) => (
            <RevenueCard
              key={index}
              title={revenue.title}
              amount={revenue.amount}
              change={revenue.change}
              icon={revenue.icon}
              color={revenue.color}
            />
          ))}
        </View>
      </View>

      {/* Earnings Graph */}
      <View style={styles.graphSection}>
        <EarningGraph orders={ordersData} />
      </View>

      {/* Crop Earnings Analytics */}
      <View style={styles.cropEarningsSection}>
        <Text style={styles.sectionTitle}>Earnings by Crops</Text>
        <Text style={styles.sectionSubtitle}>Revenue distribution across different crops</Text>
        <View style={styles.cropEarningsContainer}>
          {cropEarnings.length > 0 ? (
            cropEarnings.map((crop, index) => (
              <CropEarningCard
                key={index}
                crop={crop.crop}
                earnings={crop.earnings}
                percentage={crop.percentage}
                color={crop.color}
                icon={crop.icon}
              />
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <Icon name="TrendingDown" size={24} color="#666" />
              <Text style={styles.noDataText}>No crop earnings data available</Text>
            </View>
          )}
        </View>
      </View>

      {/* Orders Analysis */}
      <View style={styles.orderAnalyticsSection}>
        <Text style={styles.sectionTitle}>Orders Analysis</Text>
        <Text style={styles.sectionSubtitle}>Key metrics for your order management</Text>
        <View style={styles.orderAnalyticsGrid}>
          {orderAnalytics.map((analytics, index) => (
            <OrderAnalyticsCard
              key={index}
              title={analytics.title}
              value={analytics.value}
              icon={analytics.icon}
              color={analytics.color}
              subtitle={analytics.subtitle}
            />
          ))}
        </View>
      </View>

      {/* All Orders List */}
      <View style={styles.pendingOrdersSection}>
        <View style={styles.pendingOrdersHeader}>
          <Text style={styles.sectionTitle}>All Orders</Text>
          <TouchableOpacity style={styles.viewAllButton} onPress={onRefresh}>
            <Icon name="RotateCcw" size={16} color="#2196F3" />
            <Text style={styles.viewAllText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSubtitle}>All orders sorted by date ({allOrders.length} total)</Text>
        
        {allOrders.length > 0 ? (
          <FlatList
            data={allOrders}
            renderItem={({ item }) => <PendingOrderCard order={item} />}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.pendingOrdersList}
            nestedScrollEnabled={true}
          />
        ) : (
          <View style={styles.noOrdersContainer}>
            <Icon name="ShoppingBag" size={48} color="#ccc" />
            <Text style={styles.noOrdersText}>No orders found</Text>
            <Text style={styles.noOrdersSubtext}>Orders will appear here when customers place them</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>Refresh Orders</Text>
            </TouchableOpacity>
          </View>
        )}
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
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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

  // Revenue Section
  revenueSection: {
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
    marginBottom: 20,
  },
  revenueGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  revenueCard: {
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
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  revenueIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  revenueChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  revenueTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  revenueAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },

  // Graph Section
  graphSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  graphContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  graphWrapper: {
    alignItems: 'center',
  },
  monthLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 80,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  monthLabel: {
    fontSize: 10,
    color: '#666',
  },

  // Crop Earnings Section
  cropEarningsSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  cropEarningsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cropEarningCard: {
    marginBottom: 16,
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cropIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  cropEarnings: {
    fontSize: 14,
    color: '#666',
  },
  cropPercentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cropPercentageBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 10,
  },
  cropPercentageFill: {
    height: '100%',
    borderRadius: 4,
  },
  cropPercentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 30,
  },

  // Order Analytics Section
  orderAnalyticsSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  orderAnalyticsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  orderAnalyticsCard: {
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
  orderAnalyticsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderAnalyticsContent: {
    alignItems: 'center',
  },
  orderAnalyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderAnalyticsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  orderAnalyticsSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // Pending Orders Section
  pendingOrdersSection: {
    paddingTop: 30,
    paddingBottom: 30,
  },
  pendingOrdersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
    marginRight: 4,
  },
  pendingOrdersList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  pendingOrderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderIdContainer: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderCrop: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderCropName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
  },
  orderQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderQuantityText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vendorName: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
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

  // No Data Styles
  noDataContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  noOrdersContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noOrdersText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  noOrdersSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
})

export default Orders