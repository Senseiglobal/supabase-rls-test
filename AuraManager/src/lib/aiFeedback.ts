// Supabase integration for AI feedback logging
import { supabase } from "@/integrations/supabase/client";

export async function logAIFeedback(userId: string, feedback: 'up' | 'down', settings: Record<string, number>) {
  await supabase.from('ai_feedback').insert([
    {
      user_id: userId,
      feedback,
      settings,
      created_at: new Date().toISOString(),
    },
  ]);
}
