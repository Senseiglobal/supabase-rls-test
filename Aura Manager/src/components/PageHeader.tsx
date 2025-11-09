import { ArrowLeft, Home, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showMenuDots?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const PageHeader = ({ 
  title, 
  subtitle, 
  showBackButton = true,
  showHomeButton = false,
  showMenuDots = false,
  className,
  children
}: PageHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleBack = () => {
    if (globalThis.history && globalThis.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleHome = () => {
    navigate('/dashboard');
  };

  const isHomePage = location.pathname === '/' || location.pathname === '/dashboard';

  return (
    <div className={cn(
      "flex items-center justify-between mb-6 md:mb-8 px-4 md:px-6 lg:px-8",
      className
    )}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Navigation Icons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {showBackButton && !isHomePage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2 hover:bg-accent/10 rounded-full"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {showHomeButton && !isHomePage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHome}
              className="p-2 hover:bg-accent/10 rounded-full"
              aria-label="Go to dashboard"
            >
              <Home className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Title and Subtitle */}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm md:text-base text-foreground/70 mt-1 line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right side content */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {children}
        
        {showMenuDots && (
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-accent/10 rounded-full"
            aria-label="More options"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};