import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

interface AuthInfo {
  issuer?: string;
  audience?: string;
  projectRef?: string;
  currentUrl: string;
  supabaseUrl?: string;
}

export const AuthConfigDebugger: React.FC = () => {
  const [authConfig, setAuthConfig] = useState<AuthInfo | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get current user and session info
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });

    // Get current session to check JWT
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        try {
          // Decode JWT to inspect
          const payload = JSON.parse(atob(session.access_token.split('.')[1]));
          setAuthConfig({
            issuer: payload.iss,
            audience: payload.aud,
            projectRef: payload.iss?.split('/')[2]?.split('.')[0],
            currentUrl: window.location.origin,
            supabaseUrl: import.meta.env.VITE_SUPABASE_URL
          });
        } catch (error) {
          console.error('Failed to decode JWT:', error);
        }
      }
    });
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const getStatusBadge = (condition: boolean, label: string) => {
    return (
      <Badge variant={condition ? "default" : "destructive"} className="ml-2">
        {condition ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
        {label}
      </Badge>
    );
  };

  if (!authConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
          <CardDescription>Loading authentication configuration...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isCorrectProject = authConfig.projectRef === 'cpylmxhrobrhqettudjg';
  const isCorrectDomain = authConfig.currentUrl.includes('auramanager.app');
  const supabaseUrlMatch = authConfig.supabaseUrl.includes('cpylmxhrobrhqettudjg');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Authentication Configuration Debug
          {isCorrectProject && isCorrectDomain ? (
            <Badge variant="default">✓ Healthy</Badge>
          ) : (
            <Badge variant="destructive">⚠ Issues Detected</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Current authentication configuration status and troubleshooting information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Configuration */}
        <div className="space-y-2">
          <h4 className="font-semibold">Project Configuration</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span>Supabase Project:</span>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-background px-2 py-1 rounded">
                  {authConfig.projectRef || 'unknown'}
                </code>
                {getStatusBadge(isCorrectProject, isCorrectProject ? 'Correct' : 'Wrong Project')}
              </div>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span>Current Domain:</span>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-background px-2 py-1 rounded">
                  {authConfig.currentUrl}
                </code>
                {getStatusBadge(isCorrectDomain, isCorrectDomain ? 'Custom Domain' : 'Vercel URL')}
              </div>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span>Supabase URL:</span>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-background px-2 py-1 rounded">
                  {authConfig.supabaseUrl}
                </code>
                {getStatusBadge(supabaseUrlMatch, supabaseUrlMatch ? 'Matches' : 'Mismatch')}
              </div>
            </div>
          </div>
        </div>

        {/* User Information */}
        {currentUser && (
          <div className="space-y-2">
            <h4 className="font-semibold">Current User</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>Email:</span>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  {currentUser.email}
                </code>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>Auth Provider:</span>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  {currentUser.app_metadata?.provider || 'unknown'}
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Required URLs for Supabase Dashboard */}
        <div className="space-y-2">
          <h4 className="font-semibold">Required Supabase Settings</h4>
          <div className="text-sm space-y-2">
            <div>
              <p className="font-medium mb-1">Site URL:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-background px-2 py-1 rounded flex-1">
                  https://auramanager.app
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard('https://auramanager.app', 'Site URL')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div>
              <p className="font-medium mb-1">Redirect URLs (add all):</p>
              {[
                'https://auramanager.app',
                'https://auramanager.app/',
                'https://auramanager.app/auth/callback',
                'https://auramanager.app/dashboard',
                'https://auramanager.app/account'
              ].map((url) => (
                <div key={url} className="flex items-center gap-2 mb-1">
                  <code className="text-xs bg-background px-2 py-1 rounded flex-1">
                    {url}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(url, 'Redirect URL')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={() => window.open(`https://supabase.com/dashboard/project/${authConfig.projectRef}/auth/settings`, '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open Supabase Auth Settings
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Google OAuth Console
          </Button>
        </div>

        {/* Warnings */}
        {!isCorrectProject && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Wrong Supabase Project Detected
            </p>
            <p className="text-xs text-destructive/80 mt-1">
              Your session is from project '{authConfig.projectRef}' but should be 'cpylmxhrobrhqettudjg'.
              You may need to sign out and sign back in after updating the Supabase configuration.
            </p>
          </div>
        )}

        {!isCorrectDomain && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">
              ℹ️ Using Vercel URL
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              You're currently on a Vercel deployment URL. Mobile redirects should use auramanager.app.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};