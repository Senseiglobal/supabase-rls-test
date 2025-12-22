import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreditCard, Shield, Loader } from "lucide-react";
import { useNotification, NotificationContainer } from "@/components/NotificationToast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentCheckoutProps {
  planName: string;
  planPrice: string;
  billingCycle: "monthly" | "yearly";
  onSuccess?: () => void;
}

// Price mapping for plans
const planPrices: Record<string, { monthly: number; yearly: number }> = {
  "Free": { monthly: 0, yearly: 0 },
  "Creator": { monthly: 2900, yearly: 29900 }, // in cents
  "Pro": { monthly: 9900, yearly: 99900 },
};

export function PaymentCheckout({ planName, planPrice, billingCycle, onSuccess }: PaymentCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const { notifications, removeNotification, success, error, info, warning } = useNotification();

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 16);
    const formatted = sanitized.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 4);
    if (sanitized.length >= 2) {
      const formatted = `${sanitized.slice(0, 2)}/${sanitized.slice(2)}`;
      setExpiryDate(formatted);
    } else {
      setExpiryDate(sanitized);
    }
  };

  // Validate card details
  const validateCardDetails = (): boolean => {
    if (!nameOnCard.trim()) {
      toast.error("Please enter name on card");
      return false;
    }
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      toast.error("Card number must be 16 digits");
      return false;
    }
    if (expiryDate.length !== 5) {
      toast.error("Invalid expiry date format (MM/YY)");
      return false;
    }
    if (cvc.length !== 3 && cvc.length !== 4) {
      toast.error("CVC must be 3 or 4 digits");
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (paymentMethod === "paypal") {
      return handlePayPalPayment();
    }
    
    if (!validateCardDetails()) return;
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to complete payment");
        setLoading(false);
        return;
      }

      const priceInCents = planPrices[planName]?.[billingCycle] || 0;
      
      // Call backend to process payment
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          planName,
          billingCycle,
          priceInCents,
          card: {
            number: cardNumber.replace(/\s/g, ""),
            exp_month: parseInt(expiryDate.split("/")[0]),
            exp_year: parseInt("20" + expiryDate.split("/")[1]),
            cvc: cvc,
            name: nameOnCard,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Payment failed");
      }

      const result = await response.json();

      // Create subscription record in Supabase
      const { error: dbError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: session.user.id,
          plan_name: planName,
          billing_cycle: billingCycle,
          price: priceInCents / 100,
          status: "active",
          stripe_subscription_id: result.subscription_id,
          start_date: new Date().toISOString(),
          renewal_date: new Date(Date.now() + (billingCycle === "monthly" ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000)).toISOString(),
        });

      if (dbError) throw dbError;

      toast.success(`✓ Subscription activated! Welcome to ${planName} plan.`);
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalPayment = async () => {
    setLoading(true);
    let toastId = info(
      "Initiating PayPal Payment",
      "Redirecting you to PayPal to complete your purchase...",
      0 // Don't auto-dismiss
    );

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        removeNotification(toastId);
        error("Authentication Required", "You must be logged in to complete payment");
        setLoading(false);
        return;
      }

      const priceInCents = planPrices[planName]?.[billingCycle] || 0;

      if (priceInCents <= 0) {
        removeNotification(toastId);
        warning("Free Plan", "This plan doesn't require payment. You can access it directly.");
        setTimeout(() => onSuccess?.(), 1000);
        return;
      }

      // Create PayPal order
      removeNotification(toastId);
      toastId = info(
        "Creating PayPal Order",
        `Creating order for ${planName} plan...`,
        0 // Don't auto-dismiss
      );

      const response = await fetch("/api/paypal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          planName,
          billingCycle,
          priceInCents,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        removeNotification(toastId);
        const errorMessage = errorData.error || "Failed to create PayPal order";
        error(
          "PayPal Order Failed",
          errorMessage,
          5000
        );
        setLoading(false);
        return;
      }

      const result = await response.json();

      if (!result.approveUrl) {
        removeNotification(toastId);
        error(
          "PayPal Error",
          "No approval URL received. Please try again.",
          5000
        );
        setLoading(false);
        return;
      }

      removeNotification(toastId);
      success(
        "Ready to Pay",
        "Redirecting you to PayPal in a moment...",
        2000
      );

      // Redirect to PayPal approval after a brief delay
      setTimeout(() => {
        window.location.href = result.approveUrl;
      }, 2000);
    } catch (err) {
      console.error("PayPal error:", err);
      removeNotification(toastId);
      const errorMessage = err instanceof Error ? err.message : "PayPal payment failed. Please try again.";
      error(
        "Payment Error",
        errorMessage,
        5000
      );
      setLoading(false);
    }
  };

  return (
    <>
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
      <div className="max-w-2xl mx-auto space-y-6">
      {/* Order Summary */}
      <Card className="p-6 card-urban border-accent/20">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Order Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-foreground/70">Plan</span>
            <span className="font-semibold text-foreground">{planName}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-foreground/70">Billing Cycle</span>
            <span className="font-semibold text-foreground capitalize">{billingCycle}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-lg font-semibold text-foreground">Total</span>
            <span className="text-2xl font-bold text-accent">{planPrice}</span>
          </div>
        </div>
      </Card>

      {/* Payment Method Selection */}
      <Card className="p-6 card-urban">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Payment Method</h3>
        <div className="space-y-3">
          <div
            onClick={() => setPaymentMethod("card")}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              paymentMethod === "card" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                paymentMethod === "card" ? "border-accent bg-accent" : "border-border"
              }`} />
              <div>
                <p className="font-semibold text-foreground">Credit/Debit Card</p>
                <p className="text-sm text-foreground/70">Visa, Mastercard, American Express</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setPaymentMethod("paypal")}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              paymentMethod === "paypal" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                paymentMethod === "paypal" ? "border-accent bg-accent" : "border-border"
              }`} />
              <div>
                <p className="font-semibold text-foreground">PayPal</p>
                <p className="text-sm text-foreground/70">Fast and secure checkout</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Card Payment Form */}
      {paymentMethod === "card" && (
        <Card className="p-6 card-urban">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="h-5 w-5 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">Card Details</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nameOnCard">Name on Card</Label>
              <Input
                id="nameOnCard"
                placeholder="John Doe"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                className="mt-1"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => formatCardNumber(e.target.value)}
                className="mt-1 font-mono"
                disabled={loading}
                maxLength={19}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is a demo. In production, use Stripe.js for secure card handling.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => formatExpiryDate(e.target.value)}
                  className="mt-1 font-mono"
                  disabled={loading}
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="mt-1 font-mono"
                  disabled={loading}
                  maxLength={4}
                  type="password"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* PayPal Info */}
      {paymentMethod === "paypal" && (
        <Card className="p-6 card-urban bg-blue-500/5 border-blue-500/20">
          <p className="text-sm text-foreground/80">
            You will be redirected to PayPal to complete your payment securely. Your subscription will be activated immediately after confirmation.
          </p>
        </Card>
      )}

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-sm text-foreground/70 justify-center">
        <Shield className="h-4 w-4 text-accent" />
        <span>Secure payment processing via {paymentMethod === "paypal" ? "PayPal" : "Stripe"}</span>
      </div>

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full h-12 text-lg flex items-center justify-center gap-2"
        size="lg"
      >
        {loading && <Loader className="h-5 w-5 animate-spin" />}
        {loading 
          ? (paymentMethod === "paypal" ? "Redirecting to PayPal..." : "Processing Payment...")
          : `Pay ${planPrice} with ${paymentMethod === "paypal" ? "PayPal" : "Card"}`}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By confirming your subscription, you agree to our Terms of Service and Privacy Policy.
        Your subscription will auto-renew {billingCycle}.
      </p>
      </div>
    </>
  );
}
