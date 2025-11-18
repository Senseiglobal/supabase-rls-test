import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp, BarChart3, Brain } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header showAuth />
      {/* Sleek Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Minimal Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/95">
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 container mx-auto px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Brand */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <img 
                src="/icons/dark_icon_512.png" 
                alt="Aura" 
                className="w-12 h-12 dark:hidden" 
              />
              <img 
                src="/icons/light_icon_512.png" 
                alt="Aura" 
                className="w-12 h-12 hidden dark:block" 
              />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Aura Manager
              </h1>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h2 className="text-5xl md:text-7xl font-light text-foreground leading-tight">
                Your AI Artist
                <br />
                <span className="font-bold text-accent">Manager</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-foreground/70 max-w-2xl mx-auto font-light">
                Get personalized strategies, audience insights, and creative direction that works 24/7
              </p>
            </div>
            
            {/* Single CTA */}
            <div className="pt-8">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")} 
                className="text-lg px-12 py-4 bg-accent hover:bg-accent-hover transition-all duration-300"
              >
                Get Started Free
              </Button>
            </div>

            {/* Minimal Trust Indicator */}
            <p className="text-sm text-foreground/60 pt-4">
              No credit card required • Free forever plan
            </p>
          </div>
        </div>
      </div>

      {/* Simple Features */}
      <div className="container mx-auto px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-2xl md:text-3xl font-light text-foreground/80 mb-8">
              What you get
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <Brain className="h-8 w-8 text-accent mx-auto" />
              <h4 className="text-lg font-medium text-foreground">AI Strategy</h4>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Personalized release plans and marketing strategies
              </p>
            </div>
            
            <div className="space-y-4">
              <TrendingUp className="h-8 w-8 text-accent mx-auto" />
              <h4 className="text-lg font-medium text-foreground">Analytics</h4>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Track performance and audience insights
              </p>
            </div>
            
            <div className="space-y-4">
              <BarChart3 className="h-8 w-8 text-accent mx-auto" />
              <h4 className="text-lg font-medium text-foreground">Growth</h4>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Smart recommendations to grow your fanbase
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default Index;
