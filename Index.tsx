import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Music2, Sparkles, TrendingUp, Users, Target, MessageSquare, ArrowRight } from "lucide-react";
const Index = () => {
  const navigate = useNavigate();
  const features = [{
    icon: MessageSquare,
    title: "24/7 AI Manager",
    description: "Get personalized creative direction and strategy advice whenever you need it"
  }, {
    icon: TrendingUp,
    title: "Data-Driven Insights",
    description: "Understand your audience and performance with actionable AI-powered recommendations"
  }, {
    icon: Target,
    title: "Smart Goal Tracking",
    description: "Set ambitious goals and get AI-generated action plans to achieve them"
  }, {
    icon: Users,
    title: "Audience Analytics",
    description: "Deep dive into listener behavior, demographics, and engagement patterns"
  }];
  return <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-success/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in my-[10px]">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-success rounded-3xl flex items-center justify-center mb-8 animate-scale-in">
            <Music2 className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Your AI-Powered
            <span className="block gradient-text py-[20px] my-[0px]">Artist Manager</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get personalized creative direction, release strategies, and audience insights from an AI manager that works 24/7 - no trust issues, no high fees.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="bg-gradient-to-r from-primary to-success hover:opacity-90 text-lg px-8" onClick={() => navigate("/auth")}>
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => navigate("/auth")}>
              <Sparkles className="mr-2 h-5 w-5" />
              See Demo
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              Free forever plan
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mt-32">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Manage Your Music Career
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => <div key={idx} className="bg-card p-8 rounded-2xl shadow-[var(--shadow-card)] card-hover animate-slide-up" style={{
            animationDelay: `${idx * 0.1}s`
          }}>
                <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-success/10 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>)}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-32 text-center space-y-6 bg-gradient-to-br from-primary to-success p-12 rounded-3xl text-white shadow-2xl animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to level up your music career?
          </h2>
          <p className="text-lg opacity-90">
            Join thousands of artists using AI to make smarter decisions and grow faster.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 mt-6" onClick={() => navigate("/auth")}>
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>;
};
export default Index;