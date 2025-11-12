import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const OAuthRedirectFixer: React.FC = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const requiredJavaScriptOrigins = [
    'https://auramanager.app',
    'https://cpylmxhrobrhqettudjg.supabase.co'
  ];

  const requiredRedirectURIs = [
    'https://cpylmxhrobrhqettudjg.supabase.co/auth/v1/callback',
    'https://auramanager.app',
    'https://auramanager.app/',
    'https://auramanager.app/dashboard',
    'https://auramanager.app/account',
    'https://auramanager.app/auth/callback'
  ];

  return (
    <Card className="w-full border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          OAuth Redirect URI Mismatch - Error 400
          <Badge variant="destructive">URGENT FIX</Badge>
        </CardTitle>
        <CardDescription className="text-red-600">
          Google sign-in is failing because redirect URI doesn't match Google Console configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Problem Explanation */}
        <div className="p-4 bg-red-100 border border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">🔍 Issue Identified</h4>
          <div className="text-sm text-red-700 space-y-1">
            <p><strong>App is trying to use:</strong> <code>https://auramanager.app/auth/callback</code></p>
            <p><strong>Google Console has:</strong> Limited redirect URIs (missing the above)</p>
            <p><strong>Result:</strong> Error 400 - redirect_uri_mismatch</p>
          </div>
        </div>

        {/* Solution */}
        <div className="space-y-4">
          <h4 className="font-semibold text-green-700">✅ Complete Google OAuth Console Configuration</h4>
          
          {/* JavaScript Origins */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-medium text-blue-800 mb-3">
              1️⃣ Authorized JavaScript Origins (domains that can initiate OAuth):
            </p>
            <div className="space-y-2">
              {requiredJavaScriptOrigins.map((origin, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
                  <code className="text-xs text-blue-700 flex-1">{origin}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(origin, `JavaScript Origin ${index + 1}`)}
                    className="ml-2"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Redirect URIs */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-medium text-green-800 mb-3">
              2️⃣ Authorized Redirect URIs (where users go after authentication):
            </p>
            <div className="space-y-2">
              {requiredRedirectURIs.map((uri, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
                  <code className="text-xs text-green-700 flex-1">{uri}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(uri, `Redirect URI ${index + 1}`)}
                    className="ml-2"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step by Step */}
        <div className="space-y-3">
          <h4 className="font-semibold">📋 Step-by-Step Fix:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm ml-4">
            <li>Go to Google Cloud Console → APIs & Services → Credentials</li>
            <li>Find your OAuth 2.0 Client ID for Aura Manager</li>
            <li>Click "Edit" on the client</li>
            <li><strong>Add JavaScript Origins:</strong> Copy the 2 origins from the blue section above</li>
            <li><strong>Add Redirect URIs:</strong> Copy the 6 URIs from the green section above</li>
            <li>Click "Save" and wait 2-3 minutes for changes to propagate</li>
            <li>Clear browser cache and try Google sign-in again</li>
          </ol>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-red-100 border border-red-200 rounded">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-600" />
            <div className="font-medium text-red-700">Current Status</div>
            <div className="text-xs text-red-600">Google Auth Broken</div>
          </div>
          <div className="p-3 bg-green-100 border border-green-200 rounded">
            <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <div className="font-medium text-green-700">After Fix</div>
            <div className="text-xs text-green-600">Google Auth Working</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => globalThis.open('https://console.cloud.google.com/apis/credentials', '_blank')}
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Google Console
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const allConfig = `Authorized JavaScript Origins:\n${requiredJavaScriptOrigins.join('\n')}\n\nAuthorized Redirect URIs:\n${requiredRedirectURIs.join('\n')}`;
              navigator.clipboard.writeText(allConfig);
              toast({
                title: "Complete Configuration Copied!",
                description: "Paste JavaScript Origins and Redirect URIs into Google Console",
              });
            }}
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Complete Config
          </Button>
        </div>

        {/* Pro Tip */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-1">💡 Pro Tip:</p>
          <p className="text-xs text-blue-700">
            After adding the URIs to Google Console, the fix is immediate for new auth attempts. 
            Clear browser cache to remove any cached error states.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};