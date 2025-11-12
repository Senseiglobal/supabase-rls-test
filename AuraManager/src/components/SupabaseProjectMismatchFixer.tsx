import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ExternalLink, Copy, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const SupabaseProjectMismatchFixer: React.FC = () => {
  const { toast } = useToast();

  const currentProject = 'cpylmxhrobrhqettudjg';
  const oldProject = 'snbwmkrubosvpibamivu';
  const googleClientId = '655497586683-flo6he4a83rkbd9tsjble3rv6oo6v52m.apps.googleusercontent.com';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <Card className="w-full border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          Supabase Project Mismatch Found!
          <Badge variant="destructive">CRITICAL</Badge>
        </CardTitle>
        <CardDescription className="text-red-600">
          Your Google OAuth is configured for a different Supabase project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Problem Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-center">
            <h4 className="font-semibold text-red-800 mb-2">Supabase OAuth Config</h4>
            <code className="text-xs text-red-700 break-all">
              {oldProject}.supabase.co
            </code>
            <Badge variant="destructive" className="mt-2 text-xs">OLD PROJECT</Badge>
          </div>
          
          <div className="flex justify-center">
            <ArrowRight className="w-8 h-8 text-red-500" />
          </div>
          
          <div className="p-4 bg-green-100 border border-green-300 rounded-lg text-center">
            <h4 className="font-semibold text-green-800 mb-2">Current App Project</h4>
            <code className="text-xs text-green-700 break-all">
              {currentProject}.supabase.co
            </code>
            <Badge variant="default" className="mt-2 text-xs">CURRENT PROJECT</Badge>
          </div>
        </div>

        {/* Solution */}
        <div className="space-y-4">
          <h4 className="font-semibold text-green-700">✅ Fix Options</h4>
          
          {/* Option 1 - Recommended */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h5 className="font-semibold text-green-800 mb-3">
              🎯 Option 1: Configure OAuth in Current Supabase Project (Recommended)
            </h5>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-white border rounded">
                <span className="text-sm">1. Go to Current Project OAuth Settings</span>
                <Button
                  size="sm"
                  onClick={() => globalThis.open(`https://supabase.com/dashboard/project/${currentProject}/auth/providers`, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-white border rounded">
                <span className="text-sm">2. Enable Google OAuth</span>
                <span className="text-xs text-gray-600">Toggle ON</span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-white border rounded">
                <div className="flex-1">
                  <div className="text-sm font-medium">3. Client ID:</div>
                  <code className="text-xs text-gray-600 break-all">{googleClientId}</code>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(googleClientId, 'Google Client ID')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-white border rounded">
                <div className="flex-1">
                  <div className="text-sm font-medium">4. Client Secret:</div>
                  <code className="text-xs text-gray-600">****B49U (your existing secret)</code>
                </div>
                <span className="text-xs text-blue-600">Use existing</span>
              </div>
            </div>
          </div>

          {/* Option 2 - Alternative */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-semibold text-blue-800 mb-3">
              🔧 Option 2: Update Google Console for Current Project
            </h5>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-white border rounded">
                <div className="flex-1">
                  <div className="text-sm font-medium">Replace this redirect URI:</div>
                  <code className="text-xs text-red-600">https://{oldProject}.supabase.co/auth/v1/callback</code>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-white border rounded">
                <div className="flex-1">
                  <div className="text-sm font-medium">With this redirect URI:</div>
                  <code className="text-xs text-green-600">https://{currentProject}.supabase.co/auth/v1/callback</code>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(`https://${currentProject}.supabase.co/auth/v1/callback`, 'New Callback URL')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => globalThis.open(`https://supabase.com/dashboard/project/${currentProject}/auth/providers`, '_blank')}
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Configure Current Supabase
          </Button>
          <Button
            onClick={() => globalThis.open('https://console.cloud.google.com/apis/credentials', '_blank')}
            variant="outline"
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Update Google Console
          </Button>
        </div>

        {/* Pro Tip */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-medium text-yellow-800 mb-1">💡 Why This Happened:</p>
          <p className="text-xs text-yellow-700">
            You configured Google OAuth in an old Supabase project ({oldProject}), but your current app 
            uses a different project ({currentProject}). The callback URLs must match for OAuth to work.
          </p>
        </div>

        {/* Success Prediction */}
        <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800 mb-1">🎉 After Fixing:</p>
          <p className="text-xs text-green-700">
            Google OAuth will work perfectly because the callback URL will match between 
            your Supabase project and Google Console configuration.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};