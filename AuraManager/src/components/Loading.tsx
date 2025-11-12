import React from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({ 
  size = "md", 
  text = "Loading...", 
  className = "" 
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        {/* Animated logo with fade in/out between light and dark */}
        <div className="relative w-full h-full">
          <img 
            src="/icons/dark_icon_512.png" 
            alt="AuraManager" 
            className="w-full h-full absolute inset-0 dark:hidden animate-[fadeInOut_2s_ease-in-out_infinite]" 
          />
          <img 
            src="/icons/light_icon_512.png" 
            alt="AuraManager" 
            className="w-full h-full absolute inset-0 hidden dark:block animate-[fadeInOut_2s_ease-in-out_infinite]" 
          />
        </div>
      </div>
      {text && (
        <div className="text-sm text-muted-foreground animate-pulse">{text}</div>
      )}
    </div>
  );
};

export default Loading;