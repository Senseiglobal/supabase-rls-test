import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  noPadding?: boolean;
}

export const PageContainer = ({ 
  children, 
  className,
  maxWidth = "full",
  noPadding = false
}: PageContainerProps) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    "2xl": "max-w-7xl",
    full: "max-w-none"
  };

  return (
    <div className={cn(
      "min-h-screen w-full",
      !noPadding && "px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10",
      className
    )}>
      <div className={cn(
        "mx-auto w-full",
        maxWidthClasses[maxWidth]
      )}>
        {children}
      </div>
    </div>
  );
};