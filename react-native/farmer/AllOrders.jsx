import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Alert
} from 'react-native'
import Icon from '../Icon'
import OrdersService from '../services/ordersService'

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

const OrderCard = ({ order, onPress }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  const getPriorityColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#FF9800';
      case 'confirmed': return '#2196F3';
      case 'processing': return '#9C27B0';
      case 'shipped': return '#3F51B5';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  }

  return (
    <TouchableOpacity style={styles.orderCard} onPress={() => onPress(order)}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderId}>#{order.id?.substring(0, 8) || 'N/A'}</Text>
          <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
        </View>
        <StatusBadge status={order.status} originalStatus={order.originalStatus} />
      </View>
      
      <View style={styles.orderContent}>
        <View style={styles.orderCropSection}>
          <View style={styles.orderCrop}>
            <Icon name={getCropIcon(order.crop)} size={18} color="#4CAF50" />
            <Text style={styles.orderCropName}>{order.crop}</Text>
          </View>
          <View style={styles.orderQuantity}>
            <Icon name="Package" size={16} color="#666" />
            <Text style={styles.orderQuantityText}>{order.quantity} kg</Text>
          </View>
        </View>
        
        <View style={styles.orderVendorSection}>
          <View style={styles.vendorInfo}>
            <Icon name="User" size={16} color="#666" />
            <Text style={styles.vendorName}>{order.vendor}</Text>
          </View>
          <View style={styles.orderPriority}>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(order.status) }]} />
            <Text style={[styles.priorityText, { color: getPriorityColor(order.status) }]}>
              {order.originalStatus || order.status}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.orderAmount}>{OrdersService.formatCurrency(order.amount)}</Text>
        <Icon name="ChevronRight" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  )
}

const OrderDetailModal = ({ visible, order, onClose, onStatusUpdate, onCancelOrder }) => {
  const [updating, setUpdating] = useState(false);

  if (!order) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusSteps = (status) => {
    const allSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = allSteps.findIndex(step => step === status?.toLowerCase());
    
    return allSteps.map((step, index) => ({
      label: step.charAt(0).toUpperCase() + step.slice(1),
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  const handleStatusUpdate = async (newStatus) => {
    Alert.alert(
      'Update Order Status',
      `Are you sure you want to change status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setUpdating(true);
            try {
              console.log('Modal: Updating order status to:', newStatus);
              const success = await onStatusUpdate(order.id, newStatus);
              console.log('Modal: Update result:', success);
              
              if (success) {
                Alert.alert('Success', 'Order status updated successfully');
                onClose();
              } else {
                Alert.alert('Error', 'Failed to update order status. Please check console logs for details.');
              }
            } catch (error) {
              console.error('Modal: Error caught:', error);
              Alert.alert('Error', `Failed to update order status: ${error.message || 'Unknown error'}`);
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
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
    const status = currentStatus?.toLowerCase();
    return status !== 'delivered' && status !== 'cancelled';
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
              <Text style={styles.sectionTitle}>Order Summary</Text>
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
              <Text style={styles.sectionTitle}>Product Details</Text>
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
              <Text style={styles.sectionTitle}>Customer Details</Text>
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

            {/* Order Status Progress */}
            <View style={styles.statusProgressSection}>
              <Text style={styles.sectionTitle}>Order Progress</Text>
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
                <Text style={styles.sectionTitle}>Update Status</Text>
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

const FilterChip = ({ label, selected, onPress, icon }) => (
  <TouchableOpacity
    style={[styles.filterChip, selected && styles.filterChipSelected]}
    onPress={onPress}
  >
    {icon && <Icon name={icon} size={14} color={selected ? 'white' : '#666'} />}
    <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const AllOrders = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  // Status filters
  const statusFilters = [
    { label: 'All', value: 'all', icon: 'List' },
    { label: 'Pending', value: 'pending', icon: 'Clock' },
    { label: 'Confirmed', value: 'confirmed', icon: 'CheckCircle' },
    { label: 'Processing', value: 'processing', icon: 'Loader' },
    { label: 'Shipped', value: 'shipped', icon: 'Truck' },
    { label: 'Delivered', value: 'delivered', icon: 'Package' },
    { label: 'Cancelled', value: 'cancelled', icon: 'XCircle' }
  ];

  // Sort options
  const sortOptions = [
    { label: 'Date', value: 'date' },
    { label: 'Amount', value: 'amount' },
    { label: 'Status', value: 'status' },
    { label: 'Customer', value: 'vendor' }
  ];

  // Load orders data
  const loadOrders = async () => {
    try {
      setError(null);
      const response = await OrdersService.getUserOrders('seller');
      
      if (response.success && response.data && response.data.orders) {
        const transformedOrders = transformOrdersForDisplay(response.data.orders);
        setOrders(transformedOrders);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message);
      
      // Use mock data as fallback
      const mockOrders = OrdersService.generateMockOrderData();
      const transformedMockOrders = transformOrdersForDisplay(mockOrders);
      setOrders(transformedMockOrders);
    } finally {
      setLoading(false);
    }
  };

  // Transform orders for display
  const transformOrdersForDisplay = (ordersData) => {
    if (!ordersData || !Array.isArray(ordersData)) return [];
    
    return ordersData
      .map(order => ({
        id: order._id || order.id,
        date: order.createdAt || order.date,
        crop: order.products?.[0]?.name || order.crop || 'Mixed Products',
        quantity: order.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || order.quantity || 0,
        vendor: order.buyerId?.name || order.vendor || 'Unknown Buyer',
        amount: order.totalAmount || order.amount || 0,
        status: OrdersService.getStatusText(order.status),
        originalStatus: order.status,
        products: order.products || [],
        buyerInfo: order.buyerId || {},
        shippingAddress: order.shippingAddress || {},
        paymentMethod: order.paymentMethod || 'COD',
        notes: order.notes || ''
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Apply filters and search
  const applyFilters = () => {
    let filtered = [...orders];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.crop.toLowerCase().includes(query) ||
        order.vendor.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => 
        order.originalStatus?.toLowerCase() === selectedStatus.toLowerCase() ||
        order.status.toLowerCase().includes(selectedStatus.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'date':
          aVal = new Date(a.date);
          bVal = new Date(b.date);
          break;
        case 'amount':
          aVal = a.amount;
          bVal = b.amount;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'vendor':
          aVal = a.vendor.toLowerCase();
          bVal = b.vendor.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });

    setFilteredOrders(filtered);
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  // Handle order press
  const handleOrderPress = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      console.log('=== Status Update Debug ===');
      console.log('Order ID:', orderId);
      console.log('New Status:', newStatus);
      
      const response = await OrdersService.updateOrderStatus(orderId, newStatus);
      
      console.log('Status update response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        // Refresh orders list
        await loadOrders();
        return true;
      }
      
      console.error('Status update failed:', response);
      return false;
    } catch (error) {
      console.error('Error updating order status:', error);
      console.error('Error details:', error.message);
      console.error('Error response:', error.response);
      return false;
    }
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
        await loadOrders();
      } else {
        Alert.alert('Error', 'Failed to cancel order. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      Alert.alert('Error', 'Failed to cancel order. Please try again.');
    }
  };

  // Handle sort toggle
  const handleSortToggle = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
  };

  // Load data on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [orders, searchQuery, selectedStatus, sortBy, sortOrder]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="ArrowLeft" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>All Orders</Text>
            <Text style={styles.headerSubtitle}>Complete order history and management</Text>
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersSection}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="Search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders by ID, product, or customer..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="X" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusFilters}
        >
          {statusFilters.map((filter) => (
            <FilterChip
              key={filter.value}
              label={filter.label}
              selected={selectedStatus === filter.value}
              onPress={() => setSelectedStatus(filter.value)}
              icon={filter.icon}
            />
          ))}
        </ScrollView>

        {/* Sort Controls */}
        <View style={styles.sortControls}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <View style={styles.sortButtons}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortButton,
                  sortBy === option.value && styles.sortButtonActive
                ]}
                onPress={() => setSortBy(option.value)}
              >
                <Text style={[
                  styles.sortButtonText,
                  sortBy === option.value && styles.sortButtonTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.sortOrderButton} onPress={handleSortToggle}>
              <Icon 
                name={sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'} 
                size={16} 
                color="#2196F3" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Results Summary */}
      <View style={styles.resultsSection}>
        <Text style={styles.resultsText}>
          Showing {filteredOrders.length} of {orders.length} orders
        </Text>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={handleOrderPress} />
        )}
        keyExtractor={(item) => item.id}
        style={styles.ordersList}
        contentContainerStyle={styles.ordersListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.noOrdersContainer}>
            <Icon name="Search" size={48} color="#ccc" />
            <Text style={styles.noOrdersText}>No orders found</Text>
            <Text style={styles.noOrdersSubtext}>
              {searchQuery || selectedStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Orders will appear here when customers place them'
              }
            </Text>
            {searchQuery || selectedStatus !== 'all' ? (
              <TouchableOpacity 
                style={styles.clearFiltersButton} 
                onPress={() => {
                  setSearchQuery('');
                  setSelectedStatus('all');
                }}
              >
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={onRefresh}
              >
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        visible={showDetailModal}
        order={selectedOrder}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedOrder(null);
        }}
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
    </View>
  );
};

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
  errorText: {
    fontSize: 12,
    color: '#FFF9C4',
    marginTop: 5,
    fontStyle: 'italic',
  },

  // Filters Section
  filtersSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  statusFilters: {
    paddingBottom: 15,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  filterChipSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginLeft: 4,
  },
  filterChipTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  sortControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sortButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  sortButtonActive: {
    backgroundColor: '#E3F2FD',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  sortOrderButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#E3F2FD',
  },

  // Results Section
  resultsSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  // Orders List
  ordersList: {
    flex: 1,
  },
  ordersListContent: {
    padding: 20,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderContent: {
    marginBottom: 12,
  },
  orderCropSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderCrop: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderCropName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
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
  orderVendorSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vendorName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  orderPriority: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },

  // No Orders
  noOrdersContainer: {
    alignItems: 'center',
    padding: 40,
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
  clearFiltersButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  clearFiltersText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  sectionTitle: {
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

  // Status Update Actions
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

export default AllOrders