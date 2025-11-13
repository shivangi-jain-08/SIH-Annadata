import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from '../Icon'
import ProductService from '../services/ProductService'
import VendorService from '../services/VendorService'

const { width } = Dimensions.get('window')

const RevenueCard = ({ title, amount, percentage, icon, color }) => {
  const formatAmount = (value) => {
    if (!value || value === 0) return '₹0'
    return VendorService.formatCurrency(value)
  }

  return (
    <View style={styles.revenueCard}>
      <View style={styles.revenueHeader}>
        <View style={[styles.revenueIcon, { backgroundColor: color + '20' }]}>
          <Icon name={icon} size={20} color={color} />
        </View>
        <Text style={styles.revenuePercentage}>{percentage}%</Text>
      </View>
      <Text style={styles.revenueAmount}>{formatAmount(amount)}</Text>
      <Text style={styles.revenueTitle}>{title}</Text>
    </View>
  )
}

const ProductCard = ({ product, onEdit, onDelete, onToggleStatus }) => {
  const getStatusColor = (status) => {
    return status === 'active' ? '#4CAF50' : '#F44336'
  }

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'vegetables': return 'Leaf'
      case 'fruits': return 'Apple'
      case 'grains': case 'pulses': return 'Wheat'
      case 'spices': case 'herbs': return 'Star'
      default: return 'Package'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return ''
    }
  }

  return (
    <View style={styles.productCard}>
      <View style={styles.productImagePlaceholder}>
        <Icon name={getCategoryIcon(product.category)} size={32} color="#FF9800" />
      </View>
      
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(product.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(product.status) }]}>
              {product.status}
            </Text>
          </View>
        </View>
        
        {product.description ? (
          <Text style={styles.productDescription} numberOfLines={1}>
            {product.description}
          </Text>
        ) : null}
        
        <Text style={styles.productPrice}>
          ₹{product.price}/{product.unit || 'kg'}
        </Text>
        <Text style={styles.productQuantity}>
          Stock: {product.quantity} {product.unit || 'kg'}
        </Text>
        <Text style={styles.productDetails}>
          Min. Order: {product.minimumOrderQuantity || 1} {product.unit || 'kg'}
        </Text>
        {product.createdAt && (
          <Text style={styles.productDate}>
            Listed: {formatDate(product.createdAt)}
          </Text>
        )}
        
        <View style={styles.productActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(product)}>
            <Icon name="Edit3" size={16} color="#2196F3" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.toggleButton]} 
            onPress={() => onToggleStatus(product.id)}
          >
            <Icon 
              name={product.status === 'active' ? 'Pause' : 'Play'} 
              size={16} 
              color={product.status === 'active' ? '#FF9800' : '#4CAF50'} 
            />
            <Text style={styles.actionButtonText}>
              {product.status === 'active' ? 'Pause' : 'Activate'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={() => onDelete(product.id)}
          >
            <Icon name="Trash2" size={16} color="#F44336" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const OrderCard = ({ order }) => {
  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800'
      case 'confirmed': return '#2196F3'
      case 'shipped': return '#9C27B0'
      case 'delivered': return '#4CAF50'
      case 'cancelled': return '#F44336'
      default: return '#666'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{order.id}</Text>
        <View style={[styles.orderStatusBadge, { backgroundColor: getOrderStatusColor(order.status) + '20' }]}>
          <Text style={[styles.orderStatusText, { color: getOrderStatusColor(order.status) }]}>
            {order.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.orderProduct}>{order.product}</Text>
        <Text style={styles.orderQuantity}>{order.quantity} kg</Text>
        <Text style={styles.orderCustomer}>Customer: {order.customer}</Text>
        <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.orderAmount}>₹{order.amount.toLocaleString()}</Text>
        <TouchableOpacity style={styles.orderViewButton}>
          <Text style={styles.orderViewText}>View Details</Text>
          <Icon name="ChevronRight" size={16} color="#2196F3" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const AddProductModal = ({ visible, onClose, onAdd }) => {
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('vegetables')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('kg')
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState('1')
  const [loading, setLoading] = useState(false)

  const categories = [
    { label: 'Vegetables', value: 'vegetables' },
    { label: 'Fruits', value: 'fruits' },
    { label: 'Grains', value: 'grains' },
    { label: 'Pulses', value: 'pulses' },
    { label: 'Spices', value: 'spices' },
    { label: 'Herbs', value: 'herbs' },
    { label: 'Other', value: 'other' }
  ]

  const units = [
    { label: 'Kilogram (kg)', value: 'kg' },
    { label: 'Gram (g)', value: 'gram' },
    { label: 'Ton', value: 'ton' },
    { label: 'Piece', value: 'piece' },
    { label: 'Dozen', value: 'dozen' },
    { label: 'Liter', value: 'liter' },
    { label: 'Bundle', value: 'bundle' }
  ]

  const handleAdd = async () => {
    if (!productName || !price || !quantity) {
      Alert.alert('Error', 'Please fill all required fields')
      return
    }
    
    try {
      setLoading(true)
      
      const productData = {
        name: productName.trim(),
        description: description.trim(),
        category,
        price: parseFloat(price),
        unit,
        availableQuantity: parseInt(quantity),
        minimumOrderQuantity: parseInt(minimumOrderQuantity) || 1
      }
      
      await onAdd(productData)
      
      // Reset form
      setProductName('')
      setDescription('')
      setCategory('vegetables')
      setPrice('')
      setQuantity('')
      setUnit('kg')
      setMinimumOrderQuantity('1')
      onClose()
    } catch (error) {
      console.error('Error in handleAdd:', error)
      Alert.alert('Error', error.message || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Product</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="X" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Product Name *</Text>
              <TextInput
                style={styles.textInput}
                value={productName}
                onChangeText={setProductName}
                placeholder="Enter product name"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textAreaInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter product description"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category *</Text>
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.categoryOption,
                        category === cat.value && styles.selectedCategory
                      ]}
                      onPress={() => setCategory(cat.value)}
                    >
                      <Text style={[
                        styles.categoryText,
                        category === cat.value && styles.selectedCategoryText
                      ]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <View style={styles.rowContainer}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Price per {unit} (₹) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Unit *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.unitContainer}>
                    {units.map((unitOption) => (
                      <TouchableOpacity
                        key={unitOption.value}
                        style={[
                          styles.unitOption,
                          unit === unitOption.value && styles.selectedUnit
                        ]}
                        onPress={() => setUnit(unitOption.value)}
                      >
                        <Text style={[
                          styles.unitText,
                          unit === unitOption.value && styles.selectedUnitText
                        ]}>
                          {unitOption.value}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
            
            <View style={styles.rowContainer}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Available Quantity *</Text>
                <TextInput
                  style={styles.textInput}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Min. Order Qty</Text>
                <TextInput
                  style={styles.textInput}
                  value={minimumOrderQuantity}
                  onChangeText={setMinimumOrderQuantity}
                  placeholder="1"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </ScrollView>
          
          <TouchableOpacity 
            style={[styles.addButton, loading && styles.disabledButton]} 
            onPress={handleAdd}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.addButtonText}>Add Product</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const VSellCrops = () => {
  const navigation = useNavigation()
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState('products')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  
  // Real data states
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [vendorMetrics, setVendorMetrics] = useState({
    totalRevenue: 0,
    activeOrders: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    activeOrdersGrowth: 0
  })

  // Load vendor's products and orders
  const loadVendorData = async () => {
    try {
      setError(null)
      
      // Load vendor's products
      console.log('VSellCrops: Loading vendor products...')
      const productsResponse = await ProductService.getFarmerProducts() // Works for vendors too
      
      if (productsResponse.success && productsResponse.data) {
        const formattedProducts = productsResponse.data.map(product => ({
          id: product._id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          unit: product.unit || 'kg',
          quantity: product.availableQuantity,
          status: product.isActive ? 'active' : 'inactive',
          minimumOrderQuantity: product.minimumOrderQuantity || 1,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }))
        
        setProducts(formattedProducts)
        console.log('VSellCrops: Loaded products:', formattedProducts.length)
        
        if (productsResponse.isOffline) {
          setError('Using cached data - network unavailable')
        } else if (productsResponse.isMock) {
          setError('Using demo data - API unavailable')
        }
      }
      
      // Load vendor's orders for revenue calculation
      console.log('VSellCrops: Loading vendor orders...')
      const ordersResponse = await VendorService.getVendorOrders('selling') // Only selling orders
      
      if (ordersResponse.success && ordersResponse.data) {
        const ordersList = Array.isArray(ordersResponse.data) ? ordersResponse.data : ordersResponse.data.orders || []
        setOrders(ordersList)
        
        // Calculate metrics
        const metrics = VendorService.calculateVendorMetrics(ordersList)
        setVendorMetrics(metrics)
        
        console.log('VSellCrops: Loaded orders:', ordersList.length)
        console.log('VSellCrops: Calculated metrics:', metrics)
        console.log('VSellCrops: Sample orders:', ordersList.slice(0, 2))
      } else {
        // Use mock data for orders if API fails
        const mockOrders = VendorService.getMockVendorData()
        setOrders(mockOrders)
        setVendorMetrics(VendorService.calculateVendorMetrics(mockOrders))
        setError('Using demo data for orders - API unavailable')
      }
      
    } catch (err) {
      console.error('VSellCrops: Error loading data:', err)
      setError(err.message)
      
      // Use mock data as fallback
      const mockOrders = VendorService.getMockVendorData()
      setOrders(mockOrders)
      setVendorMetrics(VendorService.calculateVendorMetrics(mockOrders))
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadVendorData()
  }, [])

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true)
    await loadVendorData()
    setRefreshing(false)
  }

  // Calculate revenue breakdown by product categories from actual orders
  const calculateRevenueBreakdown = () => {
    const categoryRevenue = {
      grains: 0,
      vegetables: 0,
      fruits: 0,
      others: 0
    }

    // Calculate revenue from delivered orders by category
    const deliveredOrders = orders.filter(order => order.status === 'delivered')
    
    deliveredOrders.forEach(order => {
      if (order.products && Array.isArray(order.products)) {
        order.products.forEach(orderProduct => {
          // Find the corresponding product to get its category
          const product = products.find(p => 
            p.name.toLowerCase() === orderProduct.name?.toLowerCase() ||
            p.id === orderProduct.productId
          )
          
          const productCategory = product?.category || 'other'
          const productRevenue = (orderProduct.quantity || 0) * (orderProduct.price || 0)
          
          // Group by categories
          if (['grains', 'pulses'].includes(productCategory.toLowerCase())) {
            categoryRevenue.grains += productRevenue
          } else if (productCategory.toLowerCase() === 'vegetables') {
            categoryRevenue.vegetables += productRevenue
          } else if (productCategory.toLowerCase() === 'fruits') {
            categoryRevenue.fruits += productRevenue
          } else {
            categoryRevenue.others += productRevenue
          }
        })
      }
    })

    // Use actual total revenue from vendor metrics, fallback to calculated if needed
    const totalRevenue = vendorMetrics.totalRevenue || Object.values(categoryRevenue).reduce((a, b) => a + b, 0)
    
    // If we don't have category breakdown but have total revenue, distribute it proportionally based on products
    if (totalRevenue > 0 && Object.values(categoryRevenue).every(val => val === 0)) {
      // Fallback: distribute total revenue based on product inventory value
      const productCategoryValue = {
        grains: 0,
        vegetables: 0,
        fruits: 0,
        others: 0
      }
      
      products.forEach(product => {
        const inventoryValue = product.price * product.quantity
        if (['grains', 'pulses'].includes(product.category?.toLowerCase())) {
          productCategoryValue.grains += inventoryValue
        } else if (product.category?.toLowerCase() === 'vegetables') {
          productCategoryValue.vegetables += inventoryValue
        } else if (product.category?.toLowerCase() === 'fruits') {
          productCategoryValue.fruits += inventoryValue
        } else {
          productCategoryValue.others += inventoryValue
        }
      })
      
      const totalProductValue = Object.values(productCategoryValue).reduce((a, b) => a + b, 0)
      if (totalProductValue > 0) {
        categoryRevenue.grains = (productCategoryValue.grains / totalProductValue) * totalRevenue * 0.3 // Assume 30% sold
        categoryRevenue.vegetables = (productCategoryValue.vegetables / totalProductValue) * totalRevenue * 0.3
        categoryRevenue.fruits = (productCategoryValue.fruits / totalProductValue) * totalRevenue * 0.3
        categoryRevenue.others = (productCategoryValue.others / totalProductValue) * totalRevenue * 0.3
      }
    }
    
    return [
      {
        title: 'Total Revenue',
        amount: totalRevenue,
        percentage: 100,
        icon: 'DollarSign',
        color: '#4CAF50'
      },
      {
        title: 'Grains & Pulses',
        amount: categoryRevenue.grains,
        percentage: totalRevenue > 0 ? Math.round((categoryRevenue.grains / totalRevenue) * 100) : 0,
        icon: 'Wheat',
        color: '#FF9800'
      },
      {
        title: 'Vegetables',
        amount: categoryRevenue.vegetables,
        percentage: totalRevenue > 0 ? Math.round((categoryRevenue.vegetables / totalRevenue) * 100) : 0,
        icon: 'Leaf',
        color: '#2196F3'
      },
      {
        title: 'Others',
        amount: categoryRevenue.fruits + categoryRevenue.others,
        percentage: totalRevenue > 0 ? Math.round(((categoryRevenue.fruits + categoryRevenue.others) / totalRevenue) * 100) : 0,
        icon: 'Package',
        color: '#9C27B0'
      }
    ]
  }

  const revenueData = calculateRevenueBreakdown()

  // Get active orders for display
  const activeOrders = orders.filter(order => 
    ['pending', 'confirmed', 'shipped', 'in_transit'].includes(order.status)
  ).map(order => ({
    id: order._id,
    product: order.products?.[0]?.name || 'Unknown Product',
    quantity: order.products?.[0]?.quantity || 0,
    customer: order.buyerDetails?.name || `Customer ${order.buyerId?.slice(-6)}`,
    amount: order.totalAmount || 0,
    status: order.status,
    date: order.createdAt
  }))

  const handleAddProduct = async (productData) => {
    try {
      console.log('VSellCrops: Adding product:', productData)
      
      const response = await ProductService.addProduct(productData)
      
      if (response.success) {
        Alert.alert('Success', 'Product added successfully!')
        
        // Reload products to get the updated list
        await loadVendorData()
      } else {
        throw new Error(response.message || 'Failed to add product')
      }
    } catch (error) {
      console.error('VSellCrops: Error adding product:', error)
      Alert.alert('Error', error.message || 'Failed to add product. Please try again.')
      throw error // Re-throw to handle loading state in modal
    }
  }

  const handleEditProduct = (product) => {
    Alert.alert('Edit Product', `Editing ${product.name}...`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Edit', onPress: () => {
        // TODO: Implement edit product modal/screen
        console.log('Edit product:', product)
      }}
    ])
  }

  const handleDeleteProduct = (productId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('VSellCrops: Deleting product:', productId)
              
              const response = await ProductService.deleteProduct(productId)
              
              if (response.success) {
                Alert.alert('Success', 'Product deleted successfully!')
                
                // Remove from local state immediately for better UX
                setProducts(prev => prev.filter(p => p.id !== productId))
                
                // Also reload to ensure consistency
                await loadVendorData()
              } else {
                throw new Error(response.message || 'Failed to delete product')
              }
            } catch (error) {
              console.error('VSellCrops: Error deleting product:', error)
              Alert.alert('Error', error.message || 'Failed to delete product. Please try again.')
            }
          }
        }
      ]
    )
  }

  const handleToggleProductStatus = async (productId) => {
    try {
      const product = products.find(p => p.id === productId)
      if (!product) return
      
      const newStatus = product.status === 'active' ? 'inactive' : 'active'
      const isActive = newStatus === 'active'
      
      console.log('VSellCrops: Toggling product status:', productId, 'to', newStatus)
      
      const response = await ProductService.updateProduct(productId, { 
        isActive 
      })
      
      if (response.success) {
        // Update local state immediately for better UX
        setProducts(prev =>
          prev.map(p => 
            p.id === productId 
              ? { ...p, status: newStatus }
              : p
          )
        )
        
        Alert.alert('Success', `Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`)
      } else {
        throw new Error(response.message || 'Failed to update product status')
      }
    } catch (error) {
      console.error('VSellCrops: Error toggling product status:', error)
      Alert.alert('Error', error.message || 'Failed to update product status. Please try again.')
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="ArrowLeft" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Sell Crops</Text>
              <Text style={styles.headerSubtitle}>Manage your crop listings</Text>
            </View>
            <TouchableOpacity style={styles.addProductButton} onPress={() => setShowAddModal(true)}>
              <Icon name="Plus" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9800" />
          <Text style={styles.loadingText}>Loading your products...</Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="ArrowLeft" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Sell Crops</Text>
            <Text style={styles.headerSubtitle}>Manage your crop listings</Text>
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.addProductButton} onPress={() => setShowAddModal(true)}>
            <Icon name="Plus" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Revenue Overview */}
      <View style={styles.revenueSection}>
        <Text style={styles.sectionTitle}>Revenue Overview</Text>
        <View style={styles.revenueGrid}>
          {revenueData.map((revenue, index) => (
            <RevenueCard
              key={index}
              title={revenue.title}
              amount={revenue.amount}
              percentage={revenue.percentage}
              icon={revenue.icon}
              color={revenue.color}
            />
          ))}
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Icon name="Package" size={20} color={activeTab === 'products' ? '#FF9800' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
            My Products ({products.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Icon name="ShoppingBag" size={20} color={activeTab === 'orders' ? '#FF9800' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            Active Orders ({activeOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      <View style={styles.contentContainer}>
        {activeTab === 'products' ? (
          <View style={styles.productsList}>
            {products.length > 0 ? (
              products.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleStatus={handleToggleProductStatus}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Icon name="Package" size={64} color="#ccc" />
                <Text style={styles.emptyStateTitle}>No Products Listed</Text>
                <Text style={styles.emptyStateText}>
                  Start by adding your first product to begin selling
                </Text>
                <TouchableOpacity 
                  style={styles.emptyStateButton} 
                  onPress={() => setShowAddModal(true)}
                >
                  <Icon name="Plus" size={20} color="white" />
                  <Text style={styles.emptyStateButtonText}>Add Product</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.ordersList}>
            {activeOrders.length > 0 ? (
              activeOrders.map((item) => (
                <OrderCard key={item.id} order={item} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Icon name="ShoppingBag" size={64} color="#ccc" />
                <Text style={styles.emptyStateTitle}>No Active Orders</Text>
                <Text style={styles.emptyStateText}>
                  Your customer orders will appear here
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />

      {/* Add Product Modal */}
      <AddProductModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProduct}
      />
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
  addProductButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    marginTop: 2,
  },

  // Revenue Section
  revenueSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  revenueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  revenueCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: (width - 52) / 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  revenueIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  revenuePercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  revenueAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  revenueTitle: {
    fontSize: 14,
    color: '#666',
  },

  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFF3E0',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#FF9800',
  },

  // Products List
  productsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  productDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  toggleButton: {
    backgroundColor: '#FFF8E1',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },

  // Orders List
  ordersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderProduct: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  orderQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderCustomer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
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
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  orderViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderViewText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
    marginRight: 4,
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
  },
  errorText: {
    fontSize: 12,
    color: '#FFF9C4',
    marginTop: 5,
    fontStyle: 'italic',
  },
  
  // Content Container
  contentContainer: {
    flex: 1,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 20,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  
  // Bottom Spacing
  bottomSpacing: {
    height: 30,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  
  // Category and Unit Selection
  pickerContainer: {
    marginTop: 8,
  },
  categoryOption: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategory: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedCategoryText: {
    color: 'white',
  },
  
  // Row Layout
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  
  // Unit Selection
  unitContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  unitOption: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedUnit: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  unitText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  selectedUnitText: {
    color: 'white',
  },
  
  // Button States
  addButton: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
})

export default VSellCrops