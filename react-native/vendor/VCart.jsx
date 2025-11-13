import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from '../Icon';
import UserService from '../services/UserService';
import PaymentService from '../services/PaymentService';
import PaymentOptionsModal from '../components/PaymentOptionsModal';
import LocationService from '../services/LocationService';

const { width } = Dimensions.get('window');

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <View style={styles.cartItem}>
      <View style={styles.itemImagePlaceholder}>
        <Icon name="Wheat" size={32} color="#4CAF50" />
      </View>
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemFarmer}>by {item.farmer}</Text>
        <Text style={styles.itemPrice}>₹{item.price}/{item.unit}</Text>
      </View>

      <View style={styles.itemControls}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onUpdateQuantity(item.id, Math.max(0, item.cartQuantity - 1))}
          >
            <Icon name="Minus" size={16} color="#F44336" />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.cartQuantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onUpdateQuantity(item.id, item.cartQuantity + 1)}
          >
            <Icon name="Plus" size={16} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        <Text style={styles.itemTotal}>₹{(item.price * item.cartQuantity).toFixed(2)}</Text>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemove(item.id)}
        >
          <Icon name="Trash2" size={18} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
      
      // Get current location
      const location = await LocationService.getCurrentLocation();
      
      if (!location) {
        Alert.alert('Error', 'Could not get your current location. Please check your location settings.');
        return;
      }

      // Reverse geocode to get address
      const addressInfo = await UserService.reverseGeocodeLocation(
        location.latitude,
        location.longitude
      );

      // Pre-fill the form with location data
      setAddressData({
        ...addressData,
        street: addressInfo.street || 'Current Location',
        city: addressInfo.city || '',
        state: addressInfo.state || '',
        pincode: addressInfo.pincode || '',
        coordinates: [location.longitude, location.latitude],
        label: addressData.label || 'Current Location'
      });

      Alert.alert(
        'Location Found',
        'Your current location has been added. Please verify the details and add a label.'
      );
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSave = () => {
    // Validate
    if (!addressData.label || !addressData.street || !addressData.city || 
        !addressData.state || !addressData.phone) {
      Alert.alert('Error', 'Please fill all required fields (label, street, city, state, phone)');
      return;
    }

    if (addressData.pincode && addressData.pincode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode or leave it empty');
      return;
    }

    if (addressData.phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
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

            {addressData.coordinates && (
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

const VCart = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cartItems: initialCartItems = [] } = route.params || {};

  const [cartItems, setCartItems] = useState(initialCartItems);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Load saved addresses
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await UserService.getUserProfile();
      
      if (response.success && response.data) {
        let userAddresses = response.data.addresses || [];
        
        // Migrate old address format to new array format
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
        
        setAddresses(userAddresses);
        
        // Set first address as default if available
        if (userAddresses.length > 0 && !selectedAddress) {
          setSelectedAddress(userAddresses[0]);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      // Use demo addresses if API fails
      const demoAddresses = [
        {
          id: 'demo1',
          label: 'Home',
          street: '123 Main Street, Apartment 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210'
        }
      ];
      setAddresses(demoAddresses);
      setSelectedAddress(demoAddresses[0]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      handleRemoveItem(itemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, cartQuantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
          }
        }
      ]
    );
  };

  const handleSaveAddress = async (addressData) => {
    try {
      setLoading(true);
      
      let updatedAddresses;
      if (editingAddress) {
        // Update existing address
        updatedAddresses = addresses.map(addr =>
          addr.id === editingAddress.id ? { ...addressData, id: addr.id } : addr
        );
      } else {
        // Add new address
        const newAddress = {
          ...addressData,
          id: Date.now().toString()
        };
        updatedAddresses = [...addresses, newAddress];
        setSelectedAddress(newAddress);
      }

      // Save to backend
      const response = await UserService.updateUserProfile({
        addresses: updatedAddresses
      });

      if (response.success) {
        setAddresses(updatedAddresses);
        setShowAddressModal(false);
        setEditingAddress(null);
        Alert.alert('Success', 'Address saved successfully');
      } else {
        throw new Error(response.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setLoading(false);
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
              setLoading(true);
              const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
              
              const response = await UserService.updateUserProfile({
                addresses: updatedAddresses
              });

              if (response.success) {
                setAddresses(updatedAddresses);
                if (selectedAddress?.id === addressId) {
                  setSelectedAddress(updatedAddresses[0] || null);
                }
                Alert.alert('Success', 'Address deleted successfully');
              }
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.05; // 5% tax
  };

  const calculateDeliveryFee = () => {
    return 50; // Flat delivery fee
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateDeliveryFee();
  };

  const handleProceedToPay = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to cart before proceeding');
      return;
    }

    if (!selectedAddress) {
      Alert.alert('No Address', 'Please select or add a delivery address');
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
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.cartQuantity,
          price: item.price,
          farmerId: item.farmerId,
          farmer: item.farmer
        })),
        deliveryAddress: selectedAddress,
        amount: calculateTotal(),
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        deliveryFee: calculateDeliveryFee(),
        paymentMethod: paymentMethod,
        upiApp: upiApp
      };

      console.log('=== Payment Data Debug ===');
      console.log('Cart Items:', cartItems.length);
      console.log('Mapped Items:', paymentData.items.length);
      console.log('Items structure:', JSON.stringify(paymentData.items, null, 2));
      console.log('Delivery Address:', paymentData.deliveryAddress);
      console.log('Amount:', paymentData.amount);
      console.log('========================');

      // Initiate Razorpay payment
      const paymentResult = await PaymentService.initiatePayment(paymentData);

      if (paymentResult.success) {
        // Payment successful
        const testModeMsg = paymentResult.isTestMode ? '\n\n⚠️ Test Mode: Using sandbox credentials' : '';
        
        Alert.alert(
          'Payment Successful! 🎉',
          `Order ID: ${paymentResult.orderId}\nPayment ID: ${paymentResult.paymentId}\n\nYour order has been placed successfully!${testModeMsg}`,
          [
            {
              text: 'View Orders',
              onPress: () => {
                // Navigate to My Orders tab
                navigation.navigate('My Orders');
              }
            },
            {
              text: 'Continue Shopping',
              onPress: () => {
                // Clear cart and go back
                setCartItems([]);
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
            { text: 'Retry', onPress: () => handleProceedToPay() },
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
          { text: 'Retry', onPress: () => handleProceedToPay() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingAddresses) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="ArrowLeft" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="ArrowLeft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <Text style={styles.headerSubtitle}>{cartItems.length} items</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        {cartItems.length > 0 ? (
          <View style={styles.cartItemsSection}>
            <Text style={styles.sectionTitle}>Cart Items</Text>
            {cartItems.map(item => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCart}>
            <Icon name="ShoppingCart" size={64} color="#ccc" />
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
            <Text style={styles.emptyCartSubtext}>Add items from the marketplace</Text>
            <TouchableOpacity
              style={styles.continueShopping}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.continueShoppingText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        )}

        {cartItems.length > 0 && (
          <>
            {/* Order Summary */}
            <View style={styles.orderSummarySection}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>₹{calculateSubtotal().toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax (5%)</Text>
                  <Text style={styles.summaryValue}>₹{calculateTax().toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery Fee</Text>
                  <Text style={styles.summaryValue}>₹{calculateDeliveryFee().toFixed(2)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₹{calculateTotal().toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* Delivery Address */}
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

              {/* Address List */}
              {showAddressDropdown && (
                <View style={styles.addressList}>
                  {addresses.map(address => (
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

            {/* Proceed to Pay Button */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={styles.proceedButton}
                onPress={handleProceedToPay}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text style={styles.proceedButtonText}>Proceed to Pay</Text>
                    <Text style={styles.proceedButtonAmount}>₹{calculateTotal().toFixed(2)}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

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

      {/* Payment Options Modal */}
      <PaymentOptionsModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onProceed={handlePaymentProceed}
        amount={calculateTotal()}
        merchantName="Annadata Marketplace"
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
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },

  // Header
  header: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Content
  content: {
    flex: 1,
  },

  // Cart Items Section
  cartItemsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  cartItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#E8F5E8',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemFarmer: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
  },
  itemControls: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 8,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  removeButton: {
    padding: 4,
  },

  // Empty Cart
  emptyCart: {
    alignItems: 'center',
    padding: 60,
    marginTop: 40,
  },
  emptyCartText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  continueShopping: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueShoppingText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // Order Summary
  orderSummarySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },

  // Address Section
  addressSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addAddressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 6,
  },
  addressDropdown: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedAddressContent: {
    flexDirection: 'row',
    flex: 1,
  },
  selectedAddressText: {
    marginLeft: 12,
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressDetails: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  addressCoordinates: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  addressList: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addressItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  addressItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressItemDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  addressItemPhone: {
    fontSize: 13,
    color: '#999',
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  addressActionButton: {
    padding: 8,
  },

  // Bottom Section
  bottomSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  proceedButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  proceedButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  proceedButtonAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },

  // Modal
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

  bottomSpacing: {
    height: 30,
  },
});

export default VCart;
