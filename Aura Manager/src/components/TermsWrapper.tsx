import { useState, useEffect, type ReactNode } from "react";
import { TermsContext, type TermsContextValue, type TermsTrigger } from "@/contexts/terms";
import { useLocation } from "react-router-dom";
import { TermsAndConditions } from "@/components/TermsAndConditions";
import { useTermsAcceptance } from "@/hooks/use-terms-acceptance";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface TermsWrapperProps {
  children: ReactNode;
}

export const TermsWrapper = ({ children }: TermsWrapperProps) => {
  const [showTerms, setShowTerms] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [triggerType, setTriggerType] = useState<"signup" | "data_input" | "platform_connect">("signup");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { hasAcceptedTerms, loading, markTermsAsAccepted } = useTermsAcceptance();
  const location = useLocation();

  type Trigger = TermsTrigger;

  const open = (trigger: Trigger) => {
    // Only prompt if authenticated and not yet accepted
    if (isAuthenticated && !hasAcceptedTerms) {
      setTriggerType(trigger);
      setShowTerms(true);
    }
  };

  const close = () => setShowTerms(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      
      // Less invasive: only auto-nudge during onboarding/auth flows
      if (event === 'SIGNED_IN' && session?.user) {
        const path = globalThis.location?.pathname || '';
        if ((path === '/onboarding' || path === '/auth') && !hasAcceptedTerms) {
          setTriggerType("signup");
          setShowNudge(true);
          // Auto-dismiss after a few seconds with subtle animation
          const timer = setTimeout(() => setShowNudge(false), 5000);
          return () => clearTimeout(timer);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [hasAcceptedTerms]);

  // Check if terms should be nudged based on current route and actions
  useEffect(() => {
    if (loading || !isAuthenticated || hasAcceptedTerms) return;
    // Non-invasive: only auto-nudge on onboarding route
    if (location.pathname === '/onboarding') {
      setTriggerType('signup');
      setShowNudge(true);
      const timer = setTimeout(() => setShowNudge(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, hasAcceptedTerms, location.pathname]);

  // Removed global custom event listeners in favor of context API

  const handleAcceptTerms = async () => {
    await markTermsAsAccepted();
    setShowTerms(false);
  };

  const handleDeclineTerms = () => {
    setShowTerms(false);
    // Optionally redirect to home or sign out user
  };

  return (
    <TermsContext.Provider value={{ open, close }}>
      {children}
      {/* Subtle tooltip nudge instead of modal auto-pop */}
      {showNudge && (
        <div className="fixed bottom-6 right-6 z-50">
          <Tooltip open>
            <TooltipTrigger asChild>
              {/* Hidden trigger just to anchor the tooltip */}
              <button aria-hidden="true" className="sr-only" />
            </TooltipTrigger>
            <TooltipContent side="top" align="end" className="bg-popover/95 backdrop-blur-md border-border shadow-lg animate-in fade-in-50 zoom-in-95">
              <div className="text-sm text-foreground">
                Please review our Terms & Privacy.
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Button asChild size="sm" variant="outline">
                  <a href="/terms">Open</a>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowNudge(false)}>
                  Dismiss
                </Button>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
      <TermsAndConditions
        isOpen={showTerms}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
        trigger={triggerType}
      />
    </TermsContext.Provider>
  );
};

// useTerms hook is provided by contexts/terms

export default TermsWrapper;