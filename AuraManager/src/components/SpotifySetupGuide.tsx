import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const SpotifySetupGuide = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const correctRedirectURIs = [
    "https://cpylmxhrobrhqettudjg.supabase.co/auth/v1/callback",
    "https://auramanager.app/account?connected=spotify"
  ];

  const clientId = "2b48c7729298483c9588820c99bdbaef";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const copyAllSettings = () => {
    const settings = `
Spotify Developer Console Setup - COPY THIS:

1. Go to: https://developer.spotify.com/dashboard
2. Select your app with Client ID: ${clientId}
3. Click "Settings"
4. Update these fields:

Website: https://auramanager.app

Redirect URIs (ADD BOTH):
${correctRedirectURIs.join('\n')}

Users and Access: Add your email if app is in Development mode
    `;
    
    copyToClipboard(settings);
  };

  return (
    <Card className="w-full border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5" />
          🔧 Spotify OAuth Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-amber-700 dark:text-amber-300">
          <p className="font-medium">INVALID_CLIENT error means your Spotify app needs configuration updates.</p>
        </div>

        <div className="space-y-3">
          <div>
            <Badge variant="outline" className="mb-2">Step 1: Go to Spotify Developer Console</Badge>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => globalThis.open("https://developer.spotify.com/dashboard", "_blank")}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open Spotify Dashboard
              </Button>
            </div>
          </div>

          <div>
            <Badge variant="outline" className="mb-2">Step 2: Find Your App</Badge>
            <p className="text-xs">Look for app with Client ID:</p>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-xs bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">
                {clientId}
              </code>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard(clientId)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div>
            <Badge variant="outline" className="mb-2">Step 3: Update Redirect URIs</Badge>
            <p className="text-xs mb-2">Click "Settings" and add BOTH of these redirect URIs:</p>
            <div className="space-y-1">
              {correctRedirectURIs.map((uri, index) => (
                <div key={index} className="flex items-center gap-2">
                  <code className="text-xs bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded flex-1">
                    {uri}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(uri)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={copyAllSettings}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy Complete Setup
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Hide Details" : "Show More Details"}
            </Button>
          </div>

          {isExpanded && (
            <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded text-xs">
              <p className="font-medium mb-2">Additional Settings:</p>
              <ul className="space-y-1">
                <li>• <strong>Website:</strong> https://auramanager.app</li>
                <li>• <strong>App Name:</strong> Aura Manager (or your choice)</li>
                <li>• <strong>App Description:</strong> AI Music Career Manager</li>
                <li>• <strong>Users and Access:</strong> If in Development mode, add your email</li>
              </ul>
            </div>
          )}
        </div>

        <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 p-2 rounded">
          💡 <strong>After updating:</strong> Wait 2-3 minutes for changes to take effect, then test the Spotify connection.
        </div>
      </CardContent>
    </Card>
  );
};

export default SpotifySetupGuide;