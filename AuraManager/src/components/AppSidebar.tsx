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
  Sliders,
  Languages,
  HelpCircle,
  MessageCircle
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
    icon: Sliders,
    requiredTier: "Free",
    description: "Manage your music preferences and personalization settings"
  },
  {
    title: "Language",
    url: "/settings/language",
    icon: Languages,
    requiredTier: "Free",
    description: "Change app language"
  },
  {
    title: "Support",
    url: "/help",
    icon: HelpCircle,
    requiredTier: "Free",
    description: "Help center and FAQs"
  },
  {
    title: "Report Problem",
    url: "/settings/feedback",
    icon: MessageCircle,
    requiredTier: "Free",
    description: "Send feedback or report issues"
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
  const { open, isMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [userTier, setUserTier] = useState<TierName>("Free");
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [spotifyConnectionLoading, setSpotifyConnectionLoading] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  
  // Always show labels on all screen sizes - no icon-only mode
  const showLabels = true;

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
          className={`relative ${locked ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {locked ? (
            <div className="flex items-center w-full gap-4 py-3 px-4">
              {/* Icon - Hidden on mobile, visible on desktop */}
              <span className="hidden lg:inline-flex items-center justify-center flex-shrink-0 w-5 nav-item-icon">
                <item.icon className="h-5 w-5 flex-shrink-0 text-sidebar-foreground/40" />
              </span>
              
              {/* Text Label - Always visible, evenly spaced */}
              <span className="nav-item-text text-left flex-1 text-sm font-medium text-sidebar-foreground/50 break-words leading-tight">
                {item.title}
              </span>
              
              {/* Lock icon - Hidden on mobile, visible on desktop */}
              <span className="hidden lg:inline-flex">
                <Lock className="h-4 w-4 text-sidebar-foreground/40 flex-shrink-0" />
              </span>
            </div>
          ) : (
            <NavLink 
              to={item.url} 
              className={`flex items-center w-full transition-all duration-200 rounded-md gap-4 py-3 px-4 ${
                active 
                  ? "bg-accent text-accent-foreground font-semibold" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 font-medium"
              }`}
            >
              {/* Icon - Hidden on mobile, visible on desktop */}
              <span className="hidden lg:inline-flex items-center justify-center flex-shrink-0 w-5 nav-item-icon">
                <item.icon className="h-5 w-5 flex-shrink-0" />
              </span>
              
              {/* Text Label - Always visible, evenly spaced */}
              <span className="nav-item-text text-left flex-1 text-sm font-medium break-words leading-tight">
                {item.title}
              </span>
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
      className="border-r border-sidebar-border bg-sidebar transition-all duration-200 w-64 md:w-64"
      collapsible="icon"
    >
      {/* Clean header with branding - Responsive: Text only on mobile, Icon+Text on desktop */}
      <div className="border-b border-sidebar-border px-4 py-3 flex items-center justify-between w-full">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Logo Icon - Hidden on mobile, visible on desktop */}
          <span className="hidden lg:flex w-8 h-8 rounded-md overflow-hidden items-center justify-center flex-shrink-0">
            <img 
              src="/icons/dark_icon_32x32.png" 
              alt="Aura Manager" 
              className="w-7 h-7 dark:hidden" 
            />
            <img 
              src="/icons/light_icon_32x32.png" 
              alt="Aura Manager" 
              className="w-7 h-7 hidden dark:block" 
            />
          </span>
          
          {/* Brand Text - Always visible */}
          <span className="font-semibold text-base text-sidebar-foreground">Aura Manager</span>
        </div>
        <button
          type="button"
          onClick={() => document.querySelector<HTMLButtonElement>('[data-sidebar="trigger"]')?.click()}
          className="p-1.5 hover:bg-sidebar-accent rounded-md transition-colors flex-shrink-0 md:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5 text-sidebar-foreground" />
        </button>
      </div>
      
      <SidebarContent className="py-6 px-2 overflow-y-auto">
        {/* Main Navigation */}
        <SidebarGroup>
          {showLabels && (
            <SidebarGroupLabel className="px-3 mb-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wide">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="mt-10">
          <button
            onClick={() => setSettingsExpanded(!settingsExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-sidebar-accent/30 rounded-md transition-colors"
          >
            {showLabels && (
              <SidebarGroupLabel className="px-0 mb-0 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wide flex-1 text-left">
                Settings
              </SidebarGroupLabel>
            )}
            <svg
              className={`w-4 h-4 text-sidebar-foreground/60 transition-transform ${
                settingsExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          {settingsExpanded && (
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {settingsItems.map(renderNavItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        {/* Spotify Integration - Responsive: Text only on mobile, Icon+Text on desktop */}
        <div className="mt-6 px-4">
            <button 
              type="button"
              className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all duration-200 hover:shadow-lg ${
                isSpotifyConnected 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                  : 'bg-gradient-to-r from-accent to-accent-hover hover:from-accent-hover hover:to-accent text-black'
              }`}
              onClick={handleSpotifyConnect}
              disabled={spotifyConnectionLoading}
            >
              {/* Icon - Hidden on mobile, visible on desktop */}
              {spotifyConnectionLoading ? (
                <span className="hidden lg:flex w-5 h-5 items-center justify-center flex-shrink-0">
                  <div className="w-5 h-5 animate-[fadeInOut_2s_ease-in-out_infinite]">
                    <img 
                      src="/icons/dark_icon_32x32.png" 
                      alt="Loading" 
                      className="w-full h-full" 
                    />
                  </div>
                </span>
              ) : (
                <span className="hidden lg:inline-flex items-center justify-center flex-shrink-0 w-5">
                  <Music className="h-5 w-5 flex-shrink-0" />
                </span>
              )}
              
              {/* Text - Always visible */}
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">
                  {isSpotifyConnected ? 'Spotify Connected' : 'Connect Spotify'}
                </p>
                <p className="text-xs opacity-90">
                  {isSpotifyConnected ? 'Music data synced' : 'Sync your music data'}
                </p>
              </div>
              
              {/* Status indicator - Always visible */}
              {isSpotifyConnected && (
                <div className="hidden lg:block w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
              )}
            </button>
        </div>

        {/* Tier Badge - Responsive: Text only on mobile, Icon+Text on desktop */}
        <div className="mt-auto pt-6 px-4">
          <div className="border-l-4 border-accent pl-3 py-2 bg-sidebar-accent">
            <div className="flex items-center gap-4">
              {/* Icon - Hidden on mobile, visible on desktop */}
              <span className="hidden lg:inline-flex items-center justify-center flex-shrink-0 w-5">
                <Crown className={`h-5 w-5 flex-shrink-0 ${
                  userTier === "Pro" ? "text-accent" : 
                  userTier === "Creator" ? "text-sedimentary-base" : 
                  "text-sidebar-foreground/60"
                }`} />
              </span>
              
              {/* Text - Always visible */}
              <div className="flex-1">
                <p className="text-sm font-bold text-sidebar-foreground leading-tight">{userTier} Plan</p>
                <p className="text-xs text-sidebar-foreground/70 mt-0.5">
                  {userTier === "Free" ? "Limited features" : "Full access"}
                </p>
              </div>
            </div>
          </div>
        </div>
        
      </SidebarContent>
    </Sidebar>
  );
}
