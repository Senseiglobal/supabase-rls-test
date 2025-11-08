-- Enable RLS on public.profiles_backup and add safe default policies
-- Run this in Supabase SQL Editor (connected to the current project)

-- 1) Ensure table exists (no-op if it already does)
-- CREATE TABLE IF NOT EXISTS public.profiles_backup (LIKE public.profiles INCLUDING ALL);

-- 2) Enable Row Level Security
ALTER TABLE public.profiles_backup ENABLE ROW LEVEL SECURITY;

-- 3) Optional: Force RLS (prevents BYPASSRLS from skipping policies)
ALTER TABLE public.profiles_backup FORCE ROW LEVEL SECURITY;

-- 4) Policies
-- Adjust column names as appropriate for your schema. If this table mirrors `profiles`,
-- it likely has a `user_id` column that references auth.users.id.

-- a) Read your own row (or restrict reads entirely if this is sensitive backup data)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles_backup' AND policyname = 'Read own profile_backup'
  ) THEN
    CREATE POLICY "Read own profile_backup"
      ON public.profiles_backup
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END$$;

-- b) Insert only your own row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles_backup' AND policyname = 'Insert own profile_backup'
  ) THEN
    CREATE POLICY "Insert own profile_backup"
      ON public.profiles_backup
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END$$;

-- c) Update only your own row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles_backup' AND policyname = 'Update own profile_backup'
  ) THEN
    CREATE POLICY "Update own profile_backup"
      ON public.profiles_backup
      FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END$$;

-- d) Delete only your own row (optional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles_backup' AND policyname = 'Delete own profile_backup'
  ) THEN
    CREATE POLICY "Delete own profile_backup"
      ON public.profiles_backup
      FOR DELETE
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END$$;

-- 5) Verify
-- SELECT * FROM pg_policies WHERE schemaname='public' AND tablename='profiles_backup';
-- RLS is now enabled; only authenticated users can access their own rows.
