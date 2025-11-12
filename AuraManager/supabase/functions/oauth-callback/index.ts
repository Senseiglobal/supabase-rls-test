import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  userInfoUrl: string;
}

const oauthConfigs: Record<string, OAuthConfig> = {
  spotify: {
    clientId: Deno.env.get("SPOTIFY_CLIENT_ID") || "",
    clientSecret: Deno.env.get("SPOTIFY_CLIENT_SECRET") || "",
    tokenUrl: "https://accounts.spotify.com/api/token",
    userInfoUrl: "https://api.spotify.com/v1/me",
  },
  instagram: {
    clientId: Deno.env.get("INSTAGRAM_CLIENT_ID") || "",
    clientSecret: Deno.env.get("INSTAGRAM_CLIENT_SECRET") || "",
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    userInfoUrl: "https://graph.instagram.com/me",
  },
  tiktok: {
    clientId: Deno.env.get("TIKTOK_CLIENT_KEY") || "",
    clientSecret: Deno.env.get("TIKTOK_CLIENT_SECRET") || "",
    tokenUrl: "https://open-api.tiktok.com/oauth/access_token/",
    userInfoUrl: "https://open.tiktokapis.com/v2/user/info/",
  },
  twitter: {
    clientId: Deno.env.get("TWITTER_CLIENT_ID") || "",
    clientSecret: Deno.env.get("TWITTER_CLIENT_SECRET") || "",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    userInfoUrl: "https://api.twitter.com/2/users/me",
  },
  youtube: {
    clientId: Deno.env.get("GOOGLE_CLIENT_ID") || "",
    clientSecret: Deno.env.get("GOOGLE_CLIENT_SECRET") || "",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
  },
  facebook: {
    clientId: Deno.env.get("FACEBOOK_APP_ID") || "",
    clientSecret: Deno.env.get("FACEBOOK_APP_SECRET") || "",
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    userInfoUrl: "https://graph.facebook.com/me",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const platform = url.searchParams.get("platform");
    const state = url.searchParams.get("state"); // Contains user_id

    if (!code || !platform || !state) {
      throw new Error("Missing required parameters");
    }

    const config = oauthConfigs[platform];
    if (!config) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    console.log(`Processing OAuth callback for platform: ${platform}`);

    // Exchange code for access token
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${Deno.env.get("SUPABASE_URL")}/functions/v1/oauth-callback?platform=${platform}`,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    });

    const tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`Token exchange failed: ${errorText}`);
      throw new Error(`Failed to exchange code for token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log(`Token obtained for ${platform}`);

    // Get user info from platform
    const userInfoResponse = await fetch(config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    let platformUserId = "";
    let platformUsername = "";

    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json();
      platformUserId = userInfo.id || userInfo.user_id || "";
      platformUsername = userInfo.username || userInfo.display_name || userInfo.name || "";
    }

    // Calculate token expiry
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;

    // Store token in database
    const { error: upsertError } = await supabase
      .from("oauth_tokens")
      .upsert({
        user_id: state,
        platform,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        token_type: tokenData.token_type || "Bearer",
        expires_at: expiresAt,
        scope: tokenData.scope || null,
        platform_user_id: platformUserId,
        platform_username: platformUsername,
      }, {
        onConflict: "user_id,platform"
      });

    if (upsertError) {
      console.error("Error storing token:", upsertError);
      throw upsertError;
    }

    // Update user profile to add platform to selected_platforms
    const { data: profile } = await supabase
      .from("profiles")
      .select("selected_platforms")
      .eq("user_id", state)
      .single();

    const currentPlatforms = Array.isArray(profile?.selected_platforms) 
      ? profile.selected_platforms as string[]
      : [];

    if (!currentPlatforms.includes(platform)) {
      await supabase
        .from("profiles")
        .update({ 
          selected_platforms: [...currentPlatforms, platform] 
        })
        .eq("user_id", state);
    }

    console.log(`Successfully connected ${platform} for user ${state}`);

    // Redirect back to account page
    // Redirect to the Vercel app after successful connection
    const appUrl = "https://supabasetest-45q3s2u4g-thomas-oguns-projects.vercel.app";
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: `${appUrl}/account?connected=${platform}`,
      },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("OAuth callback error:", error);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
