import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Mock Stripe processing - In production, use actual Stripe API
async function processPaymentWithStripe(paymentData: {
  card: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
    name: string;
  };
  planName: string;
  billingCycle: string;
  priceInCents: number;
  userId: string;
}) {
  try {
    // In production, call Stripe API here:
    // const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({...});

    // For now, simulate successful payment
    console.log("Processing payment:", {
      amount: paymentData.priceInCents,
      plan: paymentData.planName,
      user: paymentData.userId,
    });

    // Generate mock subscription ID
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      subscription_id: subscriptionId,
      payment_id: `pi_${Date.now()}`,
    };
  } catch (error) {
    console.error("Payment processing error:", error);
    throw new Error("Payment processing failed");
  }
}

// Main payment handler
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.slice(7);

    // Verify token with Supabase
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { planName, billingCycle, priceInCents, card } = req.body;

    if (!planName || !billingCycle || !card) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Process payment
    const paymentResult = await processPaymentWithStripe({
      card,
      planName,
      billingCycle,
      priceInCents,
      userId: user.id,
    });

    // Create subscription record in Supabase
    const { error: dbError } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_name: planName,
        billing_cycle: billingCycle,
        price: priceInCents / 100,
        status: "active",
        stripe_subscription_id: paymentResult.subscription_id,
        payment_id: paymentResult.payment_id,
        start_date: new Date().toISOString(),
        renewal_date: new Date(
          Date.now() +
            (billingCycle === "monthly"
              ? 30 * 24 * 60 * 60 * 1000
              : 365 * 24 * 60 * 60 * 1000)
        ).toISOString(),
      });

    if (dbError) {
      throw dbError;
    }

    // Create payment history record
    await supabaseAdmin.from("payment_history").insert({
      user_id: user.id,
      plan_name: planName,
      amount: priceInCents / 100,
      status: "completed",
      stripe_payment_id: paymentResult.payment_id,
      paid_at: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      subscription_id: paymentResult.subscription_id,
      message: "Payment processed successfully",
    });
  } catch (error) {
    console.error("Payment API error:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Payment processing failed",
    });
  }
}
