import React, { useState, useRef } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  FlatList,
  Alert
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from '../Icon'

const { width } = Dimensions.get('window')

const heroSlides = [
  {
    title: "Empowering Farmers, Enriching Communities",
    description: "Connect directly with farmers, eliminate middlemen, and ensure fair pricing for all. Join the agricultural revolution today.",
    image: "https://i.ibb.co/xtSvh0kv/RESEARCH-1.jpg",
    alt: "Farmers in field"
  },
  {
    title: "Fresh Produce, Fair Prices",
    description: "Get access to farm-fresh produce at transparent prices while supporting local farmers and sustainable agriculture.",
    image: "https://media.istockphoto.com/id/503646746/photo/farmer-spreading-fertilizer-in-the-field-wheat.jpg?s=612x612&w=0&k=20&c=Lgxsjbz0jaYyQrvfzhyAsW2zELtshRP4AtLzkpmcLiE=",
    alt: "Fresh produce at Doorstep"
  },
  {
    title: "Sow with Confidence, Grow with Krishika!",
    description: "Inspiring farmers to plant with assurance and nurture their dreams into reality through the trusted support of Krishika.",
    image: "https://i.ibb.co/1YQX4Yvs/image.png",
    alt: "Your Field Companion"
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
          <TouchableOpacity style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Get Started</Text>
            <Icon name="ArrowRight" size={16} color="white" />
          </TouchableOpacity>
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
  return (
    <View style={styles.cropCard}>
      <View style={styles.cropImageContainer}>
        <Image 
          source={{ uri: crop.image }} 
          style={styles.cropImage}
          resizeMode="cover"
        />
        <View style={styles.cropBadge}>
          <Text style={styles.cropBadgeText}>{crop.badge}</Text>
        </View>
      </View>
      
      <View style={styles.cropInfo}>
        <Text style={styles.cropName}>{crop.name}</Text>
        <Text style={styles.vendorName}>by {crop.vendor}</Text>
        
        <View style={styles.cropLocation}>
          <Icon name="MapPin" size={12} color="#666" />
          <Text style={styles.locationText}>{crop.location}</Text>
        </View>
        
        <View style={styles.cropPricing}>
          <Text style={styles.cropPrice}>₹{crop.price}/kg</Text>
          <Text style={styles.cropOriginalPrice}>₹{crop.originalPrice}</Text>
        </View>
        
        <View style={styles.cropRating}>
          <Icon name="Star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{crop.rating}</Text>
          <Text style={styles.reviewCount}>({crop.reviews})</Text>
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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [cartItemsCount, setCartItemsCount] = useState(0)
  const heroScrollRef = useRef(null)

  // Categories data
  const categories = [
    { name: 'Vegetables', icon: 'Leaf', color: '#4CAF50', count: 45 },
    { name: 'Fruits', icon: 'Apple', color: '#F44336', count: 32 },
    { name: 'Grains', icon: 'Wheat', color: '#FF9800', count: 28 },
    { name: 'Pulses', icon: 'Gem', color: '#9C27B0', count: 18 },
    { name: 'Spices', icon: 'Sparkles', color: '#E91E63', count: 25 },
    { name: 'Dairy', icon: 'Milk', color: '#2196F3', count: 15 },
  ]

  // Recent crops data
  const recentCrops = [
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
    {
      id: 3,
      name: 'Premium Onions',
      vendor: 'Kumar Traders',
      location: 'Rajasthan',
      price: 20,
      originalPrice: 25,
      rating: 4.3,
      reviews: 67,
      badge: 'Premium',
      image: 'https://via.placeholder.com/150x150/9C27B0/FFFFFF?text=Onion'
    },
    {
      id: 4,
      name: 'Fresh Carrots',
      vendor: 'Sunny Farms',
      location: 'Haryana',
      price: 30,
      originalPrice: 35,
      rating: 4.6,
      reviews: 112,
      badge: 'Fresh',
      image: 'https://via.placeholder.com/150x150/FF9800/FFFFFF?text=Carrot'
    }
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

  const handleAddToCart = (crop) => {
    setCartItemsCount(prev => prev + 1)
    Alert.alert('Added to Cart', `${crop.name} has been added to your cart!`)
  }

  const handleViewDetails = (crop) => {
    Alert.alert('Product Details', `Viewing details for ${crop.name}...`)
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
    Alert.alert('Cart', `You have ${cartItemsCount} items in cart`)
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>Priya Sharma</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton} onPress={handleSearch}>
              <Icon name="Search" size={24} color="white" />
            </TouchableOpacity>
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
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <FlatList
          ref={heroScrollRef}
          data={heroSlides}
          renderItem={({ item, index }) => (
            <HeroSlide slide={item} isActive={index === currentSlide} />
          )}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width)
            setCurrentSlide(slideIndex)
          }}
        />
        
        {/* Hero Indicators */}
        <View style={styles.heroIndicators}>
          {heroSlides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.heroIndicator,
                index === currentSlide && styles.activeHeroIndicator
              ]}
            />
          ))}
        </View>
      </View>

      {/* Categories Section */}
      <View style={styles.categoriesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              category={category}
              onPress={() => handleCategoryPress(category)}
            />
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              action={action}
              onPress={() => handleQuickAction(action)}
            />
          ))}
        </View>
      </View>

      {/* Recent Crops Section */}
      <View style={styles.recentCropsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fresh Arrivals</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={recentCrops}
          renderItem={({ item }) => (
            <RecentCropCard
              crop={item}
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewDetails}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentCropsList}
        />
      </View>

      {/* Featured Section */}
      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Why Choose Krishika?</Text>
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <Icon name="Shield" size={32} color="#4CAF50" />
            <Text style={styles.featureTitle}>Quality Assured</Text>
            <Text style={styles.featureDesc}>100% fresh and organic produce</Text>
          </View>
          <View style={styles.featureCard}>
            <Icon name="Truck" size={32} color="#2196F3" />
            <Text style={styles.featureTitle}>Fast Delivery</Text>
            <Text style={styles.featureDesc}>Direct from farm to your doorstep</Text>
          </View>
          <View style={styles.featureCard}>
            <Icon name="DollarSign" size={32} color="#FF9800" />
            <Text style={styles.featureTitle}>Fair Pricing</Text>
            <Text style={styles.featureDesc}>No middlemen, transparent costs</Text>
          </View>
          <View style={styles.featureCard}>
            <Icon name="Users" size={32} color="#9C27B0" />
            <Text style={styles.featureTitle}>Support Farmers</Text>
            <Text style={styles.featureDesc}>Direct support to local farmers</Text>
          </View>
        </View>
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
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
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

  // Hero Section
  heroSection: {
    height: 280,
    position: 'relative',
  },
  heroSlide: {
    width: width,
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  heroContent: {
    padding: 25,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    lineHeight: 30,
  },
  heroDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    lineHeight: 22,
  },
  heroButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
  heroIndicators: {
    position: 'absolute',
    bottom: 15,
    left: 25,
    flexDirection: 'row',
    gap: 8,
  },
  heroIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeHeroIndicator: {
    backgroundColor: 'white',
  },

  // Sections
  categoriesSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  recentCropsSection: {
    paddingTop: 30,
  },
  featuredSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
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
  seeAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },

  // Categories
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: (width - 55) / 2,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
    color: '#666',
  },

  // Quick Actions
  quickActionsContainer: {
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  quickActionDesc: {
    fontSize: 14,
    color: '#666',
  },

  // Recent Crops
  recentCropsList: {
    paddingLeft: 20,
    gap: 15,
  },
  cropCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    width: 280,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cropImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  cropImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
  },
  cropBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cropBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cropLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  cropPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cropPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
  },
  cropOriginalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  cropRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  cropActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 6,
  },
  viewDetailsButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 10,
  },

  // Features
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginTop: 20,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: (width - 55) / 2,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
})

export default CDashboard