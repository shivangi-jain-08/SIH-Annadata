const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { authenticate } = require('../middleware/auth');
const Order = require('../models/Order');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RUvp6HCCUIF7NO',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '1HQALNfaGbb5W4IoqXCqrXlo'
});

/**
 * @route   POST /api/orders/create
 * @desc    Create new order with Razorpay
 * @access  Private
 */
router.post('/create', authenticate, async (req, res) => {
  try {
    const { items, deliveryAddress, amount, paymentMethod } = req.body;

    // Validate input
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required'
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required'
      });
    }

    // Calculate total amount
    const totalAmount = amount || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        vendor_id: req.user._id.toString(),
        vendor_name: req.user.name,
        address: `${deliveryAddress.city}, ${deliveryAddress.state}`
      }
    });

    // Create order in database
    const order = await Order.create({
      vendor: req.user._id,
      items: items.map(item => ({
        product: item.productId,
        farmer: item.farmerId,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      })),
      deliveryAddress: {
        label: deliveryAddress.label,
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        pincode: deliveryAddress.pincode,
        phone: deliveryAddress.phone
      },
      totalAmount: totalAmount,
      paymentMethod: paymentMethod || 'razorpay',
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
      paymentStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        totalAmount: totalAmount,
        currency: 'INR'
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/orders/verify-payment
 * @desc    Verify Razorpay payment signature
 * @access  Private
 */
router.post('/verify-payment', authenticate, async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Validate input
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details'
      });
    }

    // Verify signature
    const sign = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '1HQALNfaGbb5W4IoqXCqrXlo')
      .update(sign.toString())
      .digest('hex');

    if (razorpaySignature !== expectedSign) {
      // Invalid signature - payment verification failed
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed',
        status: 'cancelled'
      });

      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Invalid payment signature'
      });
    }

    // Payment verified successfully
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'completed',
        razorpayPaymentId: razorpayPaymentId,
        status: 'pending',
        paidAt: new Date()
      },
      { new: true }
    );

    // TODO: Send confirmation email/notification to vendor and farmers

    res.json({
      success: true,
      verified: true,
      message: 'Payment verified successfully',
      data: {
        orderId: order._id,
        paymentId: razorpayPaymentId,
        status: order.status,
        paymentStatus: order.paymentStatus
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/orders/payment-status/:paymentId
 * @desc    Get payment status from Razorpay
 * @access  Private
 */
router.get('/payment-status/:paymentId', authenticate, async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount / 100, // Convert from paise
        currency: payment.currency,
        method: payment.method,
        createdAt: new Date(payment.created_at * 1000)
      }
    });

  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/orders/refund
 * @desc    Initiate refund for a payment
 * @access  Private (Admin/Vendor)
 */
router.post('/refund', authenticate, async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    // Validate input
    if (!paymentId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID and amount are required'
      });
    }

    // Create refund
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount, // Amount in paise
      notes: {
        reason: reason || 'Order cancellation',
        refunded_by: req.user.name
      }
    });

    // Update order status
    const order = await Order.findOneAndUpdate(
      { razorpayPaymentId: paymentId },
      {
        paymentStatus: 'refunded',
        status: 'cancelled',
        refundId: refund.id,
        refundedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Refund initiated successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Refund failed',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/orders/webhook
 * @desc    Handle Razorpay webhooks
 * @access  Public (but verified)
 */
router.post('/webhook', async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature
    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (webhookSignature !== expectedSignature) {
        return res.status(400).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log('Razorpay Webhook Event:', event);

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        // Payment successful
        await Order.findOneAndUpdate(
          { razorpayOrderId: payload.payment.entity.order_id },
          { paymentStatus: 'completed', status: 'pending' }
        );
        break;

      case 'payment.failed':
        // Payment failed
        await Order.findOneAndUpdate(
          { razorpayOrderId: payload.payment.entity.order_id },
          { paymentStatus: 'failed', status: 'cancelled' }
        );
        break;

      case 'refund.processed':
        // Refund processed
        await Order.findOneAndUpdate(
          { razorpayPaymentId: payload.refund.entity.payment_id },
          { paymentStatus: 'refunded' }
        );
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    res.json({ success: true, received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

module.exports = router;
