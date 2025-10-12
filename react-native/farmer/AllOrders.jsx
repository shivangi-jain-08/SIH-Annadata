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

const OrderDetailModal = ({ visible, order, onClose }) => {
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
          </ScrollView>
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
})

export default AllOrders