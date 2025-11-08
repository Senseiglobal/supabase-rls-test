import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StatusCheck {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  action?: string;
  actionUrl?: string;
}

export const ConnectionStatusChecker: React.FC = () => {
  const [checks, setChecks] = useState<StatusCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const runStatusChecks = async () => {
    setLoading(true);
    const statusChecks: StatusCheck[] = [];

    try {
      // 1. Check Supabase Connection
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          statusChecks.push({
            name: 'Supabase Connection',
            status: 'error',
            message: `Connection failed: ${error.message}`,
            action: 'Check Supabase Settings'
          });
        } else {
          statusChecks.push({
            name: 'Supabase Connection', 
            status: 'success',
            message: 'Connected to cpylmxhrobrhqettudjg.supabase.co'
          });
        }
      } catch (error) {
        statusChecks.push({
          name: 'Supabase Connection',
          status: 'error', 
          message: 'Failed to connect to Supabase'
        });
      }

      // 2. Check Current User Session
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const projectFromJWT = user.aud === 'authenticated' ? 'cpylmxhrobrhqettudjg' : 'unknown';
          statusChecks.push({
            name: 'User Authentication',
            status: 'success',
            message: `Signed in as ${user.email} (Project: ${projectFromJWT})`
          });

          // Check if JWT is from correct project
          if (user.iss?.includes('cpylmxhrobrhqettudjg')) {
            statusChecks.push({
              name: 'JWT Token Project',
              status: 'success',
              message: 'JWT token from correct Supabase project'
            });
          } else {
            statusChecks.push({
              name: 'JWT Token Project',
              status: 'error',
              message: `JWT from wrong project: ${user.iss}`,
              action: 'Sign out and back in',
            });
          }
        } else {
          statusChecks.push({
            name: 'User Authentication',
            status: 'warning',
            message: 'Not signed in'
          });
        }
      } catch (error) {
        statusChecks.push({
          name: 'User Authentication',
          status: 'error',
          message: 'Failed to get user session'
        });
      }

      // 3. Check Current Domain
      const currentDomain = globalThis.location.origin;
      if (currentDomain.includes('auramanager.app')) {
        statusChecks.push({
          name: 'Custom Domain',
          status: 'success',
          message: 'Using custom domain: auramanager.app'
        });
      } else if (currentDomain.includes('vercel.app')) {
        statusChecks.push({
          name: 'Custom Domain',
          status: 'warning',
          message: `Using Vercel URL: ${currentDomain}`,
          action: 'Visit auramanager.app',
          actionUrl: 'https://auramanager.app'
        });
      } else {
        statusChecks.push({
          name: 'Custom Domain',
          status: 'error',
          message: `Unknown domain: ${currentDomain}`
        });
      }

      // 4. Check Environment Variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const spotifyClientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
      
      if (supabaseUrl?.includes('cpylmxhrobrhqettudjg')) {
        statusChecks.push({
          name: 'Environment Config',
          status: 'success',
          message: 'Environment variables correctly configured'
        });
      } else {
        statusChecks.push({
          name: 'Environment Config',
          status: 'error',
          message: 'Environment variables misconfigured',
          action: 'Check .env file'
        });
      }

      // 5. Check Privacy Policy
      try {
        const response = await fetch('/privacy');
        if (response.ok) {
          statusChecks.push({
            name: 'Privacy Policy',
            status: 'success',
            message: 'Privacy policy accessible at /privacy'
          });
        } else {
          statusChecks.push({
            name: 'Privacy Policy',
            status: 'error',
            message: 'Privacy policy page not found'
          });
        }
      } catch {
        statusChecks.push({
          name: 'Privacy Policy',
          status: 'error',
          message: 'Failed to check privacy policy'
        });
      }

      // 6. Check Spotify Configuration
      if (spotifyClientId === '2b48c7729298483c9588820c99bdbaef') {
        statusChecks.push({
          name: 'Spotify OAuth',
          status: 'success',
          message: 'Spotify client ID configured'
        });
      } else {
        statusChecks.push({
          name: 'Spotify OAuth',
          status: 'error',
          message: 'Spotify client ID missing or incorrect'
        });
      }

    } catch (error) {
      console.error('Status check error:', error);
    }

    setChecks(statusChecks);
    setLoading(false);
  };

  useEffect(() => {
    runStatusChecks();
  }, []);

  const getStatusIcon = (status: StatusCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'loading':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: StatusCheck['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive', 
      warning: 'secondary',
      loading: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status]} className="ml-2">
        {status.toUpperCase()}
      </Badge>
    );
  };

  const overallStatus = checks.length > 0 ? 
    checks.some(c => c.status === 'error') ? 'error' :
    checks.some(c => c.status === 'warning') ? 'warning' : 'success'
    : 'loading';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Connection Status Check
          {getStatusIcon(overallStatus)}
          {getStatusBadge(overallStatus)}
        </CardTitle>
        <CardDescription>
          Comprehensive check of all authentication and configuration settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Running status checks...</span>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {checks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <div className="font-medium">{check.name}</div>
                      <div className="text-sm text-muted-foreground">{check.message}</div>
                    </div>
                  </div>
                  {check.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (check.actionUrl) {
                          globalThis.open(check.actionUrl, '_blank');
                        } else {
                          toast({
                            title: "Action Required",
                            description: check.action,
                          });
                        }
                      }}
                    >
                      {check.actionUrl && <ExternalLink className="w-3 h-3 mr-1" />}
                      {check.action}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={runStatusChecks}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
              
              {overallStatus === 'error' && (
                <Button
                  onClick={() => globalThis.open('https://supabase.com/dashboard/project/cpylmxhrobrhqettudjg/auth/settings', '_blank')}
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Fix in Supabase
                </Button>
              )}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Status Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-green-600">
                    {checks.filter(c => c.status === 'success').length}
                  </div>
                  <div className="text-muted-foreground">Passing</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-yellow-600">
                    {checks.filter(c => c.status === 'warning').length}
                  </div>
                  <div className="text-muted-foreground">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-red-600">
                    {checks.filter(c => c.status === 'error').length}
                  </div>
                  <div className="text-muted-foreground">Errors</div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};