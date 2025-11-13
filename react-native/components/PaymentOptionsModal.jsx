import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import Icon from '../Icon';

const { width } = Dimensions.get('window');

const PaymentOptionsModal = ({ visible, onClose, onProceed, amount, merchantName = 'Annadata Marketplace' }) => {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState(null);
  const [processing, setProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI',
      icon: '💳',
      apps: [
        { id: 'phonepe', name: 'PhonePe', icon: '☎️', color: '#5F259F' },
        { id: 'googlepay', name: 'Google Pay', icon: '🔵', color: '#4285F4' },
        { id: 'paytm', name: 'PayTM', icon: '💙', color: '#00BAF2' },
        { id: 'amazonpay', name: 'Amazon Pay UPI', icon: '🟠', color: '#FF9900' },
      ]
    },
    {
      id: 'cards',
      name: 'Credit/Debit Cards',
      icon: '💳',
      description: 'Visa, Mastercard, Rupay, Amex'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: '🏦',
      description: 'All major banks'
    },
    {
      id: 'wallet',
      name: 'Wallets',
      icon: '👛',
      description: 'Paytm, PhonePe, Mobikwik'
    }
  ];

  const upiOffers = [
    { text: 'Get ₹10 assured cashback on any payment', icon: '🎁' },
    { text: 'Extra 2% off with UPI', icon: '💰' },
  ];

  const handleProceed = async () => {
    setProcessing(true);
    // Simulate processing delay
    setTimeout(async () => {
      await onProceed(selectedMethod, selectedUpiApp);
      setProcessing(false);
    }, 500);
  };

  const renderUpiSection = () => {
    const upiMethod = paymentMethods.find(m => m.id === 'upi');
    
    return (
      <View style={styles.upiSection}>
        <Text style={styles.recommendedLabel}>Recommended</Text>
        
        {/* UPI Apps Grid */}
        <View style={styles.upiAppsGrid}>
          {upiMethod.apps.map(app => (
            <TouchableOpacity
              key={app.id}
              style={[
                styles.upiAppCard,
                selectedUpiApp === app.id && styles.upiAppCardSelected
              ]}
              onPress={() => setSelectedUpiApp(app.id)}
            >
              <View style={[styles.upiAppIcon, { backgroundColor: app.color }]}>
                <Text style={styles.upiAppEmoji}>{app.icon}</Text>
              </View>
              <Text style={styles.upiAppName}>{app.name}</Text>
              {selectedUpiApp === app.id && (
                <View style={styles.selectedBadge}>
                  <Icon name="Check" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Other UPI Options */}
        <TouchableOpacity
          style={styles.otherUpiOption}
          onPress={() => setSelectedUpiApp('other')}
        >
          <Text style={styles.otherUpiText}>⋯ Apps & UPI ID</Text>
          <Icon name="ChevronRight" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderOtherMethods = () => {
    const otherMethods = paymentMethods.filter(m => m.id !== 'upi');
    
    return (
      <View style={styles.otherMethodsSection}>
        <Text style={styles.sectionTitle}>All Payment Options</Text>
        {otherMethods.map(method => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethodCard,
              selectedMethod === method.id && styles.paymentMethodCardSelected
            ]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <View style={styles.paymentMethodLeft}>
              <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodName}>{method.name}</Text>
                {method.description && (
                  <Text style={styles.paymentMethodDesc}>{method.description}</Text>
                )}
              </View>
            </View>
            <Icon
              name={selectedMethod === method.id ? "CheckCircle" : "ChevronRight"}
              size={20}
              color={selectedMethod === method.id ? "#4CAF50" : "#666"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Icon name="ArrowLeft" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View style={styles.merchantBadge}>
              <Text style={styles.merchantIcon}>M</Text>
            </View>
            <View>
              <Text style={styles.merchantName}>{merchantName}</Text>
              <View style={styles.trustedBadge}>
                <Icon name="Shield" size={12} color="#4CAF50" />
                <Text style={styles.trustedText}>Razorpay Trusted Business</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Icon name="Phone" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Phone Number Info */}
        <View style={styles.phoneInfo}>
          <Icon name="User" size={20} color="#4CAF50" />
          <Text style={styles.phoneText}>Using as +91 82280 73912</Text>
          <Icon name="ChevronRight" size={20} color="#666" />
        </View>

        {/* Orders Info */}
        <View style={styles.ordersInfo}>
          <Icon name="ShoppingCart" size={16} color="#4CAF50" />
          <Text style={styles.ordersText}>
            3,000+ orders last month from {merchantName}
          </Text>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <Text style={styles.mainTitle}>Payment Options</Text>

          {/* Offers Section */}
          <View style={styles.offersSection}>
            <Text style={styles.offersTitle}>Available Offers</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.offersScroll}
            >
              {upiOffers.map((offer, index) => (
                <View key={index} style={styles.offerCard}>
                  <Text style={styles.offerIcon}>{offer.icon}</Text>
                  <Text style={styles.offerText} numberOfLines={2}>
                    {offer.text}
                  </Text>
                </View>
              ))}
              <TouchableOpacity style={styles.viewAllOffers}>
                <Text style={styles.viewAllText}>+2 View all</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* UPI Section */}
          {renderUpiSection()}

          {/* Other Payment Methods */}
          {renderOtherMethods()}
        </ScrollView>

        {/* Bottom Section */}
        <View style={styles.footer}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>₹{amount ? amount.toFixed(2) : '0.00'}</Text>
            <TouchableOpacity>
              <Text style={styles.viewDetails}>View Details</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.continueButton, processing && styles.continueButtonDisabled]}
            onPress={handleProceed}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  merchantBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  merchantIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  trustedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trustedText: {
    fontSize: 11,
    color: 'white',
    marginLeft: 4,
  },
  callButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  phoneText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  ordersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  ordersText: {
    fontSize: 13,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  offersSection: {
    marginBottom: 20,
  },
  offersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  offersScroll: {
    paddingRight: 16,
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: width * 0.7,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  offerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  offerText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    fontWeight: '500',
  },
  viewAllOffers: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 20,
  },
  viewAllText: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '600',
  },
  recommendedLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  upiSection: {
    marginBottom: 20,
  },
  upiAppsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  upiAppCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  upiAppCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  upiAppIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  upiAppEmoji: {
    fontSize: 24,
  },
  upiAppName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otherUpiOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  otherUpiText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  otherMethodsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  paymentMethodCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  paymentMethodDesc: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
    backgroundColor: 'white',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  viewDetails: {
    fontSize: 14,
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  continueButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#666',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default PaymentOptionsModal;
