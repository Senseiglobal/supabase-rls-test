import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { platform } = await req.json();

    if (!platform) {
      throw new Error("Platform is required");
    }

    console.log(`Disconnecting ${platform} for user ${user.id}`);

    // Delete OAuth token
    const { error: deleteError } = await supabase
      .from("oauth_tokens")
      .delete()
      .eq("user_id", user.id)
      .eq("platform", platform);

    if (deleteError) {
      console.error("Error deleting token:", deleteError);
      throw deleteError;
    }

    // Update user profile to remove platform from selected_platforms
    const { data: profile } = await supabase
      .from("profiles")
      .select("selected_platforms")
      .eq("user_id", user.id)
      .single();

    const currentPlatforms = Array.isArray(profile?.selected_platforms) 
      ? profile.selected_platforms as string[]
      : [];

    const updatedPlatforms = currentPlatforms.filter(p => p !== platform);

    await supabase
      .from("profiles")
      .update({ selected_platforms: updatedPlatforms })
      .eq("user_id", user.id);

    console.log(`Successfully disconnected ${platform} for user ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, platform }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("OAuth disconnect error:", error);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
