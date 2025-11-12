import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Shield, Check } from "lucide-react";
import { toast } from "sonner";

interface PaymentCheckoutProps {
  planName: string;
  planPrice: string;
  billingCycle: "monthly" | "yearly";
  onSuccess?: () => void;
}

export function PaymentCheckout({ planName, planPrice, billingCycle, onSuccess }: PaymentCheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    // This is a placeholder - actual payment integration happens after export
    // You'll integrate Stripe/PayPal SDKs here
    try {
      toast.info(`Payment method: ${paymentMethod}. Integration needed after export.`);
      
      // After successful payment, you would:
      // 1. Create subscription record in Supabase
      // 2. Create payment history record
      // 3. Generate and email invoice
      // 4. Call onSuccess callback
      
      setTimeout(() => {
        toast.success("Ready for payment integration!");
        onSuccess?.();
        setLoading(false);
      }, 1500);
    } catch (error) {
      toast.error("Payment setup error");
      setLoading(false);
    }
  };

  return (
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
        <RadioGroup value={paymentMethod} onValueChange={(value: "stripe" | "paypal") => setPaymentMethod(value)}>
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
              paymentMethod === "stripe" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
            }`}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="stripe" id="stripe" />
                <Label htmlFor="stripe" className="cursor-pointer flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-accent" />
                    <span className="font-semibold text-foreground">Credit/Debit Card</span>
                  </div>
                </Label>
              </div>
              {paymentMethod === "stripe" && <Check className="h-5 w-5 text-accent" />}
            </div>

            <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
              paymentMethod === "paypal" ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
            }`}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="cursor-pointer flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#00457C">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852a.932.932 0 0 1 .922-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.72-4.46z"/>
                    </svg>
                    <span className="font-semibold text-foreground">PayPal</span>
                  </div>
                </Label>
              </div>
              {paymentMethod === "paypal" && <Check className="h-5 w-5 text-accent" />}
            </div>
          </div>
        </RadioGroup>

        {paymentMethod === "stripe" && (
          <div className="mt-6 space-y-4 animate-fade-in">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                className="mt-1"
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Stripe integration required after export
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  className="mt-1"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  className="mt-1"
                  disabled
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "paypal" && (
          <div className="mt-6 p-4 bg-secondary/30 rounded-lg border border-border animate-fade-in">
            <p className="text-sm text-foreground/70">
              You'll be redirected to PayPal to complete your payment securely.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              PayPal integration required after export
            </p>
          </div>
        )}
      </Card>

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-sm text-foreground/70 justify-center">
        <Shield className="h-4 w-4 text-accent" />
        <span>Secure payment processing via {paymentMethod === "stripe" ? "Stripe" : "PayPal"}</span>
      </div>

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full h-12 text-lg"
        size="lg"
      >
        {loading ? "Processing..." : `Pay ${planPrice}`}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By confirming your subscription, you agree to our Terms of Service and Privacy Policy.
        Your subscription will auto-renew {billingCycle}.
      </p>
    </div>
  );
}
