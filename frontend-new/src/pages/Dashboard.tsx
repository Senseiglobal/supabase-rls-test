import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  TrendingUp,
  Target,
  Instagram,
  MessageSquare,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Trophy,
} from "lucide-react";
import ConnectSpotify from "@/components/ConnectSpotify";

const Dashboard = () => {
  const [filter, setFilter] = useState<"all" | "unread" | "urgent">("all");

  // Sample data
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-danger-light text-danger";
      case "high":
        return "bg-warning-light text-warning";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "text-success";
      case "ahead":
        return "text-success";
      case "behind":
        return "text-warning";
      default:
        return "text-muted-foreground";
    }
  };

  const filteredInsights = insights.filter((insight) => {
    if (filter === "unread") return !insight.read;
    if (filter === "urgent") return insight.priority === "urgent";
    return true;
  });

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, Alex!</h1>
            <p className="text-muted-foreground">Here's what's happening with your music career</p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-success hover:opacity-90">
            <MessageSquare className="mr-2 h-4 w-4" />
            Ask AI Manager
          </Button>
        </div>

        {/* Integrations */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Integrations</h2>
          <ConnectSpotify />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="card-stats card-hover cursor-pointer animate-fade-in"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stat.trend === "up"
                      ? "bg-success/10"
                      : "bg-primary/10"
                  }`}
                >
                  <stat.icon
                    className={`h-6 w-6 ${
                      stat.trend === "up" ? "text-success" : "text-primary"
                    }`}
                  />
                </div>
                <Badge className={stat.trend === "up" ? "badge-success" : "badge-primary"}>
                  {stat.change}
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Active Goals Preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Active Goals</h2>
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeGoals.map((goal) => (
              <Card key={goal.id} className="p-6 card-hover animate-slide-up">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm line-clamp-2">{goal.title}</h3>
                    <Badge className={getStatusColor(goal.status)}>
                      {goal.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Progress value={goal.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                      </span>
                      <span>{goal.daysLeft} days left</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Insights Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              AI Insights
            </h2>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
              >
                Unread
              </Button>
              <Button
                variant={filter === "urgent" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("urgent")}
              >
                Urgent
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <Card
                key={insight.id}
                className={`p-6 card-hover cursor-pointer transition-all ${
                  !insight.read ? "border-l-4 border-l-primary" : ""
                } animate-fade-in`}
              >
                <div className="flex gap-4">
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
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold">{insight.title}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                        <Badge variant="outline">{insight.category}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {insight.summary}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">{insight.timestamp}</span>
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
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Dashboard;
