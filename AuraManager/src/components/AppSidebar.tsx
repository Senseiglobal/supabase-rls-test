import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  BarChart3, 
  FolderOpen, 
  MessageSquare,
  TrendingUp,
  Settings,
  Lock,
  Crown,
  CreditCard,
  X,
  Music,
  FileText,
  PieChart,
  Sliders
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type TierName = "Free" | "Creator" | "Pro";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredTier: TierName;
  description: string;
}

const TIER_HIERARCHY: Record<TierName, number> = {
  Free: 0,
  Creator: 1,
  Pro: 2,
};

const navItems: NavItem[] = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: LayoutDashboard,
    requiredTier: "Free",
    description: "Overview of your music career"
  },
  { 
    title: "Analytics", 
    url: "/analytics", 
    icon: BarChart3,
    requiredTier: "Free",
    description: "AI-powered insights and charts"
  },
  { 
    title: "My Content", 
    url: "/my-content", 
    icon: FolderOpen,
    requiredTier: "Free",
    description: "Upload & analyze your music"
  },
  { 
    title: "AI Chat",
    url: "/chat", 
    icon: MessageSquare,
    requiredTier: "Free",
    description: "24/7 AI music assistant"
  },
  { 
    title: "Reports", 
    url: "/reports", 
    icon: PieChart,
    requiredTier: "Free",
    description: "Advanced performance reports"
  },
  { 
    title: "Feed", 
    url: "/feed", 
    icon: TrendingUp,
    requiredTier: "Free",
    description: "Industry news and trends"
  },
];

const settingsItems: NavItem[] = [
  { 
    title: "Billing", 
    url: "/billing", 
    icon: CreditCard,
    requiredTier: "Free",
    description: "Manage payments & invoices"
  },
  { 
    title: "Account", 
    url: "/account", 
    icon: Settings,
    requiredTier: "Free",
    description: "Manage your profile & settings"
  },
      {
              title: "Preferences",
              url: "/settings/preferences",
              Sliders: ,
              requiredTier: "Free",
              description: "Manage your music preferences and personalization settings"
                    },
  { 
    title: "Legal & Terms", 
    url: "/terms", 
    icon: FileText,
    requiredTier: "Free",
    description: "Read Terms & Privacy"
  },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [userTier, setUserTier] = useState<TierName>("Free");
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [spotifyConnectionLoading, setSpotifyConnectionLoading] = useState(false);

  useEffect(() => {
    fetchUserTier();
    checkSpotifyConnection();
  }, []);

  const checkSpotifyConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const identities = (user?.identities || []) as Array<{ provider?: string }>;
      const connected = identities.some((i) => i.provider === "spotify");
      setIsSpotifyConnected(connected);
    } catch (error) {
      console.error("Error checking Spotify connection:", error);
    }
  };

  const fetchUserTier = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: subscription, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select("plan_name")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (subscription) {
        setUserTier(subscription.plan_name as TierName);
      } else if (subscriptionError) {
        // Silent fallback: table missing / RLS denial shouldn't block UI
        console.debug("Silent subscriptions fetch issue", subscriptionError.message);
      }
    } catch (e) {
      console.debug("Silent error fetching user tier", e);
    }
  };

  // Function to handle Spotify OAuth connection/disconnection
  const handleSpotifyConnect = async () => {
    if (isSpotifyConnected) {
      await handleSpotifyDisconnect();
      return;
    }

    try {
      setSpotifyConnectionLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to connect Spotify");
        return;
      }

      toast.info("Redirecting to Spotify...");

  // Use stable custom domain for redirect (fallback to current origin)
  const stableBase = (import.meta.env as { VITE_PUBLIC_BASE_URL?: string }).VITE_PUBLIC_BASE_URL || (globalThis.location?.origin ?? "https://auramanager.app");
      const { error } = await supabase.auth.linkIdentity({
        provider: "spotify",
        options: {
          scopes: "user-read-email user-read-private user-read-recently-played playlist-read-private user-top-read",
          redirectTo: `${stableBase}/account?connected=spotify`,
        },
      });

      if (error) {
        console.error("Spotify connection error:", error);
        
        // Provide user-friendly error messages based on error type
        if (error.message.includes('invalid_client') || error.message.includes('invalid redirect')) {
          toast.error("🎵 Spotify connection setup issue", {
            description: "Our team is working on this. Please try again later."
          });
        } else if (error.message.includes('unauthorized_client')) {
          toast.error("🎵 Spotify app configuration needed", {
            description: "Please contact support to enable Spotify integration."
          });
        } else if (error.message.includes('access_denied')) {
          toast.error("🎵 Connection cancelled", {
            description: "You chose not to connect Spotify. You can try again anytime."
          });
        } else {
          toast.error("🎵 Connection failed", {
            description: "Something went wrong. Please try again in a moment."
          });
        }
      } else {
        toast.success("🎉 Redirecting to Spotify...", {
          description: "Complete the authorization to connect your account."
        });
      }
    } catch (error) {
      console.error("Spotify connection error:", error);
      toast.error("🎵 Failed to connect to Spotify", {
        description: "Please check your connection and try again."
      });
    } finally {
      setSpotifyConnectionLoading(false);
    }
  };

  const handleSpotifyDisconnect = () => {
    try {
      setSpotifyConnectionLoading(true);
      
      toast.info("🎵 Disconnecting Spotify...", {
        description: "To fully disconnect, you'll need to revoke access in Spotify settings."
      });
      
      // Update local state immediately for better UX
      setIsSpotifyConnected(false);
      
      setTimeout(() => {
        toast.success("🎵 Spotify Disconnected", {
          description: "Visit Account settings for complete disconnection management."
        });
        setSpotifyConnectionLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Spotify disconnect error:", error);
      toast.error("🎵 Failed to disconnect Spotify", {
        description: "Please try again or visit Account settings."
      });
      setSpotifyConnectionLoading(false);
    }
  };

  const hasAccess = (requiredTier: TierName) => {
    return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
  };

  const isActive = (path: string) => currentPath === path;

  const renderNavItem = (item: NavItem) => {
    const locked = !hasAccess(item.requiredTier);
    const active = isActive(item.url);

    const content = (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton 
          asChild={!locked}
          disabled={locked}
          className={`relative px-3 py-2.5 ${locked ? "cursor-not-allowed opacity-50" : ""} ${
            active ? "" : "hover:bg-sidebar-accent"
          }`}
        >
          {locked ? (
            <div className={`flex items-center w-full py-3 ${open ? "gap-3 px-4" : "justify-center px-2"}`}>
              <item.icon className="h-5 w-5 flex-shrink-0 text-sidebar-foreground/40" />
              {open && (
                <>
                  <span className="flex-1 text-sm font-semibold text-sidebar-foreground/50">{item.title}</span>
                  <Lock className="h-4 w-4 text-sidebar-foreground/40" />
                </>
              )}
            </div>
          ) : (
            <NavLink 
              to={item.url} 
              className={`flex items-center w-full transition-colors py-3 ${
                open 
                  ? "gap-3 px-4" 
                  : "justify-center px-2"
              } ${
                active 
                  ? "bg-accent text-accent-foreground border-l-4 border-accent font-bold -ml-4" 
                  : "text-sidebar-foreground border-l-4 border-transparent hover:border-sidebar-border font-semibold -ml-4"
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {open && <span className="flex-1 text-sm">{item.title}</span>}
            </NavLink>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );

    if (!open && locked) {
      return (
        <TooltipProvider key={item.title}>
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover/95 backdrop-blur-sm border-border">
              <div className="space-y-1">
                <p className="font-semibold text-popover-foreground">{item.title}</p>
                <p className="text-xs text-popover-foreground/80">{item.description}</p>
                <Badge variant="outline" className="text-xs mt-1 bg-sidebar-accent/50">
                  <Crown className="h-3 w-3 mr-1" />
                  Requires {item.requiredTier}
                </Badge>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (!open) {
      return (
        <TooltipProvider key={item.title}>
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover/95 backdrop-blur-sm border-border">
              <p className="font-medium text-popover-foreground">{item.title}</p>
              <p className="text-xs text-popover-foreground/80">{item.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  return (
    <Sidebar
      className={`border-r-4 border-sidebar-border bg-sidebar transition-all duration-200 ${
        open ? "w-64" : "w-16"
      }`}
      collapsible="icon"
    >
      {/* GDS-style header with branding */}
      <div className={`border-b-4 border-sidebar-border ${open ? "p-4" : "p-2"}`}>
        {open ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                <img 
                  src="/icons/dark_icon_32x32.png" 
                  alt="Aura Manager" 
                  className="w-6 h-6 dark:hidden" 
                />
                <img 
                  src="/icons/light_icon_32x32.png" 
                  alt="Aura Manager" 
                  className="w-6 h-6 hidden dark:block" 
                />
              </div>
              <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">Aura Manager</span>
            </div>
            <button
              type="button"
              onClick={() => document.querySelector<HTMLButtonElement>('[data-sidebar="trigger"]')?.click()}
              className="p-2 hover:bg-sidebar-accent rounded transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-sidebar-foreground" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              <img 
                src="/icons/dark_icon_32x32.png" 
                alt="Aura Manager" 
                className="w-6 h-6 dark:hidden" 
              />
              <img 
                src="/icons/light_icon_32x32.png" 
                alt="Aura Manager" 
                className="w-6 h-6 hidden dark:block" 
              />
            </div>
          </div>
        )}
      </div>
      
      <SidebarContent className="py-4">
        {/* Main Navigation */}
        <SidebarGroup>
          {open && (
            <SidebarGroupLabel className="px-4 mb-2 text-sidebar-section-label font-bold text-[11px] uppercase tracking-widest">
              Main Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="mt-6">
          {open && (
            <SidebarGroupLabel className="px-4 mb-2 text-sidebar-section-label font-bold text-[11px] uppercase tracking-widest">
              Settings
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {settingsItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Spotify Integration - Desktop Only */}
        {open && (
          <div className="hidden md:block mt-6 px-4">
            <button 
              type="button"
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:shadow-lg ${
                isSpotifyConnected 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                  : 'bg-gradient-to-r from-accent to-accent-hover hover:from-accent-hover hover:to-accent text-black'
              }`}
              onClick={handleSpotifyConnect}
              disabled={spotifyConnectionLoading}
            >
              {spotifyConnectionLoading ? (
                <div className="w-5 h-5 relative">
                  <div className="w-5 h-5 animate-[fadeInOut_2s_ease-in-out_infinite]">
                    <img 
                      src="/icons/dark_icon_32x32.png" 
                      alt="Loading" 
                      className="w-full h-full" 
                    />
                  </div>
                </div>
              ) : (
                <Music className="h-5 w-5" />
              )}
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">
                  {isSpotifyConnected ? 'Spotify Connected' : 'Connect Spotify'}
                </p>
                <p className="text-xs opacity-90">
                  {isSpotifyConnected ? 'Music data synced' : 'Sync your music data'}
                </p>
              </div>
              {isSpotifyConnected && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </button>
          </div>
        )}

        {/* Tier Badge */}
        {open && (
          <div className="mt-auto pt-6 px-4">
            <div className="border-l-4 border-accent pl-3 py-2 bg-sidebar-accent">
              <div className="flex items-center gap-2">
                <Crown className={`h-5 w-5 ${
                  userTier === "Pro" ? "text-accent" : 
                  userTier === "Creator" ? "text-sedimentary-base" : 
                  "text-sidebar-foreground/60"
                }`} />
                <div className="flex-1">
                  <p className="text-base font-bold text-sidebar-foreground leading-tight">{userTier} Plan</p>
                  <p className="text-xs text-sidebar-foreground/70 mt-0.5">
                    {userTier === "Free" ? "Limited features" : "Full access"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
