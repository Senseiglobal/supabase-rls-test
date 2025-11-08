import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ConnectSpotify } from "@/components/ConnectSpotify";
import {
  Users,
  TrendingUp,
  Target,
  Instagram,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Trophy,
} from "lucide-react";

const Dashboard = () => {
  const [filter, setFilter] = useState<"all" | "unread" | "urgent">("all");

  // Simple demo data
  const stats = [
    { label: "Monthly Listeners", value: "12,847", change: "+15%", icon: Users, trend: "up" },
    { label: "Total Followers", value: "24.3K", change: "+8%", icon: Instagram, trend: "up" },
    { label: "Active Goals", value: "3", change: "On track", icon: Target, trend: "neutral" },
    { label: "New Insights", value: "5", change: "This week", icon: Sparkles, trend: "neutral" },
  ];

  const insights = [
    {
      id: 1,
      priority: "high",
      title: "Peak posting time detected",
      summary: "Your audience is most active between 7-9 PM EST.",
      category: "Marketing Strategy",
      timestamp: "2 hours ago",
      read: false,
      icon: TrendingUp,
    },
    {
      id: 2,
      priority: "medium", 
      title: "Milestone reached!",
      summary: "Your latest single just hit 10K streams.",
      category: "Performance",
      timestamp: "5 hours ago",
      read: false,
      icon: Trophy,
    },
  ];

  const activeGoals = [
    {
      id: 1,
      title: "Reach 50K monthly listeners",
      description: "Get your music to more ears",
      progress: 25.7,
      deadline: "Dec 31, 2024",
      status: "on-track",
    },
    {
      id: 2,
      title: "Release new EP",
      description: "Complete and publish 5-track EP",
      progress: 60,
      deadline: "Nov 15, 2024",
      status: "ahead",
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
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Your music dashboard</h1>
                <p className="text-base text-muted-foreground">Track your progress and discover new opportunities</p>
              </div>
              <Button variant="accent" className="font-medium">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Ask AI Manager</span>
                <span className="md:hidden">AI</span>
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-semibold text-foreground">Key metrics</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="cursor-pointer transition-all duration-200 hover:scale-[1.02]">
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10">
                        <stat.icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="outline" className="text-xs font-medium">
                        {stat.change}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Active Goals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold text-foreground">Your goals</h2>
              <Button variant="ghost" size="sm" className="font-medium">
                View all <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {activeGoals.map((goal) => (
                <Card key={goal.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base text-foreground flex-1">{goal.title}</h3>
                    <Badge variant={goal.status === "ahead" ? "outline" : "secondary"} className="shrink-0">
                      {goal.status === "ahead" ? "Ahead" : "On Track"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="w-full" />
                    <p className="text-xs text-muted-foreground">Due: {goal.deadline}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-accent" />
                <h2 className="text-lg md:text-xl font-semibold text-foreground">AI recommendations</h2>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className="font-medium"
                >
                  All
                </Button>
                <Button
                  variant={filter === "unread" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("unread")}
                  className="font-medium"
                >
                  Unread
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {filteredInsights.map((insight) => (
                <Card key={insight.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <insight.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-base">{insight.title}</h3>
                        <Badge variant="outline" className="shrink-0">{insight.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.summary}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{insight.category}</span>
                        <span>{insight.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Integrations */}
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