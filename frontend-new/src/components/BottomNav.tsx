import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, LineChart, Music, MessageSquare } from "lucide-react";
import { NavLink } from "./NavLink";
import { useRipple } from "@/hooks/use-ripple";
import { NotificationBadge } from "./NotificationBadge";
import { useNotifications } from "@/hooks/use-notifications";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { hapticFeedback } from "@/lib/haptic-feedback";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  icon: any;
  to: string;
  category?: 'chat' | 'analytics' | 'content' | 'dashboard';
}

const BottomNavItem = ({ 
  item, 
  onTap,
  badgeCount,
  onNavigate
}: { 
  item: NavItem; 
  onTap: () => void;
  badgeCount?: number;
  onNavigate: () => void;
}) => {
  const { addRipple, RippleContainer } = useRipple();
  const location = useLocation();
  const isActive = location.pathname === item.to;
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const handleInteraction = (e: React.MouseEvent<HTMLAnchorElement> | React.TouchEvent<HTMLAnchorElement>) => {
    addRipple(e);
    onTap();
    onNavigate();
  };

  return (
    <NavLink
      to={item.to}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      className="relative flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[70px] text-foreground/60 hover:text-accent transition-all duration-200 rounded-xl hover:bg-accent/5 active:scale-95 overflow-hidden"
      activeClassName="text-accent"
    >
      <RippleContainer />
      <div className="relative z-10">
        <div className={cn(
          "relative p-2 rounded-xl transition-all duration-200",
          isActive && "bg-accent/10"
        )}>
          <item.icon className={cn(
            "h-5 w-5 transition-all duration-200",
            shouldAnimate && 'animate-bounce-subtle',
            isActive && "text-accent"
          )} />
          {badgeCount && badgeCount > 0 && (
            <NotificationBadge 
              count={badgeCount}
              variant="accent"
              className="absolute -top-1 -right-1"
            />
          )}
        </div>
      </div>
      <span className={cn(
        "text-[10px] font-semibold relative z-10 tracking-wide uppercase transition-all duration-200",
        isActive && "text-accent"
      )}>
        {item.title}
      </span>
    </NavLink>
  );
};

export const BottomNav = () => {
  const { counts, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const scrollDirection = useScrollDirection();

  const navItems: NavItem[] = [
    { title: "Dashboard", icon: Home, to: "/dashboard", category: "dashboard" },
    { title: "Analytics", icon: LineChart, to: "/analytics", category: "analytics" },
    { title: "Content", icon: Music, to: "/my-content", category: "content" },
    { title: "Chat", icon: MessageSquare, to: "/chat", category: "chat" },
  ];

  const handleTap = () => {
    hapticFeedback.navigation();
  };

  const handleNavigate = (category?: string) => {
    if (category) {
      markAsRead(category as keyof typeof counts);
    }
  };

  return (
    <nav className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-xl shadow-lg transition-transform duration-300 ease-in-out",
      scrollDirection === "down" ? "translate-y-full" : "translate-y-0"
    )}>
      <div className="relative">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-accent/5 pointer-events-none" />
        
        <div className="flex items-center justify-around h-20 px-2 relative">
          {navItems.map((item) => (
            <BottomNavItem 
              key={item.to} 
              item={item} 
              onTap={handleTap}
              badgeCount={item.category ? counts[item.category] : 0}
              onNavigate={() => handleNavigate(item.category)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};
