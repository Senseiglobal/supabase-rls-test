import { useLocation } from "react-router-dom";
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
  icon: React.ComponentType<{ className?: string }>;
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
      className="relative flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 min-w-[60px] text-foreground/50 hover:text-foreground transition-colors duration-150 active:scale-95 overflow-hidden"
      activeClassName="text-foreground"
    >
      <RippleContainer />
      <div className="relative z-10 flex flex-col items-center gap-0.5">
        <div className="relative">
          <item.icon className={cn(
            "h-6 w-6 transition-colors duration-150",
            isActive ? "text-foreground" : "text-foreground/50"
          )} />
          {badgeCount && badgeCount > 0 && (
            <NotificationBadge 
              count={badgeCount}
              variant="accent"
              className="absolute -top-1 -right-1"
            />
          )}
        </div>
        <span className={cn(
          "text-xs font-normal relative z-10 transition-colors duration-150",
          isActive ? "text-foreground font-medium" : "text-foreground/50"
        )}>
          {item.title}
        </span>
      </div>
    </NavLink>
  );
};

export const BottomNav = () => {
  const { counts, markAsRead } = useNotifications();
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
      "md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/20 bg-background/98 backdrop-blur-sm transition-transform duration-300 ease-in-out",
      scrollDirection === "down" ? "translate-y-full" : "translate-y-0"
    )}>
      <div className="flex items-center justify-around h-16 px-4">
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
    </nav>
  );
};
