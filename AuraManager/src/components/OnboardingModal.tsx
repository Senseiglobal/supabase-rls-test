import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Users } from "lucide-react";

interface WorkspaceUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface OnboardingModalProps {
  onSkip: () => void;
  onContinue: () => void;
}

export function OnboardingModal({ onSkip, onContinue }: OnboardingModalProps) {
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUser[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  useEffect(() => {
    loadOnboardingData();
  }, []);

  const loadOnboardingData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
      }

      // Get workspace users (all users except current user)
      const { data: authUsers, error } = await supabase.auth.admin.listUsers();
      
      if (!error && authUsers) {
        const otherUsers = authUsers.users
          .filter((u) => u.id !== user?.id)
          .slice(0, 5); // Show first 5 other users
        
        setWorkspaceUsers(
          otherUsers.map((u) => ({
            id: u.id,
            email: u.email || "",
            user_metadata: u.user_metadata,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading onboarding data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (user: WorkspaceUser) => {
    return user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  };

  const getInitials = (user: WorkspaceUser) => {
    const name = getDisplayName(user);
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome to Aura Manager</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Step {step} of 2 - Let's get you started
            </p>
          </div>
          <button
            onClick={onSkip}
            className="p-2 hover:bg-accent/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {step === 1 ? (
            // Step 1: Welcome & Features
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Your All-in-One Music Management Platform
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Aura Manager helps you analyze, track, and grow your music career with AI-powered insights.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    icon: "📊",
                    title: "Analytics",
                    description: "Track performance metrics and growth trends",
                  },
                  {
                    icon: "🎵",
                    title: "Content Management",
                    description: "Upload and organize your music easily",
                  },
                  {
                    icon: "🤖",
                    title: "AI Assistant",
                    description: "Get personalized recommendations 24/7",
                  },
                  {
                    icon: "📈",
                    title: "Reports",
                    description: "Generate detailed performance reports",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="p-4 bg-sidebar rounded-lg border border-sidebar-border"
                  >
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <h3 className="font-semibold text-sm text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Step 2: Workspace Users
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-accent" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Users in Your Workspace
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  You're connected with {workspaceUsers.length} other users. Collaborate and share insights!
                </p>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-sidebar rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : workspaceUsers.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {workspaceUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 bg-sidebar rounded-lg border border-sidebar-border hover:bg-sidebar-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-accent-foreground">
                            {getInitials(user)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-sm">
                            {getDisplayName(user)}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-sidebar rounded-lg border border-sidebar-border text-center">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    No other users in workspace yet. You can invite team members from your account settings.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border p-6 flex items-center justify-between gap-3">
          <Button
            onClick={onSkip}
            variant="outline"
            className="flex-1"
          >
            Skip
          </Button>

          {step === 1 ? (
            <Button
              onClick={() => setStep(2)}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={onContinue}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Continue to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
