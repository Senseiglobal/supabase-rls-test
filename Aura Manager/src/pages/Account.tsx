import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Key, Bell, Globe, Palette, Music2, Link as LinkIcon, Volume2, Play, Camera, Film, Users, Twitter } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNotificationPreferences } from "@/hooks/use-notification-preferences";
import { SpotifyDebugPanel } from "@/components/SpotifyDebugPanel";
import SpotifyDiagnosticTool from "@/components/SpotifyDiagnosticTool";
import CustomDomainNotification from "@/components/CustomDomainNotification";
import SpotifySetupGuide from "@/components/SpotifySetupGuide";
import { ConnectionStatusChecker } from "@/components/ConnectionStatusChecker";
import { OAuthRedirectFixer } from "@/components/OAuthRedirectFixer";
import { OAuthDebugger } from "@/components/OAuthDebugger";
import { SupabaseProjectMismatchFixer } from "@/components/SupabaseProjectMismatchFixer";
import { notificationSound } from "@/lib/notification-sound";

// Platform Icon Components
const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.301.421-1.02.599-1.561.3z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const Account = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [userPlan, setUserPlan] = useState<"Free" | "Creator" | "Pro">("Free");
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
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

  // Platform connection options with proper logos
  const platforms = [
    { id: "spotify", name: "Spotify", icon: <SpotifyIcon />, color: "success" },
    { id: "instagram", name: "Instagram", icon: <InstagramIcon />, color: "accent" },
    { id: "tiktok", name: "TikTok", icon: <TikTokIcon />, color: "primary" },
    { id: "youtube", name: "YouTube", icon: <YouTubeIcon />, color: "destructive" },
    { id: "twitter", name: "Twitter/X", icon: <XIcon />, color: "info" },
    { id: "facebook", name: "Facebook", icon: <FacebookIcon />, color: "primary" },
  ];

  useEffect(() => {
    fetchUserData();
    
    // Check if user just returned from OAuth connection
    const urlParams = new URLSearchParams(globalThis.location.search);
    const connectedPlatform = urlParams.get('connected');
    if (connectedPlatform) {
      toast.success(`Successfully connected to ${connectedPlatform}!`);
      // Remove the parameter from URL
      const newUrl = new URL(globalThis.location.href);
      newUrl.searchParams.delete('connected');
      globalThis.history.replaceState({}, '', newUrl.toString());
      // Refresh data to show the connection
      setTimeout(fetchUserData, 1000);
    }
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
      
      // Check connected platforms by looking at user identities
      const identities = (user?.identities || []) as Array<{ provider?: string }>;
      const connectedFromIdentities = identities.map(i => i.provider).filter(Boolean) as string[];
      
      // Also get from profile selected_platforms for non-Supabase OAuth providers
      const fromProfile = Array.isArray(profileData.selected_platforms) 
        ? (profileData.selected_platforms as string[])
        : [];
      
      // Combine both sources and remove duplicates
      const allConnected = [...new Set([...connectedFromIdentities, ...fromProfile])];
      setConnectedPlatforms(allConnected);
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

  const handlePlatformDisconnect = async (platformId: string) => {
    try {
      toast.info(`Disconnecting from ${platforms.find(p => p.id === platformId)?.name}...`);
      
      if (platformId === "spotify") {
        // For Spotify disconnect, we'll show a message directing user to Spotify to revoke access
        // Direct unlinkIdentity is complex due to API requirements
        toast.info("To fully disconnect Spotify, go to Spotify Account Overview > Privacy Settings > Manage Apps and remove 'Aura Manager'");
        toast.info("Locally disconnecting Spotify...");
        
        // Remove from local state and profile
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");
        
        // Update profile to remove spotify from connected platforms list
        const { error } = await supabase
          .from("profiles")
          .update({ 
            selected_platforms: connectedPlatforms.filter(p => p !== "spotify")
          })
          .eq("user_id", user.id);
        
        if (error) {
          console.error("Profile update error:", error);
          // Don't throw - still update UI
        }
      } else {
        // For other platforms, remove from profile selected_platforms
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");
        
        const { data: profileData } = await supabase
          .from("profiles")
          .select("selected_platforms")
          .eq("user_id", user.id)
          .single();
        
        const currentPlatforms = Array.isArray(profileData?.selected_platforms) 
          ? profileData.selected_platforms as string[]
          : [];
        
        const updatedPlatforms = currentPlatforms.filter(p => p !== platformId);
        
        const { error } = await supabase
          .from("profiles")
          .update({ selected_platforms: updatedPlatforms })
          .eq("user_id", user.id);
        
        if (error) throw error;
      }

      // Update local state
      setConnectedPlatforms(prev => prev.filter(p => p !== platformId));
      toast.success(`✅ Disconnected from ${platforms.find(p => p.id === platformId)?.name}`);
      
      // Refresh data after disconnect
      setTimeout(() => {
        fetchUserData();
      }, 500);
      
    } catch (error) {
      console.error("Disconnect error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`❌ Failed to disconnect: ${errorMessage}`);
    }
  };

  const handlePlatformConnect = async (platformId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to connect platforms");
      return;
    }

    if (connectedPlatforms.includes(platformId)) {
      // Disconnect platform
      setConnectingPlatform(platformId);
      await handlePlatformDisconnect(platformId);
      setConnectingPlatform(null);
    } else {
      // Check plan limits
      if (!canConnectMore) {
        toast.error(`Upgrade to connect more platforms. Your ${userPlan} plan allows ${platformLimits[userPlan]} connection${platformLimits[userPlan] > 1 ? 's' : ''}.`);
        return;
      }

      // Handle Spotify with Supabase native OAuth, others with custom function
      if (platformId === "spotify") {
        try {
          setConnectingPlatform(platformId);
          
          toast.info("🎵 Connecting to Spotify...", {
            description: "You'll be redirected to Spotify to authorize the connection."
          });
          
          // Use stable custom domain for redirect (not changing Vercel URLs)
          const stableDomain = "https://auramanager.app";
          const redirectUrl = `${stableDomain}/account?connected=spotify`;
          
          console.log("Using stable redirect URL:", redirectUrl);
          console.log("Current origin:", globalThis.location.origin);
          
          console.log("🔍 OAuth Configuration:");
          console.log("- Redirect URL:", redirectUrl);
          console.log("- Current Domain:", globalThis.location.origin);
          console.log("- Supabase Project:", "cpylmxhrobrhqettudjg.supabase.co");
          console.log("- Client ID:", "2b48c7729298483c9588820c99bdbaef");

          const { error } = await supabase.auth.linkIdentity({
            provider: "spotify",
            options: {
              scopes: "user-read-email user-read-private user-read-recently-played playlist-read-private user-top-read",
              redirectTo: redirectUrl,
            },
          });
          
          if (error) {
            console.error("Spotify connection error:", error);
            
            // Provide user-friendly error messages
            if (error.message.includes('invalid_client') || error.message.includes('invalid redirect')) {
              toast.error("❌ Spotify connection setup issue", {
                description: "Our team is working on this. Please try again later or contact support."
              });
            } else if (error.message.includes('unauthorized_client')) {
              toast.error("❌ Spotify app configuration needed", {
                description: "Please contact support to enable Spotify integration."
              });
            } else if (error.message.includes('access_denied')) {
              toast.error("❌ Connection cancelled", {
                description: "You chose not to connect Spotify. You can try again anytime."
              });
            } else {
              toast.error("❌ Connection failed", {
                description: "Something went wrong. Please try again in a moment."
              });
            }
          } else {
            toast.success("🎉 Redirecting to Spotify...", {
              description: "Complete the authorization to connect your account."
            });
          }
        } catch (error) {
          console.error("Spotify connect error:", error);
          toast.error("Failed to connect to Spotify. Please try again.");
        } finally {
          setConnectingPlatform(null);
        }
      } else {
        // Use custom OAuth function for other platforms
        const redirectUri = `https://snbwmkrubosvpibamivu.supabase.co/functions/v1/oauth-callback?platform=${platformId}`;
        
        const oauthUrls: Record<string, string> = {
          instagram: `https://api.instagram.com/oauth/authorize?client_id=YOUR_INSTAGRAM_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code&state=${user.id}`,
          tiktok: `https://www.tiktok.com/v2/auth/authorize?client_key=YOUR_TIKTOK_CLIENT_KEY&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=user.info.basic,video.list&state=${user.id}`,
          twitter: `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=YOUR_TWITTER_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read users.read&state=${user.id}`,
          youtube: `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/youtube.readonly&state=${user.id}`,
          facebook: `https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_FACEBOOK_APP_ID&redirect_uri=${encodeURIComponent(redirectUri)}&scope=public_profile,email&state=${user.id}`,
        };

        const oauthUrl = oauthUrls[platformId];
        if (oauthUrl) {
          console.log(`Redirecting to OAuth for ${platformId}:`, oauthUrl);
          toast.info(`Redirecting to ${platformId}...`);
          globalThis.location.href = oauthUrl;
        } else {
          toast.error("Platform integration coming soon");
        }
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
            {/* Authentication Debug */}
            <Card className="p-6 card-urban border-destructive">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-destructive" />
                <h3 className="text-xl font-semibold text-destructive">Mobile Auth Issue Detected</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="text-sm font-medium text-destructive mb-2">
                    🚨 Mobile Authentication Cache Issue Detected
                  </p>
                  <p className="text-xs text-destructive/80">
                    Your mobile browser has cached old authentication data:<br />
                    • Old URL: supabasetest-six.vercel.app<br />
                    • Old Project: snbwmkrubosvpibamivu<br />
                    • Current URL: auramanager.app<br />
                    • Current Project: cpylmxhrobrhqettudjg
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    💡 Quick Fix Instructions:
                  </p>
                  <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside ml-2">
                    <li>On mobile: Clear ALL browser data for both auramanager.app and vercel.app</li>
                    <li>Sign out of Google account completely</li>
                    <li>Go to <a href="https://myaccount.google.com/permissions" target="_blank" className="underline">Google Account Permissions</a></li>
                    <li>Remove any "Aura Manager" apps</li>
                    <li>Sign back into Google</li>
                    <li>Try authentication at auramanager.app/auth</li>
                  </ol>
                </div>
                <div className="text-sm space-y-3">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="font-medium text-yellow-800 mb-2">⚠️ Alternative: Temporary Fix</p>
                    <p className="text-xs text-yellow-700">
                      If cache clearing doesn't work, we can temporarily add the old URL 
                      (<code>supabasetest-six.vercel.app</code>) to your Supabase redirect URLs 
                      as a workaround while we investigate further.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Recommended Steps (in order):</p>
                    <ol className="list-decimal list-inside text-xs space-y-1 ml-2">
                      <li><strong>First:</strong> Clear mobile browser cache completely</li>
                      <li><strong>Then:</strong> Revoke Google OAuth permissions at <a href="https://myaccount.google.com/permissions" target="_blank" className="text-blue-600 underline">Google Account</a></li>
                      <li><strong>Finally:</strong> Try fresh login at <a href="https://auramanager.app/auth" target="_blank" className="text-blue-600 underline">auramanager.app/auth</a></li>
                      <li><strong>If still broken:</strong> Contact support for temporary URL addition</li>
                    </ol>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => globalThis.open("https://myaccount.google.com/permissions", "_blank")}
                    className="flex-1"
                  >
                    Clear Google Permissions
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => globalThis.open("https://auramanager.app/auth", "_blank")}
                    className="flex-1"
                  >
                    Test Fresh Login
                  </Button>
                </div>
              </div>
            </Card>

            {/* Supabase Project Mismatch Critical Fix */}
            <SupabaseProjectMismatchFixer />

            {/* OAuth Debug & Test Tool */}
            <OAuthDebugger />

            {/* OAuth Redirect URI Fix */}
            <OAuthRedirectFixer />

            {/* Connection Status Checker */}
            <ConnectionStatusChecker />

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
                  const isConnecting = connectingPlatform === platform.id;

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
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          isConnected 
                            ? platform.id === "spotify" ? "bg-green-100 text-green-600" :
                              platform.id === "instagram" ? "bg-pink-100 text-pink-600" :
                              platform.id === "tiktok" ? "bg-slate-100 text-slate-800" :
                              platform.id === "youtube" ? "bg-red-100 text-red-600" :
                              platform.id === "twitter" ? "bg-slate-100 text-slate-800" :
                              platform.id === "facebook" ? "bg-blue-100 text-blue-600" :
                              "bg-accent/20 text-accent"
                            : "bg-foreground/10 text-muted-foreground hover:bg-foreground/15"
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
                        disabled={isDisabled || isConnecting}
                        className={isConnected ? "border-destructive/50 hover:bg-destructive/10" : ""}
                      >
                        {isConnecting ? "..." : isConnected ? "Disconnect" : "Connect"}
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
      <SpotifySetupGuide />
      
      <CustomDomainNotification />
      
      <SpotifyDebugPanel />
      
      <SpotifyDiagnosticTool />
    </>
  );
};

export default Account;
