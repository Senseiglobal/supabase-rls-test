-- Supabase table for AI feedback logging
CREATE TABLE IF NOT EXISTS public.ai_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  feedback text NOT NULL CHECK (feedback IN ('up', 'down')),
  settings jsonb,
  created_at timestamptz DEFAULT now()
);
