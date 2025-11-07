import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, CheckCircle2, Link2, Unlink, RefreshCcw } from "lucide-react";

type UntypedSupabase = {
  from: (table: string) => {
    insert: (values: unknown) => Promise<{ data?: unknown; error: { code?: string } | null }>
    upsert: (values: unknown, options?: unknown) => Promise<{ data?: unknown; error: { code?: string } | null }>
  }
}

export const ConnectSpotify = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

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
      // Use linkIdentity to connect Spotify to existing user account
      const { error } = await supabase.auth.linkIdentity({
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

  const disconnect = async () => {
    setLoading(true);
    try {
      const { data: userData, error: getUserError } = await supabase.auth.getUser();
      if (getUserError) throw getUserError;
      const identities = (userData.user?.identities || []) as Array<{ id?: string; provider?: string }>;
      const spotifyIdentity = identities.find((i) => i.provider === "spotify");
      if (!spotifyIdentity?.id) throw new Error("Spotify identity not found");

      // supabase-js expects the full identity payload; construct minimal object with required fields
      const { error: unlinkError } = await supabase.auth.unlinkIdentity({
        id: spotifyIdentity.id,
        user_id: userData.user!.id,
        identity_data: {},
        provider: "spotify",
        last_sign_in_at: null,
        created_at: null,
        updated_at: null,
      } as unknown as Parameters<typeof supabase.auth.unlinkIdentity>[0]);
      if (unlinkError) throw unlinkError;
      setConnected(false);
    } catch (e) {
      console.error("Spotify disconnect error", e);
    } finally {
      setLoading(false);
    }
  };

  const syncData = async () => {
    setSyncing(true);
    try {
      // Get current session to extract access token for serverless calls
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.provider_token; // Supabase stores provider token here for OAuth providers
      if (!accessToken) throw new Error("No Spotify access token present; reconnect needed.");

      // 1. Fetch profile via our serverless proxy
      const profileResp = await fetch(`/api/spotify/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profileJson = await profileResp.json();
      if (!profileResp.ok) throw new Error(profileJson.error || "Profile fetch failed");

      // 2. Fetch recent plays via our serverless proxy
      const recentResp = await fetch(`/api/spotify/recent`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const recentJson = await recentResp.json();
      if (!recentResp.ok) throw new Error(recentJson.error || "Recent plays fetch failed");

      // 3. Persist both profile + recent plays into Supabase tables (client-side insert for now; later move server-side)
      const user = sessionData.session?.user;
      if (!user) throw new Error("No authenticated user");

      // Upsert profile (aligning with schema: spotify_id, followers, image_url, etc.)
      const primaryImage: string | null = Array.isArray(profileJson.images) && profileJson.images.length > 0
        ? profileJson.images[0]?.url ?? null
        : null;

      const sb = supabase as unknown as UntypedSupabase;
      const { error: profileUpsertError } = await sb
        .from("spotify_profiles")
        .upsert({
          user_id: user.id,
          spotify_id: profileJson.id ?? null,
          display_name: profileJson.display_name ?? null,
          followers: profileJson.followers?.total ?? null,
          country: profileJson.country ?? null,
          product: profileJson.product ?? null,
          image_url: primaryImage,
          last_refreshed: new Date().toISOString(),
        }, { onConflict: "user_id" });
      if (profileUpsertError) throw profileUpsertError;

      // Insert recent plays items (ignore duplicates via unique constraint)
      type SpotifyArtist = { id?: string | null; name?: string | null };
      type SpotifyTrack = {
        id?: string | null;
        name?: string | null;
        album?: { id?: string | null; name?: string | null } | null;
        artists?: SpotifyArtist[] | null;
        popularity?: number | null;
        duration_ms?: number | null;
        preview_url?: string | null;
      };
      type SpotifyRecentItem = {
        played_at: string;
        track?: SpotifyTrack | null;
        context?: { type?: string | null; href?: string | null } | null;
      };
      const recentItems: SpotifyRecentItem[] = recentJson.items || [];
      for (const item of recentItems) {
        const { error: insertError } = await sb.from("spotify_recent_plays").insert({
          user_id: user.id,
          played_at: item.played_at,
          track_id: item.track?.id || "unknown",
          track_name: item.track?.name || null,
          album_name: item.track?.album?.name || null,
          artist_name: item.track?.artists?.map(a => a?.name).filter(Boolean).join(", ") || null,
          duration_ms: item.track?.duration_ms ?? null,
          preview_url: item.track?.preview_url ?? null,
        });
        if (insertError && insertError.code !== '23505') { // ignore unique violation
          console.warn("Recent play insert error", insertError);
        }
      }

      setLastSync(new Date());
    } catch (e) {
      console.error("Spotify sync error", e);
    } finally {
      setSyncing(false);
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
          <>
            <Badge className="bg-success/10 text-success flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Connected
            </Badge>
            <div className="flex gap-2">
              <Button variant="outline" onClick={syncData} disabled={syncing}>
                <RefreshCcw className="w-4 h-4 mr-2" /> {syncing ? "Syncing…" : "Sync Data"}
              </Button>
              <Button variant="outline" onClick={disconnect} disabled={loading || syncing}>
                <Unlink className="w-4 h-4 mr-2" /> {loading ? "Disconnecting…" : "Disconnect"}
              </Button>
            </div>
            {lastSync && (
              <div className="text-xs text-muted-foreground ml-2">Last sync {lastSync.toLocaleTimeString()}</div>
            )}
          </>
        ) : (
          <>
            <Badge variant="outline" className="text-muted-foreground">Not connected</Badge>
            <Button onClick={connect} disabled={loading} className="bg-gradient-to-r from-primary to-success">
              <Link2 className="w-4 h-4 mr-2" /> {loading ? "Connecting…" : "Connect Spotify"}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default ConnectSpotify;
