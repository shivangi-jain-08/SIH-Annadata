import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from '../Icon';
import CartService from '../services/CartService';
import PaymentService from '../services/PaymentService';
import PaymentOptionsModal from '../components/PaymentOptionsModal';
import UserService from '../services/UserService';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const AddressModal = ({ visible, onClose, onSave, editingAddress }) => {
  const [addressData, setAddressData] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    coordinates: null
  });
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (editingAddress) {
      setAddressData(editingAddress);
    } else {
      setAddressData({
        label: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        coordinates: null
      });
    }
  }, [editingAddress, visible]);

  const handleUseCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location access to use this feature');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse geocode to get address
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (geocode && geocode.length > 0) {
        const address = geocode[0];
        setAddressData(prev => ({
          ...prev,
          street: `${address.name || ''} ${address.street || ''}`.trim(),
          city: address.city || address.subregion || '',
          state: address.region || '',
          pincode: address.postalCode || '',
          coordinates: [longitude, latitude]
        }));
        Alert.alert('Success', 'Location captured successfully');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSave = () => {
    // Validate
    if (!addressData.label || !addressData.street || !addressData.city || 
        !addressData.state || !addressData.phone) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    if (addressData.pincode && addressData.pincode.length !== 6) {
      Alert.alert('Invalid Pincode', 'Pincode must be 6 digits');
      return;
    }

    if (addressData.phone.length !== 10) {
      Alert.alert('Invalid Phone', 'Phone number must be 10 digits');
      return;
    }

    onSave(addressData);
  };

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
            <Text style={styles.modalTitle}>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="X" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Use Current Location Button */}
            {!editingAddress && (
              <TouchableOpacity
                style={styles.currentLocationButton}
                onPress={handleUseCurrentLocation}
                disabled={loadingLocation}
              >
                {loadingLocation ? (
                  <ActivityIndicator color="#4CAF50" />
                ) : (
                  <>
                    <Icon name="MapPin" size={20} color="#4CAF50" />
                    <Text style={styles.currentLocationText}>Use Current Location</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Label (e.g., Home, Office) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Home"
                value={addressData.label}
                onChangeText={(text) => setAddressData({ ...addressData, label: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Street Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="House/Flat No., Building Name, Street"
                value={addressData.street}
                onChangeText={(text) => setAddressData({ ...addressData, street: text })}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>City *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  value={addressData.city}
                  onChangeText={(text) => setAddressData({ ...addressData, city: text })}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>State *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="State"
                  value={addressData.state}
                  onChangeText={(text) => setAddressData({ ...addressData, state: text })}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Pincode</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123456"
                  value={addressData.pincode}
                  onChangeText={(text) => setAddressData({ ...addressData, pincode: text.replace(/[^0-9]/g, '') })}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Phone *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="9876543210"
                  value={addressData.phone}
                  onChangeText={(text) => setAddressData({ ...addressData, phone: text.replace(/[^0-9]/g, '') })}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>

            {addressData.coordinates && 
             Array.isArray(addressData.coordinates) && 
             addressData.coordinates.length === 2 &&
             typeof addressData.coordinates[0] === 'number' &&
             typeof addressData.coordinates[1] === 'number' && (
              <View style={styles.coordinatesInfo}>
                <Icon name="MapPin" size={16} color="#4CAF50" />
                <Text style={styles.coordinatesText}>
                  Location saved: {addressData.coordinates[1].toFixed(6)}, {addressData.coordinates[0].toFixed(6)}
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const CCart = () => {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Reload cart when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const loadCart = async () => {
    try {
      setLoading(true);
      const items = await CartService.getCartItems();
      setCartItems(items);
      
      // Load user addresses
      await loadUserAddresses();
    } catch (error) {
      console.error('Error loading cart:', error);
      Alert.alert('Error', 'Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const loadUserAddresses = async () => {
    try {
      const response = await UserService.getUserProfile();
      
      if (response.success && response.data) {
        let userAddresses = response.data.addresses || [];
        
        // Migrate old address format to new array format if needed
        if (response.data.address && typeof response.data.address === 'string' && userAddresses.length === 0) {
          // Convert old string address to new format
          const oldAddress = response.data.address;
          const parts = oldAddress.split(', ');
          
          const migratedAddress = {
            id: 'migrated_' + Date.now(),
            label: 'Home',
            street: parts[0] || oldAddress,
            city: parts[1] || '',
            state: parts[2] || '',
            pincode: '',
            phone: response.data.phone?.replace(/^\+91\s*/, '') || '',
            coordinates: response.data.location?.coordinates || null
          };
          
          userAddresses = [migratedAddress];
          
          // Save migrated address to backend
          await UserService.updateUserProfile({
            addresses: userAddresses
          });
        }
        
        // Add IDs to addresses if they don't have them
        const addressesWithIds = userAddresses.map((addr, index) => ({
          ...addr,
          id: addr.id || `addr_${index}`
        }));
        
        setUserAddresses(addressesWithIds);
        
        // Set first address as default if available
        if (addressesWithIds.length > 0) {
          setSelectedAddress(addressesWithIds[0]);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      // Set a default address on error
      const defaultAddress = {
        id: 'default_1',
        label: 'Default Address',
        street: 'Please add your delivery address',
        city: 'City',
        state: 'State',
        pincode: '000000',
        phone: '0000000000',
        coordinates: null
      };
      setUserAddresses([defaultAddress]);
      setSelectedAddress(defaultAddress);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      setUpdating(true);
      const result = await CartService.updateQuantity(productId, newQuantity);
      if (result.success) {
        setCartItems(result.cart);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (productId, productName) => {
    Alert.alert(
      'Remove Item',
      `Remove ${productName} from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              const result = await CartService.removeFromCart(productId);
              if (result.success) {
                setCartItems(result.cart);
              }
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Failed to remove item');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Remove all items from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              const result = await CartService.clearCart();
              if (result.success) {
                setCartItems([]);
              }
            } catch (error) {
              console.error('Error clearing cart:', error);
              Alert.alert('Error', 'Failed to clear cart');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleSaveAddress = async (addressData) => {
    try {
      setShowAddressModal(false);
      setUpdating(true);

      let updatedAddresses;

      if (editingAddress) {
        // Update existing address
        updatedAddresses = userAddresses.map(addr =>
          addr.id === editingAddress.id ? { ...addressData, id: addr.id } : addr
        );
      } else {
        // Add new address
        const newAddress = {
          ...addressData,
          id: `addr_${Date.now()}`
        };
        updatedAddresses = [...userAddresses, newAddress];
        setSelectedAddress(newAddress);
      }

      // Update user profile with new addresses
      const updateResult = await UserService.updateUserProfile({
        addresses: updatedAddresses
      });

      if (updateResult.success) {
        setUserAddresses(updatedAddresses);
        Alert.alert('Success', editingAddress ? 'Address updated successfully' : 'Address added successfully');
      } else {
        throw new Error('Failed to update address');
      }

      setEditingAddress(null);
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              
              const updatedAddresses = userAddresses.filter(addr => addr.id !== addressId);

              const updateResult = await UserService.updateUserProfile({
                addresses: updatedAddresses
              });

              if (updateResult.success) {
                setUserAddresses(updatedAddresses);
                
                // If deleted address was selected, select first available
                if (selectedAddress?.id === addressId) {
                  setSelectedAddress(updatedAddresses[0] || null);
                }
                
                Alert.alert('Success', 'Address deleted successfully');
              }
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to cart before proceeding');
      return;
    }

    if (!selectedAddress) {
      Alert.alert('No Address', 'Please add a delivery address to proceed');
      return;
    }

    // Show payment options modal
    setShowPaymentModal(true);
  };

  const handlePaymentProceed = async (paymentMethod, upiApp) => {
    try {
      setLoading(true);
      setShowPaymentModal(false);

      // Prepare payment data
      const paymentData = {
        items: cartItems.map(item => {
          // Extract seller ID properly - handle nested objects
          let sellerId = null;
          if (item.seller) {
            if (typeof item.seller === 'string') {
              sellerId = item.seller;
            } else if (typeof item.seller === 'object') {
              sellerId = item.seller.id || item.seller._id || item.seller;
            }
          }
          if (!sellerId && item.sellerId) {
            sellerId = typeof item.sellerId === 'object' ? (item.sellerId.id || item.sellerId._id) : item.sellerId;
          }

          console.log(`Item: ${item.name}, Seller ID: ${sellerId}, Type: ${typeof sellerId}`);

          return {
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            farmerId: sellerId,  // Use farmerId for backend compatibility
            sellerId: sellerId,
            seller: item.seller?.name || item.seller || 'Vendor'
          };
        }),
        deliveryAddress: selectedAddress,
        amount: calculateTotal(),
        subtotal: calculateSubtotal(),
        tax: 0, // No tax for now
        deliveryFee: calculateDeliveryFee(),
        paymentMethod: paymentMethod,
        upiApp: upiApp
      };

      console.log('=== Consumer Payment Data ===');
      console.log('Cart Items:', cartItems.length);
      console.log('Delivery Address:', selectedAddress);
      console.log('Amount:', paymentData.amount);
      console.log('Payment Items:', JSON.stringify(paymentData.items, null, 2));
      console.log('============================');

      // Initiate Razorpay payment
      const paymentResult = await PaymentService.initiatePayment(paymentData);

      if (paymentResult.success) {
        // Payment successful - clear cart
        await CartService.clearCart();
        
        const testModeMsg = paymentResult.isTestMode ? '\n\n⚠️ Test Mode: Using sandbox credentials' : '';
        
        Alert.alert(
          'Payment Successful! 🎉',
          `Order ID: ${paymentResult.orderId}\nPayment ID: ${paymentResult.paymentId}\n\nYour order has been placed successfully!${testModeMsg}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to dashboard
                navigation.goBack();
              }
            }
          ]
        );
      } else if (paymentResult.cancelled) {
        // Payment cancelled by user
        Alert.alert('Payment Cancelled', 'You cancelled the payment. Your cart items are still saved.');
      } else {
        // Payment failed
        Alert.alert(
          'Payment Failed',
          paymentResult.message || 'Payment could not be completed. Please try again.',
          [
            { text: 'Retry', onPress: () => handleProceedToPayment() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Error',
        'An error occurred while processing payment. Please try again.',
        [
          { text: 'Retry', onPress: () => handleProceedToPayment() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDeliveryFee = () => {
    // Free delivery above ₹500
    const subtotal = calculateSubtotal();
    return subtotal >= 500 ? 0 : 40;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryFee();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="ChevronLeft" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
        {cartItems.length === 0 && <View style={{ width: 50 }} />}
      </View>

      {cartItems.length === 0 ? (
        // Empty Cart State
        <View style={styles.emptyContainer}>
          <Icon name="ShoppingCart" size={80} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add products to get started</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Cart Items */}
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {cartItems.map((item, index) => (
              <View key={item.productId} style={styles.cartItem}>
                <Image 
                  source={{ uri: item.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                
                <View style={styles.itemDetails}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.sellerName}>{item.seller.name}</Text>
                  <Text style={styles.priceText}>₹{item.price} / {item.unit}</Text>
                  
                  <View style={styles.quantityRow}>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        disabled={updating}
                      >
                        <Icon name="Minus" size={14} color="#666" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        disabled={updating || item.quantity >= item.availableQuantity}
                      >
                        <Icon name="Plus" size={14} color="#666" />
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.itemTotal}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(item.productId, item.name)}
                  disabled={updating}
                >
                  <Icon name="Trash2" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Spacing for bottom bar */}
            <View style={{ height: 200 }} />
          </ScrollView>

          {/* Bottom Summary */}
          <View style={styles.bottomBar}>
            {/* Delivery Address Section */}
            <View style={styles.addressSection}>
              <View style={styles.addressHeader}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <TouchableOpacity
                  style={styles.addAddressButton}
                  onPress={() => {
                    setEditingAddress(null);
                    setShowAddressModal(true);
                  }}
                >
                  <Icon name="Plus" size={16} color="#4CAF50" />
                  <Text style={styles.addAddressText}>Add New</Text>
                </TouchableOpacity>
              </View>

              {/* Address Dropdown */}
              <TouchableOpacity
                style={styles.addressDropdown}
                onPress={() => setShowAddressDropdown(!showAddressDropdown)}
              >
                {selectedAddress ? (
                  <View style={styles.selectedAddressContent}>
                    <Icon name="MapPin" size={20} color="#4CAF50" />
                    <View style={styles.selectedAddressText}>
                      <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
                      <Text style={styles.addressDetails}>
                        {selectedAddress.street}, {selectedAddress.city}
                      </Text>
                      <Text style={styles.addressDetails}>
                        {selectedAddress.state}{selectedAddress.pincode ? ` - ${selectedAddress.pincode}` : ''}
                      </Text>
                      {selectedAddress.coordinates && (
                        <Text style={styles.addressCoordinates}>
                          📍 Location saved
                        </Text>
                      )}
                    </View>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>Select delivery address</Text>
                )}
                <Icon
                  name={showAddressDropdown ? "ChevronUp" : "ChevronDown"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>

              {/* Address List Dropdown */}
              {showAddressDropdown && (
                <View style={styles.addressList}>
                  {userAddresses.map(address => (
                    <View key={address.id} style={styles.addressItem}>
                      <TouchableOpacity
                        style={styles.addressItemContent}
                        onPress={() => {
                          setSelectedAddress(address);
                          setShowAddressDropdown(false);
                        }}
                      >
                        <View style={styles.radioButton}>
                          {selectedAddress?.id === address.id && (
                            <View style={styles.radioButtonSelected} />
                          )}
                        </View>
                        <View style={styles.addressItemText}>
                          <Text style={styles.addressItemLabel}>{address.label}</Text>
                          <Text style={styles.addressItemDetails}>
                            {address.street}, {address.city}, {address.state} - {address.pincode}
                          </Text>
                          <Text style={styles.addressItemPhone}>Phone: {address.phone}</Text>
                        </View>
                      </TouchableOpacity>
                      
                      <View style={styles.addressActions}>
                        <TouchableOpacity
                          style={styles.addressActionButton}
                          onPress={() => handleEditAddress(address)}
                        >
                          <Icon name="Edit" size={16} color="#2196F3" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.addressActionButton}
                          onPress={() => handleDeleteAddress(address.id)}
                        >
                          <Icon name="Trash2" size={16} color="#F44336" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Price Summary */}
            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{calculateSubtotal().toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={[styles.summaryValue, calculateDeliveryFee() === 0 && styles.freeText]}>
                  {calculateDeliveryFee() === 0 ? 'FREE' : `₹${calculateDeliveryFee().toFixed(2)}`}
                </Text>
              </View>
              {calculateSubtotal() < 500 && (
                <Text style={styles.freeDeliveryHint}>
                  Add ₹{(500 - calculateSubtotal()).toFixed(2)} more for free delivery
                </Text>
              )}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{calculateTotal().toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={handleProceedToPayment}
              disabled={updating}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Payment</Text>
              <Icon name="ArrowRight" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Payment Options Modal */}
      <PaymentOptionsModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onProceed={handlePaymentProceed}
        amount={calculateTotal()}
      />

      {/* Address Modal */}
      <AddressModal
        visible={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
        editingAddress={editingAddress}
      />

      {/* Loading overlay */}
      {updating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      )}
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
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  clearText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '500',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // Cart Items
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  addressSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  addAddressText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  addressDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedAddressContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
  },
  selectedAddressText: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  addressCoordinates: {
    fontSize: 11,
    color: '#4CAF50',
    marginTop: 4,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
  },
  addressList: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 10,
    maxHeight: 300,
  },
  addressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  addressItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  addressItemText: {
    flex: 1,
  },
  addressItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressItemDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  addressItemPhone: {
    fontSize: 12,
    color: '#666',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  addressActionButton: {
    padding: 6,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginLeft: 22,
  },
  summarySection: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  freeText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  freeDeliveryHint: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 4,
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },

  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
  },
  coordinatesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 8,
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default CCart;
