import { Music2, LogOut, Menu, Sparkles } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Settings, CreditCard, Crown } from "lucide-react";

interface HeaderProps {
  showAuth?: boolean;
}

export function Header({ showAuth = false }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [currentPlan, setCurrentPlan] = useState<string>("Free");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        setUserEmail(session.user.email || "");
        fetchUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        setUserEmail(session.user.email || "");
        fetchUserProfile(session.user.id);
      } else {
        setUserEmail("");
        setDisplayName("");
        setAvatarUrl("");
        setCurrentPlan("Free");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", userId)
      .single();

    if (profile) {
      setDisplayName(profile.display_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }

    // Fetch subscription
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
    });
    navigate("/");
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
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

  const NavContent = () => (
    <>
      {!isAuthenticated && (
        <nav className="flex items-center gap-1 md:gap-2">
          <Link 
            to="/#features" 
            className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-accent transition-colors rounded-md hover:bg-accent/10"
          >
            Features
          </Link>
          <Link 
            to="/pricing" 
            className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-accent transition-colors rounded-md hover:bg-accent/10"
          >
            Pricing
          </Link>
          <Link 
            to="/help" 
            className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-accent transition-colors rounded-md hover:bg-accent/10"
          >
            Help
          </Link>
        </nav>
      )}
      
      <ThemeToggle />
      
      {!isAuthenticated && showAuth && location.pathname !== "/auth" && (
        <>
          <Button
            variant="outline"
            onClick={() => handleNavigation("/auth")}
            className="hover-scale"
          >
            Sign In
          </Button>
          <Button
            onClick={() => handleNavigation("/auth")}
            className="hover-scale hidden md:flex"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Get Started Free
          </Button>
        </>
      )}

      {isAuthenticated && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover-scale relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} alt={displayName || userEmail} />
                <AvatarFallback className="bg-gradient-to-br from-accent to-sedimentary-base text-foreground text-xs font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-background border-border z-50">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => handleNavigation("/account")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => handleNavigation("/pricing")}>
              <CreditCard className="mr-2 h-4 w-4" />
              <div className="flex items-center justify-between w-full">
                <span>Subscription</span>
                <Badge variant={getPlanBadgeVariant()} className="ml-2 text-xs">
                  {currentPlan}
                </Badge>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background backdrop-blur-none">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between px-4 max-w-screen-2xl mx-auto">
          {/* Logo */}
          <button
            onClick={() => handleNavigation("/")}
            className="flex items-center gap-3 hover-scale group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-sedimentary-base rounded-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_hsl(var(--accent)/0.4)]">
              <Music2 className="h-6 w-6 text-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight brand-text">
              AURA
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            <NavContent />
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center gap-2">
                      <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover-scale">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] card-urban border-border/50">
                <div className="flex flex-col gap-4 mt-8">
                  <NavContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
