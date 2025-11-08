import { useState, useEffect, type ReactNode } from "react";
import { TermsContext, type TermsContextValue, type TermsTrigger } from "@/contexts/terms";
import { useLocation } from "react-router-dom";
import { TermsAndConditions } from "@/components/TermsAndConditions";
import { useTermsAcceptance } from "@/hooks/use-terms-acceptance";
import { supabase } from "@/integrations/supabase/client";

interface TermsWrapperProps {
  children: ReactNode;
}

export const TermsWrapper = ({ children }: TermsWrapperProps) => {
  const [showTerms, setShowTerms] = useState(false);
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
      
      // Less invasive: only auto-show during onboarding/auth flows
      if (event === 'SIGNED_IN' && session?.user) {
        const path = globalThis.location?.pathname || '';
        if ((path === '/onboarding' || path === '/auth') && !hasAcceptedTerms) {
          setTriggerType("signup");
          setShowTerms(true);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [hasAcceptedTerms]);

  // Check if terms should be shown based on current route and actions
  useEffect(() => {
    if (loading || !isAuthenticated || hasAcceptedTerms) return;
    // Non-invasive: only auto-open on onboarding route
    if (location.pathname === '/onboarding') {
      setTriggerType('signup');
      setShowTerms(true);
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