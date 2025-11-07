import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Music2, Sparkles, TrendingUp, Users, Target, MessageSquare, ArrowRight, Zap, Calendar, BarChart3, Brain } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  const features = [{
    icon: Brain,
    title: "AI-Powered Strategy",
    description: "Get personalized release plans, marketing strategies, and creative direction from an AI that understands your unique sound and goals"
  }, {
    icon: TrendingUp,
    title: "Real-Time Analytics",
    description: "Track streams, engagement, and audience growth across all platforms with AI-generated insights and actionable recommendations"
  }, {
    icon: MessageSquare,
    title: "24/7 AI Manager Chat",
    description: "Ask questions, get advice, and strategize any time - your AI manager never sleeps and always has your back"
  }, {
    icon: Target,
    title: "Smart Goal Planning",
    description: "Set ambitious career goals and get AI-generated step-by-step action plans with timeline tracking and progress monitoring"
  }, {
    icon: Calendar,
    title: "Release Strategy",
    description: "Optimize your release timing, playlist pitching, and promotional campaigns with data-driven AI recommendations"
  }, {
    icon: BarChart3,
    title: "Audience Insights",
    description: "Understand listener demographics, behavior patterns, and preferences to create music that resonates and grows your fanbase"
  }];

  return <div className="min-h-screen">
      <Header showAuth={true} />
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-block">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent">AI-Powered Artist Management</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Your AI Artist Manager,<br />
            <span className="brand-text">Always in Your Corner</span>
          </h1>
          
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Get personalized creative direction, release strategies, and audience insights from an AI manager that works 24/7 - no trust issues, no high fees, just results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-base">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-base">
              <Sparkles className="mr-2 h-5 w-5" />
              See Demo
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-foreground/70">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              Free forever plan
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mt-32" id="features">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-sedimentary-base/10 border border-sedimentary-base/20">
                <Zap className="h-4 w-4 text-sedimentary-dark" />
                <span className="text-sm font-semibold text-sedimentary-dark">Powerful Features</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              From strategy to analytics, AURA gives you the tools professional artists use to build their careers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="card-urban p-8 card-hover animate-slide-up group"
                style={{
                  animationDelay: `${idx * 0.1}s`
                }}
              >
                <div className="w-14 h-14 bg-accent/10 border border-accent/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/20 mx-auto group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-center text-foreground">{feature.title}</h3>
                <p className="text-foreground/70 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-32 text-center space-y-6 card-urban p-12 animate-fade-in border-accent/30 hover:border-accent/50">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Ready to level up your music career?
          </h2>
          <p className="text-lg text-foreground/70">
            Join thousands of artists using AI to make smarter decisions and grow faster.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="mt-6 text-base">
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <Footer />
    </div>;
};

export default Index;
