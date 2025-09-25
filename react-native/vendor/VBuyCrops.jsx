import React, { useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  TextInput,
  Dimensions,
  Alert
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from '../Icon'

const { width } = Dimensions.get('window')

const CategoryCard = ({ category, isSelected, onPress }) => {
  return (
    <TouchableOpacity 
      style={[styles.categoryCard, isSelected && styles.selectedCategoryCard]} 
      onPress={onPress}
    >
      <Icon 
        name={category.icon} 
        size={20} 
        color={isSelected ? 'white' : category.color} 
      />
      <Text style={[styles.categoryText, isSelected && styles.selectedCategoryText]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  )
}

const FilterButton = ({ title, isSelected, onPress }) => {
  return (
    <TouchableOpacity 
      style={[styles.filterButton, isSelected && styles.selectedFilterButton]} 
      onPress={onPress}
    >
      <Text style={[styles.filterText, isSelected && styles.selectedFilterText]}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}

const CropCard = ({ crop, onAddToCart, onRemoveFromCart }) => {
  return (
    <View style={styles.cropCard}>
      <View style={styles.cropImagePlaceholder}>
        <Icon name="Wheat" size={32} color="#4CAF50" />
      </View>
      
      <View style={styles.cropInfo}>
        <Text style={styles.cropName}>{crop.name}</Text>
        <Text style={styles.farmerName}>by {crop.farmer}</Text>
        
        <View style={styles.cropDetails}>
          <View style={styles.locationContainer}>
            <Icon name="MapPin" size={12} color="#666" />
            <Text style={styles.locationText}>{crop.location}</Text>
          </View>
          <View style={styles.qualityBadge}>
            <Text style={styles.qualityText}>{crop.quality}</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{crop.price}/kg</Text>
          <Text style={styles.availableQuantity}>{crop.available} kg available</Text>
        </View>

        <View style={styles.cartControls}>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={() => onRemoveFromCart(crop.id)}
              disabled={crop.cartQuantity === 0}
            >
              <Icon name="Minus" size={16} color={crop.cartQuantity === 0 ? '#CCC' : '#F44336'} />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{crop.cartQuantity || 0}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={() => onAddToCart(crop.id)}
            >
              <Icon name="Plus" size={16} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.addToCartButton}>
            <Icon name="ShoppingCart" size={16} color="#FF9800" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const VBuyCrops = () => {
  const navigation = useNavigation()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedSort, setSelectedSort] = useState('name')
  const [searchText, setSearchText] = useState('')
  const [cartItemsCount, setCartItemsCount] = useState(0)
  const [crops, setCrops] = useState([
    {
      id: 1,
      name: 'Premium Wheat',
      farmer: 'Rajesh Kumar',
      location: 'Punjab',
      quality: 'Organic',
      price: 35,
      available: 500,
      category: 'grains',
      cartQuantity: 0
    },
    {
      id: 2,
      name: 'Basmati Rice',
      farmer: 'Suresh Patel',
      location: 'Haryana',
      quality: 'Grade A',
      price: 45,
      available: 300,
      category: 'grains',
      cartQuantity: 0
    },
    {
      id: 3,
      name: 'Fresh Tomatoes',
      farmer: 'Priya Sharma',
      location: 'Maharashtra',
      quality: 'Organic',
      price: 25,
      available: 150,
      category: 'vegetables',
      cartQuantity: 0
    },
    {
      id: 4,
      name: 'Red Onions',
      farmer: 'Vikram Singh',
      location: 'Rajasthan',
      quality: 'Grade A',
      price: 20,
      available: 400,
      category: 'vegetables',
      cartQuantity: 0
    },
    {
      id: 5,
      name: 'Fresh Apples',
      farmer: 'Amit Gupta',
      location: 'Himachal Pradesh',
      quality: 'Premium',
      price: 80,
      available: 200,
      category: 'fruits',
      cartQuantity: 0
    },
    {
      id: 6,
      name: 'Cotton',
      farmer: 'Ramesh Jain',
      location: 'Gujarat',
      quality: 'Grade B',
      price: 55,
      available: 350,
      category: 'cash_crops',
      cartQuantity: 0
    }
  ])

  const categories = [
    { name: 'All', value: 'all', icon: 'Grid3x3', color: '#666' },
    { name: 'Grains', value: 'grains', icon: 'Wheat', color: '#FF9800' },
    { name: 'Vegetables', value: 'vegetables', icon: 'Leaf', color: '#4CAF50' },
    { name: 'Fruits', value: 'fruits', icon: 'Apple', color: '#F44336' },
    { name: 'Cash Crops', value: 'cash_crops', icon: 'Trees', color: '#9C27B0' }
  ]

  const filterOptions = [
    { name: 'All', value: 'all' },
    { name: 'Organic', value: 'organic' },
    { name: 'Grade A', value: 'grade_a' },
    { name: 'Premium', value: 'premium' }
  ]

  const sortOptions = [
    { name: 'Name', value: 'name' },
    { name: 'Price: Low to High', value: 'price_asc' },
    { name: 'Price: High to Low', value: 'price_desc' },
    { name: 'Availability', value: 'available' }
  ]

  const handleAddToCart = (cropId) => {
    setCrops(prevCrops => 
      prevCrops.map(crop => {
        if (crop.id === cropId) {
          const newQuantity = (crop.cartQuantity || 0) + 1
          if (newQuantity === 1) {
            setCartItemsCount(prev => prev + 1)
          }
          return { ...crop, cartQuantity: newQuantity }
        }
        return crop
      })
    )
  }

  const handleRemoveFromCart = (cropId) => {
    setCrops(prevCrops => 
      prevCrops.map(crop => {
        if (crop.id === cropId && crop.cartQuantity > 0) {
          const newQuantity = crop.cartQuantity - 1
          if (newQuantity === 0) {
            setCartItemsCount(prev => prev - 1)
          }
          return { ...crop, cartQuantity: newQuantity }
        }
        return crop
      })
    )
  }

  const handleGoToCart = () => {
    if (cartItemsCount === 0) {
      Alert.alert('Empty Cart', 'Please add items to cart before proceeding')
      return
    }
    Alert.alert('Cart', `Going to cart with ${cartItemsCount} items`)
  }

  const getFilteredCrops = () => {
    let filteredCrops = crops

    // Filter by category
    if (selectedCategory !== 'all') {
      filteredCrops = filteredCrops.filter(crop => crop.category === selectedCategory)
    }

    // Filter by quality
    if (selectedFilter !== 'all') {
      const filterMap = {
        'organic': 'Organic',
        'grade_a': 'Grade A',
        'premium': 'Premium'
      }
      filteredCrops = filteredCrops.filter(crop => 
        crop.quality === filterMap[selectedFilter]
      )
    }

    // Filter by search text
    if (searchText.trim()) {
      filteredCrops = filteredCrops.filter(crop => 
        crop.name.toLowerCase().includes(searchText.toLowerCase()) ||
        crop.farmer.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    // Sort crops
    filteredCrops.sort((a, b) => {
      switch (selectedSort) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price_asc':
          return a.price - b.price
        case 'price_desc':
          return b.price - a.price
        case 'available':
          return b.available - a.available
        default:
          return 0
      }
    })

    return filteredCrops
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
            <Text style={styles.headerTitle}>Buy Crops</Text>
            <Text style={styles.headerSubtitle}>Source directly from farmers</Text>
          </View>
          <TouchableOpacity style={styles.cartButton} onPress={handleGoToCart}>
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
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Icon name="Search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crops or farmers..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icon name="X" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <CategoryCard
                key={category.value}
                category={category}
                isSelected={selectedCategory === category.value}
                onPress={() => setSelectedCategory(category.value)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Filters and Sorting */}
      <View style={styles.filtersSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersContainer}>
            <Text style={styles.filterLabel}>Filter:</Text>
            {filterOptions.map((filter) => (
              <FilterButton
                key={filter.value}
                title={filter.name}
                isSelected={selectedFilter === filter.value}
                onPress={() => setSelectedFilter(filter.value)}
              />
            ))}
            
            <View style={styles.sortContainer}>
              <Text style={styles.filterLabel}>Sort:</Text>
              <TouchableOpacity 
                style={styles.sortButton}
                onPress={() => {
                  // Cycle through sort options
                  const currentIndex = sortOptions.findIndex(opt => opt.value === selectedSort)
                  const nextIndex = (currentIndex + 1) % sortOptions.length
                  setSelectedSort(sortOptions[nextIndex].value)
                }}
              >
                <Text style={styles.sortText}>
                  {sortOptions.find(opt => opt.value === selectedSort)?.name}
                </Text>
                <Icon name="ChevronDown" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Crops List */}
      <FlatList
        data={getFilteredCrops()}
        renderItem={({ item }) => (
          <CropCard
            crop={item}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.cropsList}
        showsVerticalScrollIndicator={false}
      />

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {getFilteredCrops().length} crops found
        </Text>
      </View>
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
    backgroundColor: '#4CAF50',
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
  cartButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    marginTop: 2,
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

  // Search Section
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    marginRight: 10,
  },

  // Categories Section
  categoriesSection: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategoryCard: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  selectedCategoryText: {
    color: 'white',
  },

  // Filters Section
  filtersSection: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedFilterButton: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  selectedFilterText: {
    color: 'white',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 20,
  },
  sortButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sortText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginRight: 6,
  },

  // Crops List
  cropsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cropCard: {
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
  cropImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
  farmerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cropDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  qualityBadge: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  qualityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4CAF50',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  availableQuantity: {
    fontSize: 12,
    color: '#666',
  },
  cartControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 8,
  },

  // Results Info
  resultsInfo: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
})

export default VBuyCrops