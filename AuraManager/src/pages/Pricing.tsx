import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Zap, Star, Crown } from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();

  const handlePlanSelect = (planName: string, price: string) => {
    navigate(`/checkout?plan=${encodeURIComponent(planName)}&price=${encodeURIComponent(price)}&cycle=monthly`);
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with AI-powered artist management",
      icon: Zap,
      features: [
        "Basic AI insights",
        "Up to 3 active goals",
        "Monthly reports",
        "Email support",
        "5GB storage",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Creator",
      price: "$29",
      period: "per month",
      description: "For growing artists ready to level up their career",
      icon: Star,
      features: [
        "Advanced AI recommendations",
        "Unlimited goals",
        "Weekly reports",
        "Priority support",
        "50GB storage",
        "Music platform integration",
        "Custom branding",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Pro",
      price: "$99",
      period: "per month",
      description: "For professional artists and labels managing multiple projects",
      icon: Crown,
      features: [
        "Everything in Creator",
        "Team collaboration (up to 5)",
        "Real-time analytics",
        "Daily insights",
        "Dedicated support",
        "500GB storage",
        "API access",
        "White-label options",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-screen-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Simple, Transparent Pricing</h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Choose the perfect plan to accelerate your music career with AI-powered insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, idx) => (
            <Card
              key={idx}
              className={`p-8 card-urban relative ${
                plan.popular ? "border-2 border-accent shadow-[var(--shadow-accent)]" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <plan.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-foreground/70"> / {plan.period}</span>
                </div>
                <p className="text-sm text-foreground/70">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handlePlanSelect(plan.name, plan.price)}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>

        {/* Enterprise */}
        <Card className="p-12 card-urban border-accent/20 text-center">
          <h3 className="text-3xl font-bold mb-4 text-foreground">Enterprise</h3>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            Custom solutions for labels, agencies, and large organizations managing multiple artists
          </p>
          <Button variant="outline" size="lg" onClick={() => console.log("Contact sales team")}>
            Contact Sales Team
          </Button>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;
