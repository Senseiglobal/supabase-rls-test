import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Music, Target, Sparkles, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [artistName, setArtistName] = useState("");
  const [genre, setGenre] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [aiPersonality, setAiPersonality] = useState("friendly");
  const navigate = useNavigate();

  const goalOptions = [
    { id: "grow", label: "Grow my fanbase" },
    { id: "release", label: "Release more music" },
    { id: "playlist", label: "Get playlisted" },
    { id: "tour", label: "Book shows/tours" },
    { id: "social", label: "Build social media presence" },
  ];

  const handleGoalToggle = (goalId: string) => {
    setGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleComplete = () => {
    toast.success("Welcome! Setting up your AI manager...");
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-success/5 p-4">
      <Card className="w-full max-w-2xl shadow-xl animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-16 rounded-full transition-colors ${
                    s <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Step {step} of 4</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center gap-2 mb-2">
                <Music className="h-5 w-5 text-primary" />
                <CardTitle>Tell us about your music</CardTitle>
              </div>
              <div className="space-y-2">
                <Label htmlFor="artistName">Artist Name</Label>
                <Input
                  id="artistName"
                  placeholder="Your stage name"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Primary Genre</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pop">Pop</SelectItem>
                    <SelectItem value="hiphop">Hip Hop</SelectItem>
                    <SelectItem value="electronic">Electronic</SelectItem>
                    <SelectItem value="rock">Rock</SelectItem>
                    <SelectItem value="indie">Indie</SelectItem>
                    <SelectItem value="rnb">R&B</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>What are your main goals?</CardTitle>
              </div>
              <CardDescription>Select all that apply</CardDescription>
              <div className="space-y-3">
                {goalOptions.map((goal) => (
                  <div key={goal.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={goal.id}
                      checked={goals.includes(goal.id)}
                      onCheckedChange={() => handleGoalToggle(goal.id)}
                    />
                    <Label
                      htmlFor={goal.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {goal.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Choose your AI manager style</CardTitle>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "professional", icon: "🎩", label: "Professional" },
                  { value: "friendly", icon: "😊", label: "Friendly" },
                  { value: "direct", icon: "🎯", label: "Direct" },
                  { value: "motivational", icon: "💪", label: "Motivational" },
                ].map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setAiPersonality(style.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      aiPersonality === style.value
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-3xl mb-2">{style.icon}</div>
                    <div className="font-medium">{style.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-slide-up text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-success rounded-3xl flex items-center justify-center mb-4">
                <Music className="h-10 w-10 text-white" />
              </div>
              <CardTitle>Connect your Spotify for Artists</CardTitle>
              <CardDescription>
                Link your Spotify account to get personalized insights and track your performance.
                We'll analyze your streams, saves, and audience data to provide AI-powered recommendations.
              </CardDescription>
              <Button className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white">
                Connect Spotify
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleComplete}
              >
                Skip for now
              </Button>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 && step < 4 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step < 4 && (
              <Button
                className="ml-auto"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && (!artistName || !genre)}
              >
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
