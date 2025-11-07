import { Plus, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { hapticFeedback } from "@/lib/haptic-feedback";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  className?: string;
}

export const FloatingActionButton = ({ className }: FloatingActionButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    hapticFeedback.buttonPress();
    navigate("/my-content");
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className={cn(
        "md:hidden fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full shadow-2xl",
        "bg-gradient-to-br from-accent to-accent-hover",
        "hover:shadow-accent/50 hover:scale-110",
        "active:scale-95",
        "transition-all duration-300 ease-out",
        "border-2 border-accent-foreground/10",
        "group",
        className
      )}
      aria-label="Upload music"
    >
      <div className="relative">
        <Upload className="h-6 w-6 text-accent-foreground transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute inset-0 bg-accent-foreground/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </Button>
  );
};
