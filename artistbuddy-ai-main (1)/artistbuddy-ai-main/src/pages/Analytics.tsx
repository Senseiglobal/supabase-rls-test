import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Music, TrendingUp, Sparkles, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

interface AIAnalysis {
  genre?: string;
  mood?: string;
  energy_level?: string;
  commercial_potential?: string;
  [key: string]: any;
}

interface Upload {
  id: string;
  file_name: string;
  ai_analysis: AIAnalysis | null;
  created_at: string;
}

const COLORS = ['hsl(var(--accent))', 'hsl(var(--sedimentary-base))', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#a48cff'];

const Analytics = () => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUploads: 0,
    analyzedTracks: 0,
    avgEnergy: 0,
    topGenre: 'N/A'
  });
  const [genreData, setGenreData] = useState<any[]>([]);
  const [moodData, setMoodData] = useState<any[]>([]);
  const [energyData, setEnergyData] = useState<any[]>([]);
  const [uploadTrend, setUploadTrend] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("uploads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching analytics:", error);
      setLoading(false);
      return;
    }

    const uploads = (data || []) as unknown as Upload[];
    setUploads(uploads);

    // Calculate stats
    const analyzedUploads = uploads.filter(u => u.ai_analysis);
    const totalUploads = uploads.length;
    const analyzedCount = analyzedUploads.length;

    // Genre distribution
    const genreMap = new Map<string, number>();
    analyzedUploads.forEach(upload => {
      const genre = upload.ai_analysis?.genre || 'Unknown';
      genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
    });
    const genreChartData = Array.from(genreMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    setGenreData(genreChartData);

    // Mood distribution
    const moodMap = new Map<string, number>();
    analyzedUploads.forEach(upload => {
      const mood = upload.ai_analysis?.mood || 'Unknown';
      moodMap.set(mood, (moodMap.get(mood) || 0) + 1);
    });
    const moodChartData = Array.from(moodMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    setMoodData(moodChartData);

    // Energy level distribution
    const energyMap = new Map<string, number>();
    analyzedUploads.forEach(upload => {
      const energy = upload.ai_analysis?.energy_level || 'Unknown';
      energyMap.set(energy, (energyMap.get(energy) || 0) + 1);
    });
    const energyChartData = Array.from(energyMap.entries())
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
      .sort((a, b) => {
        const order = { 'Low': 1, 'Medium': 2, 'High': 3, 'Very high': 4 };
        return (order[a.name as keyof typeof order] || 0) - (order[b.name as keyof typeof order] || 0);
      });
    setEnergyData(energyChartData);

    // Upload trend over time (group by month)
    const trendMap = new Map<string, number>();
    uploads.forEach(upload => {
      const date = new Date(upload.created_at);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      trendMap.set(monthYear, (trendMap.get(monthYear) || 0) + 1);
    });
    const trendChartData = Array.from(trendMap.entries())
      .map(([month, uploads]) => ({ month, uploads }));
    setUploadTrend(trendChartData);

    // Stats
    const topGenre = genreChartData[0]?.name || 'N/A';
    const energyValues = { 'low': 1, 'medium': 2, 'high': 3, 'very high': 4 };
    const avgEnergy = analyzedUploads.length > 0
      ? analyzedUploads.reduce((sum, u) => {
          const level = u.ai_analysis?.energy_level?.toLowerCase() || 'medium';
          return sum + (energyValues[level as keyof typeof energyValues] || 2);
        }, 0) / analyzedUploads.length
      : 0;

    setStats({
      totalUploads,
      analyzedTracks: analyzedCount,
      avgEnergy: Math.round(avgEnergy * 100) / 100,
      topGenre
    });

    setLoading(false);
  };

  const statCards = [
    { 
      label: "Total Uploads", 
      value: stats.totalUploads, 
      icon: Music,
      color: "text-accent"
    },
    { 
      label: "AI Analyzed", 
      value: stats.analyzedTracks, 
      icon: Sparkles,
      color: "text-sedimentary-base"
    },
    { 
      label: "Top Genre", 
      value: stats.topGenre, 
      icon: TrendingUp,
      color: "text-accent"
    },
    { 
      label: "Avg Energy", 
      value: stats.avgEnergy.toFixed(1), 
      icon: TrendingUp,
      color: "text-sedimentary-base"
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-screen-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Upload Analytics</h1>
          <p className="text-foreground/70">AI-powered insights from your music uploads</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-foreground/70">Loading analytics...</div>
          </div>
        ) : stats.totalUploads === 0 ? (
          <Card className="p-12 text-center">
            <Music className="h-16 w-16 text-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Data Yet</h3>
            <p className="text-foreground/70 mb-4">Upload your first track to see analytics and insights</p>
          </Card>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, idx) => (
                <Card key={idx} className="p-6 card-urban card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1 text-foreground">{stat.value}</div>
                  <div className="text-sm text-foreground/70">{stat.label}</div>
                </Card>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Genre Distribution */}
              {genreData.length > 0 && (
                <Card className="p-6 card-urban">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Genre Distribution</h3>
                    <Badge variant="outline">{genreData.length} genres</Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={genreData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="hsl(var(--accent))"
                        dataKey="value"
                      >
                        {genreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Mood Distribution */}
              {moodData.length > 0 && (
                <Card className="p-6 card-urban">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Mood Analysis</h3>
                    <Badge variant="outline">{stats.analyzedTracks} tracks</Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={moodData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Energy Levels */}
              {energyData.length > 0 && (
                <Card className="p-6 card-urban">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Energy Levels</h3>
                    <Badge variant="outline">Avg: {stats.avgEnergy.toFixed(1)}/4</Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={energyData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--foreground))" />
                      <YAxis dataKey="name" type="category" stroke="hsl(var(--foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--sedimentary-base))" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Upload Trend */}
              {uploadTrend.length > 0 && (
                <Card className="p-6 card-urban">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Upload Trend</h3>
                    <Calendar className="h-4 w-4 text-accent" />
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={uploadTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="uploads" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--accent))', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>

            {/* Top Insights */}
            <Card className="p-6 card-urban">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">AI Insights Summary</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploads
                  .filter(u => u.ai_analysis?.commercial_potential)
                  .sort((a, b) => {
                    const potentialOrder = { 'very high': 4, 'high': 3, 'moderate': 2, 'low': 1 };
                    const aValue = potentialOrder[a.ai_analysis.commercial_potential as keyof typeof potentialOrder] || 0;
                    const bValue = potentialOrder[b.ai_analysis.commercial_potential as keyof typeof potentialOrder] || 0;
                    return bValue - aValue;
                  })
                  .slice(0, 6)
                  .map((upload) => (
                    <div key={upload.id} className="p-4 rounded-lg bg-accent/5 border border-accent/10">
                      <div className="flex items-start justify-between mb-2">
                        <Music className="h-4 w-4 text-accent flex-shrink-0" />
                        <Badge variant="secondary" className="text-xs capitalize">
                          {upload.ai_analysis.commercial_potential}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1 truncate" title={upload.file_name}>
                        {upload.file_name}
                      </p>
                      <p className="text-xs text-foreground/70">
                        {upload.ai_analysis.genre} • {upload.ai_analysis.mood}
                      </p>
                    </div>
                  ))
                }
              </div>
            </Card>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Analytics;