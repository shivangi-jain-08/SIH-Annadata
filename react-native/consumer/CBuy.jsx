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
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import Icon from '../Icon'
import ProductService from '../services/ProductService'
import CartService from '../services/CartService'

const { width } = Dimensions.get('window')

const FilterButton = ({ title, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.filterButton, isActive && styles.activeFilterButton]}
    onPress={onPress}
  >
    <Text style={[styles.filterButtonText, isActive && styles.activeFilterButtonText]}>
      {title}
    </Text>
  </TouchableOpacity>
)

const SortButton = ({ title, isActive, onPress, icon }) => (
  <TouchableOpacity
    style={[styles.sortButton, isActive && styles.activeSortButton]}
    onPress={onPress}
  >
    <Icon name={icon} size={16} color={isActive ? '#2196F3' : '#666'} />
    <Text style={[styles.sortButtonText, isActive && styles.activeSortButtonText]}>
      {title}
    </Text>
  </TouchableOpacity>
)

const VendorCard = ({ vendor, onPress, onViewProducts }) => (
  <TouchableOpacity style={styles.vendorCard} onPress={onPress}>
    <View style={styles.vendorHeader}>
      <Image source={{ uri: vendor.image }} style={styles.vendorImage} />
      <View style={styles.vendorInfo}>
        <Text style={styles.vendorName}>{vendor.name}</Text>
        <View style={styles.vendorLocation}>
          <Icon name="MapPin" size={14} color="#666" />
          <Text style={styles.locationText}>{vendor.location} • {vendor.distance}</Text>
        </View>
        <View style={styles.vendorRating}>
          <Icon name="Star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{vendor.rating}</Text>
          <Text style={styles.reviewCount}>({vendor.reviews} reviews)</Text>
        </View>
      </View>
      <View style={styles.vendorBadges}>
        {vendor.verified && (
          <View style={styles.verifiedBadge}>
            <Icon name="CheckCircle" size={12} color="#4CAF50" />
            <Text style={styles.badgeText}>Verified</Text>
          </View>
        )}
        {vendor.organic && (
          <View style={styles.organicBadge}>
            <Text style={styles.badgeText}>Organic</Text>
          </View>
        )}
      </View>
    </View>
    
    <View style={styles.vendorStats}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{vendor.totalProducts}</Text>
        <Text style={styles.statLabel}>Products</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{vendor.responseTime}</Text>
        <Text style={styles.statLabel}>Response</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{vendor.successRate}%</Text>
        <Text style={styles.statLabel}>Success Rate</Text>
      </View>
    </View>

    <TouchableOpacity 
      style={styles.viewProductsButton} 
      onPress={() => onViewProducts(vendor)}
    >
      <Text style={styles.viewProductsText}>View Products ({vendor.totalProducts})</Text>
      <Icon name="ArrowRight" size={16} color="#2196F3" />
    </TouchableOpacity>
  </TouchableOpacity>
)

const ProductCard = ({ product, onAddToCart, onViewDetails }) => (
  <View style={styles.productCard}>
    <View style={styles.productImageContainer}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      <View style={styles.productBadges}>
        {product.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.badgeText}>New</Text>
          </View>
        )}
        {product.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.badgeText}>{product.discount}% OFF</Text>
          </View>
        )}
      </View>
      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={() => Alert.alert('Favorite', `Added ${product.name} to favorites`)}
      >
        <Icon name="Heart" size={16} color="#F44336" />
      </TouchableOpacity>
    </View>

    <View style={styles.productInfo}>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.vendorName}>by {product.vendorName}</Text>
      
      <View style={styles.productLocation}>
        <Icon name="MapPin" size={12} color="#666" />
        <Text style={styles.locationText}>{product.location}</Text>
        <Text style={styles.addedDate}>• Added {product.daysAgo} days ago</Text>
      </View>
      
      <View style={styles.productRating}>
        <Icon name="Star" size={12} color="#FFD700" />
        <Text style={styles.ratingText}>{product.vendorRating}</Text>
        <Text style={styles.stockText}>• {product.stock} kg available</Text>
      </View>
      
      <View style={styles.productPricing}>
        <Text style={styles.productPrice}>₹{product.price}/kg</Text>
        {product.originalPrice && (
          <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
        )}
        <Text style={styles.priceUnit}>Min order: {product.minOrder}kg</Text>
      </View>
      
      <View style={styles.productActions}>
        <TouchableOpacity 
          style={styles.addToCartButton} 
          onPress={() => onAddToCart(product)}
        >
          <Icon name="ShoppingCart" size={14} color="white" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.viewDetailsButton} 
          onPress={() => onViewDetails(product)}
        >
          <Icon name="Eye" size={14} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.contactButton} 
          onPress={() => Alert.alert('Contact', `Contacting ${product.vendorName}`)}
        >
          <Icon name="Phone" size={14} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
)

const CBuy = () => {
  const navigation = useNavigation()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [activeSort, setActiveSort] = useState('Latest')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('products') // 'products' or 'vendors'
  const [cartItems, setCartItems] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [vendors, setVendors] = useState([])

  // Load products on component mount
  useEffect(() => {
    loadProducts()
    loadCartCount()
  }, [])

  // Reload cart count when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCartCount()
    }, [])
  )

  const loadProducts = async () => {
    try {
      setLoading(true)
      const result = await ProductService.getVendorProducts()
      
      if (result.success && result.data) {
        setProducts(result.data)
        
        // Extract unique vendors from products
        const vendorsMap = new Map()
        result.data.forEach(product => {
          if (product.sellerId && typeof product.sellerId === 'object') {
            const vendorId = product.sellerId._id
            if (!vendorsMap.has(vendorId)) {
              vendorsMap.set(vendorId, {
                id: vendorId,
                name: product.sellerId.name || 'Unknown Vendor',
                location: extractLocation(product.sellerId),
                distance: calculateDistance(product.sellerId.location),
                rating: 4.5, // Mock rating for now
                reviews: Math.floor(Math.random() * 100) + 20,
                image: `https://via.placeholder.com/80x80/4CAF50/FFFFFF?text=${(product.sellerId.name || 'V').charAt(0)}`,
                verified: true,
                organic: product.quality === 'Organic',
                totalProducts: 0,
                responseTime: '< 2h',
                successRate: 95 + Math.floor(Math.random() * 5),
                products: []
              })
            }
            const vendor = vendorsMap.get(vendorId)
            vendor.totalProducts++
            vendor.products.push(product)
          }
        })
        
        setVendors(Array.from(vendorsMap.values()))
        console.log('CBuy: Loaded products:', result.data.length, 'Vendors:', vendorsMap.size)
      } else {
        console.error('Failed to load products:', result.message)
      }
    } catch (error) {
      console.error('Error loading products:', error)
      Alert.alert('Error', 'Failed to load products. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const extractLocation = (seller) => {
    if (!seller) return 'Location not available'
    
    if (seller.address) {
      const parts = seller.address.split(',').map(p => p.trim())
      if (parts.length >= 2) {
        return parts.slice(-3, -1).join(', ')
      }
      return parts[0]
    }
    
    if (seller.location) {
      const loc = seller.location
      if (loc.district && loc.state) {
        return `${loc.district}, ${loc.state}`
      }
      if (loc.state) return loc.state
    }
    
    return 'Location not available'
  }

  const calculateDistance = (location) => {
    // Mock distance calculation
    // In real app, use geolocation library
    const distance = (Math.random() * 10 + 1).toFixed(1)
    return `${distance} km`
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadProducts()
  }

  const loadCartCount = async () => {
    try {
      const items = await CartService.getCartItems()
      setCartItems(items)
    } catch (error) {
      console.error('Error loading cart count:', error)
    }
  }

  // Sample vendor data (keeping as fallback)
  const nearbyVendors = vendors.length > 0 ? vendors : [
    {
      id: 1,
      name: 'Green Valley Farms',
      location: 'Punjabi Bagh, Delhi',
      distance: '2.3 km',
      rating: 4.8,
      reviews: 156,
      image: 'https://via.placeholder.com/80x80/4CAF50/FFFFFF?text=GV',
      verified: true,
      organic: true,
      totalProducts: 24,
      responseTime: '< 2h',
      successRate: 98
    },
    {
      id: 2,
      name: 'Organic Harvest Co.',
      location: 'Lajpat Nagar, Delhi',
      distance: '3.1 km',
      rating: 4.6,
      reviews: 89,
      image: 'https://via.placeholder.com/80x80/FF9800/FFFFFF?text=OH',
      verified: true,
      organic: true,
      totalProducts: 18,
      responseTime: '< 4h',
      successRate: 95
    },
    {
      id: 3,
      name: 'Fresh Farm Direct',
      location: 'Karol Bagh, Delhi',
      distance: '4.5 km',
      rating: 4.4,
      reviews: 67,
      image: 'https://via.placeholder.com/80x80/2196F3/FFFFFF?text=FF',
      verified: false,
      organic: false,
      totalProducts: 32,
      responseTime: '< 6h',
      successRate: 92
    }
  ]

  const filters = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Organic Only']
  const sortOptions = [
    { key: 'Latest', title: 'Latest Added', icon: 'Clock' },
    { key: 'Price', title: 'Price Low-High', icon: 'ArrowUp' },
    { key: 'PriceDesc', title: 'Price High-Low', icon: 'ArrowDown' },
    { key: 'Name', title: 'Name A-Z', icon: 'FileText' }
  ]

  const filteredProducts = products.filter(product => {
    // Filter by category
    let categoryMatch = true
    if (activeFilter !== 'All') {
      if (activeFilter === 'Organic Only') {
        categoryMatch = product.quality === 'Organic' || product.name?.toLowerCase().includes('organic')
      } else {
        categoryMatch = product.category?.toLowerCase() === activeFilter.toLowerCase()
      }
    }
    
    // Filter by search query
    const searchMatch = searchQuery.trim() === '' || 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sellerId?.name && product.sellerId.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return categoryMatch && searchMatch
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (activeSort) {
      case 'Latest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      case 'Price':
        return (a.price || 0) - (b.price || 0)
      case 'PriceDesc':
        return (b.price || 0) - (a.price || 0)
      case 'Name':
        return (a.name || '').localeCompare(b.name || '')
      default:
        return 0
    }
  })

  // Transform product for display
  const transformProduct = (product) => {
    const daysAgo = product.createdAt ? 
      Math.floor((Date.now() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24)) : 0
    
    return {
      id: product._id,
      name: product.name,
      vendorName: product.sellerId?.name || 'Unknown Vendor',
      vendorRating: 4.5, // Mock rating
      location: extractLocation(product.sellerId),
      price: product.price,
      originalPrice: null,
      discount: null,
      stock: product.availableQuantity,
      minOrder: product.minimumOrderQuantity || 1,
      daysAgo,
      isNew: daysAgo <= 7,
      image: getProductImage(product),
      category: product.category,
      quality: product.quality,
      unit: product.unit,
      description: product.description,
      sellerId: product.sellerId
    }
  }

  const getProductImage = (product) => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0]
    }
    if (product.image) return product.image
    if (product.imageUrl) return product.imageUrl
    
    // Category-based placeholder colors
    const colors = {
      vegetables: '4CAF50',
      fruits: 'F44336',
      grains: 'FF9800',
      pulses: '9C27B0',
      spices: 'FFC107'
    }
    const color = colors[product.category?.toLowerCase()] || '2196F3'
    return `https://via.placeholder.com/150x120/${color}/FFFFFF?text=${product.name?.charAt(0) || 'P'}`
  }

  const handleAddToCart = async (product) => {
    try {
      // Prepare product data for cart
      const productData = {
        _id: product.id,
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit || 'kg',
        image: product.image,
        availableQuantity: product.stock || 100,
        minimumOrderQuantity: product.minOrder || 1,
        sellerId: product.sellerId
      }

      const result = await CartService.addToCart(productData, 1)
      if (result.success) {
        // Update local cart count
        setCartItems(result.cart)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      Alert.alert('Error', 'Failed to add item to cart')
    }
  }

  const handleViewDetails = (product) => {
    navigation.navigate('CProductDetail', { productId: product.id })
  }

  const handleCart = () => {
    navigation.navigate('CCart')
  }

  const handleFindNearbyVendors = () => {
    navigation.navigate('CVendorMap', { vendors: nearbyVendors })
  }

  const handleVendorPress = (vendor) => {
    Alert.alert('Vendor Profile', `Opening profile for ${vendor.name}`)
  }

  const handleViewProducts = (vendor) => {
    // Filter products by this vendor and switch to products view
    setSearchQuery(vendor.name)
    setViewMode('products')
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="ArrowLeft" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Marketplace</Text>
          <Text style={styles.headerSubtitle}>{sortedProducts.length} products available</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={handleCart}
        >
          <Icon name="ShoppingCart" size={24} color="white" />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="Search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products or vendors..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="X" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Find Nearby Vendors Button */}
      <View style={styles.nearbyVendorsContainer}>
        <TouchableOpacity 
          style={styles.nearbyVendorsButton}
          onPress={handleFindNearbyVendors}
        >
          <Icon name="MapPin" size={20} color="#2196F3" />
          <Text style={styles.nearbyVendorsText}>Find Nearby Vendors</Text>
          <Icon name="ExternalLink" size={16} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'products' && styles.activeToggleButton]}
            onPress={() => setViewMode('products')}
          >
            <Icon name="Box" size={16} color={viewMode === 'products' ? 'white' : '#666'} />
            <Text style={[styles.toggleText, viewMode === 'products' && styles.activeToggleText]}>
              Products
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'vendors' && styles.activeToggleButton]}
            onPress={() => setViewMode('vendors')}
          >
            <Icon name="Users" size={16} color={viewMode === 'vendors' ? 'white' : '#666'} />
            <Text style={[styles.toggleText, viewMode === 'vendors' && styles.activeToggleText]}>
              Vendors
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Icon name="ChartBar" size={20} color="#2196F3" />
          <Text style={styles.filterToggleText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {filters.map((filter) => (
              <FilterButton
                key={filter}
                title={filter}
                isActive={activeFilter === filter}
                onPress={() => setActiveFilter(filter)}
              />
            ))}
          </ScrollView>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
            {sortOptions.map((sort) => (
              <SortButton
                key={sort.key}
                title={sort.title}
                icon={sort.icon}
                isActive={activeSort === sort.key}
                onPress={() => setActiveSort(sort.key)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2196F3']}
            />
          }
        >
          {viewMode === 'vendors' ? (
            // Vendors View
            <View style={styles.vendorsContainer}>
              <Text style={styles.sectionTitle}>Nearby Vendors ({nearbyVendors.length})</Text>
              {nearbyVendors.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="Users" size={48} color="#CCC" />
                  <Text style={styles.emptyText}>No vendors found</Text>
                  <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
                </View>
              ) : (
                nearbyVendors.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    onPress={() => handleVendorPress(vendor)}
                    onViewProducts={handleViewProducts}
                  />
                ))
              )}
            </View>
          ) : (
            // Products View
            <View style={styles.productsContainer}>
              <Text style={styles.sectionTitle}>
                Available Products ({sortedProducts.length})
              </Text>
              {sortedProducts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="Package" size={48} color="#CCC" />
                  <Text style={styles.emptyText}>No products found</Text>
                  <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
                </View>
              ) : (
                <View style={styles.productsGrid}>
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product._id || product.id}
                      product={transformProduct(product)}
                      onAddToCart={handleAddToCart}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header
  header: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  cartButton: {
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

  // Search
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },

  // Nearby Vendors
  nearbyVendorsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  nearbyVendorsButton: {
    backgroundColor: '#E3F2FD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  nearbyVendorsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginHorizontal: 8,
  },

  // View Mode Toggle
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  activeToggleButton: {
    backgroundColor: '#2196F3',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
  },
  activeToggleText: {
    color: 'white',
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginLeft: 6,
  },

  // Filters
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersScroll: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sortScroll: {
    paddingHorizontal: 20,
  },
  filterButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
  },
  activeFilterButton: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 12,
  },
  activeSortButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  activeSortButtonText: {
    color: '#2196F3',
  },

  // Content
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },

  // Vendors
  vendorsContainer: {
    padding: 20,
  },
  vendorCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  vendorHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  vendorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  vendorLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  vendorRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
  },
  vendorBadges: {
    alignItems: 'flex-end',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  organicBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  vendorStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  viewProductsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    borderRadius: 8,
  },
  viewProductsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginRight: 8,
  },

  // Products
  productsContainer: {
    padding: 20,
  },
  productsGrid: {
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
  },
  productBadges: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
  },
  newBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
  },
  discountBadge: {
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
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
  vendorName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  addedDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  productPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  priceUnit: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginLeft: 4,
  },
  viewDetailsButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  contactButton: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 8,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
  },
})

export default CBuy
