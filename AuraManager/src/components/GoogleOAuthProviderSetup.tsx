import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertTriangle, ExternalLink, Copy, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const GoogleOAuthProviderSetup: React.FC = () => {
  const [showClientSecret, setShowClientSecret] = useState(false);
  const { toast } = useToast();

  const googleClientId = '655497586683-flo6he4a83rkbd9tsjble3rv6oo6v52m.apps.googleusercontent.com';
  const currentProject = 'cpylmxhrobrhqettudjg';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <Card className="w-full border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <AlertTriangle className="w-5 h-5" />
          Google OAuth Provider Setup Required
          <Badge variant="secondary">CONFIGURATION</Badge>
        </CardTitle>
        <CardDescription className="text-orange-600">
          Your URLs are configured correctly, but Google OAuth provider needs to be enabled
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-100 border border-green-200 rounded">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">URL Configuration</span>
            </div>
            <p className="text-xs text-green-700">✅ Site URL: auramanager.app</p>
            <p className="text-xs text-green-700">✅ 14 Redirect URLs configured</p>
          </div>
          
          <div className="p-3 bg-orange-100 border border-orange-200 rounded">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-orange-800">OAuth Provider</span>
            </div>
            <p className="text-xs text-orange-700">❓ Google OAuth status unknown</p>
            <p className="text-xs text-orange-700">🔧 Needs configuration check</p>
          </div>
        </div>

        {/* Step-by-Step Setup */}
        <div className="space-y-4">
          <h4 className="font-semibold text-orange-700">🔧 Google OAuth Provider Setup</h4>
          
          <div className="space-y-3">
            <div className="p-3 bg-white border rounded-lg">
              <h5 className="font-medium mb-3">Step 1: Navigate to Auth Providers</h5>
              <Button
                onClick={() => globalThis.open(`https://supabase.com/dashboard/project/${currentProject}/auth/providers`, '_blank')}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Supabase Auth Providers Settings
              </Button>
            </div>

            <div className="p-3 bg-white border rounded-lg">
              <h5 className="font-medium mb-3">Step 2: Enable Google OAuth</h5>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Look for "Google" in the providers list</p>
                <p>• Toggle the switch to <strong>ENABLE</strong> Google OAuth</p>
                <p>• You should see a configuration form appear</p>
              </div>
            </div>

            <div className="p-3 bg-white border rounded-lg">
              <h5 className="font-medium mb-3">Step 3: Configure Google Credentials</h5>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="client-id" className="text-sm font-medium">Google Client ID</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="client-id"
                      value={googleClientId}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(googleClientId, 'Google Client ID')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="client-secret" className="text-sm font-medium">Google Client Secret</Label>
                  <div className="flex gap-2 mt-1">
                    <div className="flex-1 relative">
                      <Input
                        id="client-secret"
                        type={showClientSecret ? 'text' : 'password'}
                        value="YOUR_CLIENT_SECRET_ENDING_IN_B49U"
                        readOnly
                        className="font-mono text-xs pr-10"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowClientSecret(!showClientSecret)}
                      >
                        {showClientSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Use your existing Google Client Secret (the one ending in B49U)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white border rounded-lg">
              <h5 className="font-medium mb-3">Step 4: Save and Test</h5>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Click "Save" in the Supabase provider settings</p>
                <p>• Wait 1-2 minutes for changes to take effect</p>
                <p>• Test Google sign-in on your app</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-3">✅ Verification Checklist</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Google Console OAuth configured ✅</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Supabase URL configuration ✅</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span>Supabase Google OAuth provider (needs verification)</span>
            </div>
          </div>
        </div>

        {/* Common Issues */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-3">🚨 Common Issues</h4>
          <div className="space-y-2 text-sm text-yellow-700">
            <p>• <strong>Provider not enabled:</strong> Google OAuth toggle is OFF in Supabase</p>
            <p>• <strong>Wrong credentials:</strong> Client ID/Secret don't match Google Console</p>
            <p>• <strong>Cache issues:</strong> Clear browser cache after configuration</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => globalThis.open(`https://supabase.com/dashboard/project/${currentProject}/auth/providers`, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Configure Supabase OAuth
          </Button>
          <Button
            onClick={() => globalThis.open('https://console.cloud.google.com/apis/credentials', '_blank')}
            variant="outline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Verify Google Console
          </Button>
        </div>

        {/* Success Message */}
        <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800 mb-1">🎉 After Setup Complete:</p>
          <p className="text-xs text-green-700">
            Google OAuth will work seamlessly with your auramanager.app domain. 
            Users will be redirected back to your dashboard after successful authentication.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};