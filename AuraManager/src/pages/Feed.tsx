import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { TrendingUp, Music, Radio, Heart, Share2, Filter, Play } from "lucide-react";
import { Card } from "@/components/ui/card";

const Feed = () => {
  // DEMO DATA - Replace with Supabase data later
  const trendingTracks = [
    { id: 1, title: "Midnight Dreams", artist: "Luna Eclipse", plays: "2.4M", trend: "+15%" },
    { id: 2, title: "Electric Soul", artist: "Neon Waves", plays: "1.8M", trend: "+22%" },
    { id: 3, title: "Lost in Sound", artist: "Echo Chamber", plays: "1.5M", trend: "+18%" },
    { id: 4, title: "Cosmic Dance", artist: "Star Dust", plays: "1.2M", trend: "+25%" },
  ];

  // DEMO DATA - Replace with AI-generated recommendations later
  const aiRecommendations = [
    { title: "Trending in Your Genre", description: "Lo-fi hip hop is seeing 40% growth this month" },
    { title: "Best Time to Release", description: "Friday 3PM EST shows highest engagement for your audience" },
    { title: "Collaboration Opportunity", description: "3 artists in your network match your style" },
  ];

  return (
    <>
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">Music Feed</h1>
        <p className="text-sm md:text-base text-foreground/70">AI-curated music, trends, and recommendations</p>
      </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <Button variant="default" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            All Trends
          </Button>
          <Button variant="outline" size="sm">Your Genre</Button>
          <Button variant="outline" size="sm">Recommended</Button>
          <Button variant="outline" size="sm">New Releases</Button>
        </div>

        {/* AI Recommendations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">AI Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiRecommendations.map((rec, idx) => (
              <Card key={idx} className="p-6 card-urban card-hover">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-foreground">{rec.title}</h3>
                    <p className="text-sm text-foreground/70">{rec.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Trending Tracks */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">Trending Now</h2>
          <div className="grid grid-cols-1 gap-4">
            {trendingTracks.map((track) => (
              <Card key={track.id} className="p-6 card-urban card-hover">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="hover-scale">
                      <Play className="h-5 w-5" />
                    </Button>
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-accent to-sedimentary-base" />
                    <div>
                      <h3 className="font-semibold text-foreground">{track.title}</h3>
                      <p className="text-sm text-foreground/70">{track.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-accent" />
                        <span className="font-semibold text-foreground">{track.plays}</span>
                      </div>
                      <span className="text-sm text-success">{track.trend}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="hover-scale">
                        <Heart className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover-scale">
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
    </>
  );
};

export default Feed;
