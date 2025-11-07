import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationTemplate {
  category: 'chat' | 'analytics' | 'content' | 'dashboard';
  title: string;
  message: string;
}

const sampleNotifications: NotificationTemplate[] = [
  {
    category: 'chat',
    title: 'New message received',
    message: 'You have a new message from the AI assistant about your latest track',
  },
  {
    category: 'chat',
    title: 'Chat response ready',
    message: 'Your question about music distribution has been answered',
  },
  {
    category: 'analytics',
    title: 'Weekly report available',
    message: 'Your weekly analytics report is ready to view',
  },
  {
    category: 'analytics',
    title: 'Streaming milestone reached',
    message: 'Congratulations! Your track reached 10,000 streams',
  },
  {
    category: 'analytics',
    title: 'New insights detected',
    message: 'We found some interesting trends in your audience data',
  },
  {
    category: 'content',
    title: 'Upload complete',
    message: 'Your new track "Summer Vibes" has been successfully uploaded',
  },
  {
    category: 'content',
    title: 'AI analysis ready',
    message: 'The AI analysis for your latest upload is now available',
  },
  {
    category: 'content',
    title: 'Content recommendation',
    message: 'Based on your style, we suggest uploading more lo-fi beats',
  },
  {
    category: 'dashboard',
    title: 'Welcome to AURA',
    message: 'Get started by uploading your first track or connecting your platforms',
  },
  {
    category: 'dashboard',
    title: 'Daily tip',
    message: 'Pro tip: Upload during off-peak hours for better engagement',
  },
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Creating test notifications...');

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization')!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Creating notifications for user: ${user.id}`);

    // Parse request body to see how many notifications to create
    const { count = 5 } = await req.json().catch(() => ({ count: 5 }));
    const notificationsToCreate = Math.min(count, sampleNotifications.length);

    // Randomly select notifications
    const shuffled = [...sampleNotifications].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, notificationsToCreate);

    // Create notifications
    const notifications = selected.map(template => ({
      user_id: user.id,
      category: template.category,
      title: template.title,
      message: template.message,
      is_read: false,
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) {
      console.error('Error creating notifications:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Successfully created ${data.length} test notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: data.length,
        notifications: data 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
