# Backend Razorpay Integration Setup

## Prerequisites

1. Node.js installed
2. MongoDB running
3. Razorpay account (test mode is fine for development)

## Installation

### 1. Install Razorpay SDK

```bash
cd backend
npm install razorpay
```

### 2. Add Environment Variables

Add the following to your `backend/.env` file:

```env
# Razorpay Configuration (Sandbox/Test Mode)
RAZORPAY_KEY_ID=rzp_test_RUvp6HCCUIF7NO
RAZORPAY_KEY_SECRET=1HQALNfaGbb5W4IoqXCqrXlo

# Razorpay Webhook Secret (optional, for production)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### 3. Update Order Model

Make sure your `backend/models/Order.js` includes these fields:

```javascript
{
  razorpayOrderId: String,
  razorpayPaymentId: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  refundId: String,
  paidAt: Date,
  refundedAt: Date
}
```

### 4. Register Payment Routes

Add to your `backend/server.js`:

```javascript
const paymentRoutes = require('./routes/payment');

// ... other middleware

app.use('/api/orders', paymentRoutes);
```

## API Endpoints

The following endpoints are now available:

### 1. Create Order
```
POST /api/orders/create
Authorization: Bearer <token>

Body:
{
  "items": [
    {
      "productId": "xxx",
      "farmerId": "xxx",
      "name": "Premium Wheat",
      "quantity": 10,
      "price": 35
    }
  ],
  "deliveryAddress": {
    "label": "Home",
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "phone": "9876543210"
  },
  "amount": 350,
  "paymentMethod": "razorpay"
}

Response:
{
  "success": true,
  "data": {
    "orderId": "xxx",
    "razorpayOrderId": "order_xxx",
    "totalAmount": 350,
    "currency": "INR"
  }
}
```

### 2. Verify Payment
```
POST /api/orders/verify-payment
Authorization: Bearer <token>

Body:
{
  "orderId": "xxx",
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "xxx"
}

Response:
{
  "success": true,
  "verified": true,
  "message": "Payment verified successfully"
}
```

### 3. Get Payment Status
```
GET /api/orders/payment-status/:paymentId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "paymentId": "pay_xxx",
    "status": "captured",
    "amount": 350,
    "currency": "INR",
    "method": "card"
  }
}
```

### 4. Process Refund
```
POST /api/orders/refund
Authorization: Bearer <token>

Body:
{
  "paymentId": "pay_xxx",
  "amount": 35000,  // Amount in paise
  "reason": "Order cancelled by vendor"
}

Response:
{
  "success": true,
  "data": {
    "refundId": "rfnd_xxx",
    "amount": 350,
    "status": "processed"
  }
}
```

### 5. Webhook Handler
```
POST /api/orders/webhook
Headers:
  x-razorpay-signature: xxx

Body: (Razorpay webhook payload)

Response:
{
  "success": true,
  "received": true
}
```

## Testing

### Test Cards (Razorpay Sandbox):

**Successful Payment:**
- Card: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: Any future date

**Failed Payment:**
- Card: `4000 0000 0000 0002`
- CVV: `123`
- Expiry: Any future date

### Test UPI:
- UPI ID: `success@razorpay`

### Test Net Banking:
- Select any bank
- Will redirect to test page

## Webhook Setup (Optional, for Production)

1. Go to Razorpay Dashboard > Settings > Webhooks
2. Add webhook URL: `https://yourdomain.com/api/orders/webhook`
3. Select events: `payment.captured`, `payment.failed`, `refund.processed`
4. Copy the webhook secret
5. Add to `.env` as `RAZORPAY_WEBHOOK_SECRET`

## Security Best Practices

1. **Never expose Key Secret in frontend**
2. **Always verify payment signature on backend**
3. **Use HTTPS in production**
4. **Validate all inputs**
5. **Log all payment transactions**
6. **Set up proper error handling**
7. **Use environment variables for credentials**

## Production Checklist

Before going live:

- [ ] Replace test credentials with live Razorpay keys
- [ ] Set up webhook verification
- [ ] Enable proper logging
- [ ] Set up monitoring/alerts
- [ ] Test refund flow
- [ ] Configure rate limiting
- [ ] Set up proper error handling
- [ ] Test with different payment methods
- [ ] Verify HTTPS is enabled
- [ ] Test webhook delivery

## Troubleshooting

### Issue: Order creation fails
**Solution:** Check if Razorpay credentials are correct in `.env`

### Issue: Payment verification fails
**Solution:** Verify the signature calculation matches Razorpay's format

### Issue: Webhook not receiving events
**Solution:** 
- Check webhook URL is accessible
- Verify webhook secret is correct
- Check Razorpay dashboard for webhook delivery status

## Resources

- [Razorpay API Documentation](https://razorpay.com/docs/api/)
- [Payment Gateway Integration](https://razorpay.com/docs/payment-gateway/)
- [Webhooks Guide](https://razorpay.com/docs/webhooks/)
- [Test Credentials](https://razorpay.com/docs/payments/payments/test-card-details/)
