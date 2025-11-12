import { useState } from "react";
import { MessageSquare, Upload, Music, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { hapticFeedback } from "@/lib/haptic-feedback";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FloatingActionButtonProps {
  className?: string;
}

export const FloatingActionButton = ({ className }: FloatingActionButtonProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleMainClick = () => {
    hapticFeedback.buttonPress();
    setIsOpen(!isOpen);
  };

  const handleChatClick = () => {
    hapticFeedback.buttonPress();
    setIsOpen(false);
    navigate("/chat");
  };

  const handleSpotifyClick = () => {
    hapticFeedback.buttonPress();
    setIsOpen(false);
    // Navigate to account page where user can connect Spotify
    navigate("/account");
  };

  const handleUploadClick = () => {
    hapticFeedback.buttonPress();
    setIsOpen(false);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/mp3,audio/wav,audio/mpeg";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setUploadedFile(file);
        setShowUploadDialog(true);
      }
    };
    input.click();
  };

  const handleUploadConfirm = () => {
    if (uploadedFile) {
      toast({
        title: "Processing Audio",
        description: `Analyzing "${uploadedFile.name}" with Aura Manager AI...`,
      });
      setShowUploadDialog(false);
      setUploadedFile(null);
      // Navigate to chat after upload
      setTimeout(() => navigate("/chat"), 500);
    }
  };

  return (
    <>
      {/* Action buttons that appear when FAB is open */}
      <div
        className={cn(
          "md:hidden fixed bottom-32 right-6 z-40 flex flex-col gap-3 transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* Chat with Aura Manager */}
        <Button
          onClick={handleChatClick}
          size="lg"
          className={cn(
            "h-12 px-4 rounded-full shadow-lg",
            "bg-gradient-to-br from-accent to-accent-hover",
            "hover:shadow-accent/50 hover:scale-105",
            "transition-all duration-300",
            "border border-accent-foreground/10",
            "flex items-center gap-2"
          )}
        >
          <MessageSquare className="h-5 w-5 text-accent-foreground" />
          <span className="text-sm font-semibold text-accent-foreground">Chat with AI</span>
        </Button>

        {/* Upload Audio */}
        <Button
          onClick={handleUploadClick}
          size="lg"
          className={cn(
            "h-12 px-4 rounded-full shadow-lg",
            "bg-gradient-to-br from-primary to-primary-hover",
            "hover:shadow-primary/50 hover:scale-105",
            "transition-all duration-300",
            "border border-primary-foreground/10",
            "flex items-center gap-2"
          )}
        >
          <Upload className="h-5 w-5 text-primary-foreground" />
          <span className="text-sm font-semibold text-primary-foreground">Upload Audio</span>
        </Button>

        {/* Connect Spotify */}
        <Button
          onClick={handleSpotifyClick}
          size="lg"
          className={cn(
            "h-12 px-4 rounded-full shadow-lg",
            "bg-gradient-to-br from-success to-success",
            "hover:shadow-success/50 hover:scale-105",
            "transition-all duration-300",
            "border border-success-foreground/10",
            "flex items-center gap-2"
          )}
        >
          <Music className="h-5 w-5 text-success-foreground" />
          <span className="text-sm font-semibold text-success-foreground">Add Spotify</span>
        </Button>
      </div>

      {/* Main FAB - positioned higher to avoid blocking bottom nav */}
      <Button
        onClick={handleMainClick}
        size="lg"
        className={cn(
          "md:hidden fixed bottom-28 right-6 z-50 h-14 w-14 rounded-full shadow-2xl",
          "bg-gradient-to-br from-accent to-accent-hover",
          "hover:shadow-accent/50 hover:scale-110",
          "active:scale-95",
          "transition-all duration-300 ease-out",
          "border-2 border-accent-foreground/10",
          "group",
          className
        )}
        aria-label="Quick actions menu"
      >
        <div className="relative">
          {isOpen ? (
            <X className="h-6 w-6 text-accent-foreground transition-transform duration-300 group-hover:rotate-90" />
          ) : (
            <MessageSquare className="h-6 w-6 text-accent-foreground transition-transform duration-300 group-hover:scale-110" />
          )}
          <div className="absolute inset-0 bg-accent-foreground/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Button>

      {/* Upload confirmation dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Analyze Audio with Aura Manager</DialogTitle>
            <DialogDescription className="text-foreground/70">
              Aura Manager will analyze your track and provide insights on style, mood, production quality, and recommendations.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <Music className="h-10 w-10 text-accent flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {uploadedFile?.name}
                </p>
                <p className="text-xs text-foreground/60">
                  {uploadedFile ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB` : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadDialog(false);
                  setUploadedFile(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadConfirm}
                className="flex-1 bg-gradient-to-r from-accent to-accent-hover"
              >
                Analyze Track
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
