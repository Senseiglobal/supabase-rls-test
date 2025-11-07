import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Key, Bell, Globe, Palette, Music2, Link as LinkIcon, Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNotificationPreferences } from "@/hooks/use-notification-preferences";
import { notificationSound } from "@/lib/notification-sound";

const Account = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [userPlan, setUserPlan] = useState<"Free" | "Creator" | "Pro">("Free");
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [profile, setProfile] = useState({
    display_name: "",
    bio: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(true);
  
  const { soundEnabled, soundVolume, setSoundEnabled, setSoundVolume } = useNotificationPreferences();

  // Platform connection limits based on plan
  const platformLimits = {
    Free: 1,
    Creator: 3,
    Pro: 999, // Unlimited
  };

  // DEMO DATA - Platform connection options
  const platforms = [
    { id: "spotify", name: "Spotify", icon: "🎵", color: "success" },
    { id: "instagram", name: "Instagram", icon: "📸", color: "accent" },
    { id: "tiktok", name: "TikTok", icon: "🎬", color: "primary" },
    { id: "youtube", name: "YouTube", icon: "▶️", color: "destructive" },
    { id: "twitter", name: "Twitter/X", icon: "🐦", color: "info" },
    { id: "facebook", name: "Facebook", icon: "👥", color: "primary" },
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch user profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileData) {
      setProfile({
        display_name: profileData.display_name || "",
        bio: profileData.bio || "",
        avatar_url: profileData.avatar_url || "",
      });
      setConnectedPlatforms(
        Array.isArray(profileData.selected_platforms) 
          ? (profileData.selected_platforms as string[])
          : []
      );
    }

    // Fetch user's subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan_name")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (subscription) {
      setUserPlan(subscription.plan_name as "Free" | "Creator" | "Pro");
    }

    setLoading(false);
  };

  const handleSaveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile updated successfully!");
    }
  };

  const canConnectMore = connectedPlatforms.length < platformLimits[userPlan];

  const handlePlatformConnect = async (platformId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to connect platforms");
      return;
    }

    if (connectedPlatforms.includes(platformId)) {
      // Disconnect platform
      try {
        const { error } = await supabase.functions.invoke("oauth-disconnect", {
          body: { platform: platformId },
        });

        if (error) throw error;

        setConnectedPlatforms(connectedPlatforms.filter(p => p !== platformId));
        toast.success(`Disconnected from ${platforms.find(p => p.id === platformId)?.name}`);
      } catch (error: any) {
        console.error("Disconnect error:", error);
        toast.error("Failed to disconnect platform");
      }
    } else {
      // Check plan limits
      if (!canConnectMore) {
        toast.error(`Upgrade to connect more platforms. Your ${userPlan} plan allows ${platformLimits[userPlan]} connection${platformLimits[userPlan] > 1 ? 's' : ''}.`);
        return;
      }

      // Initiate OAuth flow
      const redirectUri = `${window.location.origin}/functions/v1/oauth-callback?platform=${platformId}`;
      
      // Platform-specific OAuth URLs
      const oauthUrls: Record<string, string> = {
        spotify: `https://accounts.spotify.com/authorize?client_id=YOUR_SPOTIFY_CLIENT_ID&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user-read-email user-read-private user-top-read&state=${user.id}`,
        instagram: `https://api.instagram.com/oauth/authorize?client_id=YOUR_INSTAGRAM_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code&state=${user.id}`,
        tiktok: `https://www.tiktok.com/v2/auth/authorize?client_key=YOUR_TIKTOK_CLIENT_KEY&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=user.info.basic,video.list&state=${user.id}`,
        twitter: `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=YOUR_TWITTER_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read users.read&state=${user.id}`,
        youtube: `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/youtube.readonly&state=${user.id}`,
        facebook: `https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_FACEBOOK_APP_ID&redirect_uri=${encodeURIComponent(redirectUri)}&scope=public_profile,email&state=${user.id}`,
      };

      const oauthUrl = oauthUrls[platformId];
      if (oauthUrl) {
        window.location.href = oauthUrl;
      } else {
        toast.error("Platform integration coming soon");
      }
    }
  };

  const handleTestSound = () => {
    notificationSound.play(soundVolume);
    toast.success("Test notification sound played!");
  };

  return (
    <>
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">Account Settings</h1>
        <p className="text-sm md:text-base text-foreground/70">Manage your profile and preferences</p>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <Card className="p-6 card-urban h-fit">
            <div className="text-center mb-6">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-accent text-accent-foreground text-2xl">
                  {profile.display_name ? profile.display_name.substring(0, 2).toUpperCase() : "AA"}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg text-foreground">
                {profile.display_name || "Artist"}
              </h3>
              <p className="text-sm text-foreground/70">
                {userPlan} Plan
              </p>
            </div>
            <Button className="w-full" variant="outline">
              Change Avatar
            </Button>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <Card className="p-6 card-urban">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-5 w-5 text-accent" />
                <h3 className="text-xl font-semibold text-foreground">Profile Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Display Name</Label>
                  <Input 
                    id="name" 
                    value={profile.display_name}
                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <textarea 
                    id="bio" 
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background focus:border-accent focus:outline-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </div>
            </Card>

            {/* Platform Connections */}
            <Card className="p-6 card-urban">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Music2 className="h-5 w-5 text-accent" />
                  <h3 className="text-xl font-semibold text-foreground">Platform Connections</h3>
                </div>
                <Badge variant="outline" className="text-xs">
                  {connectedPlatforms.length}/{platformLimits[userPlan]} Connected
                </Badge>
              </div>

              {!canConnectMore && (
                <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/30">
                  <p className="text-sm text-foreground/80">
                    🎯 Upgrade to <span className="font-semibold text-accent">
                      {userPlan === "Free" ? "Creator" : "Pro"}
                    </span> to connect more platforms
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {platforms.map((platform) => {
                  const isConnected = connectedPlatforms.includes(platform.id);
                  const isDisabled = !canConnectMore && !isConnected;

                  return (
                    <div
                      key={platform.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        isConnected
                          ? "border-accent bg-accent/5"
                          : isDisabled
                          ? "border-border/50 bg-secondary/30 opacity-60"
                          : "border-border bg-secondary/50 hover:border-accent/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                          isConnected ? "bg-accent/20" : "bg-foreground/10"
                        }`}>
                          {platform.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            {platform.name}
                            {isConnected && (
                              <Badge className="text-xs bg-success/20 text-success border-success/30">
                                Connected
                              </Badge>
                            )}
                          </div>
                          {isDisabled && (
                            <div className="text-xs text-muted-foreground">
                              Upgrade to connect
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isConnected ? "outline" : "default"}
                        onClick={() => handlePlatformConnect(platform.id)}
                        disabled={isDisabled}
                        className={isConnected ? "border-destructive/50 hover:bg-destructive/10" : ""}
                      >
                        {isConnected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Notifications */}
            <Card className="p-6 card-urban">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="h-5 w-5 text-accent" />
                <h3 className="text-xl font-semibold text-foreground">Notifications</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">Email Notifications</div>
                    <div className="text-sm text-foreground/70">Receive updates via email</div>
                  </div>
                  <Switch 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">Push Notifications</div>
                    <div className="text-sm text-foreground/70">Get notified in-app</div>
                  </div>
                  <Switch 
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Volume2 className="h-4 w-4 text-accent" />
                    <h4 className="font-semibold text-foreground">Sound Settings</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">Notification Sounds</div>
                        <div className="text-sm text-foreground/70">Play sound when new notifications arrive</div>
                      </div>
                      <Switch 
                        checked={soundEnabled}
                        onCheckedChange={setSoundEnabled}
                      />
                    </div>

                    {soundEnabled && (
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="volume" className="text-sm font-medium">Volume</Label>
                            <span className="text-sm text-muted-foreground">{Math.round(soundVolume * 100)}%</span>
                          </div>
                          <Slider
                            id="volume"
                            min={0}
                            max={1}
                            step={0.01}
                            value={[soundVolume]}
                            onValueChange={(value) => setSoundVolume(value[0])}
                            className="w-full"
                          />
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleTestSound}
                          className="w-full"
                        >
                          <Volume2 className="h-4 w-4 mr-2" />
                          Test Notification Sound
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Security */}
            <Card className="p-6 card-urban">
              <div className="flex items-center gap-2 mb-6">
                <Key className="h-5 w-5 text-accent" />
                <h3 className="text-xl font-semibold text-foreground">Security</h3>
              </div>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Enable Two-Factor Authentication
                </Button>
              </div>
            </Card>
          </div>
        </div>
    </>
  );
};

export default Account;
