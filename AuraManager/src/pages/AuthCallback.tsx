// src/pages/AuthCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loading } from "@/components/Loading";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOAuthRedirect = async () => {
      try {
        const { data, error } = await supabase.auth.getSessionFromUrl({
          storeSession: true,
        });

        if (error) {
          console.error("[AuthCallback] OAuth error:", error);
          toast.error("Authentication failed. Please try again.");
          navigate("/auth");
        } else if (data?.session) {
          // Check if user has completed onboarding
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', data.session.user.id)
          .single();

        if (!preferences) {
          // First time user - redirect to onboarding
          toast.success("Welcome! Let's get you set up.");
          navigate("/onboarding");
        } else {
          // Returning user - go to dashboard
          toast.success("Welcome back!");
          navigate("/dashboard");
        }
          // Fallback if no session
          navigate("/auth");
        }
      } catch (err) {
        console.error("[AuthCallback] Exception:", err);
        toast.error("Something went wrong. Please try again.");
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    handleOAuthRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loading size="lg" text="Signing you in..." />
    </div>
  );
};

export default AuthCallback;
