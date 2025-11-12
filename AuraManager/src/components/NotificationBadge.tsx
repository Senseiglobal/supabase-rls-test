import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count?: number;
  variant?: "default" | "accent" | "danger" | "success";
  dot?: boolean;
  className?: string;
}

export const NotificationBadge = ({ 
  count = 0, 
  variant = "accent",
  dot = false,
  className 
}: NotificationBadgeProps) => {
  if (count === 0 && !dot) return null;

  const variantStyles = {
    default: "bg-muted text-muted-foreground",
    accent: "bg-accent text-accent-foreground",
    danger: "bg-danger text-danger-foreground",
    success: "bg-success text-success-foreground",
  };

  const displayCount = count > 99 ? "99+" : count.toString();

  if (dot) {
    return (
      <span 
        className={cn(
          "absolute top-1 right-1 h-2 w-2 rounded-full animate-pulse",
          variantStyles[variant],
          className
        )}
      />
    );
  }

  return (
    <span 
      className={cn(
        "absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[9px] font-bold shadow-lg border-2 border-background animate-pulse",
        variantStyles[variant],
        className
      )}
    >
      {displayCount}
    </span>
  );
};
