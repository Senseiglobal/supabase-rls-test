import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// PayPal API configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const PAYPAL_API_BASE = "https://api.sandbox.paypal.com"; // Use sandbox for testing

// Get PayPal access token
async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal credentials not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.");
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to get PayPal access token" }));
    throw new Error(`PayPal authentication failed: ${error.message || "Unknown error"}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("No access token received from PayPal");
  }
  return data.access_token;
}

// Create PayPal order
async function createPayPalOrder(amount: number, planName: string, billingCycle: string) {
  if (!amount || amount <= 0) {
    throw new Error("Invalid payment amount");
  }

  const accessToken = await getPayPalAccessToken();
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173";

  const response = await fetch(`${PAYPAL_API_BASE}/v1/checkout/orders`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: (amount / 100).toString(), // Convert cents to dollars
          },
          description: `${planName} Plan - ${billingCycle}`,
          custom_id: `${planName}-${billingCycle}`,
        },
      ],
      application_context: {
        brand_name: "Aura Manager",
        return_url: `${baseUrl}/checkout/paypal/return`,
        cancel_url: `${baseUrl}/checkout/paypal/cancel`,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to create PayPal order" }));
    throw new Error(`PayPal order creation failed: ${error.message || error.details?.[0]?.issue || "Unknown error"}`);
  }

  const order = await response.json();
  if (!order.id) {
    throw new Error("No order ID received from PayPal");
  }
  return order;
}

// Capture PayPal order
async function capturePayPalOrder(orderId: string) {
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v1/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to capture PayPal order" }));
    throw new Error(`PayPal capture failed: ${error.message || error.details?.[0]?.issue || "Unknown error"}`);
  }

  const capture = await response.json();
  if (!capture.id) {
    throw new Error("No capture ID received from PayPal");
  }
  return capture;
}

// Main PayPal create order handler
export async function createOrder(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid authorization header" });
    }

    const token = authHeader.slice(7);

    // Verify token with Supabase
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid authentication token" });
    }

    const { planName, billingCycle, priceInCents } = req.body;

    if (!planName || !billingCycle || !priceInCents) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        required: ["planName", "billingCycle", "priceInCents"] 
      });
    }

    // Create PayPal order
    const paypalOrder = await createPayPalOrder(priceInCents, planName, billingCycle);

    // Find approve link
    const approveLink = paypalOrder.links?.find((link: any) => link.rel === "approve");

    if (!approveLink) {
      throw new Error("PayPal did not return an approval link");
    }

    // Store pending order in Supabase for later capture
    const { error: insertError } = await supabaseAdmin.from("pending_payments").insert({
      user_id: user.id,
      plan_name: planName,
      billing_cycle: billingCycle,
      amount: priceInCents / 100,
      paypal_order_id: paypalOrder.id,
      payment_method: "paypal",
      status: "pending",
    });

    if (insertError) {
      console.error("Failed to store pending payment:", insertError);
      throw new Error(`Failed to store payment record: ${insertError.message}`);
    }

    return res.status(200).json({
      success: true,
      orderId: paypalOrder.id,
      approveUrl: approveLink.href,
    });
  } catch (error) {
    console.error("PayPal create order error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create PayPal order";
    return res.status(500).json({
      error: errorMessage,
      code: "PAYPAL_ORDER_CREATION_FAILED",
    });
  }
}

// Capture PayPal order and create subscription
export async function captureOrder(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid authorization header" });
    }

    const token = authHeader.slice(7);

    // Verify token with Supabase
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid authentication token" });
    }

    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Missing orderId" });
    }

    // Get pending payment details
    const { data: pendingPayment, error: fetchError } = await supabaseAdmin
      .from("pending_payments")
      .select("*")
      .eq("paypal_order_id", orderId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !pendingPayment) {
      return res.status(404).json({ 
        error: "Pending payment not found. The order may have expired or already been processed." 
      });
    }

    // Capture PayPal order
    const capturedOrder = await capturePayPalOrder(orderId);

    // Create subscription record
    const { error: subError } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_name: pendingPayment.plan_name,
        billing_cycle: pendingPayment.billing_cycle,
        price: pendingPayment.amount,
        status: "active",
        payment_method: "paypal",
        paypal_order_id: orderId,
        paypal_capture_id: capturedOrder.id,
        start_date: new Date().toISOString(),
        renewal_date: new Date(
          Date.now() +
            (pendingPayment.billing_cycle === "monthly"
              ? 30 * 24 * 60 * 60 * 1000
              : 365 * 24 * 60 * 60 * 1000)
        ).toISOString(),
      });

    if (subError) {
      console.error("Failed to create subscription:", subError);
      throw new Error(`Failed to create subscription: ${subError.message}`);
    }

    // Create payment history record
    const { error: historyError } = await supabaseAdmin.from("payment_history").insert({
      user_id: user.id,
      plan_name: pendingPayment.plan_name,
      amount: pendingPayment.amount,
      status: "succeeded",
      payment_method: "paypal",
      payment_intent_id: orderId,
      description: `${pendingPayment.plan_name} Plan - ${pendingPayment.billing_cycle}`,
      created_at: new Date().toISOString(),
    });

    if (historyError) {
      console.error("Failed to create payment history:", historyError);
      // Don't fail the whole transaction for this
    }

    // Update pending payment to completed
    const { error: updateError } = await supabaseAdmin
      .from("pending_payments")
      .update({ status: "completed" })
      .eq("id", pendingPayment.id);

    if (updateError) {
      console.error("Failed to update pending payment status:", updateError);
      // Don't fail the whole transaction for this
    }

    return res.status(200).json({
      success: true,
      subscription_id: `sub_paypal_${orderId}`,
      message: "Payment captured successfully and subscription activated",
      planName: pendingPayment.plan_name,
      billingCycle: pendingPayment.billing_cycle,
    });
  } catch (error) {
    console.error("PayPal capture error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to capture PayPal order";
    return res.status(500).json({
      error: errorMessage,
      code: "PAYPAL_CAPTURE_FAILED",
    });
  }
}

export default createOrder;
