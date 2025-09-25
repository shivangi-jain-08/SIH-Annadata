import React, { useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  FlatList,
  TouchableOpacity 
} from 'react-native'
import Svg, { Polyline, Circle } from 'react-native-svg'
import Icon from '../Icon'

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

const EarningGraph = () => {
  // Mock data for yearly earnings (12 months)
  const monthlyData = [45000, 52000, 48000, 65000, 72000, 68000, 75000, 82000, 78000, 85000, 92000, 88000]
  const maxValue = Math.max(...monthlyData)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  // Calculate points for the graph
  const graphWidth = width - 80
  const graphHeight = 120
  const pointSpacing = graphWidth / (monthlyData.length - 1)
  
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
    switch (status) {
      case 'Processing': return '#FF9800'
      case 'Shipped': return '#2196F3'
      case 'Delivered': return '#4CAF50'
      case 'Cancelled': return '#F44336'
      default: return '#666'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <TouchableOpacity style={styles.pendingOrderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderId}>#{order.id}</Text>
          <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {order.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <View style={styles.orderCrop}>
          <Icon name="Wheat" size={16} color="#4CAF50" />
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
        <Text style={styles.orderAmount}>₹{order.amount.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  )
}

const Orders = () => {
  // Mock revenue data
  const revenueData = [
    { title: 'Total Revenue', amount: 450000, change: 12.5, icon: 'DollarSign', color: '#4CAF50' },
    { title: 'This Month', amount: 88000, change: 8.2, icon: 'Calendar', color: '#2196F3' },
  ]

  // Mock crop earnings data
  const cropEarnings = [
    { crop: 'Wheat', earnings: 180000, percentage: 40, color: '#FF9800', icon: 'Wheat' },
    { crop: 'Rice', earnings: 135000, percentage: 30, color: '#4CAF50', icon: 'Leaf' },
    { crop: 'Sugarcane', earnings: 90000, percentage: 20, color: '#9C27B0', icon: 'Trees' },
    { crop: 'Cotton', earnings: 45000, percentage: 10, color: '#F44336', icon: 'CloudSnow' },
  ]

  // Mock order analytics
  const orderAnalytics = [
    { title: 'Total Orders', value: '247', icon: 'ShoppingBag', color: '#4CAF50', subtitle: 'All time' },
    { title: 'Active Orders', value: '18', icon: 'Clock', color: '#FF9800', subtitle: 'In progress' },
    { title: 'Vendors', value: '12', icon: 'Users', color: '#2196F3', subtitle: 'Partners' },
  ]

  // Mock pending orders data (sorted by date)
  const pendingOrders = [
    {
      id: 'ORD001',
      date: '2025-09-25',
      crop: 'Wheat',
      quantity: 150,
      vendor: 'AgriCorp Ltd',
      amount: 45000,
      status: 'Processing'
    },
    {
      id: 'ORD002',
      date: '2025-09-24',
      crop: 'Rice',
      quantity: 200,
      vendor: 'GrainEx Pvt',
      amount: 38000,
      status: 'Shipped'
    },
    {
      id: 'ORD003',
      date: '2025-09-23',
      crop: 'Sugarcane',
      quantity: 500,
      vendor: 'SugarTech Co',
      amount: 75000,
      status: 'Processing'
    },
    {
      id: 'ORD004',
      date: '2025-09-22',
      crop: 'Cotton',
      quantity: 80,
      vendor: 'TextilePro',
      amount: 28000,
      status: 'Shipped'
    },
    {
      id: 'ORD005',
      date: '2025-09-21',
      crop: 'Wheat',
      quantity: 120,
      vendor: 'FarmFresh Ltd',
      amount: 36000,
      status: 'Delivered'
    }
  ].sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newest first

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders Dashboard</Text>
        <Text style={styles.headerSubtitle}>Track your sales and revenue performance</Text>
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
        <EarningGraph />
      </View>

      {/* Crop Earnings Analytics */}
      <View style={styles.cropEarningsSection}>
        <Text style={styles.sectionTitle}>Earnings by Crops</Text>
        <Text style={styles.sectionSubtitle}>Revenue distribution across different crops</Text>
        <View style={styles.cropEarningsContainer}>
          {cropEarnings.map((crop, index) => (
            <CropEarningCard
              key={index}
              crop={crop.crop}
              earnings={crop.earnings}
              percentage={crop.percentage}
              color={crop.color}
              icon={crop.icon}
            />
          ))}
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

      {/* Pending Orders List */}
      <View style={styles.pendingOrdersSection}>
        <View style={styles.pendingOrdersHeader}>
          <Text style={styles.sectionTitle}>Pending Orders</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <Icon name="ChevronRight" size={16} color="#2196F3" />
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSubtitle}>Recent orders sorted by date</Text>
        
        <FlatList
          data={pendingOrders}
          renderItem={({ item }) => <PendingOrderCard order={item} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.pendingOrdersList}
          nestedScrollEnabled={true}
        />
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
})

export default Orders