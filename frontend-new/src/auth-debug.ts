// Debug auth state
console.log('=== AUTH DEBUG ===');
console.log('Environment variables:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✓ Present' : '✗ Missing');

import { supabase } from "@/integrations/supabase/client";

// Check auth state
supabase.auth.getSession().then(({ data: { session }, error }) => {
  console.log('Current session:', session);
  console.log('Session error:', error);
  
  if (session) {
    console.log('User ID:', session.user.id);
    console.log('Email:', session.user.email);
    console.log('Access token exists:', !!session.access_token);
    console.log('Refresh token exists:', !!session.refresh_token);
  }
});

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  console.log('Session in event:', session);
});

export {};