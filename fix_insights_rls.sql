-- ============================================================
-- VERIFY AND FIX RLS POLICIES
-- ============================================================
-- Run this to check if all RLS policies are in place
-- ============================================================

-- Check existing policies for insights table
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'insights';

-- Expected policies for insights table:
-- 1. Users can view insights for songs they own
-- 2. Users can insert insights for songs they own  
-- 3. Users can update their own insights
-- 4. Users can delete their own insights

-- If policies are missing, create them:

-- DROP existing policies (if any are wrong)
DROP POLICY IF EXISTS "Users can view insights for their songs" ON public.insights;
DROP POLICY IF EXISTS "Users can insert insights for their songs" ON public.insights;
DROP POLICY IF EXISTS "Users can update insights for their songs" ON public.insights;
DROP POLICY IF EXISTS "Users can delete insights for their songs" ON public.insights;

-- Create correct policies

-- Policy 1: SELECT (read) - users can view insights for songs that belong to their artists
CREATE POLICY "Users can view insights for their songs"
ON public.insights FOR SELECT
USING (
  song_id IN (
    SELECT s.id FROM songs s
    INNER JOIN artists a ON s.artist_id = a.id
    WHERE a.auth_uid::uuid = auth.uid()
  )
);

-- Policy 2: INSERT (create) - users can create insights for songs that belong to their artists
CREATE POLICY "Users can insert insights for their songs"
ON public.insights FOR INSERT
WITH CHECK (
  song_id IN (
    SELECT s.id FROM songs s
    INNER JOIN artists a ON s.artist_id = a.id
    WHERE a.auth_uid::uuid = auth.uid()
  )
);

-- Policy 3: UPDATE - users can update insights for songs that belong to their artists
CREATE POLICY "Users can update insights for their songs"
ON public.insights FOR UPDATE
USING (
  song_id IN (
    SELECT s.id FROM songs s
    INNER JOIN artists a ON s.artist_id = a.id
    WHERE a.auth_uid::uuid = auth.uid()
  )
)
WITH CHECK (
  song_id IN (
    SELECT s.id FROM songs s
    INNER JOIN artists a ON s.artist_id = a.id
    WHERE a.auth_uid::uuid = auth.uid()
  )
);

-- Policy 4: DELETE - users can delete insights for songs that belong to their artists
CREATE POLICY "Users can delete insights for their songs"
ON public.insights FOR DELETE
USING (
  song_id IN (
    SELECT s.id FROM songs s
    INNER JOIN artists a ON s.artist_id = a.id
    WHERE a.auth_uid::uuid = auth.uid()
  )
);

-- Verify policies were created
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE tablename = 'insights'
ORDER BY cmd, policyname;

-- Expected output: 4 policies (SELECT, INSERT, UPDATE, DELETE)
