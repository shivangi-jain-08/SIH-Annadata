import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from '../Icon';
import ProductService from '../services/ProductService';
import CartService from '../services/CartService';

const { width, height } = Dimensions.get('window');

const CProductDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = route.params || {};
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadProductDetails();
  }, [productId]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      // Fetch vendor products (consumers view vendor products, not farmer products)
      const response = await ProductService.getVendorProducts();
      
      if (response.success && response.data) {
        const foundProduct = response.data.find(p => p._id === productId || p.id === productId);
        if (foundProduct) {
          setProduct(foundProduct);
          console.log('Product loaded:', foundProduct);
        } else {
          Alert.alert('Error', 'Product not found');
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      const result = await CartService.addToCart(product, quantity);
      if (result.success) {
        // Navigate to cart immediately without showing modal
        navigation.navigate('CCart');
      } else {
        Alert.alert('Error', 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    // Add to cart first, then navigate to cart
    try {
      const result = await CartService.addToCart(product, quantity);
      if (result.success) {
        navigation.navigate('CCart');
      } else {
        Alert.alert('Error', 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to process request');
    }
  };

  const incrementQuantity = () => {
    const maxQuantity = product?.availableQuantity || 100;
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > (product?.minimumOrderQuantity || 1)) {
      setQuantity(quantity - 1);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert(
      isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
      isFavorite 
        ? `${product?.name} removed from your favorites`
        : `${product?.name} added to your favorites`
    );
  };

  const handleShare = () => {
    Alert.alert('Share', `Share ${product?.name} with friends`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="AlertCircle" size={60} color="#999" />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Safe extraction of data
  const productName = String(product.name || 'Product');
  const productPrice = Number(product.price) || 0;
  const productUnit = String(product.unit || 'kg');
  const availableQty = Number(product.availableQuantity) || 0;
  const minOrderQty = Number(product.minimumOrderQuantity) || 1;
  const description = String(product.description || 'No description available');
  const category = String(product.category || 'General');
  const quality = String(product.quality || 'Standard');
  
  // Extract farmer/seller info
  const seller = product.sellerId || {};
  const sellerName = String(seller.name || 'Vendor');
  const sellerLocation = seller.location || {};
  
  // Format location
  let locationText = 'Location not available';
  if (seller.address && typeof seller.address === 'string') {
    const parts = seller.address.split(',').map(s => s.trim());
    locationText = parts.slice(-3, -1).join(', ') || parts.join(', ');
  } else if (typeof sellerLocation === 'object' && !sellerLocation.coordinates) {
    if (sellerLocation.district && sellerLocation.state) {
      locationText = `${sellerLocation.district}, ${sellerLocation.state}`;
    } else if (sellerLocation.state) {
      locationText = sellerLocation.state;
    }
  }

  // Handle images
  const images = [];
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    images.push(...product.images.filter(img => typeof img === 'string'));
  }
  if (product.imageUrl && typeof product.imageUrl === 'string') {
    images.push(product.imageUrl);
  }
  if (product.image && typeof product.image === 'string') {
    images.push(product.image);
  }
  
  // Fallback placeholder
  if (images.length === 0) {
    images.push(`https://via.placeholder.com/400x400/4CAF50/FFFFFF?text=${productName.substring(0, 1)}`);
  }

  const currentImage = images[selectedImage] || images[0];

  // Calculate ratings (mock for now)
  const rating = 4.9;
  const reviewCount = 2356;
  const soldCount = 2900;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="ChevronLeft" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={toggleFavorite}>
          <Icon name="Heart" size={24} color={isFavorite ? "#F44336" : "#333"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <Icon name="Share2" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => Alert.alert('Cart', 'View cart')}
        >
          <Icon name="ShoppingCart" size={24} color="#333" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>1</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={styles.imageSection}>
          <Image 
            source={{ uri: currentImage }} 
            style={styles.mainImage}
            resizeMode="cover"
          />
          
          {/* Image Thumbnails */}
          {images.length > 1 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailContainer}
            >
              {images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(index)}
                  style={[
                    styles.thumbnail,
                    selectedImage === index && styles.selectedThumbnail
                  ]}
                >
                  <Image 
                    source={{ uri: img }} 
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          {/* Seller */}
          <View style={styles.sellerInfo}>
            <Icon name="Store" size={16} color="#666" />
            <Text style={styles.sellerName}>{sellerName}</Text>
          </View>

          {/* Product Name */}
          <Text style={styles.productName}>{productName}</Text>

          {/* Rating & Reviews */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Icon name="Star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{rating} Ratings</Text>
            </View>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.reviewText}>{reviewCount.toLocaleString()}+ Reviews</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.soldText}>{soldCount.toLocaleString()} + Sold</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity style={styles.activeTab}>
              <Text style={styles.activeTabText}>About Item</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabText}>Reviews</Text>
            </TouchableOpacity>
          </View>

          {/* Product Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Brand:</Text>
              <Text style={styles.detailValue}>{sellerName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Color:</Text>
              <Text style={styles.detailValue}>{quality}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>{category}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>{locationText}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Available:</Text>
              <Text style={styles.detailValue}>{availableQty} {productUnit}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Min Order:</Text>
              <Text style={styles.detailValue}>{minOrderQty} {productUnit}</Text>
            </View>
          </View>

          {/* Description */}
          {description && description !== 'No description available' && (
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.priceValue}>₹{(productPrice * quantity).toFixed(2)}</Text>
        </View>
        
        <View style={styles.quantityControl}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={decrementQuantity}
          >
            <Icon name="Minus" size={16} color="white" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={incrementQuantity}
          >
            <Icon name="Plus" size={16} color="white" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Icon name="ShoppingCart" size={20} color="white" />
          <Text style={styles.addToCartButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    color: '#999',
    marginTop: 10,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
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

  // Images
  scrollView: {
    flex: 1,
  },
  imageSection: {
    backgroundColor: '#F5F5F5',
  },
  mainImage: {
    width: width,
    height: width * 1.2,
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderColor: '#2196F3',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },

  // Info Section
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sellerName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  productName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  separator: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
  },
  soldText: {
    fontSize: 14,
    color: '#666',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 16,
  },
  activeTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#4CAF50',
  },
  activeTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tabText: {
    fontSize: 15,
    color: '#999',
  },

  // Details
  detailsSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
  },
  detailValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },

  // Description
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },

  // Bottom Bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  buyButton: {
    backgroundColor: '#1a2332',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addToCartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default CProductDetail;
