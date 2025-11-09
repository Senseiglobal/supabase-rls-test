import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Sparkles, Eye, EyeOff, Music } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Startup environment validation
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const publicBase = import.meta.env.VITE_PUBLIC_BASE_URL;
    
    console.log('[Auth] 🔍 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasPublicBase: !!publicBase,
      supabaseUrlPrefix: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING',
      publicBase: publicBase || 'Using location.origin fallback',
      currentOrigin: globalThis.location.origin,
    });

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Auth] ❌ CRITICAL: Missing Supabase environment variables. Auth will fail.');
      toast.error('Configuration error: Missing required environment variables', {
        description: 'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in Vercel.',
      });
    }
  }, []);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      // Runtime diagnostics: verify required environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('[Auth] ❌ Missing critical Supabase environment variables:', { 
          hasUrl: !!supabaseUrl, 
          hasKey: !!supabaseKey 
        });
        toast.error('Configuration error: Missing Supabase credentials. Please contact support.');
        setLoading(false);
        return;
      }

      // For local development, always use localhost
      const isDevelopment = globalThis.location.hostname === 'localhost' || globalThis.location.hostname === '127.0.0.1';
      const baseUrl = isDevelopment 
        ? globalThis.location.origin 
        : (import.meta.env.VITE_PUBLIC_BASE_URL || globalThis.location.origin).replace(/\/$/, '');
      // Post-auth landing path (keep simple to reduce mismatch risk)
      const postAuthPath = '/dashboard';
      const redirectTo = `${baseUrl}${postAuthPath}`;

      // Validate redirect URL format and warn about expected hosts
      const expectedHosts = ['auramanager.app', 'localhost', '127.0.0.1'];
      let redirectHost = '';
      try {
        redirectHost = new URL(redirectTo).hostname;
        
        // Guard against old preview domains causing redirect mismatch
        if (/vercel\.app$/.test(redirectHost)) {
          console.warn('[Auth] ⚠️ Using a Vercel preview domain for Google OAuth redirect:', redirectHost);
          console.warn('[Auth] Consider setting VITE_PUBLIC_BASE_URL=https://auramanager.app in Vercel env vars.');
          toast.warning('Using preview domain for OAuth - may fail if not whitelisted');
        }
        
        if (!expectedHosts.includes(redirectHost) && !redirectHost.includes('vercel.app')) {
          console.warn('[Auth] ⚠️ Unexpected redirect host:', redirectHost, 'Full redirectTo:', redirectTo);
          console.warn('[Auth] Ensure this domain is whitelisted in Supabase Auth > URL Configuration');
        }
        
        console.log('[Auth] 🔐 Google OAuth initiated with:', { 
          redirectTo, 
          redirectHost, 
          supabaseUrl: supabaseUrl.substring(0, 30) + '...' 
        });
      } catch (e) {
        console.error('[Auth] ❌ Failed to parse redirect URL:', redirectTo, e);
        toast.error('Invalid redirect URL configuration');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error) {
        console.error('[Auth] ❌ Google OAuth error:', error);
        
        // Provide specific error messages
        if (error.message.includes('redirect') || error.message.includes('uri')) {
          toast.error(`Redirect URI not whitelisted. Check Supabase Auth settings for: ${redirectHost}`);
        } else if (error.message.includes('client_id') || error.message.includes('invalid_request')) {
          toast.error('Google OAuth configuration error. Please contact support.');
        } else {
          toast.error(error.message || 'Failed to sign in with Google');
        }
        
        throw error;
      }
      
      console.log('[Auth] ✅ OAuth redirect initiated successfully');
    } catch (error) {
      console.error('[Auth] Exception in handleGoogleAuth:', error);
      // Error already toasted above with specific message
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      if (!isForgotPassword) {
        authSchema.parse({ email, password });
      } else {
        z.string().email().parse(email);
      }

      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?reset=true`,
        });
        
        if (error) throw error;
        
        toast.success("Password reset email sent! Check your inbox.");
        setIsForgotPassword(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Invalid email or password. Please try again.");
          }
          throw error;
        }
        
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        
        if (error) {
          if (error.message.includes("User already registered")) {
            throw new Error("This email is already registered. Please sign in instead.");
          }
          throw error;
        }
        
        toast.success("Account created! Please check your email to verify.");
        navigate("/onboarding");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message || "Authentication failed");
      } else {
        toast.error("Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen">
      <Header showAuth={false} />
      <div className="flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-md card-urban border-accent/20 animate-scale-in">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-3xl font-bold brand-text">
              {isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Join AURA"}
            </CardTitle>
            <CardDescription className="flex items-center justify-center gap-2 text-base text-foreground/70">
              <Sparkles className="h-4 w-4 text-accent animate-pulse" />
              Your AI-Powered Artist Manager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="artist@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-border focus:border-accent transition-all duration-300 hover:border-accent/50"
                />
              </div>
              
              {!isForgotPassword && (
                <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-border focus:border-accent transition-all duration-300 hover:border-accent/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-all duration-200 hover:scale-110"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full animate-slide-up"
                style={{ animationDelay: "0.3s" }}
                disabled={loading}
              >
                {loading ? "Loading..." : isForgotPassword ? "Send Reset Link" : isLogin ? "Sign In" : "Create Account"}
              </Button>

              {!isForgotPassword && (
                <>
                  <div className="relative animate-slide-up" style={{ animationDelay: "0.35s" }}>
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full animate-slide-up border-border hover:border-accent transition-all duration-300"
                    style={{ animationDelay: "0.4s" }}
                    onClick={handleGoogleAuth}
                    disabled={loading}
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {isLogin ? "Sign in with Google" : "Sign up with Google"}
                  </Button>
                </>
              )}
              
              {!isForgotPassword && (
                <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: "0.4s" }}>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-sm text-foreground/70 hover:text-accent p-0 h-auto"
                    onClick={() => setIsForgotPassword(true)}
                  >
                    Forgot password?
                  </Button>
                </div>
              )}
              
              <Button
                type="button"
                variant="ghost"
                className="w-full animate-slide-up"
                style={{ animationDelay: "0.6s" }}
                onClick={() => {
                  if (isForgotPassword) {
                    setIsForgotPassword(false);
                  } else {
                    setIsLogin(!isLogin);
                  }
                }}
              >
                {isForgotPassword 
                  ? "Back to sign in" 
                  : isLogin 
                    ? "Need an account? Sign up" 
                    : "Already have an account? Sign in"
                }
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
