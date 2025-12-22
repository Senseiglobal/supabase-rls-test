import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// PayPal API configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const PAYPAL_API_BASE = "https://api.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal credentials not configured");
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
    throw new Error("Failed to authenticate with PayPal");
  }

  const data = await response.json();
  return data.access_token;
}

async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v1/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Capture failed" }));
    throw new Error(error.message || "Failed to capture PayPal order");
  }

  const capture = await response.json();
  return capture;
}

export default async function handler(req: any, res: any) {
  // Support both GET (for redirect) and POST (for API call)
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token } = req.query || req.body;

    if (!token) {
      return res.status(400).json({ error: "Missing token from Supabase auth" });
    }

    // For GET requests from PayPal redirect, extract orderId from query
    const { orderId } = req.query || {};

    if (!orderId) {
      return res.status(400).json({ error: "Missing PayPal order ID" });
    }

    // Verify token with Supabase
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      // If no valid token, redirect to login
      return res.redirect(302, `/login?return_to=/checkout/paypal/return?orderId=${orderId}`);
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
        success: false,
        error: "Payment record not found",
      });
    }

    // Capture PayPal order
    const capturedOrder = await capturePayPalOrder(orderId);

    // Create subscription record
    const { error: subError } = await supabaseAdmin.from("subscriptions").insert({
      user_id: user.id,
      plan_name: pendingPayment.plan_name,
      billing_cycle: pendingPayment.billing_cycle,
      price: pendingPayment.amount,
      status: "active",
      payment_method: "paypal",
      paypal_order_id: orderId,
      paypal_capture_id: capturedOrder.id,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(
        Date.now() +
          (pendingPayment.billing_cycle === "monthly"
            ? 30 * 24 * 60 * 60 * 1000
            : 365 * 24 * 60 * 60 * 1000)
      ).toISOString(),
    });

    if (subError) {
      console.error("Subscription creation error:", subError);
      throw new Error(`Failed to create subscription: ${subError.message}`);
    }

    // Create payment history record
    const { error: historyError } = await supabaseAdmin.from("payment_history").insert({
      user_id: user.id,
      plan_name: pendingPayment.plan_name,
      amount: pendingPayment.amount,
      currency: "USD",
      status: "succeeded",
      payment_method: "paypal",
      payment_intent_id: orderId,
      description: `${pendingPayment.plan_name} Plan - ${pendingPayment.billing_cycle}`,
      created_at: new Date().toISOString(),
    });

    if (historyError) {
      console.error("Payment history creation error:", historyError);
      // Don't fail the transaction for this non-critical operation
    }

    // Update pending payment to completed
    const { error: updateError } = await supabaseAdmin
      .from("pending_payments")
      .update({ status: "completed" })
      .eq("id", pendingPayment.id);

    if (updateError) {
      console.error("Pending payment update error:", updateError);
      // Don't fail the transaction for this non-critical operation
    }

    // Return success response
    return res.status(200).json({
      success: true,
      subscription_id: `sub_paypal_${orderId}`,
      message: "Payment captured successfully and subscription activated",
      planName: pendingPayment.plan_name,
      billingCycle: pendingPayment.billing_cycle,
      redirectUrl: "/dashboard",
    });
  } catch (error) {
    console.error("PayPal return handler error:", error);
    const errorMessage = error instanceof Error ? error.message : "Payment processing failed";

    return res.status(500).json({
      success: false,
      error: errorMessage,
      code: "PAYPAL_RETURN_FAILED",
      redirectUrl: "/checkout/paypal/cancel",
    });
  }
}
