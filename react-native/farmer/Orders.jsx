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
  RefreshControl,
  Modal,
  TextInput,
  Alert
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

const CropListingCard = ({ listing, onEdit, onDelete }) => {
  const getQualityColor = (quality) => {
    switch (quality.toLowerCase()) {
      case 'premium': return '#4CAF50';
      case 'standard': return '#FF9800';
      case 'organic': return '#8BC34A';
      default: return '#666';
    }
  };

  const getCropIcon = (cropName) => {
    const name = cropName?.toLowerCase() || '';
    if (name.includes('wheat') || name.includes('flour')) return 'Wheat';
    if (name.includes('rice') || name.includes('basmati')) return 'Leaf';
    if (name.includes('tomato')) return 'Apple';
    if (name.includes('spinach') || name.includes('vegetable')) return 'Leaf';
    if (name.includes('apple') || name.includes('fruit')) return 'Apple';
    return 'Package';
  };

  return (
    <View style={styles.cropListingCard}>
      <View style={styles.cropListingHeader}>
        <View style={styles.cropListingInfo}>
          <View style={styles.cropListingTitleRow}>
            <Icon name={getCropIcon(listing.cropName)} size={20} color="#4CAF50" />
            <Text style={styles.cropListingName}>{listing.cropName}</Text>
            <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(listing.quality) + '20' }]}>
              <Text style={[styles.qualityText, { color: getQualityColor(listing.quality) }]}>
                {listing.quality}
              </Text>
            </View>
          </View>
          <Text style={styles.cropListingDescription}>{listing.description}</Text>
        </View>
      </View>
      
      <View style={styles.cropListingDetails}>
        <View style={styles.cropListingDetailRow}>
          <View style={styles.cropListingDetailItem}>
            <Icon name="Package" size={16} color="#666" />
            <Text style={styles.cropListingDetailText}>{listing.quantity} kg</Text>
          </View>
          <View style={styles.cropListingDetailItem}>
            <Icon name="DollarSign" size={16} color="#666" />
            <Text style={styles.cropListingDetailText}>₹{listing.pricePerKg}/kg</Text>
          </View>
        </View>
        
        <View style={styles.cropListingDetailRow}>
          <View style={styles.cropListingDetailItem}>
            <Icon name="MapPin" size={16} color="#666" />
            <Text style={styles.cropListingDetailText}>{listing.location}</Text>
          </View>
          <View style={styles.cropListingDetailItem}>
            <Icon name="Calendar" size={16} color="#666" />
            <Text style={styles.cropListingDetailText}>{listing.harvestDate}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cropListingActions}>
        <Text style={styles.cropListingTotal}>
          Total: ₹{(listing.quantity * listing.pricePerKg).toLocaleString()}
        </Text>
        <View style={styles.cropListingButtons}>
          <TouchableOpacity 
            style={[styles.cropListingButton, styles.editButton]} 
            onPress={() => onEdit(listing)}
          >
            <Icon name="Edit" size={16} color="#2196F3" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.cropListingButton, styles.deleteButton]} 
            onPress={() => onDelete(listing)}
          >
            <Icon name="Trash2" size={16} color="#F44336" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

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
  
  // Crop Listings State
  const [cropListings, setCropListings] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [newListing, setNewListing] = useState({
    cropName: '',
    quantity: '',
    pricePerKg: '',
    description: '',
    location: '',
    harvestDate: '',
    quality: 'Premium'
  });

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

  // Load crop listings data
  const loadCropListings = async () => {
    try {
      // TODO: Replace with actual API call to get farmer's crop listings
      // const response = await CropService.getFarmerListings();
      
      // Mock data for now
      const mockListings = [
        {
          id: '1',
          cropName: 'Wheat',
          quantity: 1000,
          pricePerKg: 25,
          description: 'Fresh wheat from organic farm, excellent quality grain',
          location: 'Punjab, India',
          harvestDate: '2025-10-01',
          quality: 'Premium'
        },
        {
          id: '2',
          cropName: 'Basmati Rice',
          quantity: 500,
          pricePerKg: 45,
          description: 'Premium basmati rice with long grains and aromatic fragrance',
          location: 'Punjab, India',
          harvestDate: '2025-09-15',
          quality: 'Premium'
        },
        {
          id: '3',
          cropName: 'Tomatoes',
          quantity: 200,
          pricePerKg: 35,
          description: 'Fresh red tomatoes, perfect for cooking and salads',
          location: 'Punjab, India',
          harvestDate: '2025-10-05',
          quality: 'Standard'
        }
      ];
      
      setCropListings(mockListings);
    } catch (err) {
      console.error('Error loading crop listings:', err);
      setCropListings([]);
    }
  };

  // Add new crop listing
  const handleAddListing = async () => {
    try {
      if (!newListing.cropName || !newListing.quantity || !newListing.pricePerKg) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // TODO: Replace with actual API call
      // const response = await CropService.addListing(newListing);
      
      const listing = {
        id: Date.now().toString(),
        ...newListing,
        quantity: parseFloat(newListing.quantity),
        pricePerKg: parseFloat(newListing.pricePerKg)
      };

      setCropListings(prev => [listing, ...prev]);
      
      // Reset form
      setNewListing({
        cropName: '',
        quantity: '',
        pricePerKg: '',
        description: '',
        location: '',
        harvestDate: '',
        quality: 'Premium'
      });
      
      setShowAddModal(false);
      Alert.alert('Success', 'Crop listing added successfully!');
    } catch (err) {
      console.error('Error adding listing:', err);
      Alert.alert('Error', 'Failed to add crop listing');
    }
  };

  // Edit crop listing
  const handleEditListing = (listing) => {
    setEditingListing(listing);
    setNewListing({
      cropName: listing.cropName,
      quantity: listing.quantity.toString(),
      pricePerKg: listing.pricePerKg.toString(),
      description: listing.description,
      location: listing.location,
      harvestDate: listing.harvestDate,
      quality: listing.quality
    });
    setShowEditModal(true);
  };

  // Update crop listing
  const handleUpdateListing = async () => {
    try {
      if (!newListing.cropName || !newListing.quantity || !newListing.pricePerKg) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // TODO: Replace with actual API call
      // const response = await CropService.updateListing(editingListing.id, newListing);
      
      const updatedListing = {
        ...editingListing,
        ...newListing,
        quantity: parseFloat(newListing.quantity),
        pricePerKg: parseFloat(newListing.pricePerKg)
      };

      setCropListings(prev => 
        prev.map(listing => 
          listing.id === editingListing.id ? updatedListing : listing
        )
      );
      
      setShowEditModal(false);
      setEditingListing(null);
      Alert.alert('Success', 'Crop listing updated successfully!');
    } catch (err) {
      console.error('Error updating listing:', err);
      Alert.alert('Error', 'Failed to update crop listing');
    }
  };

  // Delete crop listing
  const handleDeleteListing = (listing) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete the listing for ${listing.cropName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Replace with actual API call
              // await CropService.deleteListing(listing.id);
              
              setCropListings(prev => prev.filter(item => item.id !== listing.id));
              Alert.alert('Success', 'Crop listing deleted successfully!');
            } catch (err) {
              console.error('Error deleting listing:', err);
              Alert.alert('Error', 'Failed to delete crop listing');
            }
          }
        }
      ]
    );
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadOrdersData(), loadCropListings()]);
    setRefreshing(false);
  };

  // Load data on component mount
  useEffect(() => {
    loadOrdersData();
    loadCropListings();
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

      {/* Crop Listings Management */}
      <View style={styles.cropListingsSection}>
        <View style={styles.cropListingsHeader}>
          <Text style={styles.sectionTitle}>My Crop Listings</Text>
          <TouchableOpacity 
            style={styles.addListingButton} 
            onPress={() => setShowAddModal(true)}
          >
            <Icon name="Plus" size={16} color="white" />
            <Text style={styles.addListingText}>Add Listing</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSubtitle}>Manage your crop listings for vendors ({cropListings.length} active)</Text>
        
        {cropListings.length > 0 ? (
          <FlatList
            data={cropListings}
            renderItem={({ item }) => (
              <CropListingCard 
                listing={item} 
                onEdit={handleEditListing}
                onDelete={handleDeleteListing}
              />
            )}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cropListingsList}
            nestedScrollEnabled={true}
          />
        ) : (
          <View style={styles.noCropListingsContainer}>
            <Icon name="Package" size={48} color="#ccc" />
            <Text style={styles.noCropListingsText}>No crop listings yet</Text>
            <Text style={styles.noCropListingsSubtext}>Create your first listing to start selling your crops to vendors</Text>
            <TouchableOpacity 
              style={styles.addFirstListingButton} 
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.addFirstListingText}>Add Your First Listing</Text>
            </TouchableOpacity>
          </View>
        )}
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

      {/* Add Listing Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Crop Listing</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Icon name="X" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Crop Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newListing.cropName}
                  onChangeText={(text) => setNewListing(prev => ({ ...prev, cropName: text }))}
                  placeholder="e.g., Wheat, Rice, Tomatoes"
                />
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Quantity (kg) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newListing.quantity}
                    onChangeText={(text) => setNewListing(prev => ({ ...prev, quantity: text }))}
                    placeholder="1000"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Price per kg (₹) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newListing.pricePerKg}
                    onChangeText={(text) => setNewListing(prev => ({ ...prev, pricePerKg: text }))}
                    placeholder="25"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newListing.description}
                  onChangeText={(text) => setNewListing(prev => ({ ...prev, description: text }))}
                  placeholder="Describe your crop quality, farming practices..."
                  multiline={true}
                  numberOfLines={3}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  style={styles.textInput}
                  value={newListing.location}
                  onChangeText={(text) => setNewListing(prev => ({ ...prev, location: text }))}
                  placeholder="Village, District, State"
                />
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Harvest Date</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newListing.harvestDate}
                    onChangeText={(text) => setNewListing(prev => ({ ...prev, harvestDate: text }))}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Quality</Text>
                  <View style={styles.qualitySelector}>
                    {['Premium', 'Standard', 'Organic'].map((quality) => (
                      <TouchableOpacity
                        key={quality}
                        style={[
                          styles.qualityOption,
                          newListing.quality === quality && styles.qualityOptionSelected
                        ]}
                        onPress={() => setNewListing(prev => ({ ...prev, quality }))}
                      >
                        <Text style={[
                          styles.qualityOptionText,
                          newListing.quality === quality && styles.qualityOptionTextSelected
                        ]}>
                          {quality}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleAddListing}
              >
                <Text style={styles.saveButtonText}>Add Listing</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Listing Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Crop Listing</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Icon name="X" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Crop Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newListing.cropName}
                  onChangeText={(text) => setNewListing(prev => ({ ...prev, cropName: text }))}
                  placeholder="e.g., Wheat, Rice, Tomatoes"
                />
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Quantity (kg) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newListing.quantity}
                    onChangeText={(text) => setNewListing(prev => ({ ...prev, quantity: text }))}
                    placeholder="1000"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Price per kg (₹) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newListing.pricePerKg}
                    onChangeText={(text) => setNewListing(prev => ({ ...prev, pricePerKg: text }))}
                    placeholder="25"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newListing.description}
                  onChangeText={(text) => setNewListing(prev => ({ ...prev, description: text }))}
                  placeholder="Describe your crop quality, farming practices..."
                  multiline={true}
                  numberOfLines={3}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  style={styles.textInput}
                  value={newListing.location}
                  onChangeText={(text) => setNewListing(prev => ({ ...prev, location: text }))}
                  placeholder="Village, District, State"
                />
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Harvest Date</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newListing.harvestDate}
                    onChangeText={(text) => setNewListing(prev => ({ ...prev, harvestDate: text }))}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Quality</Text>
                  <View style={styles.qualitySelector}>
                    {['Premium', 'Standard', 'Organic'].map((quality) => (
                      <TouchableOpacity
                        key={quality}
                        style={[
                          styles.qualityOption,
                          newListing.quality === quality && styles.qualityOptionSelected
                        ]}
                        onPress={() => setNewListing(prev => ({ ...prev, quality }))}
                      >
                        <Text style={[
                          styles.qualityOptionText,
                          newListing.quality === quality && styles.qualityOptionTextSelected
                        ]}>
                          {quality}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleUpdateListing}
              >
                <Text style={styles.saveButtonText}>Update Listing</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  // Crop Listings Styles
  cropListingsSection: {
    paddingTop: 30,
  },
  cropListingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  addListingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addListingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cropListingsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  cropListingCard: {
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
  cropListingHeader: {
    marginBottom: 12,
  },
  cropListingInfo: {
    flex: 1,
  },
  cropListingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  cropListingName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  qualityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cropListingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  cropListingDetails: {
    marginBottom: 16,
  },
  cropListingDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cropListingDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  cropListingDetailText: {
    fontSize: 14,
    color: '#666',
  },
  cropListingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  cropListingTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  cropListingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cropListingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  editButton: {
    backgroundColor: '#E3F2FD',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F44336',
  },

  // No Crop Listings Styles
  noCropListingsContainer: {
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
  noCropListingsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  noCropListingsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  addFirstListingButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  addFirstListingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  qualitySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  qualityOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  qualityOptionSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  qualityOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  qualityOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
})

export default Orders