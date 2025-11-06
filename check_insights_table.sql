-- ============================================================
-- QUICK DIAGNOSTIC - Check Current State of insights Table
-- ============================================================

-- Show all columns in insights table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'insights'
ORDER BY ordinal_position;

-- This will show you exactly what columns exist right now
-- Look for: user_id, artist_id, advice_type, priority, etc.
