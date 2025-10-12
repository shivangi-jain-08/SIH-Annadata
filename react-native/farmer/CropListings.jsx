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
  Modal,
  TextInput,
  Alert,
  Dimensions
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import Icon from '../Icon'
import ProductService from '../services/ProductService'

const { width } = Dimensions.get('window')

const ProductCard = ({ product, onEdit, onDelete, onToggleStatus }) => {
  const getQualityColor = (quality) => {
    switch (quality?.toLowerCase()) {
      case 'premium': return '#4CAF50';
      case 'standard': return '#FF9800';
      case 'organic': return '#8BC34A';
      case 'fresh': return '#2196F3';
      default: return '#666';
    }
  };

  const getCategoryIcon = (category) => {
    const categoryName = category?.toLowerCase() || '';
    if (categoryName.includes('vegetable')) return 'Leaf';
    if (categoryName.includes('fruit')) return 'Apple';
    if (categoryName.includes('grain')) return 'Wheat';
    if (categoryName.includes('spice')) return 'Star';
    return 'Package';
  };

  const formatExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { text: 'No expiry', color: '#666' };
    
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Expired', color: '#F44336' };
    if (diffDays <= 3) return { text: `${diffDays}d left`, color: '#FF9800' };
    if (diffDays <= 7) return { text: `${diffDays}d left`, color: '#FFC107' };
    return { text: `${diffDays}d left`, color: '#4CAF50' };
  };

  const expiryStatus = formatExpiryStatus(product.expiryDate);

  return (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <View style={styles.productTitleRow}>
            <Icon name={getCategoryIcon(product.category)} size={20} color="#4CAF50" />
            <Text style={styles.productName}>{product.cropName}</Text>
            <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(product.quality) + '20' }]}>
              <Text style={[styles.qualityText, { color: getQualityColor(product.quality) }]}>
                {product.quality}
              </Text>
            </View>
          </View>
          
          <View style={styles.categoryRow}>
            <Text style={styles.categoryText}>{product.category?.toUpperCase()}</Text>
            <View style={[styles.statusBadge, { backgroundColor: product.isActive ? '#4CAF5020' : '#F4433620' }]}>
              <Text style={[styles.statusText, { color: product.isActive ? '#4CAF50' : '#F44336' }]}>
                {product.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.productDescription} numberOfLines={2}>{product.description}</Text>
        </View>
      </View>
      
      <View style={styles.productDetails}>
        <View style={styles.productDetailRow}>
          <View style={styles.productDetailItem}>
            <Icon name="Package" size={16} color="#666" />
            <Text style={styles.productDetailText}>{product.availableQuantity} {product.unit}</Text>
          </View>
          <View style={styles.productDetailItem}>
            <Icon name="DollarSign" size={16} color="#666" />
            <Text style={styles.productDetailText}>₹{product.price}/{product.unit}</Text>
          </View>
        </View>
        
        <View style={styles.productDetailRow}>
          <View style={styles.productDetailItem}>
            <Icon name="ShoppingCart" size={16} color="#666" />
            <Text style={styles.productDetailText}>Min: {product.minimumOrderQuantity} {product.unit}</Text>
          </View>
          <View style={styles.productDetailItem}>
            <Icon name="MapPin" size={16} color="#666" />
            <Text style={styles.productDetailText}>{product.location}</Text>
          </View>
        </View>

        {product.harvestDate && (
          <View style={styles.productDetailRow}>
            <View style={styles.productDetailItem}>
              <Icon name="Calendar" size={16} color="#666" />
              <Text style={styles.productDetailText}>Harvested: {product.harvestDate}</Text>
            </View>
            <View style={styles.productDetailItem}>
              <Icon name="Clock" size={16} color={expiryStatus.color} />
              <Text style={[styles.productDetailText, { color: expiryStatus.color }]}>
                {expiryStatus.text}
              </Text>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.productActions}>
        <Text style={styles.productTotal}>
          Total Value: ₹{(product.availableQuantity * product.price).toLocaleString()}
        </Text>
        <View style={styles.productButtons}>
          <TouchableOpacity 
            style={[styles.productButton, styles.toggleButton]} 
            onPress={() => onToggleStatus(product)}
          >
            <Icon name={product.isActive ? "EyeOff" : "Eye"} size={16} color={product.isActive ? "#FF9800" : "#4CAF50"} />
            <Text style={[styles.toggleButtonText, { color: product.isActive ? "#FF9800" : "#4CAF50" }]}>
              {product.isActive ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.productButton, styles.editButton]} 
            onPress={() => onEdit(product)}
          >
            <Icon name="Edit" size={16} color="#2196F3" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.productButton, styles.deleteButton]} 
            onPress={() => onDelete(product)}
          >
            <Icon name="Trash2" size={16} color="#F44336" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const StatsCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <View style={styles.statsCard}>
      <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={styles.statsContent}>
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsTitle}>{title}</Text>
        {subtitle && <Text style={styles.statsSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  )
}

const CropListings = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({});

  // Modal and form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [updatingProduct, setUpdatingProduct] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'vegetables',
    price: '',
    unit: 'kg',
    availableQuantity: '',
    minimumOrderQuantity: '',
    location: '',
    harvestDate: new Date(),
    expiryDate: new Date()
  });

  // Date picker states
  const [showHarvestDatePicker, setShowHarvestDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Categories for dropdown (matching backend validation)
  const categories = [
    { label: 'All Categories', value: 'all' },
    { label: 'Vegetables', value: 'vegetables' },
    { label: 'Fruits', value: 'fruits' },
    { label: 'Grains', value: 'grains' },
    { label: 'Pulses', value: 'pulses' },
    { label: 'Spices', value: 'spices' },
    { label: 'Herbs', value: 'herbs' },
    { label: 'Dairy', value: 'dairy' },
    { label: 'Other', value: 'other' }
  ];

  // Units for dropdown (matching backend validation)
  const units = ['kg', 'gram', 'ton', 'piece', 'dozen', 'liter', 'bundle'];

  // Load products from API
  const loadProducts = async () => {
    try {
      setError(null);
      const response = await ProductService.getFarmerProducts();
      
      if (response.success && response.data) {
        const formattedProducts = response.data
          .map(product => ProductService.formatProductData(product))
          .filter(product => product !== null);  // Remove any null products
        
        setProducts(formattedProducts);
        
        // Calculate analytics using formatted products
        const productAnalytics = ProductService.getProductsAnalytics(formattedProducts);
        setAnalytics(productAnalytics);

        // Handle offline/mock indicators
        if (response.isOffline) {
          setError('Using cached data - network unavailable');
        } else if (response.isMock) {
          setError('Using demo data - API unavailable');
        }
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message);
      setProducts([]);
      setAnalytics({});
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  const applyFilters = () => {
    if (!products || products.length === 0) return;
    
    let filtered = [...products];

    // Apply search
    if (searchQuery && searchQuery.trim()) {
      filtered = ProductService.searchProducts(filtered, searchQuery);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = ProductService.filterByCategory(filtered, selectedCategory);
    }

    // Apply sorting
    filtered = ProductService.sortProducts(filtered, sortBy, 'asc');

    setFilteredProducts(filtered);
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      description: '',
      category: 'vegetables',
      price: '',
      unit: 'kg',
      availableQuantity: '',
      minimumOrderQuantity: '',
      location: '',
      harvestDate: new Date(),
      expiryDate: new Date()
    });
  };

  // Add new product
  const handleAddProduct = async () => {
    try {
      setAddingProduct(true);
      
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        Alert.alert('Error', 'Product name is required');
        return;
      }
      if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
        Alert.alert('Error', 'Please enter a valid price');
        return;
      }
      if (!formData.availableQuantity || isNaN(parseFloat(formData.availableQuantity)) || parseFloat(formData.availableQuantity) <= 0) {
        Alert.alert('Error', 'Please enter a valid available quantity');
        return;
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        category: formData.category,
        price: parseFloat(formData.price),
        unit: formData.unit,
        availableQuantity: parseFloat(formData.availableQuantity),
        minimumOrderQuantity: parseFloat(formData.minimumOrderQuantity) || 1,
        // Remove location field for now since backend expects coordinates
        harvestDate: formData.harvestDate ? formData.harvestDate.toISOString() : new Date().toISOString(),
        expiryDate: formData.expiryDate ? formData.expiryDate.toISOString() : null,
        isActive: true
      };

      console.log('Sending product data:', productData);

      await ProductService.addProduct(productData);
      
      resetFormData();
      setShowAddModal(false);
      setShowSuccessModal(true); // Show success modal instead of alert
      await loadProducts(); // Refresh products
    } catch (err) {
      console.error('Error adding product:', err);
      Alert.alert('Error', 'Failed to add product: ' + err.message);
    } finally {
      setAddingProduct(false);
    }
  };

  // Edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.cropName,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
      unit: product.unit,
      availableQuantity: product.availableQuantity.toString(),
      minimumOrderQuantity: product.minimumOrderQuantity.toString(),
      location: product.location,
      harvestDate: product.harvestDate ? new Date(product.harvestDate) : new Date(),
      expiryDate: product.expiryDate ? new Date(product.expiryDate) : new Date()
    });
    setShowEditModal(true);
  };

  // Update product
  const handleUpdateProduct = async () => {
    try {
      setUpdatingProduct(true);
      
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        Alert.alert('Error', 'Product name is required');
        return;
      }
      if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
        Alert.alert('Error', 'Please enter a valid price');
        return;
      }
      if (!formData.availableQuantity || isNaN(parseFloat(formData.availableQuantity)) || parseFloat(formData.availableQuantity) <= 0) {
        Alert.alert('Error', 'Please enter a valid available quantity');
        return;
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        category: formData.category,
        price: parseFloat(formData.price),
        unit: formData.unit,
        availableQuantity: parseFloat(formData.availableQuantity),
        minimumOrderQuantity: parseFloat(formData.minimumOrderQuantity) || 1,
        // Remove location field for now
        harvestDate: formData.harvestDate ? formData.harvestDate.toISOString() : null,
        expiryDate: formData.expiryDate ? formData.expiryDate.toISOString() : null
      };

      await ProductService.updateProduct(editingProduct.id, productData);
      
      setShowEditModal(false);
      setEditingProduct(null);
      resetFormData();
      await loadProducts(); // Refresh products
      Alert.alert('Success', 'Product updated successfully!');
    } catch (err) {
      console.error('Error updating product:', err);
      Alert.alert('Error', 'Failed to update product: ' + err.message);
    } finally {
      setUpdatingProduct(false);
    }
  };

  // Delete product
  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.cropName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await ProductService.deleteProduct(product.id);
              await loadProducts(); // Refresh products
              Alert.alert('Success', 'Product deleted successfully!');
            } catch (err) {
              console.error('Error deleting product:', err);
              Alert.alert('Error', 'Failed to delete product: ' + err.message);
            }
          }
        }
      ]
    );
  };

  // Toggle product active status
  const handleToggleStatus = async (product) => {
    try {
      const updatedData = { isActive: !product.isActive };
      await ProductService.updateProduct(product.id, updatedData);
      await loadProducts(); // Refresh products
      
      const statusText = product.isActive ? 'deactivated' : 'activated';
      Alert.alert('Success', `Product ${statusText} successfully!`);
    } catch (err) {
      console.error('Error toggling product status:', err);
      Alert.alert('Error', 'Failed to update product status: ' + err.message);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, selectedCategory, sortBy]);

  const statsData = [
    { 
      title: 'Total Products', 
      value: analytics.totalProducts?.toString() || '0', 
      icon: 'Package', 
      color: '#4CAF50', 
      subtitle: 'All listings' 
    },
    { 
      title: 'Active Products', 
      value: analytics.activeProducts?.toString() || '0', 
      icon: 'Eye', 
      color: '#2196F3', 
      subtitle: 'Live on market' 
    },
    { 
      title: 'Total Value', 
      value: `₹${(analytics.totalValue || 0).toLocaleString()}`, 
      icon: 'DollarSign', 
      color: '#FF9800', 
      subtitle: 'Inventory worth' 
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading crop listings...</Text>
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
            <Text style={styles.headerTitle}>Crop Listings</Text>
            <Text style={styles.headerSubtitle}>Manage your products for the marketplace</Text>
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Icon name="Plus" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Statistics */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            {statsData.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                subtitle={stat.subtitle}
              />
            ))}
          </View>
        </View>

        {/* Filters and Search */}
        <View style={styles.filtersSection}>
          <View style={styles.searchContainer}>
            <Icon name="Search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Category:</Text>
              <View style={styles.filterButtons}>
                {categories.slice(0, 4).map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.filterButton,
                      selectedCategory === category.value && styles.filterButtonActive
                    ]}
                    onPress={() => setSelectedCategory(category.value)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      selectedCategory === category.value && styles.filterButtonTextActive
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Products List */}
        <View style={styles.productsSection}>
          <View style={styles.productsSectionHeader}>
            <Text style={styles.sectionTitle}>
              Your Products ({filteredProducts.length})
            </Text>
            {filteredProducts.length > 0 && (
              <TouchableOpacity 
                style={styles.sortButton}
                onPress={() => {
                  const sortOptions = ['name', 'price', 'quantity', 'date'];
                  const currentIndex = sortOptions.indexOf(sortBy);
                  const nextIndex = (currentIndex + 1) % sortOptions.length;
                  setSortBy(sortOptions[nextIndex]);
                }}
              >
                <Icon name="ArrowUpDown" size={16} color="#2196F3" />
                <Text style={styles.sortButtonText}>Sort by {sortBy}</Text>
              </TouchableOpacity>
            )}
          </View>

          {filteredProducts.length > 0 ? (
            <FlatList
              data={filteredProducts}
              renderItem={({ item }) => (
                <ProductCard 
                  product={item} 
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleStatus={handleToggleStatus}
                />
              )}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
              nestedScrollEnabled={true}
            />
          ) : (
            <View style={styles.noProductsContainer}>
              <Icon name="Package" size={64} color="#ccc" />
              <Text style={styles.noProductsText}>No products found</Text>
              <Text style={styles.noProductsSubtext}>
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first product listing to start selling'
                }
              </Text>
              {!searchQuery && selectedCategory === 'all' && (
                <TouchableOpacity 
                  style={styles.addFirstProductButton} 
                  onPress={() => setShowAddModal(true)}
                >
                  <Text style={styles.addFirstProductText}>Add Your First Product</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Product Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Product</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Icon name="X" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="e.g., Fresh Tomatoes, Basmati Rice"
                />
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Category *</Text>
                  <View style={styles.pickerContainer}>
                    {categories.slice(1).map((category) => (
                      <TouchableOpacity
                        key={category.value}
                        style={[
                          styles.pickerOption,
                          formData.category === category.value && styles.pickerOptionSelected
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, category: category.value }))}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          formData.category === category.value && styles.pickerOptionTextSelected
                        ]}>
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Unit *</Text>
                  <View style={styles.pickerContainer}>
                    {units.map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.pickerOption,
                          formData.unit === unit && styles.pickerOptionSelected
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, unit }))}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          formData.unit === unit && styles.pickerOptionTextSelected
                        ]}>
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Price per {formData.unit} (₹) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.price}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                    placeholder="40"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Available Quantity *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.availableQuantity}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, availableQuantity: text }))}
                    placeholder="100"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Minimum Order Quantity</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.minimumOrderQuantity}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, minimumOrderQuantity: text }))}
                  placeholder="5"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="Describe your product quality, farming practices..."
                  multiline={true}
                  numberOfLines={3}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.location}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                  placeholder="District name"
                />
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Harvest Date</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowHarvestDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {formData.harvestDate instanceof Date ? formData.harvestDate.toLocaleDateString() : 'Select date'}
                    </Text>
                    <Icon name="calendar-outline" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowExpiryDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {formData.expiryDate instanceof Date ? formData.expiryDate.toLocaleDateString() : 'Select date'}
                    </Text>
                    <Icon name="calendar-outline" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowAddModal(false)}
                disabled={addingProduct}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, addingProduct && styles.saveButtonDisabled]} 
                onPress={handleAddProduct}
                disabled={addingProduct}
              >
                {addingProduct ? (
                  <View style={styles.buttonLoadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.saveButtonText}>Adding...</Text>
                  </View>
                ) : (
                  <Text style={styles.saveButtonText}>Add Product</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Product</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Icon name="X" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Same form fields as Add Modal */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="e.g., Fresh Tomatoes, Basmati Rice"
                />
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Category *</Text>
                  <View style={styles.pickerContainer}>
                    {categories.slice(1).map((category) => (
                      <TouchableOpacity
                        key={category.value}
                        style={[
                          styles.pickerOption,
                          formData.category === category.value && styles.pickerOptionSelected
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, category: category.value }))}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          formData.category === category.value && styles.pickerOptionTextSelected
                        ]}>
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Unit *</Text>
                  <View style={styles.pickerContainer}>
                    {units.map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.pickerOption,
                          formData.unit === unit && styles.pickerOptionSelected
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, unit }))}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          formData.unit === unit && styles.pickerOptionTextSelected
                        ]}>
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Price per {formData.unit} (₹) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.price}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                    placeholder="40"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Available Quantity *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.availableQuantity}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, availableQuantity: text }))}
                    placeholder="100"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Minimum Order Quantity</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.minimumOrderQuantity}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, minimumOrderQuantity: text }))}
                  placeholder="5"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="Describe your product quality, farming practices..."
                  multiline={true}
                  numberOfLines={3}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.location}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                  placeholder="District name"
                />
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Harvest Date</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowHarvestDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {formData.harvestDate instanceof Date ? formData.harvestDate.toLocaleDateString() : 'Select date'}
                    </Text>
                    <Icon name="calendar-outline" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowExpiryDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {formData.expiryDate instanceof Date ? formData.expiryDate.toLocaleDateString() : 'Select date'}
                    </Text>
                    <Icon name="calendar-outline" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowEditModal(false)}
                disabled={updatingProduct}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, updatingProduct && styles.saveButtonDisabled]} 
                onPress={handleUpdateProduct}
                disabled={updatingProduct}
              >
                {updatingProduct ? (
                  <View style={styles.buttonLoadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.saveButtonText}>Updating...</Text>
                  </View>
                ) : (
                  <Text style={styles.saveButtonText}>Update Product</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Date Pickers */}
      {showHarvestDatePicker && (
        <DateTimePicker
          value={formData.harvestDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowHarvestDatePicker(false)
            if (selectedDate) {
              setFormData(prev => ({ ...prev, harvestDate: selectedDate }))
            }
          }}
        />
      )}

      {showExpiryDatePicker && (
        <DateTimePicker
          value={formData.expiryDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowExpiryDatePicker(false)
            if (selectedDate) {
              setFormData(prev => ({ ...prev, expiryDate: selectedDate }))
            }
          }}
        />
      )}

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContainer}>
            <View style={styles.successIconContainer}>
              <Icon name="CheckCircle" size={64} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Product Added Successfully!</Text>
            <Text style={styles.successMessage}>
              Your product has been added to the marketplace and is now available for customers to purchase.
            </Text>
            <TouchableOpacity 
              style={styles.successButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.successButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#4CAF50',
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
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#FFF9C4',
    marginTop: 5,
    fontStyle: 'italic',
  },

  scrollContainer: {
    flex: 1,
  },

  // Statistics Section
  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statsCard: {
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
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsContent: {
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  statsSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // Filters Section
  filtersSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  filterRow: {
    marginBottom: 10,
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },

  // Products Section
  productsSection: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  productsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  productsList: {
    paddingHorizontal: 20,
  },

  // Product Card Styles
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productHeader: {
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  productName: {
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
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
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
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  productDetails: {
    marginBottom: 16,
  },
  productDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  productDetailText: {
    fontSize: 14,
    color: '#666',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  productTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  productButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  productButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  toggleButton: {
    backgroundColor: '#FFF3E0',
  },
  editButton: {
    backgroundColor: '#E3F2FD',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
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

  // No Products Styles
  noProductsContainer: {
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
  noProductsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  noProductsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  addFirstProductButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  addFirstProductText: {
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
    maxHeight: 500,
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
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  pickerOptionSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  pickerOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
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
  saveButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  dateInput: {
    height: 45,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },

  // Success Modal Styles
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '90%',
    maxWidth: 320,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  successIconContainer: {
    marginBottom: 20,
    backgroundColor: '#E8F5E8',
    borderRadius: 50,
    padding: 15,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  successButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
})

export default CropListings