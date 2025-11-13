# Razorpay Payment Integration Setup

## Overview
This project uses Razorpay for payment processing in the Annadata marketplace app.

## Configuration

### Razorpay Credentials (Sandbox/Test Mode)
- **Key ID**: `rzp_test_RUvp6HCCUIF7NO`
- **Key Secret**: `1HQALNfaGbb5W4IoqXCqrXlo`

These credentials are stored in:
- `.env` file (root level)
- `config/razorpay.js` (React Native config)

## Setup Instructions

### 1. Install Dependencies
```bash
cd react-native
npx expo install react-native-razorpay
```

### 2. Environment Variables
The `.env` file contains:
```env
RAZORPAY_KEY_ID=rzp_test_RUvp6HCCUIF7NO
RAZORPAY_KEY_SECRET=1HQALNfaGbb5W4IoqXCqrXlo
```

### 3. Native Platform Setup

#### For iOS:
```bash
cd ios
pod install
cd ..
```

#### For Android:
No additional setup required - Razorpay SDK is auto-linked.

## Implementation Details

### Files Created/Modified:

1. **config/razorpay.js** - Razorpay configuration and helper functions
2. **services/PaymentService.js** - Payment service with Razorpay integration
3. **vendor/VCart.jsx** - Cart component with payment integration
4. **.env** - Environment variables with Razorpay credentials

### Payment Flow:

1. **Create Order** (`PaymentService.createOrder()`)
   - Sends order details to backend
   - Backend creates Razorpay order
   - Returns `razorpayOrderId`

2. **Initiate Payment** (`PaymentService.initiatePayment()`)
   - Opens Razorpay checkout
   - User completes payment
   - Returns payment details

3. **Verify Payment** (`PaymentService.verifyPayment()`)
   - Sends payment details to backend
   - Backend verifies signature
   - Confirms order

### Test Mode Features:

- **Automatic Fallback**: If Razorpay native module is not available (e.g., Expo Go), the app automatically uses test payment simulation
- **Mock Payment**: Simulates successful payment after 1.5 second delay
- **Console Logging**: All payment operations are logged for debugging

## Testing Payment

### Test Cards (Razorpay Sandbox):

**Success:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failure:**
- Card Number: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### UPI Test:
- UPI ID: `success@razorpay`

### Net Banking:
- Select any bank
- Use test credentials provided by Razorpay

## Usage in App

### In VCart component:

```javascript
const handleProceedToPay = async () => {
  const paymentData = {
    items: cartItems,
    deliveryAddress: selectedAddress,
    amount: calculateTotal(),
    subtotal: calculateSubtotal(),
    tax: calculateTax(),
    deliveryFee: calculateDeliveryFee()
  };

  const result = await PaymentService.initiatePayment(paymentData);
  
  if (result.success) {
    // Payment successful
    Alert.alert('Payment Successful!', `Order ID: ${result.orderId}`);
  }
};
```

## Backend Requirements

The backend should have these endpoints:

### 1. Create Order
```
POST /api/orders/create
Body: {
  items: Array,
  deliveryAddress: Object,
  amount: Number,
  paymentMethod: 'razorpay'
}
Response: {
  success: true,
  data: {
    orderId: String,
    razorpayOrderId: String,
    totalAmount: Number
  }
}
```

### 2. Verify Payment
```
POST /api/orders/verify-payment
Body: {
  orderId: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String
}
Response: {
  success: true,
  verified: true
}
```

### 3. Payment Status
```
GET /api/orders/payment-status/:paymentId
Response: {
  success: true,
  data: {
    status: 'success' | 'failed' | 'pending'
  }
}
```

## Security Notes

⚠️ **Important Security Practices:**

1. **Never expose Key Secret in frontend code**
   - Key Secret should ONLY be used on backend
   - Frontend only uses Key ID

2. **Always verify payment on backend**
   - Use Razorpay webhook signature verification
   - Never trust frontend payment success alone

3. **Use HTTPS in production**
   - All API calls must be over HTTPS
   - Razorpay requires HTTPS for webhooks

4. **Environment Variables**
   - Never commit `.env` file to Git
   - Add `.env` to `.gitignore`
   - Use different credentials for production

## Production Checklist

Before going live:

- [ ] Replace test credentials with live Razorpay credentials
- [ ] Update `RAZORPAY_KEY_ID` in config/razorpay.js
- [ ] Ensure backend uses live Razorpay key
- [ ] Set up Razorpay webhooks
- [ ] Enable payment methods in Razorpay dashboard
- [ ] Test all payment flows thoroughly
- [ ] Set up proper error logging
- [ ] Configure refund policies

## Troubleshooting

### Payment not opening:
1. Check if `react-native-razorpay` is installed
2. Verify Key ID is correct
3. Check console logs for errors
4. Ensure backend is creating order successfully

### Payment succeeds but verification fails:
1. Check webhook signature verification
2. Verify Key Secret on backend
3. Ensure proper order ID matching

### Test mode not working:
1. Check if running in Expo Go (test mode auto-enabled)
2. Verify console shows "Using test payment mode"
3. Check if RazorpayCheckout import failed

## Support

For Razorpay integration issues:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [React Native Integration](https://razorpay.com/docs/payment-gateway/react-native/)
- [Test Credentials](https://razorpay.com/docs/payments/payments/test-card-details/)

## Notes

- Current implementation includes automatic test mode fallback
- Backend integration is required for production use
- Payment verification should always happen on backend
- Keep Razorpay credentials secure and never commit them to version control
