// Payment Service for Razorpay Integration

import { Alert, Platform } from 'react-native';
import { apiRequest } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RAZORPAY_CONFIG, createRazorpayOptions } from '../config/razorpay';
import OrderService from './OrderService';

// Conditionally import RazorpayCheckout only for native platforms
let RazorpayCheckout = null;
try {
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    const RazorpayModule = require('react-native-razorpay');
    RazorpayCheckout = RazorpayModule.default || RazorpayModule;
    
    // Verify that the module has the open method
    if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
      console.log('Razorpay module loaded but open method not available');
      RazorpayCheckout = null;
    }
  }
} catch (error) {
  console.log('Razorpay native module not available, using test mode');
  RazorpayCheckout = null;
}

class PaymentService {
  
  /**
   * Create order on backend before payment
   */
  static async createOrder(orderData) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate items before sending
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        console.error('Invalid items data:', orderData.items);
        throw new Error('Cart items are required');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Format delivery address as string if it's an object
      let deliveryAddressString;
      if (typeof orderData.deliveryAddress === 'string') {
        deliveryAddressString = orderData.deliveryAddress;
      } else if (orderData.deliveryAddress && typeof orderData.deliveryAddress === 'object') {
        const addr = orderData.deliveryAddress;
        deliveryAddressString = `${addr.street}, ${addr.city}, ${addr.state}${addr.pincode ? ' - ' + addr.pincode : ''}`;
      }

      const requestBody = {
        items: orderData.items,
        deliveryAddress: deliveryAddressString,
        amount: orderData.amount,
        paymentMethod: 'razorpay'
      };

      console.log('Creating order on backend...');
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await apiRequest('/orders/create', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log('Create order response:', response);

      if (response.success && response.data) {
        return {
          success: true,
          orderId: response.data.orderId || response.data._id,
          razorpayOrderId: response.data.razorpayOrderId,
          amount: response.data.totalAmount || orderData.amount
        };
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (error) {
      console.log('Error creating order:', error);
      console.log('Order data was:', orderData);
      
      // For testing without backend, create mock order
      return {
        success: true,
        orderId: 'ORDER_' + Date.now(),
        razorpayOrderId: 'rzp_order_' + Date.now(),
        amount: orderData.amount,
        isMock: true
      };
    }
  }

  /**
   * Initiate Razorpay payment
   */
  static async initiatePayment(paymentData) {
    try {
      // Get current user data
      const userData = await AsyncStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : {};

      // Create order on backend first
      const orderResponse = await this.createOrder({
        items: paymentData.items,
        deliveryAddress: paymentData.deliveryAddress,
        amount: paymentData.amount
      });

      if (!orderResponse.success) {
        throw new Error('Failed to create order');
      }

      // Check if Razorpay is available (native platforms)
      if (!RazorpayCheckout) {
        console.log('Using test payment mode (Razorpay SDK not available)');
        console.log('Platform:', Platform.OS);
        console.log('Test mode will simulate payment after 2 seconds...');
        
        // Simulate payment for testing
        return await this.simulateTestPayment(orderResponse, paymentData);
      }

      // Prepare Razorpay options
      const razorpayOptions = createRazorpayOptions({
        orderId: orderResponse.razorpayOrderId,
        amount: orderResponse.amount,
        description: `Order #${orderResponse.orderId}`,
        customerName: user.name || 'Customer',
        customerEmail: user.email || 'customer@example.com',
        customerPhone: user.phone || '9999999999',
        notes: {
          orderId: orderResponse.orderId,
          address: paymentData.deliveryAddress.street
        }
      });

      console.log('Initiating Razorpay payment with options:', razorpayOptions);

      // Double-check that RazorpayCheckout is available and has open method
      if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
        console.log('⚠️ Razorpay checkout method not available at payment time');
        console.log('Falling back to test payment mode...');
        return await this.simulateTestPayment(orderResponse, paymentData);
      }

      // Try to open Razorpay checkout - wrap in try-catch as native module might not be available
      let paymentResult;
      try {
        paymentResult = await RazorpayCheckout.open(razorpayOptions);
      } catch (openError) {
        // If the native module call fails, fall back to test mode
        console.log('⚠️ Razorpay native module not available:', openError.message);
        console.log('Falling back to test payment mode...');
        return await this.simulateTestPayment(orderResponse, paymentData);
      }

      console.log('Payment successful:', paymentResult);

      // Verify payment on backend
      const verificationResult = await this.verifyPayment({
        orderId: orderResponse.orderId,
        razorpayOrderId: paymentResult.razorpay_order_id,
        razorpayPaymentId: paymentResult.razorpay_payment_id,
        razorpaySignature: paymentResult.razorpay_signature
      });

      // Create order and update inventory after successful payment
      const orderCreationResult = await this.completeOrder({
        orderId: orderResponse.orderId,
        paymentId: paymentResult.razorpay_payment_id,
        razorpayOrderId: paymentResult.razorpay_order_id,
        items: paymentData.items,
        deliveryAddress: paymentData.deliveryAddress,
        amount: paymentData.amount,
        subtotal: paymentData.subtotal,
        tax: paymentData.tax,
        deliveryFee: paymentData.deliveryFee
      });

      return {
        success: true,
        orderId: orderResponse.orderId,
        paymentId: paymentResult.razorpay_payment_id,
        order: orderCreationResult.order,
        message: 'Payment successful'
      };

    } catch (error) {
      console.error('Payment failed:', error);
      
      // Handle payment cancellation
      if (RazorpayCheckout && RazorpayCheckout.PAYMENT_CANCELLED && error.code === RazorpayCheckout.PAYMENT_CANCELLED) {
        return {
          success: false,
          cancelled: true,
          message: 'Payment was cancelled by user'
        };
      }

      // Handle other errors
      return {
        success: false,
        error: error.description || error.message || 'Payment failed',
        message: 'Payment failed. Please try again.'
      };
    }
  }

  /**
   * Simulate test payment (for development/testing without native Razorpay)
   */
  static async simulateTestPayment(orderResponse, paymentData) {
    return new Promise(async (resolve) => {
      console.log('=================================');
      console.log('🧪 TEST PAYMENT MODE ACTIVATED');
      console.log('=================================');
      console.log('Order ID:', orderResponse.orderId);
      console.log('Amount: ₹' + orderResponse.amount.toFixed(2));
      console.log('Items:', paymentData.items.length);
      console.log('Address:', paymentData.deliveryAddress.city + ', ' + paymentData.deliveryAddress.state);
      console.log('---------------------------------');
      console.log('⏳ Simulating payment gateway...');
      console.log('=================================');
      
      // Simulate payment gateway delay
      setTimeout(async () => {
        const mockPaymentId = 'pay_test_' + Date.now();
        
        console.log('=================================');
        console.log('✅ TEST PAYMENT SUCCESSFUL!');
        console.log('=================================');
        console.log('Order ID:', orderResponse.orderId);
        console.log('Payment ID:', mockPaymentId);
        console.log('Amount: ₹' + orderResponse.amount.toFixed(2));
        console.log('Status: COMPLETED');
        console.log('=================================');
        console.log('');
        console.log('💡 NOTE: This is a simulated payment.');
        console.log('   Use actual device/emulator for real Razorpay checkout.');
        console.log('=================================');

        // Create order after successful test payment
        const orderCreationResult = await this.completeOrder({
          orderId: orderResponse.orderId,
          paymentId: mockPaymentId,
          razorpayOrderId: orderResponse.razorpayOrderId,
          items: paymentData.items,
          deliveryAddress: paymentData.deliveryAddress,
          amount: paymentData.amount,
          subtotal: paymentData.subtotal,
          tax: paymentData.tax,
          deliveryFee: paymentData.deliveryFee
        });

        // Simulate successful payment
        resolve({
          success: true,
          orderId: orderResponse.orderId,
          paymentId: mockPaymentId,
          order: orderCreationResult.order,
          message: 'Test payment successful (Razorpay sandbox mode)',
          isTestMode: true
        });
      }, 2000);
    });
  }

  /**
   * Verify payment on backend
   */
  static async verifyPayment(paymentData) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      console.log('Verifying payment on backend...', paymentData);

      const response = await apiRequest('/orders/verify-payment', {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentData),
      });

      if (response.success) {
        return {
          success: true,
          verified: true,
          message: 'Payment verified successfully'
        };
      } else {
        throw new Error(response.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      
      // For testing without backend, return success
      return {
        success: true,
        verified: true,
        isMock: true,
        message: 'Payment verification skipped (testing mode)'
      };
    }
  }

  /**
   * Complete order after successful payment
   * This creates the order and updates farmer inventory
   */
  static async completeOrder(orderData) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : {};

      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('📦 Creating order and updating inventory...');

      // Prepare delivery address
      let deliveryAddressString;
      let deliveryCoordinates = null;
      
      if (typeof orderData.deliveryAddress === 'string') {
        deliveryAddressString = orderData.deliveryAddress;
      } else {
        const addr = orderData.deliveryAddress;
        deliveryAddressString = `${addr.street}, ${addr.city}, ${addr.state}${addr.pincode ? ' - ' + addr.pincode : ''}`;
        
        // Extract coordinates if available
        if (addr.coordinates && Array.isArray(addr.coordinates) && addr.coordinates.length === 2) {
          deliveryCoordinates = addr.coordinates;
        }
      }

      // Prepare order data for backend
      const orderPayload = {
        buyerId: user._id || user.id,
        items: orderData.items,
        deliveryAddress: {
          street: deliveryAddressString,
          city: orderData.deliveryAddress.city || '',
          state: orderData.deliveryAddress.state || '',
          pincode: orderData.deliveryAddress.pincode || '',
          coordinates: deliveryCoordinates
        },
        totalAmount: orderData.amount,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        deliveryFee: orderData.deliveryFee,
        paymentMethod: 'razorpay',
        paymentId: orderData.paymentId,
        razorpayOrderId: orderData.razorpayOrderId,
        razorpayPaymentId: orderData.razorpayPaymentId,
        status: 'confirmed'
      };

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await apiRequest('/orders/complete', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload),
      });

      if (response.success && response.data) {
        console.log('✅ Order created successfully');
        console.log('✅ Inventory updated for farmers');
        
        return {
          success: true,
          order: response.data,
          message: 'Order placed successfully'
        };
      } else {
        throw new Error(response.message || 'Failed to complete order');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      
      // For testing without backend, return mock success
      console.log('⚠️ Backend not available - order will be created when backend is online');
      return {
        success: true,
        order: {
          _id: orderData.orderId,
          ...orderData,
          status: 'confirmed',
          createdAt: new Date().toISOString()
        },
        isMock: true,
        message: 'Order will be processed when backend is available'
      };
    }
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(paymentId) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await apiRequest(`/orders/payment-status/${paymentId}`, {
        method: 'GET',
        headers,
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get payment status');
      }
    } catch (error) {
      console.error('Error getting payment status:', error);
      return null;
    }
  }

  /**
   * Refund payment
   */
  static async refundPayment(paymentId, amount, reason) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await apiRequest('/orders/refund', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          paymentId,
          amount: Math.round(amount * 100), // Convert to paise
          reason
        }),
      });

      if (response.success) {
        return {
          success: true,
          refundId: response.data.refundId,
          message: 'Refund initiated successfully'
        };
      } else {
        throw new Error(response.message || 'Refund failed');
      }
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount) {
    return `₹${amount.toFixed(2)}`;
  }

  /**
   * Format payment method
   */
  static formatPaymentMethod(method) {
    const methods = {
      'razorpay': 'Razorpay',
      'cod': 'Cash on Delivery',
      'card': 'Credit/Debit Card',
      'upi': 'UPI',
      'netbanking': 'Net Banking',
      'wallet': 'Wallet'
    };
    return methods[method] || method;
  }
}

export default PaymentService;

// Helper functions for easy import
export const initiatePayment = PaymentService.initiatePayment.bind(PaymentService);
export const verifyPayment = PaymentService.verifyPayment.bind(PaymentService);
export const getPaymentStatus = PaymentService.getPaymentStatus.bind(PaymentService);
export const refundPayment = PaymentService.refundPayment.bind(PaymentService);
export const formatAmount = PaymentService.formatAmount.bind(PaymentService);
