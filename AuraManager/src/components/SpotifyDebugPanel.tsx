import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export const SpotifyDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentOrigin, setCurrentOrigin] = useState("");
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const collectDebugInfo = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      setCurrentOrigin(globalThis.location.origin);
      setIsSpotifyConnected(user?.identities?.some(i => i.provider === "spotify") || false);
      
      console.log("Debug info collected:", {
        origin: globalThis.location.origin,
        hasSpotify: user?.identities?.some(i => i.provider === "spotify") || false,
        identities: user?.identities?.map(i => ({ provider: i.provider }))
      });
    } catch (error) {
      console.error("Debug info collection error:", error);
      toast.error("Failed to collect debug info");
    } finally {
      setLoading(false);
    }
  };

  const testSpotifyConnection = async () => {
    try {
      toast.info("Testing Spotify connection...");
      
      const redirectUrl = `${globalThis.location.origin}/account?connected=spotify&debug=true`;
      console.log("Testing with redirect URL:", redirectUrl);
      
      const { data, error } = await supabase.auth.linkIdentity({
        provider: "spotify",
        options: {
          scopes: "user-read-email user-read-private",
          redirectTo: redirectUrl,
        },
      });
      
      if (error) {
        console.error("Test connection error:", error);
        toast.error(`Test failed: ${error.message}`);
      } else {
        console.log("Test connection success:", data);
      }
    } catch (error) {
      console.error("Test connection exception:", error);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50"
      >
        🔧 Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card className="w-96 max-h-96 overflow-y-auto">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Spotify OAuth Debug</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-2">
            <Button
              onClick={collectDebugInfo}
              disabled={loading}
              size="sm"
              variant="outline"
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Collect Info
            </Button>
            
            <Button
              onClick={testSpotifyConnection}
              size="sm"
              variant="outline"
              className="w-full"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
          </div>
          
          {currentOrigin && (
            <div className="space-y-2 text-xs">
              <div>
                <Badge variant="secondary">Origin</Badge>
                <p className="mt-1 break-all">{currentOrigin}</p>
              </div>
              
              <div>
                <Badge variant={isSpotifyConnected ? "default" : "destructive"}>
                  {isSpotifyConnected ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                  Spotify Connected
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpotifyDebugPanel;