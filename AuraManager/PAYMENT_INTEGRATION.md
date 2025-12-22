# Payment Integration Setup Guide

## Current Status
✅ Payment UI: Complete with Card & PayPal options
✅ Navigation: Pricing → Checkout flow working
✅ API Endpoints: `/api/payment` (Stripe) & `/api/paypal` (PayPal) ready
✅ PayPal Integration: ACTIVE with sandbox credentials
⏳ Supabase Tables: `subscriptions`, `payment_history`, `pending_payments` needed
⏳ Stripe Integration: Optional - card payment not yet live

## Quick Start - PayPal (ACTIVE NOW)

### 1. PayPal Credentials (Already Provided)
```
PAYPAL_CLIENT_ID=AZcQmosuTDZpncFUi-Tn9tEwhWle2iCedn9ed3HPix9m5d7UiwB1wkxAaMEQryXcIkZCurOHLw6_oYIt
PAYPAL_CLIENT_SECRET=EBXG4sa_otDpkTh2XMXZIJT_d0BafRe_84nw6hXErMD68EG2CdQtmmrGr1qDs45XVi1nD6iOaMf5wDCP
```
These are sandbox credentials (testing only).

### 2. Create Supabase Tables

Run these SQL queries in Supabase:

```sql
-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  payment_method TEXT CHECK (payment_method IN ('card', 'paypal')),
  stripe_subscription_id TEXT,
  paypal_order_id TEXT,
  paypal_capture_id TEXT,
  payment_id TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  renewal_date TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment history table
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method TEXT CHECK (payment_method IN ('card', 'paypal')),
  stripe_payment_id TEXT,
  paypal_order_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pending payments (for PayPal order tracking)
CREATE TABLE pending_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paypal_order_id TEXT NOT NULL UNIQUE,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscriptions
CREATE POLICY subscriptions_select ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY subscriptions_insert ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY subscriptions_update ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only see their own payment history
CREATE POLICY payment_history_select ON payment_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY payment_history_insert ON payment_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only see their own pending payments
CREATE POLICY pending_payments_select ON pending_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY pending_payments_insert ON pending_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY pending_payments_update ON pending_payments FOR UPDATE
  USING (auth.uid() = user_id);
```

### 3. Configure Environment Variables

Add to `.env.local`:
```
PAYPAL_CLIENT_ID=AZcQmosuTDZpncFUi-Tn9tEwhWle2iCedn9ed3HPix9m5d7UiwB1wkxAaMEQryXcIkZCurOHLw6_oYIt
PAYPAL_CLIENT_SECRET=EBXG4sa_otDpkTh2XMXZIJT_d0BafRe_84nw6hXErMD68EG2CdQtmmrGr1qDs45XVi1nD6iOaMf5wDCP
```

### 4. Test PayPal Flow

1. Go to `/pricing`
2. Select any plan → Click "Start Free Trial" / "Contact Sales"
3. On Checkout page, select "PayPal" payment method
4. Click "Pay $X with PayPal"
5. You'll be redirected to PayPal sandbox
6. Use sandbox account credentials (testing account)
7. Approve payment → redirected back to dashboard

## Stripe Integration (Optional - For Card Payments)

### 1. Get Stripe API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Developers → API Keys
3. Copy **Publishable Key** and **Secret Key**
4. Add to `.env.local`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxx
   ```

### 2. Install Stripe SDK
```bash
npm install stripe
```

### 3. Update api/payment.ts
Replace the mock payment handler with actual Stripe calls:

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

async function processPaymentWithStripe(paymentData: {...}) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: paymentData.priceInCents,
    currency: "usd",
    payment_method_types: ["card"],
    metadata: {
      plan: paymentData.planName,
      billingCycle: paymentData.billingCycle,
      userId: paymentData.userId,
    },
  });

  // Confirm payment
  const confirmed = await stripe.paymentIntents.confirm(paymentIntent.id, {
    payment_method: "pm_card_visa", // from Stripe Elements
  });

  return { subscription_id: confirmed.id, payment_id: confirmed.id };
}
```

### 4. Test Cards (Sandbox)
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Expiry:** Any future date (MM/YY)
- **CVC:** Any 3 digits

## API Endpoints

### PayPal
- `POST /api/paypal` - Create PayPal order
  - Auth: Bearer token
  - Body: { planName, billingCycle, priceInCents }
  - Returns: { orderId, approveUrl }

- `POST /api/paypal/capture` - Capture PayPal order
  - Auth: Bearer token
  - Body: { orderId }
  - Returns: { success, subscription_id }

### Stripe
- `POST /api/payment` - Process card payment
  - Auth: Bearer token
  - Body: { planName, billingCycle, priceInCents, card }
  - Returns: { success, subscription_id }

## Current Architecture

```
PayPal Flow:
Frontend (select PayPal) 
  → POST /api/paypal
  → Backend creates PayPal order
  → Returns approveUrl
  → Frontend redirects to PayPal
  → User approves
  → Redirected to return URL
  → POST /api/paypal/capture
  → Subscription created
  → Redirect to dashboard

Card Flow (Stripe):
Frontend (select Card, fill form)
  → POST /api/payment (with card data)
  → Backend processes with Stripe
  → Returns subscription_id
  → Subscription created
  → Redirect to dashboard
```

## Environment Variables Needed

### PayPal (Required)
```
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

### Stripe (Optional)
```
VITE_STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

### Supabase (Required)
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Vercel (Production)
```
VERCEL_URL=https://your-app.vercel.app
```

## Next Steps

1. ✅ Add PayPal credentials to .env.local
2. ⏳ Create Supabase tables (SQL above)
3. ⏳ Test PayPal flow
4. ⏳ (Optional) Set up Stripe for card payments
5. ⏳ Deploy to Vercel

## Support

- [PayPal Documentation](https://developer.paypal.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Auth Reference](https://supabase.com/docs/guides/auth)

