-- ============================================================
-- FIX PROFILES TABLE - Add Missing Website Column
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Add website column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS website TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Expected output should show:
-- id | uuid
-- full_name | text
-- username | text
-- website | text (this should now appear)
-- avatar_url | text
-- updated_at | timestamp with time zone
