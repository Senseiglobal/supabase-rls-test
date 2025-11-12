import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Settings, CreditCard, Crown, Moon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [currentPlan, setCurrentPlan] = useState<string>("Free");
  const [isSleepMode, setIsSleepMode] = useState(false);

  const fetchUserData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || "");
      await fetchUserProfile(user.id);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email || "");
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);


  const fetchUserProfile = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", userId)
      .single();

    if (profile) {
      setDisplayName(profile.display_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan_name")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (subscription) {
      setCurrentPlan(subscription.plan_name);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account",
    });
    navigate("/");
  };

  const toggleSleepMode = () => {
    setIsSleepMode(!isSleepMode);
    toast({
      title: isSleepMode ? "Sleep Mode Off" : "Sleep Mode On",
      description: isSleepMode 
        ? "App will run normally in background" 
        : "App will minimize resource usage when inactive",
    });
    
    // Implement sleep mode behavior
    if (!isSleepMode) {
      // Enable sleep mode - reduce activity
      document.documentElement.classList.add('sleep-mode');
    } else {
      document.documentElement.classList.remove('sleep-mode');
    }
  };

  const getInitials = () => {
    if (displayName) {
      return displayName
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (userEmail) {
      return userEmail.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getPlanBadgeVariant = () => {
    switch (currentPlan.toLowerCase()) {
      case "pro":
        return "default";
      case "creator":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Sleep Mode Toggle - Visible affordance */}
      <Button
        variant={isSleepMode ? "default" : "outline"}
        size="sm"
        onClick={toggleSleepMode}
        className="gap-2 hidden md:flex"
        title={isSleepMode ? "Disable sleep mode" : "Enable sleep mode for background operation"}
      >
        <Moon className="h-4 w-4" />
        <span className="text-xs font-semibold">
          {isSleepMode ? "Sleep On" : "Sleep Off"}
        </span>
      </Button>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-sidebar-accent h-auto px-3 py-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={avatarUrl} alt={displayName || userEmail} />
              <AvatarFallback className="bg-gradient-to-br from-accent to-sedimentary-base text-foreground text-xs font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:flex flex-col items-start">
              <span className="text-xs font-semibold text-foreground leading-tight">
                {displayName || "User"}
              </span>
              <Badge variant={getPlanBadgeVariant()} className="text-[10px] h-4 px-1.5">
                {currentPlan}
              </Badge>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-background border-border">
          <DropdownMenuLabel className="font-normal pb-3">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-semibold leading-none text-foreground">
                {displayName || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {userEmail}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Crown className={`h-3.5 w-3.5 ${
                  currentPlan === "Pro" ? "text-accent" : 
                  currentPlan === "Creator" ? "text-sedimentary-base" : 
                  "text-muted-foreground"
                }`} />
                <span className="text-xs font-medium text-foreground">
                  {currentPlan} Plan
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {/* Mobile Sleep Mode Toggle */}
          <DropdownMenuItem 
            className="cursor-pointer md:hidden py-3" 
            onClick={toggleSleepMode}
          >
            <Moon className="mr-3 h-4 w-4" />
            <div className="flex-1">
              <span className="font-medium">Sleep Mode</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isSleepMode ? "Active - Low power" : "Off - Full power"}
              </p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="md:hidden" />
          
          <DropdownMenuItem 
            className="cursor-pointer py-3" 
            onClick={() => navigate("/account")}
          >
            <Settings className="mr-3 h-4 w-4" />
            <div>
              <span className="font-medium">Account Settings</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage profile & preferences
              </p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="cursor-pointer py-3" 
            onClick={() => navigate("/pricing")}
          >
            <CreditCard className="mr-3 h-4 w-4" />
            <div className="flex-1">
              <span className="font-medium">Subscription</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upgrade or manage plan
              </p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Prominent Sign Out - Don Norman principle: make critical actions visible */}
          <DropdownMenuItem 
            className="cursor-pointer bg-destructive/10 hover:bg-destructive/20 focus:bg-destructive/20 py-3" 
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-4 w-4 text-destructive" />
            <span className="font-semibold text-destructive">Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Visible Sign Out Button - Additional affordance for desktop */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        className="gap-2 hidden xl:flex border-destructive/30 text-destructive hover:bg-destructive/10"
        title="Sign out of your account"
      >
        <LogOut className="h-4 w-4" />
        <span className="text-xs font-semibold">Sign Out</span>
      </Button>
    </div>
  );
}
