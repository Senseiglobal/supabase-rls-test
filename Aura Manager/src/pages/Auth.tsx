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
      console.log('🔍 Starting Google OAuth...');
      
      // Check environment first
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        toast.error('❌ Authentication not configured');
        setLoading(false);
        return;
      }

      toast.info('🔄 Opening Google sign-in...');
      
      // Wrap OAuth call to catch JSON errors specifically
      let oauthResult;
      try {
        oauthResult = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${globalThis.location.origin}/dashboard`,
          },
        });
      } catch (jsonError) {
        console.error('🚨 OAuth JSON Error:', jsonError);
        if (jsonError instanceof SyntaxError || (jsonError && jsonError.message && jsonError.message.includes('JSON'))) {
          toast.error('❌ Google OAuth Not Available', {
            description: 'Google sign-in is not properly configured. Please use email/password to sign in.',
            duration: 8000
          });
          setLoading(false);
          return;
        }
        throw jsonError;
      }

      if (oauthResult.error) {
        console.error('❌ OAuth Error:', oauthResult.error);
        
        if (oauthResult.error.message.includes('Provider not found') || oauthResult.error.message.includes('not enabled')) {
          toast.error('❌ Google Sign-In Unavailable', {
            description: 'Google OAuth is not enabled. Please sign in with email and password.',
            duration: 8000
          });
        } else {
          toast.error('❌ Google Sign-In Failed', {
            description: 'Please try signing in with email and password instead.',
            duration: 6000
          });
        }
        setLoading(false);
      } else {
        console.log('✅ OAuth redirect should start...');
        toast.success('Redirecting to Google...');
        
        // Check if redirect actually happens
        setTimeout(() => {
          if (document.visibilityState === 'visible') {
            toast.error('❌ Google redirect failed. Please use email/password to sign in.');
            setLoading(false);
          }
        }, 3000);
      }
      
    } catch (error) {
      console.error('🚨 OAuth Exception:', error);
      toast.error('❌ Cannot connect to Google. Please sign in with email/password.');
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
          redirectTo: `${globalThis.location.origin}/auth?reset=true`,
        });
        
        if (error) throw error;
        
        toast.success("Password reset email sent! Check your inbox.");
        setIsForgotPassword(false);
      } else if (isLogin) {
        console.log('🔑 Attempting email/password sign-in...');
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('❌ Sign-in error:', error);
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("❌ Invalid email or password. Please check your credentials and try again.");
          } else if (error.message.includes("Email not confirmed")) {
            throw new Error("📧 Please check your email and click the confirmation link before signing in.");
          } else if (error.message.includes("Too many requests")) {
            throw new Error("⏰ Too many attempts. Please wait a few minutes and try again.");
          }
          throw new Error(`❌ Sign-in failed: ${error.message}`);
        }
        
        if (data.user) {
          console.log('✅ Sign-in successful!', data.user.email);
          toast.success("✅ Welcome back!");
          navigate("/dashboard");
        } else {
          throw new Error("❌ Sign-in failed - no user data returned");
        }
      } else {
        console.log('📝 Creating new account...');
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${globalThis.location.origin}/dashboard`,
          },
        });
        
        if (error) {
          console.error('❌ Sign-up error:', error);
          if (error.message.includes("User already registered")) {
            throw new Error("📧 This email is already registered. Please sign in instead.");
          } else if (error.message.includes("Password should be at least")) {
            throw new Error("🔐 Password must be at least 6 characters long.");
          } else if (error.message.includes("Unable to validate email address")) {
            throw new Error("📧 Please enter a valid email address.");
          }
          throw new Error(`❌ Account creation failed: ${error.message}`);
        }
        
        if (data.user) {
          console.log('✅ Account created successfully!', data.user.email);
          if (data.user.email_confirmed_at) {
            toast.success("✅ Account created! You can now sign in.");
            setIsLogin(true);
          } else {
            toast.success("✅ Account created! Please check your email to verify your account.");
            setIsLogin(true);
          }
        } else {
          throw new Error("❌ Account creation failed - no user data returned");
        }
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
            
            {/* Emergency Access */}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-center text-muted-foreground mb-3">
                Having trouble? Try emergency access:
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  console.log('🚨 Testing emergency access...');
                  toast.info('Testing authentication system...');
                  
                  try {
                    // Test current session
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                      toast.success('✅ You are already signed in! Redirecting...');
                      navigate('/dashboard');
                      return;
                    }
                    
                    // Test with demo credentials
                    const { data, error } = await supabase.auth.signInWithPassword({
                      email: 'demo@auramanager.app',
                      password: 'demo123456'
                    });
                    
                    if (error && error.message.includes('Invalid login credentials')) {
                      // Try to create demo account
                      const signUpResult = await supabase.auth.signUp({
                        email: 'demo@auramanager.app',
                        password: 'demo123456'
                      });
                      
                      if (signUpResult.error) {
                        toast.error('❌ Authentication system issue', {
                          description: signUpResult.error.message
                        });
                      } else {
                        toast.success('✅ Demo account created! Try signing in with demo@auramanager.app / demo123456');
                        setEmail('demo@auramanager.app');
                        setPassword('demo123456');
                      }
                    } else if (error) {
                      toast.error('❌ Authentication issue', {
                        description: error.message
                      });
                    } else if (data.user) {
                      toast.success('✅ Emergency access successful!');
                      navigate('/dashboard');
                    }
                  } catch (error) {
                    console.error('Emergency access failed:', error);
                    toast.error('❌ System error - check console for details');
                  }
                }}
                className="w-full"
              >
                🚨 Emergency Access Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
