-- ============================================================
-- VERIFY SCHEMA ENHANCEMENT
-- ============================================================
-- Run this AFTER running SAFE_SCHEMA_ENHANCEMENT.sql
-- to verify everything was added correctly
-- ============================================================

-- Check profiles table has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN (
  'spotify_user_id', 
  'spotify_access_token', 
  'ai_manager_enabled', 
  'manager_personality',
  'goals',
  'target_audience'
)
ORDER BY column_name;
-- Expected: 6 rows

-- Check artists table has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'artists' 
AND column_name IN (
  'spotify_id',
  'genres',
  'instagram_handle',
  'tiktok_handle',
  'youtube_channel',
  'monthly_listeners',
  'last_synced_at'
)
ORDER BY column_name;
-- Expected: 7 rows

-- Check songs table has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'songs' 
AND column_name IN (
  'spotify_id',
  'release_date',
  'spotify_streams',
  'tempo',
  'energy',
  'danceability',
  'valence'
)
ORDER BY column_name;
-- Expected: 7 rows

-- Check insights table has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'insights' 
AND column_name IN (
  'user_id',
  'advice',
  'advice_type',
  'priority',
  'category',
  'title',
  'ai_confidence',
  'action_items',
  'is_read',
  'generated_at'
)
ORDER BY column_name;
-- Expected: 9 rows

-- Verify artist_id was dropped from insights
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'insights' 
AND column_name = 'artist_id';
-- Expected: 0 rows (column should be gone)

-- Check new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('manager_conversations', 'goals_tracker')
ORDER BY table_name;
-- Expected: 2 rows

-- Check RLS policies for insights (should be simple now)
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'insights'
ORDER BY cmd, policyname;
-- Expected: 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- Policy names should be "Users can view own insights", etc. (not "for their songs")

-- Check all existing data still intact
SELECT 
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM artists) as artists_count,
  (SELECT COUNT(*) FROM songs) as songs_count,
  (SELECT COUNT(*) FROM insights) as insights_count;
-- Expected: Your current row counts (should not change)

-- Check insights user_id was backfilled
SELECT 
  COUNT(*) as total_insights,
  COUNT(user_id) as insights_with_user_id,
  COUNT(*) - COUNT(user_id) as insights_missing_user_id
FROM insights;
-- Expected: insights_missing_user_id should be 0

-- ============================================================
-- VERIFICATION SUMMARY
-- ============================================================
-- If all queries return expected results, enhancement was successful!
-- ============================================================

DO $$ 
BEGIN
    RAISE NOTICE '✅ Schema enhancement verification complete!';
    RAISE NOTICE 'Check each query result above to ensure:';
    RAISE NOTICE '1. New columns added to profiles, artists, songs, insights';
    RAISE NOTICE '2. artist_id removed from insights';
    RAISE NOTICE '3. New tables created: manager_conversations, goals_tracker';
    RAISE NOTICE '4. RLS policies simplified';
    RAISE NOTICE '5. All existing data preserved';
    RAISE NOTICE '6. insights.user_id backfilled from existing relationships';
END $$;
