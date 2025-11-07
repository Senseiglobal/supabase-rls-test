import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Music2, Target, Sparkles, ArrowRight, ArrowLeft, Check, 
  TrendingUp, Calendar, MessageSquare, BarChart3, Brain, Zap 
} from "lucide-react";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [genre, setGenre] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const navigate = useNavigate();

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const genres = ["Pop", "Hip Hop", "R&B", "Rock", "Electronic", "Country", "Jazz", "Classical", "Afrobeats", "Gospel", "Other"];
  
  const useCases = [
    { 
      id: "strategy", 
      title: "Release Strategy", 
      description: "Get AI-powered release plans and marketing strategies",
      icon: Brain 
    },
    { 
      id: "analytics", 
      title: "Performance Analytics", 
      description: "Track streams, engagement, and audience growth in real-time",
      icon: TrendingUp 
    },
    { 
      id: "planning", 
      title: "Career Planning", 
      description: "Set goals and get step-by-step action plans to achieve them",
      icon: Calendar 
    },
    { 
      id: "insights", 
      title: "Audience Insights", 
      description: "Understand your listeners and create music that resonates",
      icon: BarChart3 
    },
    { 
      id: "chat", 
      title: "24/7 AI Guidance", 
      description: "Ask questions and get expert advice anytime you need it",
      icon: MessageSquare 
    },
    { 
      id: "optimize", 
      title: "Content Optimization", 
      description: "Optimize your social media and promotional content for maximum impact",
      icon: Zap 
    },
  ];

  const goalOptions = [
    { id: "streams", label: "Increase Streams", icon: Music2 },
    { id: "followers", label: "Grow Followers", icon: Target },
    { id: "engagement", label: "Boost Engagement", icon: Sparkles },
    { id: "releases", label: "Plan Releases", icon: Calendar },
  ];

  const toggleUseCase = (useCaseId: string) => {
    setSelectedUseCases(prev => 
      prev.includes(useCaseId) 
        ? prev.filter(u => u !== useCaseId)
        : [...prev, useCaseId]
    );
  };

  const toggleGoal = (goalId: string) => {
    setGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--gradient-urban)] bg-fixed">
      {/* Theme Toggle - Fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-2xl card-urban border-accent/20 animate-scale-in">
        {/* Header */}
        <div className="p-8 border-b border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-sedimentary-base rounded-lg flex items-center justify-center">
                <Music2 className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold brand-text">Welcome to AURA</h1>
                <p className="text-sm text-foreground/70">Let's get you set up</p>
              </div>
            </div>
            <Button variant="ghost" onClick={handleSkip} className="text-foreground/70">
              Skip
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/70">Step {step} of {totalSteps}</span>
              <span className="font-semibold text-accent">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 text-foreground">Tell us about yourself</h2>
                <p className="text-foreground/70">Help us personalize your experience</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Artist / Band Name</Label>
                  <Input 
                    id="displayName"
                    placeholder="Your stage name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 text-foreground">What's your genre?</h2>
                <p className="text-foreground/70">Select your primary music genre</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenre(g)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      genre === g 
                        ? "border-accent bg-accent/10 text-foreground" 
                        : "border-border bg-secondary/30 text-foreground/70 hover:border-accent/50"
                    }`}
                  >
                    <span className="font-semibold">{g}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 text-foreground">What are your goals?</h2>
                <p className="text-foreground/70">Select all that apply</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goalOptions.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`p-6 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      goals.includes(goal.id)
                        ? "border-accent bg-accent/10"
                        : "border-border bg-secondary/30 hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <goal.icon className={`h-6 w-6 ${goals.includes(goal.id) ? "text-accent" : "text-foreground/50"}`} />
                      {goals.includes(goal.id) && (
                        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                          <Check className="h-4 w-4 text-accent-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="font-semibold text-left text-foreground">{goal.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 text-foreground">How will you use AURA?</h2>
                <p className="text-foreground/70">Select the features you're most interested in</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {useCases.map((useCase) => (
                  <button
                    key={useCase.id}
                    onClick={() => toggleUseCase(useCase.id)}
                    className={`p-5 rounded-lg border-2 transition-all duration-200 hover:scale-105 text-left ${
                      selectedUseCases.includes(useCase.id)
                        ? "border-accent bg-accent/10"
                        : "border-border bg-secondary/30 hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedUseCases.includes(useCase.id) ? "bg-accent/20" : "bg-foreground/5"
                      }`}>
                        <useCase.icon className={`h-5 w-5 ${
                          selectedUseCases.includes(useCase.id) ? "text-accent" : "text-foreground/50"
                        }`} />
                      </div>
                      {selectedUseCases.includes(useCase.id) && (
                        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                          <Check className="h-4 w-4 text-accent-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="font-semibold text-foreground mb-1">{useCase.title}</div>
                    <div className="text-xs text-foreground/60">{useCase.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-fade-in text-center">
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Sparkles className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-3xl font-bold mb-2 text-foreground">You're all set!</h2>
              <p className="text-foreground/70 max-w-md mx-auto">
                AURA is now customizing your dashboard based on your preferences. 
                Get ready to take your music career to the next level with AI-powered insights!
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-8">
                <div className="p-4 rounded-lg bg-accent/10 hover:bg-accent/20 transition-all duration-200 hover:scale-105">
                  <div className="text-2xl font-bold text-accent">24/7</div>
                  <div className="text-xs text-foreground/70">AI Assistant</div>
                </div>
                <div className="p-4 rounded-lg bg-success/10 hover:bg-success/20 transition-all duration-200 hover:scale-105">
                  <div className="text-2xl font-bold text-success">Real-time</div>
                  <div className="text-xs text-foreground/70">Analytics</div>
                </div>
                <div className="p-4 rounded-lg bg-sedimentary-base/10 hover:bg-sedimentary-base/20 transition-all duration-200 hover:scale-105">
                  <div className="text-2xl font-bold text-sedimentary-dark">Smart</div>
                  <div className="text-xs text-foreground/70">Insights</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-border flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            disabled={step === 1}
            className={step === 1 ? "invisible" : ""}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleNext}>
            {step === totalSteps ? "Go to Dashboard" : "Continue"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;

