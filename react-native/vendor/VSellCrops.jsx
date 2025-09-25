import React, { useState } from 'react'
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
  TextInput
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from '../Icon'

const { width } = Dimensions.get('window')

const RevenueCard = ({ title, amount, percentage, icon, color }) => {
  return (
    <View style={styles.revenueCard}>
      <View style={styles.revenueHeader}>
        <View style={[styles.revenueIcon, { backgroundColor: color + '20' }]}>
          <Icon name={icon} size={20} color={color} />
        </View>
        <Text style={styles.revenuePercentage}>{percentage}%</Text>
      </View>
      <Text style={styles.revenueAmount}>₹{amount.toLocaleString()}</Text>
      <Text style={styles.revenueTitle}>{title}</Text>
    </View>
  )
}

const ProductCard = ({ product, onEdit, onDelete, onToggleStatus }) => {
  const getStatusColor = (status) => {
    return status === 'active' ? '#4CAF50' : '#F44336'
  }

  return (
    <View style={styles.productCard}>
      <View style={styles.productImagePlaceholder}>
        <Icon name="Package" size={32} color="#FF9800" />
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
        
        <Text style={styles.productPrice}>₹{product.price}/kg</Text>
        <Text style={styles.productQuantity}>Stock: {product.quantity} kg</Text>
        <Text style={styles.productRevenue}>Revenue: ₹{product.totalRevenue.toLocaleString()}</Text>
        
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
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')

  const handleAdd = () => {
    if (!productName || !price || !quantity) {
      Alert.alert('Error', 'Please fill all fields')
      return
    }
    
    onAdd({
      name: productName,
      price: parseFloat(price),
      quantity: parseInt(quantity)
    })
    
    setProductName('')
    setPrice('')
    setQuantity('')
    onClose()
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
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Product Name</Text>
            <TextInput
              style={styles.textInput}
              value={productName}
              onChangeText={setProductName}
              placeholder="Enter product name"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Price per kg (₹)</Text>
            <TextInput
              style={styles.textInput}
              value={price}
              onChangeText={setPrice}
              placeholder="Enter price"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Quantity (kg)</Text>
            <TextInput
              style={styles.textInput}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Enter quantity"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
          
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>Add Product</Text>
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
  
  // Mock products data
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Premium Wheat',
      price: 35,
      quantity: 500,
      status: 'active',
      totalRevenue: 87500,
      ordersSold: 250
    },
    {
      id: 2,
      name: 'Organic Rice',
      price: 50,
      quantity: 300,
      status: 'active',
      totalRevenue: 65000,
      ordersSold: 130
    },
    {
      id: 3,
      name: 'Fresh Tomatoes',
      price: 25,
      quantity: 0,
      status: 'inactive',
      totalRevenue: 45000,
      ordersSold: 180
    },
    {
      id: 4,
      name: 'Cotton',
      price: 60,
      quantity: 200,
      status: 'active',
      totalRevenue: 36000,
      ordersSold: 60
    }
  ])

  // Mock active orders
  const activeOrders = [
    {
      id: 'ORD001',
      product: 'Premium Wheat',
      quantity: 50,
      customer: 'Rajesh Store',
      amount: 1750,
      status: 'pending',
      date: '2025-09-25'
    },
    {
      id: 'ORD002',
      product: 'Organic Rice',
      quantity: 25,
      customer: 'Green Grocers',
      amount: 1250,
      status: 'confirmed',
      date: '2025-09-24'
    },
    {
      id: 'ORD003',
      product: 'Cotton',
      quantity: 30,
      customer: 'Textile Mills',
      amount: 1800,
      status: 'shipped',
      date: '2025-09-23'
    }
  ]

  // Calculate revenue data
  const totalRevenue = products.reduce((sum, product) => sum + product.totalRevenue, 0)
  const activeProducts = products.filter(p => p.status === 'active')
  const wheatRevenue = products.find(p => p.name.includes('Wheat'))?.totalRevenue || 0
  const riceRevenue = products.find(p => p.name.includes('Rice'))?.totalRevenue || 0
  const otherRevenue = totalRevenue - wheatRevenue - riceRevenue

  const revenueData = [
    {
      title: 'Total Revenue',
      amount: totalRevenue,
      percentage: 100,
      icon: 'DollarSign',
      color: '#4CAF50'
    },
    {
      title: 'Wheat Revenue',
      amount: wheatRevenue,
      percentage: Math.round((wheatRevenue / totalRevenue) * 100),
      icon: 'Wheat',
      color: '#FF9800'
    },
    {
      title: 'Rice Revenue',
      amount: riceRevenue,
      percentage: Math.round((riceRevenue / totalRevenue) * 100),
      icon: 'Leaf',
      color: '#2196F3'
    },
    {
      title: 'Others',
      amount: otherRevenue,
      percentage: Math.round((otherRevenue / totalRevenue) * 100),
      icon: 'Package',
      color: '#9C27B0'
    }
  ]

  const handleAddProduct = (newProduct) => {
    const product = {
      ...newProduct,
      id: products.length + 1,
      status: 'active',
      totalRevenue: 0,
      ordersSold: 0
    }
    setProducts(prev => [...prev, product])
    Alert.alert('Success', 'Product added successfully!')
  }

  const handleEditProduct = (product) => {
    Alert.alert('Edit Product', `Editing ${product.name}...`)
  }

  const handleDeleteProduct = (productId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setProducts(prev => prev.filter(p => p.id !== productId))
            Alert.alert('Success', 'Product deleted successfully!')
          }
        }
      ]
    )
  }

  const handleToggleProductStatus = (productId) => {
    setProducts(prev =>
      prev.map(product => {
        if (product.id === productId) {
          const newStatus = product.status === 'active' ? 'inactive' : 'active'
          return { ...product, status: newStatus }
        }
        return product
      })
    )
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
            <Text style={styles.headerTitle}>Sell Crops</Text>
            <Text style={styles.headerSubtitle}>Manage your crop listings</Text>
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
      {activeTab === 'products' ? (
        <FlatList
          data={products}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onToggleStatus={handleToggleProductStatus}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={activeOrders}
          renderItem={({ item }) => <OrderCard order={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Product Modal */}
      <AddProductModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProduct}
      />
    </View>
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
  productRevenue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
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
  addButton: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
})

export default VSellCrops