import { useState, useEffect, type ReactNode } from "react";
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
      
      // Show terms for new signups
      if (event === 'SIGNED_IN' && session?.user) {
        setTriggerType("signup");
        setShowTerms(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check if terms should be shown based on current route and actions
  useEffect(() => {
    if (loading || !isAuthenticated) return;

    // Don't show terms if already accepted
    if (hasAcceptedTerms) return;

    // Show terms for authenticated users who haven't accepted
    if (isAuthenticated && !hasAcceptedTerms) {
      // Determine trigger type based on current route
      if (location.pathname === "/account") {
        setTriggerType("platform_connect");
      } else if (location.pathname === "/dashboard" || location.pathname === "/analytics") {
        setTriggerType("data_input");
      } else {
        setTriggerType("signup");
      }
      setShowTerms(true);
    }
  }, [loading, isAuthenticated, hasAcceptedTerms, location.pathname]);

  // Global event listener for data input actions
  useEffect(() => {
    const handleDataInputAction = () => {
      if (isAuthenticated && !hasAcceptedTerms) {
        setTriggerType("data_input");
        setShowTerms(true);
      }
    };

    const handlePlatformConnect = () => {
      if (isAuthenticated && !hasAcceptedTerms) {
        setTriggerType("platform_connect");
        setShowTerms(true);
      }
    };

    // Listen for custom events that might trigger terms
    globalThis.addEventListener("spotify-connect-attempt", handlePlatformConnect);
    globalThis.addEventListener("file-upload-attempt", handleDataInputAction);
    globalThis.addEventListener("platform-connect-attempt", handlePlatformConnect);

    return () => {
      globalThis.removeEventListener("spotify-connect-attempt", handlePlatformConnect);
      globalThis.removeEventListener("file-upload-attempt", handleDataInputAction);
      globalThis.removeEventListener("platform-connect-attempt", handlePlatformConnect);
    };
  }, [isAuthenticated, hasAcceptedTerms]);

  const handleAcceptTerms = async () => {
    await markTermsAsAccepted();
    setShowTerms(false);
  };

  const handleDeclineTerms = () => {
    setShowTerms(false);
    // Optionally redirect to home or sign out user
  };

  return (
    <>
      {children}
      <TermsAndConditions
        isOpen={showTerms}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
        trigger={triggerType}
      />
    </>
  );
};

// Helper function to trigger terms modal from anywhere in the app
export const triggerTermsForDataInput = () => {
  globalThis.dispatchEvent(new CustomEvent("file-upload-attempt"));
};

export const triggerTermsForPlatformConnect = () => {
  globalThis.dispatchEvent(new CustomEvent("platform-connect-attempt"));
};

export const triggerTermsForSpotifyConnect = () => {
  globalThis.dispatchEvent(new CustomEvent("spotify-connect-attempt"));
};

export default TermsWrapper;