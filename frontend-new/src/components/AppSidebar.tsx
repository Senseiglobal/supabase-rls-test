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
  X
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
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
  icon: any;
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
    requiredTier: "Creator",
    description: "AI-powered insights and charts"
  },
  { 
    title: "My Content", 
    url: "/my-content", 
    icon: FolderOpen,
    requiredTier: "Creator",
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
    icon: TrendingUp,
    requiredTier: "Pro",
    description: "Advanced performance reports"
  },
  { 
    title: "Feed", 
    url: "/feed", 
    icon: TrendingUp,
    requiredTier: "Creator",
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
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [userTier, setUserTier] = useState<TierName>("Free");

  useEffect(() => {
    fetchUserTier();
  }, []);

  const fetchUserTier = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan_name")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (subscription) {
      setUserTier(subscription.plan_name as TierName);
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
          className={`relative px-4 py-3 ${locked ? "cursor-not-allowed opacity-50" : ""} ${
            active ? "" : "hover:bg-sidebar-accent"
          }`}
        >
          {locked ? (
            <div className="flex items-center gap-3 w-full">
              <item.icon className="h-5 w-5 flex-shrink-0 text-sidebar-foreground/40" />
              {open && (
                <>
                  <span className="flex-1 text-base font-semibold text-sidebar-foreground/50">{item.title}</span>
                  <Lock className="h-4 w-4 text-sidebar-foreground/40" />
                </>
              )}
            </div>
          ) : (
            <NavLink 
              to={item.url} 
              className={`flex items-center gap-3 w-full transition-colors ${
                active 
                  ? "bg-accent text-accent-foreground border-l-4 border-accent font-bold" 
                  : "text-sidebar-foreground border-l-4 border-transparent hover:border-sidebar-border font-semibold"
              }`}
            >
              <item.icon className={`flex-shrink-0 ${open ? "h-5 w-5" : "h-6 w-6"}`} />
              {open && <span className="flex-1 text-base">{item.title}</span>}
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
            <h2 className="text-xl font-bold text-sidebar-foreground">AURA</h2>
            <button
              onClick={() => document.querySelector<HTMLButtonElement>('[data-sidebar="trigger"]')?.click()}
              className="p-2 hover:bg-sidebar-accent rounded transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-sidebar-foreground" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-accent flex items-center justify-center rounded font-bold text-accent-foreground text-sm">
              A
            </div>
          </div>
        )}
      </div>
      
      <SidebarContent className="py-6">
        {/* Main Navigation */}
        <SidebarGroup>
          {open && (
            <SidebarGroupLabel className="px-4 mb-3 text-sidebar-section-label font-bold text-[11px] uppercase tracking-widest">
              Main Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0">
              {navItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="mt-8">
          {open && (
            <SidebarGroupLabel className="px-4 mb-3 text-sidebar-section-label font-bold text-[11px] uppercase tracking-widest">
              Settings
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0">
              {settingsItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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
