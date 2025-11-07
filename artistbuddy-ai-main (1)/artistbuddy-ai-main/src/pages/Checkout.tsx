import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PaymentCheckout } from "@/components/PaymentCheckout";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const planName = searchParams.get("plan") || "Creator";
  const planPrice = searchParams.get("price") || "$29";
  const billingCycle = (searchParams.get("cycle") || "monthly") as "monthly" | "yearly";

  const handleSuccess = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-screen-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/pricing")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pricing
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Complete Your Subscription</h1>
          <p className="text-foreground/70">
            Join thousands of artists accelerating their careers with AURA
          </p>
        </div>

        <PaymentCheckout
          planName={planName}
          planPrice={planPrice}
          billingCycle={billingCycle}
          onSuccess={handleSuccess}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
