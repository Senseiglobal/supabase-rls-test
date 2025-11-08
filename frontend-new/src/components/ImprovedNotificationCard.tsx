import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ExternalLink, Clock } from "lucide-react";

interface ImprovedNotificationCardProps {
  id: string;
  category: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  onMarkRead: (id: string) => void;
  className?: string;
}

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'urgent':
    case 'security':
    case 'critical':
      return {
        bg: '#dc2626', // Dark red
        hover: '#b91c1c', // Darker red on hover
        text: '#FFFFFF', // Pure white text
        priority: 'high'
      };
    case 'milestone':
    case 'achievement':
    case 'success':
      return {
        bg: '#22c55e', // Green
        hover: '#16a34a', // Darker green
        text: '#000000', // Black text
        priority: 'low'
      };
    case 'social':
    case 'engagement':
    case 'analytics':
      return {
        bg: '#facc15', // Yellow
        hover: '#eab308', // Darker yellow
        text: '#000000', // Black text
        priority: 'medium'
      };
    default:
      return {
        bg: '#f97316', // Orange
        hover: '#ea580c', // Darker orange
        text: '#000000', // Black text
        priority: 'medium'
      };
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

export function ImprovedNotificationCard({
  id,
  category,
  title,
  message,
  is_read,
  created_at,
  onMarkRead,
  className,
}: ImprovedNotificationCardProps) {
  const colors = getCategoryColor(category);
  const timeAgo = formatTimeAgo(created_at);

  return (
    <div
      className={cn(
        "relative group transition-all duration-200 hover:shadow-lg overflow-hidden",
        "bg-card border rounded-xl p-5 hover:border-orange-500/40",
        is_read ? "opacity-75" : "opacity-100",
        className
      )}
      style={{ minHeight: '120px' }}
    >
      {/* Accent Line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: colors.bg }}
      />

      {/* Card Content */}
      <div className="flex flex-col space-y-4 pl-3">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold leading-tight text-foreground flex-1 pr-2">
            {title}
          </h3>

          <div className="flex items-center gap-2">
            {!is_read && (
              <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
            )}
            
            <Badge
              variant="outline"
              className="transition-all duration-200 cursor-default flex-shrink-0 border-0"
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
                fontWeight: colors.priority === 'high' ? '700' : '600',
                textShadow: colors.priority === 'high' ? '0 1px 2px rgba(0,0,0,0.7), 0 0 1px rgba(0,0,0,0.5)' : 'none',
                border: colors.priority === 'high' ? '1px solid rgba(255,255,255,0.2)' : 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.hover;
                e.currentTarget.style.transform = 'scale(1.05)';
                if (colors.priority === 'high') {
                  e.currentTarget.style.textShadow = '0 1px 3px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.6)';
                  e.currentTarget.style.fontWeight = '700';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.bg;
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.textShadow = colors.priority === 'high' ? '0 1px 2px rgba(0,0,0,0.7), 0 0 1px rgba(0,0,0,0.5)' : 'none';
                e.currentTarget.style.fontWeight = colors.priority === 'high' ? '700' : '600';
              }}
            >
              {category}
            </Badge>
          </div>
        </div>

        {/* Body Text */}
        <p className="text-sm text-muted-foreground leading-relaxed -mt-1">
          {message}
        </p>

        {/* Footer Row */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/50">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>

          <div className="flex items-center space-x-3">
            {!is_read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkRead(id)}
                className="h-8 px-3 text-xs hover:text-green-400 hover:bg-green-400/10"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Mark as Read
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs hover:text-orange-400 hover:bg-orange-400/10"
            >
              <span className="mr-1">Tell me more</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}