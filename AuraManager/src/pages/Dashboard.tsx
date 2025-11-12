import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, TrendingUp, Music2, Calendar, MessageSquare, BarChart3, Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [stats, setStats] = useState({
    streams: 12345,
    fans: 2350,
    engagement: 8.2,
    nextRelease: "14d",
    nextReleaseTitle: "Summer Vibes",
    nextReleaseDate: "Dec 1"
  });
  // Simulate real-time updates if user has connected platforms
  useEffect(() => {
    const fetchPlatforms = async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("selected_platforms")
        .eq("user_id", user.data.user.id)
        .single();
      setConnectedPlatforms(Array.isArray(data?.selected_platforms) ? data.selected_platforms : []);
    };
    fetchPlatforms();
  }, []);
  useEffect(() => {
    if (connectedPlatforms.length === 0) return;
    // Simulate polling or subscription for real-time updates
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        streams: prev.streams + Math.floor(Math.random() * 5),
        fans: prev.fans + Math.floor(Math.random() * 2),
        engagement: +(prev.engagement + (Math.random() * 0.05 - 0.02)).toFixed(2),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [connectedPlatforms]);

  // Filter helpers
  const matches = (text: string) => text.toLowerCase().includes(search.toLowerCase());

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Welcome Header + Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome back, Artist!
          </h1>
          <p className="text-foreground/70">
            Here's what's happening with your music career today
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto md:flex-row md:items-center">
          <Input
            type="search"
            placeholder="Search your dashboard..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
            aria-label="Search dashboard"
          />
          <Button onClick={() => navigate("/chat")} size="lg" className="gap-2 mt-2 md:mt-0">
            <MessageSquare className="h-5 w-5" />
            Chat with AI Manager
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(!search || matches("streams")) && (
          <Card className="card-hover border-accent/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.streams.toLocaleString()}</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +20.1% from last month
              </p>
            </CardContent>
          </Card>
        )}
        {(!search || matches("fans")) && (
          <Card className="card-hover border-accent/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Fans</CardTitle>
              <Music2 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.fans.toLocaleString()}</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +180 new this week
              </p>
            </CardContent>
          </Card>
        )}
        {(!search || matches("engagement")) && (
          <Card className="card-hover border-accent/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.engagement}%</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +2.5% from last week
              </p>
            </CardContent>
          </Card>
        )}
        {(!search || matches("release") || matches(stats.nextReleaseTitle)) && (
          <Card className="card-hover border-accent/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Release</CardTitle>
              <Calendar className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.nextRelease}</div>
              <p className="text-xs text-foreground/70 mt-1">
                "{stats.nextReleaseTitle}" drops {stats.nextReleaseDate}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Insights */}
      <Card className="border-l-4 border-l-accent card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <CardTitle>AI Insights & Recommendations</CardTitle>
          </div>
          <CardDescription>
            Personalized strategies to grow your career
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
            <div className="mt-1">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Release Strategy Opportunity</h4>
              <p className="text-sm text-foreground/70 mb-2">
                Your engagement peaks on Fridays at 6 PM. Consider scheduling your next release for maximum impact.
              </p>
              <Badge variant="secondary">High Priority</Badge>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
            <div className="mt-1">
              <MessageSquare className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Fan Engagement Tip</h4>
              <p className="text-sm text-foreground/70 mb-2">
                Your top 100 fans are highly active. A personalized message or exclusive content could boost loyalty.
              </p>
              <Badge variant="secondary">Medium Priority</Badge>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
            <div className="mt-1">
              <BarChart3 className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Growth Milestone</h4>
              <p className="text-sm text-foreground/70 mb-2">
                You're 250 streams away from hitting 15,000 total streams! Share your latest track to celebrate.
              </p>
                    <Badge variant="secondary">Celebrate</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
              <div>
                <p className="font-medium">Finalize album artwork</p>
                <p className="text-xs text-foreground/70">Due in 3 days</p>
              </div>
              <Badge>To Do</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
              <div>
                <p className="font-medium">Submit to playlists</p>
                <p className="text-xs text-foreground/70">Due in 5 days</p>
              </div>
              <Badge>To Do</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
              <div>
                <p className="font-medium">Schedule social posts</p>
                <p className="text-xs text-foreground/70">Due in 1 week</p>
              </div>
              <Badge variant="secondary">Planning</Badge>
            </div>
            <Button variant="outline" className="w-full mt-2" onClick={() => navigate("/chat")}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Task
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music2 className="h-5 w-5 text-accent" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg">
              <div className="w-2 h-2 bg-accent rounded-full mt-2" />
              <div>
                <p className="font-medium">New playlist add</p>
                <p className="text-xs text-foreground/70">"Summer Nights" added to "Chill Vibes"</p>
                <p className="text-xs text-foreground/50 mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg">
              <div className="w-2 h-2 bg-success rounded-full mt-2" />
              <div>
                <p className="font-medium">Stream milestone reached</p>
                <p className="text-xs text-foreground/70">10,000 streams on "Midnight Drive"</p>
                <p className="text-xs text-foreground/50 mt-1">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg">
              <div className="w-2 h-2 bg-accent rounded-full mt-2" />
              <div>
                <p className="font-medium">New follower spike</p>
                <p className="text-xs text-foreground/70">+85 followers on Instagram</p>
                <p className="text-xs text-foreground/50 mt-1">2 days ago</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-2" onClick={() => navigate("/analytics")}>
              View All Activity
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* CTA Banner */}
      <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/30">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">Ready to take your career to the next level?</h3>
              <p className="text-foreground/70">
                Upgrade to Pro for advanced analytics, unlimited AI consultations, and more
              </p>
            </div>
            <Button size="lg" onClick={() => navigate("/pricing")} className="whitespace-nowrap">
              Upgrade to Pro
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
