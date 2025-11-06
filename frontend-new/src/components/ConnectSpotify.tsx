import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, CheckCircle2, Link2 } from "lucide-react";

export const ConnectSpotify = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      const identities = (data.user?.identities || []) as Array<{ provider?: string }>;
      const isConnected = identities.some((i) => i.provider === "spotify");
      if (active) setConnected(isConnected);
    };
    void check();
    return () => {
      active = false;
    };
  }, []);

  const connect = async () => {
    setLoading(true);
    try {
      const redirectTo = `${globalThis.location.origin}/dashboard`;
      // Attempt to start OAuth with Spotify. Linking will be handled by Supabase on return.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "spotify",
        options: {
          scopes: "user-read-email user-read-private user-read-recently-played playlist-read-private",
          redirectTo,
        },
      });
      if (error) throw error;
    } catch (e) {
      console.error("Spotify connect error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 md:p-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Music className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="font-semibold">Spotify</div>
          <div className="text-sm text-muted-foreground">Connect to pull listeners, playlists, and recent activity.</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {connected ? (
          <Badge className="bg-success/10 text-success flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Connected
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">Not connected</Badge>
        )}
        {!connected && (
          <Button onClick={connect} disabled={loading} className="bg-gradient-to-r from-primary to-success">
            <Link2 className="w-4 h-4 mr-2" /> {loading ? "Connecting…" : "Connect Spotify"}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ConnectSpotify;
