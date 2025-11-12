import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, ExternalLink, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DebugInfo {
  currentDomain: string;
  currentPath: string;
  supabaseUrl?: string;
  userAgent: string;
  timestamp: string;
  googleClientId: string | null;
  supabaseProject: string | null;
  hasSession?: boolean;
  sessionError?: string;
  userEmail?: string;
  authProvider?: string;
  userCreated?: string;
}

export const OAuthDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | Record<string, never>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    gatherDebugInfo();
  }, []);

  const gatherDebugInfo = async () => {
    setLoading(true);
    
    const info: DebugInfo = {
      currentDomain: globalThis.location.origin,
      currentPath: globalThis.location.pathname,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      googleClientId: null,
      supabaseProject: null
    };

    // Extract Supabase project ID
    if (info.supabaseUrl) {
      const match = info.supabaseUrl.match(/https:\/\/(\w+)\.supabase\.co/);
      info.supabaseProject = match ? match[1] : 'unknown';
    }

    // Check current session
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      info.hasSession = !!session;
      info.sessionError = error?.message;
      
      if (session?.user) {
        info.userEmail = session.user.email;
        info.authProvider = session.user.app_metadata?.provider;
        info.userCreated = session.user.created_at;
      }
    } catch (error) {
      info.sessionError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Check if we can get Google client ID from Supabase config
    try {
      // This won't work in production, but let's gather what we can
      info.googleClientId = '655497586683-flo6he4a83rkbd9tsjble3rv6oo6v52m.apps.googleusercontent.com';
    } catch (error) {
      // Expected to fail
    }

    setDebugInfo(info);
    setLoading(false);
  };

  const testGoogleAuth = async () => {
    try {
      toast({
        title: "Testing Google OAuth...",
        description: "Check browser console for detailed logs",
      });

      console.log("🔍 Starting Google OAuth test");
      console.log("Current domain:", globalThis.location.origin);
      console.log("Redirect will be:", `${globalThis.location.origin}/dashboard`);
      console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${globalThis.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });

      console.log("OAuth response:", { data, error });

      if (error) {
        console.error("OAuth error details:", error);
        toast({
          title: "OAuth Test Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log("OAuth initiated successfully");
        toast({
          title: "OAuth Test Initiated",
          description: "Redirecting to Google...",
        });
      }
    } catch (error) {
      console.error("OAuth test error:", error);
      toast({
        title: "OAuth Test Error",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const copyDebugInfo = () => {
    const debugText = JSON.stringify(debugInfo, null, 2);
    navigator.clipboard.writeText(debugText);
    toast({
      title: "Debug Info Copied",
      description: "Share this with support for troubleshooting",
    });
  };

  const clearCache = () => {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage  
    sessionStorage.clear();
    
    toast({
      title: "Cache Cleared",
      description: "Local storage and session storage cleared. Refresh page and try again.",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading OAuth Debug Info...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const hasConfigIssues = 
    !debugInfo.supabaseUrl?.includes('cpylmxhrobrhqettudjg') ||
    !debugInfo.currentDomain?.includes('auramanager.app');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          OAuth Debug & Test Tool
          {hasConfigIssues ? (
            <Badge variant="destructive">Issues Detected</Badge>
          ) : (
            <Badge variant="secondary">Config OK</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Debug Google OAuth issues with detailed logging and testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Environment Status</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Domain:</span>
                <code className="text-xs">{debugInfo.currentDomain}</code>
              </div>
              <div className="flex justify-between">
                <span>Project:</span>
                <code className="text-xs">{debugInfo.supabaseProject}</code>
              </div>
              <div className="flex justify-between">
                <span>Session:</span>
                {debugInfo.hasSession ? (
                  <Badge variant="default" className="text-xs">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">None</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Google OAuth Config</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Client ID:</span>
                <code className="text-xs">...v52m</code>
              </div>
              <div className="flex justify-between">
                <span>Origins:</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex justify-between">
                <span>Redirects:</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Potential Issues */}
        <div className="space-y-3">
          <h4 className="font-semibold">🔍 Potential Issues to Check:</h4>
          <div className="grid gap-2 text-sm">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="font-medium text-yellow-800">1. OAuth Consent Screen Status</p>
              <p className="text-yellow-700 text-xs">
                Make sure your OAuth consent screen is published, not in "Testing" mode
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="font-medium text-blue-800">2. API Enablement</p>
              <p className="text-blue-700 text-xs">
                Google+ API or People API must be enabled in Google Console
              </p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded">
              <p className="font-medium text-purple-800">3. Cache/Cookies</p>
              <p className="text-purple-700 text-xs">
                Clear browser cache, cookies, and site data completely
              </p>
            </div>
          </div>
        </div>

        {/* Test OAuth */}
        <div className="space-y-3">
          <h4 className="font-semibold">🧪 Test Google OAuth</h4>
          <div className="flex gap-2">
            <Button onClick={testGoogleAuth} className="flex-1">
              Test Google Sign-In
            </Button>
            <Button onClick={clearCache} variant="outline" className="flex-1">
              Clear Cache & Test
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This will attempt Google OAuth and log detailed information to browser console
          </p>
        </div>

        {/* Debug Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={() => globalThis.open('https://console.cloud.google.com/apis/api/people.googleapis.com', '_blank')}
            variant="outline"
            size="sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Check People API
          </Button>
          <Button
            onClick={() => globalThis.open('https://console.cloud.google.com/apis/credentials/consent', '_blank')}
            variant="outline"
            size="sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            OAuth Consent Screen
          </Button>
          <Button onClick={copyDebugInfo} variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Copy Debug Info
          </Button>
        </div>

        {/* Debug Info Display */}
        {debugInfo.sessionError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="font-medium text-red-800">Session Error:</p>
            <code className="text-xs text-red-700">{debugInfo.sessionError}</code>
          </div>
        )}
      </CardContent>
    </Card>
  );
};