import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Icon from '../Icon';
import PaymentService from '../services/PaymentService';

const TestPayment = () => {
  const [loading, setLoading] = useState(false);

  // Test payment with sample data
  const handleTestPayment = async () => {
    setLoading(true);

    const testPaymentData = {
      items: [
        {
          productId: 'test_product_1',
          name: 'Test Premium Wheat',
          quantity: 10,
          price: 35,
          farmerId: 'test_farmer_1',
          farmer: 'Test Farmer'
        }
      ],
      deliveryAddress: {
        id: 'test_address_1',
        label: 'Test Home',
        street: '123 Test Street, Apartment 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '9876543210'
      },
      amount: 400.25,
      subtotal: 350,
      tax: 17.50,
      deliveryFee: 50
    };

    try {
      console.log('Starting test payment...');
      const result = await PaymentService.initiatePayment(testPaymentData);

      if (result.success) {
        Alert.alert(
          'Test Payment Successful! ✅',
          `Order ID: ${result.orderId}\nPayment ID: ${result.paymentId}\n\n${result.isTestMode ? '⚠️ Test Mode Active' : ''}`,
          [{ text: 'OK' }]
        );
      } else if (result.cancelled) {
        Alert.alert('Payment Cancelled', 'Test payment was cancelled');
      } else {
        Alert.alert('Payment Failed', result.message || 'Test payment failed');
      }
    } catch (error) {
      console.error('Test payment error:', error);
      Alert.alert('Error', 'Test payment encountered an error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="CreditCard" size={48} color="#4CAF50" />
        <Text style={styles.title}>Razorpay Payment Test</Text>
        <Text style={styles.subtitle}>Test the payment integration</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Test Credentials</Text>
        <Text style={styles.infoText}>Key ID: rzp_test_RUvp6HCCUIF7NO</Text>
        <Text style={styles.infoText}>Mode: Sandbox/Test</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Payment Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Product:</Text>
          <Text style={styles.detailValue}>Test Premium Wheat</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quantity:</Text>
          <Text style={styles.detailValue}>10 kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={styles.detailValue}>₹35/kg</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Subtotal:</Text>
          <Text style={styles.detailValue}>₹350.00</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tax (5%):</Text>
          <Text style={styles.detailValue}>₹17.50</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Delivery:</Text>
          <Text style={styles.detailValue}>₹50.00</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>₹417.50</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Cards (Razorpay Sandbox)</Text>
        
        <View style={styles.testCard}>
          <View style={styles.testCardHeader}>
            <Icon name="CheckCircle" size={20} color="#4CAF50" />
            <Text style={styles.testCardTitle}>Success</Text>
          </View>
          <Text style={styles.testCardNumber}>4111 1111 1111 1111</Text>
          <Text style={styles.testCardInfo}>CVV: Any 3 digits | Expiry: Any future date</Text>
        </View>

        <View style={styles.testCard}>
          <View style={styles.testCardHeader}>
            <Icon name="XCircle" size={20} color="#F44336" />
            <Text style={styles.testCardTitle}>Failure</Text>
          </View>
          <Text style={styles.testCardNumber}>4000 0000 0000 0002</Text>
          <Text style={styles.testCardInfo}>CVV: Any 3 digits | Expiry: Any future date</Text>
        </View>

        <View style={styles.testCard}>
          <View style={styles.testCardHeader}>
            <Icon name="Smartphone" size={20} color="#2196F3" />
            <Text style={styles.testCardTitle}>UPI</Text>
          </View>
          <Text style={styles.testCardNumber}>success@razorpay</Text>
          <Text style={styles.testCardInfo}>Test UPI ID for successful payment</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.testButton, loading && styles.testButtonDisabled]}
        onPress={handleTestPayment}
        disabled={loading}
      >
        {loading ? (
          <Text style={styles.testButtonText}>Processing...</Text>
        ) : (
          <>
            <Icon name="Zap" size={20} color="white" />
            <Text style={styles.testButtonText}>Run Test Payment</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.noteCard}>
        <Icon name="Info" size={20} color="#FF9800" />
        <Text style={styles.noteText}>
          This will initiate a test payment using Razorpay sandbox credentials. 
          No real money will be charged.
        </Text>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: 'white',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  infoCard: {
    backgroundColor: '#E8F5E9',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#2E7D32',
    marginVertical: 2,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
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
  testCard: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  testCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  testCardNumber: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2196F3',
    marginBottom: 4,
  },
  testCardInfo: {
    fontSize: 12,
    color: '#666',
  },
  testButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  testButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  testButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  noteCard: {
    backgroundColor: '#FFF3E0',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteText: {
    fontSize: 13,
    color: '#E65100',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 30,
  },
});

export default TestPayment;
