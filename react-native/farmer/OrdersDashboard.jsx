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
  Alert,
  TextInput
} from 'react-native'
import Svg, { Polyline, Circle } from 'react-native-svg'
import Icon from '../Icon'
import OrdersService from '../services/ordersService'
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window')

// Status Badge Component (from AllOrders)
const StatusBadge = ({ status, originalStatus }) => {
  const statusColor = OrdersService.getStatusColor(originalStatus || status);
  
  return (
    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
      <Text style={[styles.statusText, { color: statusColor }]}>
        {status}
      </Text>
    </View>
  );
};

// Order Detail Modal Component (from AllOrders)
const OrderDetailModal = ({ visible, order, onClose, onStatusUpdate, onCancelOrder }) => {
  const [updating, setUpdating] = useState(false);

  if (!order) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusSteps = (status) => {
    const allSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = allSteps.indexOf(status?.toLowerCase());
    
    return allSteps.map((step, index) => ({
      label: step.charAt(0).toUpperCase() + step.slice(1),
      completed: index < currentIndex,
      active: index === currentIndex
    }));
  };

  const handleStatusUpdate = async (newStatus) => {
    console.log('=== Status Update Debug ===');
    console.log('Order ID:', order.id);
    console.log('New Status:', newStatus);
    
    setUpdating(true);
    try {
      const response = await OrdersService.updateOrderStatus(order.id, newStatus);
      console.log('Status update response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        Alert.alert('Success', 'Order status updated successfully');
        onStatusUpdate();
        onClose();
      } else {
        const errorMessage = response.message || 'Failed to update order status';
        const errorDetails = response.errors ? JSON.stringify(response.errors) : '';
        console.error('Error updating order status:', errorMessage, errorDetails);
        Alert.alert('Error', `${errorMessage}\n${errorDetails}`);
      }
    } catch (error) {
      console.error('Exception during status update:', error);
      Alert.alert('Error', error.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'processing',
      'processing': 'shipped',
      'shipped': 'delivered'
    };
    return statusFlow[currentStatus?.toLowerCase()];
  };

  const canUpdateStatus = (currentStatus) => {
    return ['pending', 'confirmed', 'processing', 'shipped'].includes(currentStatus?.toLowerCase());
  };

  const canCancelOrder = (currentStatus) => {
    const status = currentStatus?.toLowerCase();
    return status === 'pending' || status === 'confirmed' || status === 'processing';
  };

  const statusSteps = getStatusSteps(order.originalStatus || order.status);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.detailModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="X" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Order Summary */}
            <View style={styles.orderSummarySection}>
              <Text style={styles.sectionTitleModal}>Order Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Order ID:</Text>
                  <Text style={styles.summaryValue}>#{order.id?.substring(0, 12) || 'N/A'}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Date:</Text>
                  <Text style={styles.summaryValue}>{formatDate(order.date)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Status:</Text>
                  <StatusBadge status={order.status} originalStatus={order.originalStatus} />
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Amount:</Text>
                  <Text style={[styles.summaryValue, styles.amountText]}>
                    {OrdersService.formatCurrency(order.amount)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Product Details */}
            <View style={styles.productDetailsSection}>
              <Text style={styles.sectionTitleModal}>Product Details</Text>
              <View style={styles.productCard}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{order.crop}</Text>
                  <Text style={styles.productQuantity}>{order.quantity} kg</Text>
                </View>
                <Text style={styles.productPrice}>
                  ₹{Math.round(order.amount / order.quantity)} per kg
                </Text>
              </View>
            </View>

            {/* Customer Details */}
            <View style={styles.customerDetailsSection}>
              <Text style={styles.sectionTitleModal}>Customer Details</Text>
              <View style={styles.customerCard}>
                <View style={styles.customerInfo}>
                  <Icon name="User" size={20} color="#4CAF50" />
                  <View style={styles.customerText}>
                    <Text style={styles.customerName}>{order.vendor}</Text>
                    <Text style={styles.customerType}>Vendor/Retailer</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Order Progress */}
            <View style={styles.statusProgressSection}>
              <Text style={styles.sectionTitleModal}>Order Progress</Text>
              <View style={styles.progressContainer}>
                {statusSteps.map((step, index) => (
                  <View key={index} style={styles.progressStep}>
                    <View style={styles.progressStepIndicator}>
                      <View style={[
                        styles.progressDot,
                        step.completed && styles.progressDotCompleted,
                        step.active && styles.progressDotActive
                      ]}>
                        {step.completed && (
                          <Icon name="Check" size={12} color="white" />
                        )}
                      </View>
                      {index < statusSteps.length - 1 && (
                        <View style={[
                          styles.progressLine,
                          step.completed && styles.progressLineCompleted
                        ]} />
                      )}
                    </View>
                    <Text style={[
                      styles.progressLabel,
                      step.completed && styles.progressLabelCompleted,
                      step.active && styles.progressLabelActive
                    ]}>
                      {step.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Status Update Actions */}
            {canUpdateStatus(order.originalStatus || order.status) && (
              <View style={styles.statusActionsSection}>
                <Text style={styles.sectionTitleModal}>Update Status</Text>
                <View style={styles.statusActionsContainer}>
                  {order.originalStatus?.toLowerCase() === 'pending' && (
                    <>
                      <TouchableOpacity
                        style={[styles.statusActionButton, styles.confirmButton]}
                        onPress={() => handleStatusUpdate('confirmed')}
                        disabled={updating}
                      >
                        {updating ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <>
                            <Icon name="CheckCircle" size={20} color="white" />
                            <Text style={styles.statusActionButtonText}>Confirm Order</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.statusActionButton, styles.rejectButton]}
                        onPress={() => handleStatusUpdate('cancelled')}
                        disabled={updating}
                      >
                        <Icon name="XCircle" size={20} color="white" />
                        <Text style={styles.statusActionButtonText}>Reject Order</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  
                  {order.originalStatus?.toLowerCase() === 'confirmed' && (
                    <TouchableOpacity
                      style={[styles.statusActionButton, styles.processingButton]}
                      onPress={() => handleStatusUpdate('processing')}
                      disabled={updating}
                    >
                      {updating ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Icon name="Loader" size={20} color="white" />
                          <Text style={styles.statusActionButtonText}>Start Processing</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                  
                  {order.originalStatus?.toLowerCase() === 'processing' && (
                    <TouchableOpacity
                      style={[styles.statusActionButton, styles.shippedButton]}
                      onPress={() => handleStatusUpdate('shipped')}
                      disabled={updating}
                    >
                      {updating ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Icon name="Truck" size={20} color="white" />
                          <Text style={styles.statusActionButtonText}>Mark as Shipped</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                  
                  {order.originalStatus?.toLowerCase() === 'shipped' && (
                    <TouchableOpacity
                      style={[styles.statusActionButton, styles.deliveredButton]}
                      onPress={() => handleStatusUpdate('delivered')}
                      disabled={updating}
                    >
                      {updating ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Icon name="Package" size={20} color="white" />
                          <Text style={styles.statusActionButtonText}>Mark as Delivered</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Cancel Order Button */}
            {canCancelOrder(order.originalStatus || order.status) && (
              <View style={styles.cancelOrderSection}>
                <TouchableOpacity
                  style={styles.cancelOrderButton}
                  onPress={() => onCancelOrder(order)}
                  disabled={updating}
                >
                  <Icon name="XCircle" size={20} color="#F44336" />
                  <Text style={styles.cancelOrderButtonText}>Cancel Order</Text>
                </TouchableOpacity>
                <Text style={styles.cancelOrderHint}>
                  You can cancel this order while it's in pending, confirmed, or processing status
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const CancelOrderModal = ({ visible, order, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!reason.trim()) {
      Alert.alert('Required', 'Please provide a reason for cancellation');
      return;
    }

    setCancelling(true);
    await onConfirm(reason);
    setCancelling(false);
    setReason('');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.cancelModalOverlay}>
        <View style={styles.cancelModalContainer}>
          <View style={styles.cancelModalHeader}>
            <Text style={styles.cancelModalTitle}>Cancel Order</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="X" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.cancelModalBody}>
            <Text style={styles.cancelModalOrderInfo}>
              Order #{order?.id?.substring(0, 12) || 'N/A'}
            </Text>
            <Text style={styles.cancelModalWarning}>
              Are you sure you want to cancel this order? This action cannot be undone and may affect your customer relationship.
            </Text>

            <Text style={styles.cancelInputLabel}>Reason for cancellation *</Text>
            <TextInput
              style={styles.cancelReasonInput}
              placeholder="e.g., Out of stock, Unable to fulfill order..."
              placeholderTextColor="#999"
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.cancelModalFooter}>
            <TouchableOpacity
              style={[styles.cancelModalButton, styles.cancelModalKeepButton]}
              onPress={onClose}
              disabled={cancelling}
            >
              <Text style={styles.cancelModalKeepButtonText}>Keep Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelModalButton, styles.cancelModalConfirmButton]}
              onPress={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.cancelModalConfirmButtonText}>Cancel Order</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
  const generateMonthlyData = (ordersData) => {
    if (!ordersData || !Array.isArray(ordersData)) {
      return [45000, 52000, 48000, 65000, 72000, 68000, 75000, 82000, 78000, 85000, 92000, 88000];
    }

    const monthlyEarnings = new Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    ordersData.forEach(order => {
      if (order.status === 'delivered' && order.totalAmount) {
        const orderDate = new Date(order.createdAt);
        if (orderDate.getFullYear() === currentYear) {
          const monthIndex = orderDate.getMonth();
          monthlyEarnings[monthIndex] += order.totalAmount;
        }
      }
    });

    return monthlyEarnings;
  };

  const monthlyData = generateMonthlyData(orders);
  const maxValue = Math.max(...monthlyData, 10000);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
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
          <Polyline
            points={points}
            fill="none"
            stroke="#4CAF50"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
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

const OrderCard = ({ order, onPress }) => {
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
    <TouchableOpacity style={styles.orderCard} onPress={onPress}>
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

const OrdersDashboard = () => {
  const navigation = useNavigation();
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({});
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  // Load orders data from database
  const loadOrdersData = async () => {
    try {
      setError(null);
      const response = await OrdersService.getUserOrders('seller');
      
      if (response.success && response.data && response.data.orders) {
        const orders = response.data.orders;
        setOrdersData(orders);
        
        const calculatedMetrics = OrdersService.getDashboardMetrics(orders);
        setMetrics(calculatedMetrics);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message);
      
      const mockOrders = OrdersService.generateMockOrderData();
      setOrdersData(mockOrders);
      setMetrics(OrdersService.getDashboardMetrics(mockOrders));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrdersData();
    setRefreshing(false);
  };

  // Handle order press
  const handleOrderPress = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    setShowDetailModal(false);
    await loadOrdersData();
  };

  // Handle cancel order
  const handleCancelOrder = (order) => {
    const status = order.originalStatus?.toLowerCase();
    if (status === 'pending' || status === 'confirmed' || status === 'processing') {
      setOrderToCancel(order);
      setShowDetailModal(false);
      setShowCancelModal(true);
    } else {
      Alert.alert('Cannot Cancel', 'This order cannot be cancelled at its current status.');
    }
  };

  // Confirm cancel order
  const confirmCancelOrder = async (reason) => {
    if (!orderToCancel) return;

    try {
      const response = await OrdersService.updateOrderStatus(orderToCancel.id, 'cancelled');
      
      if (response.success) {
        Alert.alert('Success', 'Order has been cancelled successfully');
        setShowCancelModal(false);
        setOrderToCancel(null);
        await loadOrdersData();
      } else {
        Alert.alert('Error', 'Failed to cancel order. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      Alert.alert('Error', 'Failed to cancel order. Please try again.');
    }
  };

  useEffect(() => {
    loadOrdersData();
  }, []);

  const generateCropEarnings = (orders) => {
    if (!orders || !Array.isArray(orders)) return [];

    const cropMap = {};
    let totalEarnings = 0;

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

    return Object.entries(cropMap)
      .map(([crop, data]) => ({
        crop,
        earnings: data.earnings,
        percentage: totalEarnings > 0 ? Math.round((data.earnings / totalEarnings) * 100) : 0,
        color: data.color,
        icon: data.icon
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 4);
  };

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
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const currentMonthEarnings = getCurrentMonthEarnings(ordersData);
  const totalRevenue = metrics.totalRevenue || 0;
  const monthlyChange = totalRevenue > 0 ? ((currentMonthEarnings / totalRevenue) * 100).toFixed(1) : 0;

  const revenueData = [
    { 
      title: 'Total Revenue', 
      amount: totalRevenue, 
      change: 12.5,
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

  const cropEarnings = generateCropEarnings(ordersData);

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

  const allOrders = transformOrdersForDisplay(ordersData);
  const recentOrders = allOrders.slice(0, 5); // Show only 5 recent orders

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

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionCard} 
            onPress={() => navigation.navigate('CropListings')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#4CAF5020' }]}>
              <Icon name="Package" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.quickActionTitle}>Manage Crops</Text>
            <Text style={styles.quickActionSubtitle}>Add & edit listings</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard} 
            onPress={() => navigation.navigate('AllOrders')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#2196F320' }]}>
              <Icon name="List" size={24} color="#2196F3" />
            </View>
            <Text style={styles.quickActionTitle}>All Orders</Text>
            <Text style={styles.quickActionSubtitle}>View order history</Text>
          </TouchableOpacity>
        </View>
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

      {/* Recent Orders Preview */}
      <View style={styles.recentOrdersSection}>
        <View style={styles.recentOrdersHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity 
            style={styles.viewAllButton} 
            onPress={() => navigation.navigate('AllOrders')}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Icon name="ChevronRight" size={16} color="#2196F3" />
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSubtitle}>Latest 5 orders</Text>
        
        {recentOrders.length > 0 ? (
          <FlatList
            data={recentOrders}
            renderItem={({ item }) => <OrderCard order={item} onPress={() => handleOrderPress(item)} />}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.ordersList}
            nestedScrollEnabled={true}
          />
        ) : (
          <View style={styles.noOrdersContainer}>
            <Icon name="ShoppingBag" size={48} color="#ccc" />
            <Text style={styles.noOrdersText}>No orders found</Text>
            <Text style={styles.noOrdersSubtext}>Orders will appear here when customers place them</Text>
          </View>
        )}
      </View>
      
      {/* Order Detail Modal */}
      <OrderDetailModal
        visible={showDetailModal}
        order={selectedOrder}
        onClose={() => setShowDetailModal(false)}
        onStatusUpdate={handleStatusUpdate}
        onCancelOrder={handleCancelOrder}
      />

      {/* Cancel Order Modal */}
      <CancelOrderModal
        visible={showCancelModal}
        order={orderToCancel}
        onClose={() => {
          setShowCancelModal(false);
          setOrderToCancel(null);
        }}
        onConfirm={confirmCancelOrder}
      />
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
  errorText: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 5,
    fontStyle: 'italic',
  },

  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  quickActionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    flex: 1,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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

  // Recent Orders Section
  recentOrdersSection: {
    paddingTop: 30,
    paddingBottom: 30,
  },
  recentOrdersHeader: {
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
  ordersList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  orderCard: {
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
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
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    padding: 20,
  },
  sectionTitleModal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  orderSummarySection: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  amountText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  productDetailsSection: {
    marginBottom: 24,
  },
  productCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 14,
    color: '#666',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  customerDetailsSection: {
    marginBottom: 24,
  },
  customerCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerText: {
    marginLeft: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  customerType: {
    fontSize: 14,
    color: '#666',
  },
  statusProgressSection: {
    marginBottom: 20,
  },
  progressContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressStepIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  progressDotActive: {
    backgroundColor: '#2196F3',
  },
  progressLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E9ECEF',
  },
  progressLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  progressLabelCompleted: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  progressLabelActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  statusActionsSection: {
    marginBottom: 20,
  },
  statusActionsContainer: {
    gap: 10,
  },
  statusActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusActionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  processingButton: {
    backgroundColor: '#9C27B0',
  },
  shippedButton: {
    backgroundColor: '#3F51B5',
  },
  deliveredButton: {
    backgroundColor: '#4CAF50',
  },

  // Cancel Order Section
  cancelOrderSection: {
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#F44336',
  },
  cancelOrderButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  cancelOrderHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 16,
  },

  // Cancel Modal Styles
  cancelModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
  },
  cancelModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cancelModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  cancelModalBody: {
    padding: 20,
  },
  cancelModalOrderInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  cancelModalWarning: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  cancelInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cancelReasonInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cancelModalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 10,
  },
  cancelModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalKeepButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cancelModalKeepButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  cancelModalConfirmButton: {
    backgroundColor: '#F44336',
  },
  cancelModalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
})

export default OrdersDashboard