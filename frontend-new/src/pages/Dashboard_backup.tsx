import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConnectSpotify } from "@/components/ConnectSpotify";
import {
  Users,
  TrendingUp,
  Target,
  Music,
  Instagram,
  MessageSquare,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Trophy,
  LayoutGrid,
  LayoutList,
  Layers,
} from "lucide-react";

const Dashboard = () => {
  const [filter, setFilter] = useState<"all" | "unread" | "urgent">("all");
  const [viewMode, setViewMode] = useState<"easy" | "compact" | "professional">("easy");

  // DEMO DATA - Replace with Supabase data later
  const stats = [
    {
      label: "Monthly Listeners",
      value: "12,847",
      change: "+15%",
      icon: Users,
      trend: "up",
    },
    {
      label: "Total Followers",
      value: "24.3K",
      change: "+8%",
      icon: Instagram,
      trend: "up",
    },
    {
      label: "Active Goals",
      value: "3",
      change: "On track",
      icon: Target,
      trend: "neutral",
    },
    {
      label: "New Insights",
      value: "5",
      change: "This week",
      icon: Sparkles,
      trend: "neutral",
    },
  ];

  const insights = [
    {
      id: 1,
      type: "opportunity",
      priority: "high",
      title: "Peak posting time detected",
      summary: "Your audience is most active between 7-9 PM EST. Consider posting your next single announcement during this window.",
      category: "Marketing Strategy",
      timestamp: "2 hours ago",
      read: false,
      icon: TrendingUp,
    },
    {
      id: 2,
      type: "achievement",
      priority: "medium",
      title: "Milestone reached!",
      summary: "Your latest single 'Midnight Dreams' just hit 10K streams. This is 40% faster than your previous release.",
      category: "Performance",
      timestamp: "5 hours ago",
      read: false,
      icon: Trophy,
    },
    {
      id: 3,
      type: "advice",
      priority: "medium",
      title: "Content consistency opportunity",
      summary: "Artists in your genre who post 3-4 Reels per week see 2x more Spotify clicks. You're currently at 1-2 per week.",
      category: "Social Media",
      timestamp: "1 day ago",
      read: true,
      icon: MessageSquare,
    },
    {
      id: 4,
      type: "warning",
      priority: "urgent",
      title: "Release momentum slowing",
      summary: "Streams for 'Summer Nights' dropped 30% this week. Consider running a TikTok campaign or playlist push.",
      category: "Release Strategy",
      timestamp: "1 day ago",
      read: false,
      icon: AlertCircle,
    },
  ];

  const activeGoals = [
    {
      id: 1,
      title: "Reach 5K streams in first week",
      current: 3847,
      target: 5000,
      progress: 77,
      status: "on-track",
      daysLeft: 3,
    },
    {
      id: 2,
      title: "Gain 1,000 Instagram followers",
      current: 687,
      target: 1000,
      progress: 69,
      status: "behind",
      daysLeft: 10,
    },
    {
      id: 3,
      title: "Get added to 10 editorial playlists",
      current: 6,
      target: 10,
      progress: 60,
      status: "ahead",
      daysLeft: 15,
    },
  ];

  const filteredInsights = insights.filter((insight) => {
    if (filter === "unread") return !insight.read;
    if (filter === "urgent") return insight.priority === "urgent";
    return true;
  });

  return (
    <div className="min-h-screen w-full">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* Header - GOV.UK inspired clarity */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  Your music dashboard
                </h1>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Track your progress and discover new opportunities to grow your audience
                </p>
              </div>
              
              {/* View Controls - Accessible and clear */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 p-1 bg-secondary rounded-[var(--radius)] border border-border shadow-[var(--shadow-sm)]">
                  <Button
                    variant={viewMode === "easy" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("easy")}
                    className="gap-2"
                    title="Simple view with key information"
                    aria-label="Switch to easy view mode"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="hidden lg:inline">Simple</span>
                  </Button>
                  <Button
                    variant={viewMode === "compact" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("compact")}
                    className="gap-2"
                    title="Compact view for efficiency"
                    aria-label="Switch to compact view mode"
                  >
                    <LayoutList className="h-4 w-4" />
                    <span className="hidden lg:inline">Compact</span>
                  </Button>
                  <Button
                    variant={viewMode === "professional" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("professional")}
                    className="gap-2"
                    title="Detailed view for professionals"
                    aria-label="Switch to professional view mode"
                  >
                    <Layers className="h-4 w-4" />
                    <span className="hidden lg:inline">Detailed</span>
                  </Button>
                </div>
                              <Button 
                  variant="accent" 
                  className="font-medium"
                  title="Get AI-powered music industry advice"
                  aria-label="Open AI manager assistant"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span className="hidden md:inline">Ask AI Manager</span>
                  <span className="md:hidden">AI</span>
                </Button>
              </div>
            </div>
          </div>

        {/* Key Metrics - Clear and accessible */}
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">Key metrics</h2>
          <div className={`grid gap-4 ${
            viewMode === "easy" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" 
              : viewMode === "compact"
              ? "grid-cols-2 lg:grid-cols-4"
              : "grid-cols-2 lg:grid-cols-4"
          }`}>
            {stats.map((stat, idx) => (
              <Card
                key={stat.label}
                className="cursor-pointer transition-all duration-200 hover:scale-[1.02] focus-within:shadow-[var(--shadow-focus)]"
                tabIndex={0}
                role="button"
                aria-label={`${stat.label}: ${stat.value}, ${stat.change}`}
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-10 h-10 rounded-[var(--radius)] flex items-center justify-center ${
                        stat.trend === "up" ? "bg-success/10" : "bg-primary/10"
                      }`}
                    >
                      <stat.icon
                        className={`h-5 w-5 ${
                          stat.trend === "up" ? "text-success" : "text-primary"
                        }`}
                      />
                    </div>
                    <Badge 
                      variant="secondary"
                      className={`text-xs font-medium ${
                        stat.trend === "up" 
                          ? "bg-success/10 text-success border-success/20" 
                          : "bg-primary/10 text-primary border-primary/20"
                      }`}
                    >
                      {stat.change}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-foreground leading-tight">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      {stat.label}
                    </div>
                  </div>
                </div>
            </Card>
          ))}
        </div>

        {/* Active Goals - Clear progress tracking */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-semibold text-foreground">Your goals</h2>
            <Button 
              variant="ghost" 
              size="sm"
              className="font-medium"
              aria-label="View all goals"
            >
              View all
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className={`grid gap-4 ${
            viewMode === "easy" 
              ? "grid-cols-1 md:grid-cols-3" 
              : viewMode === "compact"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}>
            {activeGoals.map((goal, idx) => (
              <Card 
                key={goal.id} 
                className={`${viewMode === "compact" ? "p-4" : viewMode === "professional" ? "p-5" : "p-6"} card-hover animate-slide-up bg-card border-border`}
                style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
              >
                <div className={`space-y-${viewMode === "compact" ? "3" : "4"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-semibold ${viewMode === "compact" ? "text-sm" : "text-base"} line-clamp-2 text-foreground flex-1`}>
                      {goal.title}
                    </h3>
                    <Badge 
                      variant={goal.status === "on-track" ? "default" : goal.status === "ahead" ? "secondary" : "outline"}
                      className={`${viewMode === "compact" ? "text-xs px-2 py-0.5" : "text-xs"} whitespace-nowrap flex-shrink-0`}
                    >
                      {viewMode === "compact" ? goal.status.charAt(0).toUpperCase() : goal.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Progress value={goal.progress} className={viewMode === "compact" ? "h-2" : "h-2.5"} />
                    <div className={`flex justify-between ${viewMode === "compact" ? "text-xs" : "text-sm"} font-medium`}>
                      <span className="text-foreground">
                        {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">{goal.daysLeft}d left</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Insights - Smart recommendations */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="text-lg md:text-xl font-semibold text-foreground">AI recommendations</h2>
            </div>
            
            <div className="flex gap-2" role="group" aria-label="Filter recommendations">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                aria-pressed={filter === "all"}
                className="font-medium"
              >
                All
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
                aria-pressed={filter === "unread"}
                className="font-medium"
              >
                Unread
              </Button>
              <Button
                variant={filter === "urgent" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("urgent")}
                aria-pressed={filter === "urgent"}
                className="font-medium"
              >
                Urgent
              </Button>
            </div>
          </div>

          <div className={`${viewMode === "compact" ? "space-y-2" : "space-y-4"}`}>
            {filteredInsights.map((insight, idx) => (
              <Card
                key={insight.id}
                className={`${viewMode === "compact" ? "p-4" : viewMode === "professional" ? "p-5" : "p-6"} card-hover cursor-pointer transition-all ${
                  !insight.read ? "border-l-4 border-l-primary" : ""
                } animate-fade-in`}
                style={{ animationDelay: `${0.5 + idx * 0.05}s` }}
              >
                <div className={`flex gap-${viewMode === "compact" ? "3" : "4"}`}>
                  {viewMode !== "compact" && (
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        insight.type === "achievement"
                          ? "bg-success/10"
                          : insight.type === "warning"
                          ? "bg-danger/10"
                          : "bg-primary/10"
                      }`}
                    >
                      <insight.icon
                        className={`h-6 w-6 ${
                          insight.type === "achievement"
                            ? "text-success"
                            : insight.type === "warning"
                            ? "text-danger"
                            : "text-primary"
                        }`}
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {viewMode === "compact" && (
                          <insight.icon
                            className={`h-4 w-4 flex-shrink-0 ${
                              insight.type === "achievement"
                                ? "text-success"
                                : insight.type === "warning"
                                ? "text-danger"
                                : "text-primary"
                            }`}
                          />
                        )}
                        <h3 className={`font-semibold text-foreground ${viewMode === "compact" ? "text-sm" : ""}`}>
                          {insight.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="shrink-0">
                          {viewMode === "compact" ? insight.priority.charAt(0).toUpperCase() : insight.priority}
                        </Badge>
                        {viewMode !== "compact" && <Badge variant="outline">{insight.category}</Badge>}
                      </div>
                    </div>
                    {viewMode !== "compact" && (
                      <p className="text-sm text-foreground/70 leading-relaxed">
                        {insight.summary}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <span className={`${viewMode === "compact" ? "text-[10px]" : "text-xs"} text-foreground/60`}>
                        {insight.timestamp}
                      </span>
                      {viewMode !== "compact" && (
                        <div className="flex gap-2">
                          {!insight.read && (
                            <Button size="sm" variant="ghost">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Read
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Tell me more
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Integrations - Connected services */}
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">Connected services</h2>
          <ConnectSpotify />
        </div>
      </div>
    </div>
  </div>
  );
};

export default Dashboard;

