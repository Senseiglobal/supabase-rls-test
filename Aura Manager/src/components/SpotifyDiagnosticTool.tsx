import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertTriangle, Copy } from "lucide-react";

export const SpotifyDiagnosticTool = () => {
  const [diagnostics, setDiagnostics] = useState<Record<string, unknown> | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const currentOrigin = globalThis.location.origin;
      const expectedRedirect = `${currentOrigin}/account?connected=spotify`;
      const supabaseAuthUrl = `https://cpylmxhrobrhqettudjg.supabase.co/auth/v1/callback`;
      
      const results = {
        timestamp: new Date().toISOString(),
        environment: {
          origin: currentOrigin,
          userAgent: navigator.userAgent.substring(0, 100),
        },
        urls: {
          current: currentOrigin,
          expectedRedirect,
          supabaseCallback: supabaseAuthUrl,
        },
        user: {
          authenticated: !!user,
          userId: user?.id?.substring(0, 8) + "..." || "Not authenticated",
          identities: user?.identities?.length || 0,
          hasSpotify: user?.identities?.some(i => i.provider === "spotify") || false,
        },
        configuration: {
          clientId: "2b48c7729298483c9588820c99bdbaef",
          supabaseUrl: "https://cpylmxhrobrhqettudjg.supabase.co",
          projectId: "cpylmxhrobrhqettudjg",
        },
        recommendations: []
      };

      // Add recommendations based on findings
      if (!user) {
        results.recommendations.push("❌ User not authenticated - sign in first");
      }
      
      if (currentOrigin.includes("localhost")) {
        results.recommendations.push("⚠️ Using localhost - ensure Spotify app allows localhost redirects");
      }
      
      if (currentOrigin.includes("vercel.app")) {
        results.recommendations.push("⚠️ Using dynamic Vercel URL - consider custom domain for stability");
      }
      
      results.recommendations.push("✅ Add to Spotify App Redirect URIs:");
      results.recommendations.push(`   - ${expectedRedirect}`);
      results.recommendations.push(`   - ${supabaseAuthUrl}`);
      
      if (user?.identities?.some(i => i.provider === "spotify")) {
        results.recommendations.push("✅ Spotify already connected!");
      } else {
        results.recommendations.push("📋 Verify Spotify Developer Console:");
        results.recommendations.push("   - Client ID matches exactly");
        results.recommendations.push("   - Client Secret is set correctly");
        results.recommendations.push("   - All redirect URIs are registered");
        results.recommendations.push("   - App is published OR your email is in test users");
      }

      setDiagnostics(results);
      console.log("Spotify OAuth Diagnostics:", results);
      toast.success("Diagnostics complete! Check results below.");
      
    } catch (error) {
      console.error("Diagnostics error:", error);
      toast.error("Failed to run diagnostics");
    } finally {
      setIsRunning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const copyConfiguration = () => {
    if (!diagnostics) return;
    
    const config = `
Spotify OAuth Configuration for Debugging
=========================================

**CUSTOM DOMAIN:** https://auramanager.app (STABLE - Use this for OAuth!)
Current App URL: ${diagnostics.urls.current}
Required Redirect URIs:
- https://auramanager.app/account?connected=spotify
- ${diagnostics.urls.supabaseCallback}

Supabase Project: ${diagnostics.configuration.projectId}
Client ID: ${diagnostics.configuration.clientId}

Add these to your Spotify Developer Console:
1. Go to https://developer.spotify.com/dashboard
2. Select your app > Settings
3. Add the redirect URIs above
4. Ensure Client ID matches exactly
5. Set Client Secret in Supabase Dashboard

Timestamp: ${diagnostics.timestamp}
`;
    
    copyToClipboard(config);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Spotify OAuth Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? "Running Diagnostics..." : "🔍 Run Spotify OAuth Diagnostics"}
        </Button>

        {diagnostics && (
          <div className="space-y-4 text-sm">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyConfiguration}
                className="text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy Config
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Badge variant="secondary">Environment</Badge>
                <div className="mt-1 p-2 bg-muted rounded text-xs">
                  <p><strong>Current URL:</strong> {diagnostics.urls.current}</p>
                  <p><strong>Expected Redirect:</strong> {diagnostics.urls.expectedRedirect}</p>
                  <p><strong>Supabase Callback:</strong> {diagnostics.urls.supabaseCallback}</p>
                </div>
              </div>

              <div>
                <Badge variant={diagnostics.user.authenticated ? "default" : "destructive"}>
                  {diagnostics.user.authenticated ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                  Authentication
                </Badge>
                <div className="mt-1 text-xs">
                  <p>User: {diagnostics.user.userId}</p>
                  <p>Identities: {diagnostics.user.identities}</p>
                  <p>Spotify Connected: {diagnostics.user.hasSpotify ? "✅ Yes" : "❌ No"}</p>
                </div>
              </div>

              <div>
                <Badge variant="secondary">Configuration</Badge>
                <div className="mt-1 p-2 bg-muted rounded text-xs">
                  <p><strong>Client ID:</strong> {diagnostics.configuration.clientId}</p>
                  <p><strong>Project:</strong> {diagnostics.configuration.projectId}</p>
                </div>
              </div>

              <div>
                <Badge variant="secondary">Recommendations</Badge>
                <div className="mt-1 space-y-1">
                  {diagnostics.recommendations.map((rec: string, i: number) => (
                    <p key={i} className="text-xs font-mono bg-muted p-1 rounded">
                      {rec}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpotifyDiagnosticTool;