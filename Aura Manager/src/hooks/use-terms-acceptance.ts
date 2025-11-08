import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TermsAcceptance {
  hasAcceptedTerms: boolean;
  termsVersion: string | null;
  lastAcceptedAt: string | null;
  loading: boolean;
}

export const useTermsAcceptance = () => {
  const [termsData, setTermsData] = useState<TermsAcceptance>({
    hasAcceptedTerms: false,
    termsVersion: null,
    lastAcceptedAt: null,
    loading: true,
  });

  const checkTermsAcceptance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setTermsData({
          hasAcceptedTerms: false,
          termsVersion: null,
          lastAcceptedAt: null,
          loading: false,
        });
        return;
      }

      // Check if user has accepted current terms
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, bio, created_at") // Only select existing columns
        .eq("user_id", user.id)
        .single();

      // For now, we'll use localStorage to track terms acceptance
      // until we can update the database schema
      const termsAccepted = localStorage.getItem(`terms_accepted_${user.id}`);
      const termsVersion = localStorage.getItem(`terms_version_${user.id}`);
      const acceptedAt = localStorage.getItem(`terms_accepted_at_${user.id}`);

      setTermsData({
        hasAcceptedTerms: termsAccepted === "true",
        termsVersion: termsVersion,
        lastAcceptedAt: acceptedAt,
        loading: false,
      });
    } catch (error) {
      console.error("Error checking terms acceptance:", error);
      setTermsData({
        hasAcceptedTerms: false,
        termsVersion: null,
        lastAcceptedAt: null,
        loading: false,
      });
    }
  };

  const markTermsAsAccepted = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date().toISOString();
    const version = "1.0";

    // Store in localStorage for now
    localStorage.setItem(`terms_accepted_${user.id}`, "true");
    localStorage.setItem(`terms_version_${user.id}`, version);
    localStorage.setItem(`terms_accepted_at_${user.id}`, now);

    setTermsData({
      hasAcceptedTerms: true,
      termsVersion: version,
      lastAcceptedAt: now,
      loading: false,
    });
  };

  const resetTermsAcceptance = () => {
    setTermsData({
      hasAcceptedTerms: false,
      termsVersion: null,
      lastAcceptedAt: null,
      loading: false,
    });
  };

  useEffect(() => {
    checkTermsAcceptance();
  }, []);

  return {
    ...termsData,
    checkTermsAcceptance,
    markTermsAsAccepted,
    resetTermsAcceptance,
  };
};