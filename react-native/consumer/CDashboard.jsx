import React, { useState, useRef, useEffect, useCallback } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native'
import Icon from '../Icon'
import UserService from '../services/UserService'
import ProductService from '../services/ProductService'
import CartService from '../services/CartService'

const { width } = Dimensions.get('window')

const heroSlides = [
  {
    title: "#FASHION DAY",
    subtitle: "80% OFF",
    description: "Discover fashion that suits to your style",
    buttonText: "Check this out",
    image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800",
    alt: "Fashion sale"
  },
  {
    title: "#FRESH HARVEST",
    subtitle: "50% OFF",
    description: "Farm-fresh produce delivered to your doorstep",
    buttonText: "Shop Now",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
    alt: "Fresh produce"
  },
  {
    title: "#ORGANIC DEALS",
    subtitle: "60% OFF",
    description: "Quality organic products at best prices",
    buttonText: "Explore",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
    alt: "Organic products"
  }
];

const HeroSlide = ({ slide, isActive }) => {
  return (
    <View style={styles.heroSlide}>
      <Image 
        source={{ uri: slide.image }} 
        style={styles.heroImage}
        resizeMode="cover"
      />
      <View style={styles.heroOverlay}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{slide.title}</Text>
          <Text style={styles.heroDescription}>{slide.description}</Text>
        </View>
      </View>
    </View>
  )
}

const CategoryCard = ({ category, onPress }) => {
  return (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
      <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
        <Icon name={category.icon} size={28} color={category.color} />
      </View>
      <Text style={styles.categoryName}>{category.name}</Text>
      <Text style={styles.categoryCount}>{category.count} items</Text>
    </TouchableOpacity>
  )
}

const RecentCropCard = ({ crop, onAddToCart, onViewDetails }) => {
  // Ensure all values are safe to render
  const safeCrop = {
    name: String(crop.name || 'Product'),
    vendor: String(crop.vendor || 'Vendor'),
    location: String(crop.location || 'Location'),
    price: Number(crop.price) || 0,
    originalPrice: Number(crop.originalPrice) || 0,
    rating: Number(crop.rating) || 0,
    reviews: Number(crop.reviews) || 0,
    badge: String(crop.badge || 'Fresh'),
    image: String(crop.image || 'https://via.placeholder.com/150'),
  }

  return (
    <View style={styles.cropCard}>
      <View style={styles.cropImageContainer}>
        <Image 
          source={{ uri: safeCrop.image }} 
          style={styles.cropImage}
          resizeMode="cover"
        />
        <View style={styles.cropBadge}>
          <Text style={styles.cropBadgeText}>{safeCrop.badge}</Text>
        </View>
      </View>
      
      <View style={styles.cropInfo}>
        <Text style={styles.cropName}>{safeCrop.name}</Text>
        <Text style={styles.vendorName}>by {safeCrop.vendor}</Text>
        
        <View style={styles.cropLocation}>
          <Icon name="MapPin" size={12} color="#666" />
          <Text style={styles.locationText}>{safeCrop.location}</Text>
        </View>
        
        <View style={styles.cropPricing}>
          <Text style={styles.cropPrice}>₹{safeCrop.price}/kg</Text>
          <Text style={styles.cropOriginalPrice}>₹{safeCrop.originalPrice}</Text>
        </View>
        
        <View style={styles.cropRating}>
          <Icon name="Star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{safeCrop.rating}</Text>
          <Text style={styles.reviewCount}>({safeCrop.reviews})</Text>
        </View>
        
        <View style={styles.cropActions}>
          <TouchableOpacity style={styles.addToCartButton} onPress={() => onAddToCart(crop)}>
            <Icon name="ShoppingCart" size={16} color="white" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewDetailsButton} onPress={() => onViewDetails(crop)}>
            <Icon name="Eye" size={16} color="#2196F3" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const QuickActionCard = ({ action, onPress }) => {
  return (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
        <Icon name={action.icon} size={24} color={action.color} />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{action.title}</Text>
        <Text style={styles.quickActionDesc}>{action.description}</Text>
      </View>
      <Icon name="ChevronRight" size={20} color="#999" />
    </TouchableOpacity>
  )
}

const CDashboard = () => {
  const navigation = useNavigation()
  const [cartItemsCount, setCartItemsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [consumerName, setConsumerName] = useState('Consumer')
  const [recentCrops, setRecentCrops] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [allProducts, setAllProducts] = useState([])

  // Load consumer data
  const loadConsumerData = async () => {
    try {
      // Load current user data
      const currentUser = await UserService.getCurrentUser()
      if (currentUser) {
        const formattedUser = UserService.formatUserData(currentUser)
        setConsumerName(formattedUser.fullName || 'Consumer')
      } else {
        // Try to fetch fresh data from API
        const userData = await UserService.fetchUserProfile()
        if (userData) {
          const formattedUser = UserService.formatUserData(userData)
          setConsumerName(formattedUser.fullName || 'Consumer')
        }
      }
    } catch (error) {
      console.error('Error loading consumer data:', error)
    }
  }

  // Load available products
  const loadProducts = async () => {
    try {
      // Fetch products from vendors for consumer shopping
      const response = await ProductService.getVendorProducts()
      
      if (response.success && response.data) {
        const products = response.data
        
        const formattedCrops = products.map((product, index) => {
          // Safely extract location - handle if it's an object or string
          let locationText = 'India'
          if (typeof product.location === 'string') {
            locationText = product.location
          } else if (product.location && typeof product.location === 'object') {
            // If location is an object, try to extract meaningful text
            locationText = product.location.district || product.location.city || product.location.state || 'India'
          } else if (product.sellerId?.location) {
            const sellerLoc = product.sellerId.location
            if (typeof sellerLoc === 'string') {
              locationText = sellerLoc
            } else if (sellerLoc.district && sellerLoc.state) {
              locationText = `${sellerLoc.district}, ${sellerLoc.state}`
            }
          }

          // Safely extract image URL
          let imageUrl = `https://via.placeholder.com/150x150/${['4CAF50', 'F44336', '9C27B0', 'FF9800'][index % 4]}/FFFFFF?text=${product.name || 'Product'}`
          if (typeof product.imageUrl === 'string') {
            imageUrl = product.imageUrl
          } else if (typeof product.image === 'string') {
            imageUrl = product.image
          } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            imageUrl = product.images[0]
          }

          return {
            id: product.id || product._id || `product_${index}`,
            name: product.name || 'Product',
            vendor: product.sellerId?.name || product.farmerName || product.seller?.name || product.sellerName || 'Local Farmer',
            location: locationText,
            price: product.price || 0,
            originalPrice: product.originalPrice || (product.price ? (product.price * 1.2).toFixed(0) : 0),
            rating: product.rating || (4 + Math.random()).toFixed(1),
            reviews: product.reviews || Math.floor(Math.random() * 200) + 50,
            badge: product.category === 'organic' ? 'Organic' : product.isFresh ? 'Fresh' : 'Premium',
            image: imageUrl,
            unit: product.unit || 'kg',
            quantity: product.quantity || 100,
            category: (product.category || 'vegetables').toLowerCase()
          }
        })
        
        setAllProducts(formattedCrops)
        setRecentCrops(formattedCrops)
        
        // Calculate category counts from products
        const categoryMap = {}
        products.forEach(product => {
          const cat = (product.category || 'others').toLowerCase()
          categoryMap[cat] = (categoryMap[cat] || 0) + 1
        })
        
        const categoriesData = [
          { id: 'all', name: 'All', icon: 'Grid', color: '#2196F3', count: products.length },
          { id: 'vegetables', name: 'Vegetables', icon: 'Leaf', color: '#4CAF50', count: categoryMap.vegetables || categoryMap.vegetable || 0 },
          { id: 'fruits', name: 'Fruits', icon: 'Apple', color: '#F44336', count: categoryMap.fruits || categoryMap.fruit || 0 },
          { id: 'grains', name: 'Grains', icon: 'Wheat', color: '#FF9800', count: categoryMap.grains || categoryMap.grain || 0 },
          { id: 'pulses', name: 'Pulses', icon: 'Gem', color: '#9C27B0', count: categoryMap.pulses || categoryMap.pulse || 0 },
          { id: 'spices', name: 'Spices', icon: 'Sparkles', color: '#E91E63', count: categoryMap.spices || categoryMap.spice || 0 },
        ]
        
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Error loading products:', error)
      
      // Fallback to mock data
      setCategories([
        { id: 'all', name: 'All', icon: 'Grid', color: '#2196F3', count: 0 },
        { id: 'vegetables', name: 'Vegetables', icon: 'Leaf', color: '#4CAF50', count: 0 },
        { id: 'fruits', name: 'Fruits', icon: 'Apple', color: '#F44336', count: 0 },
        { id: 'grains', name: 'Grains', icon: 'Wheat', color: '#FF9800', count: 0 },
        { id: 'pulses', name: 'Pulses', icon: 'Gem', color: '#9C27B0', count: 0 },
        { id: 'spices', name: 'Spices', icon: 'Sparkles', color: '#E91E63', count: 0 },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Filter products by category
  const filterProductsByCategory = (categoryId) => {
    setSelectedCategory(categoryId)
    if (categoryId === 'all') {
      setRecentCrops(allProducts)
    } else {
      const filtered = allProducts.filter(product => product.category === categoryId)
      setRecentCrops(filtered)
    }
  }

  // Load cart count
  const loadCartCount = async () => {
    try {
      const summary = await CartService.getCartSummary()
      if (summary.success) {
        setCartItemsCount(summary.totalItems)
      }
    } catch (error) {
      console.error('Error loading cart count:', error)
    }
  }

  // Load data on mount
  useEffect(() => {
    loadConsumerData()
    loadProducts()
    loadCartCount()
  }, [])

  // Reload cart count when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCartCount()
    }, [])
  )

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([loadConsumerData(), loadProducts(), loadCartCount()])
    setRefreshing(false)
  }

  // Categories data
  const categoriesData = categories.length > 0 ? categories : [
    { name: 'Vegetables', icon: 'Leaf', color: '#4CAF50', count: 45 },
    { name: 'Fruits', icon: 'Apple', color: '#F44336', count: 32 },
    { name: 'Grains', icon: 'Wheat', color: '#FF9800', count: 28 },
    { name: 'Pulses', icon: 'Gem', color: '#9C27B0', count: 18 },
    { name: 'Spices', icon: 'Sparkles', color: '#E91E63', count: 25 },
    { name: 'Dairy', icon: 'Milk', color: '#2196F3', count: 15 },
  ]

  // Recent crops data - now loaded from API
  const recentCropsData = recentCrops.length > 0 ? recentCrops : [
    {
      id: 1,
      name: 'Fresh Potatoes',
      vendor: 'Rajesh Farm',
      location: 'Punjab',
      price: 25,
      originalPrice: 30,
      rating: 4.5,
      reviews: 128,
      badge: 'Fresh',
      image: 'https://via.placeholder.com/150x150/4CAF50/FFFFFF?text=Potato'
    },
    {
      id: 2,
      name: 'Organic Tomatoes',
      vendor: 'Green Valley',
      location: 'Maharashtra',
      price: 35,
      originalPrice: 40,
      rating: 4.7,
      reviews: 95,
      badge: 'Organic',
      image: 'https://via.placeholder.com/150x150/F44336/FFFFFF?text=Tomato'
    },
  ]

  // Quick actions
  const quickActions = [
    {
      title: 'Track Orders',
      description: 'Check your order status',
      icon: 'Package',
      color: '#2196F3'
    },
    {
      title: 'Bulk Orders',
      description: 'Order in large quantities',
      icon: 'Truck',
      color: '#4CAF50'
    },
    {
      title: 'Seasonal Offers',
      description: 'Limited time deals',
      icon: 'Percent',
      color: '#F44336'
    },
    {
      title: 'Quality Assurance',
      description: 'Certified organic produce',
      icon: 'Shield',
      color: '#FF9800'
    }
  ]

  const handleCategoryPress = (category) => {
    Alert.alert('Category', `Opening ${category.name} section...`)
  }

    const handleAddToCart = async (crop) => {
    try {
      // Extract product details from crop
      const product = {
        _id: crop.id,
        id: crop.id,
        name: crop.name,
        price: crop.price,
        unit: crop.unit || 'kg',
        image: crop.image,
        availableQuantity: crop.quantity || 100,
        minimumOrderQuantity: crop.minimumOrderQuantity || 1,
        sellerId: {
          _id: crop.vendorId,
          name: crop.vendor
        }
      }

      const result = await CartService.addToCart(product, 1)
      if (result.success) {
        // Update cart count without showing modal
        await loadCartCount()
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      Alert.alert('Error', 'Failed to add item to cart')
    }
  }

  const handleViewDetails = (crop) => {
    navigation.navigate('CProductDetail', { productId: crop.id })
  }

  const handleQuickAction = (action) => {
    Alert.alert(action.title, action.description)
  }

  const handleSearch = () => {
    Alert.alert('Search', 'Opening search functionality...')
  }

  const handleNotifications = () => {
    Alert.alert('Notifications', 'Opening notifications...')
  }

  const handleCart = () => {
    navigation.navigate('CCart')
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading fresh produce...</Text>
      </View>
    )
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
        {/* Top Row - Welcome & Icons */}
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{consumerName}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton} onPress={handleNotifications}>
              <Icon name="Bell" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleCart}>
              <Icon name="ShoppingCart" size={24} color="white" />
              {cartItemsCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="Search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Groceries, vegetables or fruits"
            placeholderTextColor="#999"
            onFocus={handleSearch}
          />
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryFilterSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilterContainer}
        >
          {categoriesData.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryFilterChip,
                selectedCategory === category.id && styles.categoryFilterChipActive
              ]}
              onPress={() => filterProductsByCategory(category.id)}
            >
              <Icon 
                name={category.icon} 
                size={20} 
                color={selectedCategory === category.id ? 'white' : category.color} 
              />
              <Text style={[
                styles.categoryFilterText,
                selectedCategory === category.id && styles.categoryFilterTextActive
              ]}>
                {category.name}
              </Text>
              {category.count > 0 && (
                <View style={[
                  styles.categoryCountBadge,
                  selectedCategory === category.id && styles.categoryCountBadgeActive
                ]}>
                  <Text style={[
                    styles.categoryCountText,
                    selectedCategory === category.id && styles.categoryCountTextActive
                  ]}>
                    {category.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Section */}
      <View style={styles.productsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Products' : `${categoriesData.find(c => c.id === selectedCategory)?.name || 'Products'}`}
          </Text>
          <Text style={styles.productCount}>{recentCropsData.length} items</Text>
        </View>
        
        <View style={styles.productsGrid}>
          {recentCropsData.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.productCard}
              onPress={() => handleViewDetails(item)}
            >
              <View style={styles.productImageContainer}>
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.favoriteIcon}
                  onPress={(e) => {
                    e.stopPropagation()
                    Alert.alert('Favorite', `Added ${item.name} to favorites`)
                  }}
                >
                  <Icon name="Heart" size={18} color="#666" />
                </TouchableOpacity>
                <View style={styles.productBadge}>
                  <Text style={styles.productBadgeText}>{item.badge}</Text>
                </View>
              </View>
              
              <View style={styles.productDetails}>
                <Text style={styles.productVendor} numberOfLines={1}>{item.vendor}</Text>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                
                <View style={styles.productRating}>
                  <Icon name="Star" size={14} color="#FFD700" />
                  <Text style={styles.productRatingText}>{item.rating}</Text>
                  <Text style={styles.productReviews}>({item.reviews})</Text>
                </View>
                
                <View style={styles.productPriceRow}>
                  <Text style={styles.productPrice}>₹{item.price}/{item.unit}</Text>
                  <TouchableOpacity 
                    style={styles.addToCartIcon}
                    onPress={(e) => {
                      e.stopPropagation()
                      handleAddToCart(item)
                    }}
                  >
                    <Icon name="ShoppingCart" size={18} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        {recentCropsData.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="Package" size={60} color="#CCC" />
            <Text style={styles.emptyStateText}>No products found</Text>
            <Text style={styles.emptyStateSubtext}>Try selecting a different category</Text>
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
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
  },

  // Category Filter
  categoryFilterSection: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  categoryFilterContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  categoryFilterChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  categoryFilterTextActive: {
    color: 'white',
  },
  categoryCountBadge: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  categoryCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  categoryCountTextActive: {
    color: 'white',
  },

  // Products Section
  productsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  productCount: {
    fontSize: 14,
    color: '#666',
  },

  // Products Grid
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 52) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  productBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  productDetails: {
    padding: 12,
  },
  productVendor: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    height: 38,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  productReviews: {
    fontSize: 12,
    color: '#999',
    marginLeft: 2,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  addToCartIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 4,
  },
})

export default CDashboard