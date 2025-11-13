// Razorpay Configuration

// Razorpay Sandbox/Test Credentials
export const RAZORPAY_CONFIG = {
  KEY_ID: 'rzp_test_RUvp6HCCUIF7NO',
  KEY_SECRET: '1HQALNfaGbb5W4IoqXCqrXlo',
  
  // Payment Options
  OPTIONS: {
    currency: 'INR',
    name: 'Annadata Marketplace',
    description: 'Farm-to-Consumer Direct Purchase',
    image: 'https://your-logo-url.com/logo.png', // Replace with actual logo
    theme: {
      color: '#4CAF50'
    }
  }
};

// Helper to create Razorpay order options
export const createRazorpayOptions = (orderDetails) => {
  return {
    key: RAZORPAY_CONFIG.KEY_ID,
    amount: Math.round(orderDetails.amount * 100), // Convert to paise
    currency: RAZORPAY_CONFIG.OPTIONS.currency,
    name: RAZORPAY_CONFIG.OPTIONS.name,
    description: orderDetails.description || RAZORPAY_CONFIG.OPTIONS.description,
    image: RAZORPAY_CONFIG.OPTIONS.image,
    order_id: orderDetails.orderId, // Order ID from backend
    prefill: {
      name: orderDetails.customerName,
      email: orderDetails.customerEmail,
      contact: orderDetails.customerPhone
    },
    theme: RAZORPAY_CONFIG.OPTIONS.theme,
    notes: orderDetails.notes || {}
  };
};

export default RAZORPAY_CONFIG;
