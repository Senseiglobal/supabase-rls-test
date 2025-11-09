import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import BrandLogo from "@/components/BrandLogo";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNav } from "@/components/BottomNav";
import { NotificationCenter } from "@/components/NotificationCenter";
import { UserMenu } from "@/components/UserMenu";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Feed from "./pages/Feed";
import Analytics from "./pages/Analytics";
import MyContent from "./pages/MyContent";
import Reports from "./pages/Reports";
import Account from "./pages/Account";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import Billing from "./pages/Billing";
import Help from "./pages/Help";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms"; // Static legal page retained
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

const App = () => {
  // Set to false for production - authenticated users go to dashboard
  const DEV_MODE = false;
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        // Simplified check - assume returning user for now
        setIsNewUser(false);
      }
      
      setLoading(false);
    };

    checkUserStatus();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      if (session) {
        setIsNewUser(false);
      } else {
        setIsNewUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route 
                path="/" 
                element={
                  DEV_MODE ? <Index /> : (
                    session ? (
                      isNewUser ? <Navigate to="/onboarding" /> : <Navigate to="/dashboard" />
                    ) : (
                      <Index />
                    )
                  )
                } 
              />
              <Route
                path="/auth"
                element={
                  DEV_MODE ? <Auth /> : (
                    !session ? <Auth /> : (isNewUser ? <Navigate to="/onboarding" /> : <Navigate to="/dashboard" />)
                  )
                }
              />
              <Route
                path="/onboarding"
                element={
                  DEV_MODE ? <Onboarding /> : (
                    session && isNewUser ? <Onboarding /> : <Navigate to={session ? "/dashboard" : "/auth"} />
                  )
                }
              />
              
              {/* Authenticated routes with sidebar */}
              <Route
                path="/*"
                element={
                  session || DEV_MODE ? (
                    <SidebarProvider>
                      <div className="flex min-h-screen w-full">
                        <AppSidebar />
                        <div className="flex-1 flex flex-col min-w-0">
                          {/* Sidebar toggle bar - Consistent padding */}
                          <div className="sticky top-0 z-40 flex h-14 md:h-16 items-center gap-3 md:gap-4 border-b border-border bg-background px-4 md:px-6 lg:px-8">
                            <SidebarTrigger className="hover:bg-accent/10" />
                            <div className="flex items-center gap-2">
                              <BrandLogo size={30} showText={false} aria-label="Aura Manager" />
                              <span className="hidden md:inline text-base md:text-lg font-bold bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">Aura</span>
                            </div>
                            <div className="flex-1" />
                            {/* Don Norman principle: Group related controls with consistent spacing */}
                            <div className="flex items-center gap-2 md:gap-3">
                              <ThemeToggle />
                              <NotificationCenter />
                              <UserMenu />
                            </div>
                          </div>
                          
                          {/* Main content area - Responsive padding and gutters */}
                          <main className="flex-1 pb-20 md:pb-6 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 max-w-screen-2xl w-full mx-auto">
                            <Routes>
                              <Route path="/dashboard" element={<Dashboard />} />
                              <Route path="/feed" element={<Feed />} />
                              <Route path="/analytics" element={<Analytics />} />
                              <Route path="/my-content" element={<MyContent />} />
                              <Route path="/reports" element={<Reports />} />
                              <Route path="/billing" element={<Billing />} />
                              <Route path="/account" element={<Account />} />
                              <Route path="/chat" element={<Chat />} />
                            </Routes>
                          </main>
                          
                          {/* FAB removed to keep mobile navigation clean */}
                          
                          {/* Mobile bottom navigation */}
                          <BottomNav />
                        </div>
                      </div>
                    </SidebarProvider>
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              
              {/* Public routes */}
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/help" element={<Help />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              {/* Handle auth callback and other redirects */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
