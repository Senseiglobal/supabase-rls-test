-- ============================================================
-- POST ENHANCEMENT HARDENING (Run after SAFE_SCHEMA_ENHANCEMENT.sql)
-- Makes UX simpler for generated frontends (e.g., Lovable) and
-- ensures data integrity + performance.
-- ============================================================

-- 1) Ensure RLS is enabled on insights (idempotent)
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- 2) Default user_id to the current auth.uid() so client UIs
--    don't have to remember to set it explicitly on insert.
ALTER TABLE public.insights ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 3) Make user_id mandatory once data is backfilled.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.insights WHERE user_id IS NULL) THEN
        RAISE EXCEPTION 'Cannot set NOT NULL: some insights.user_id are NULL';
    END IF;
END $$;
ALTER TABLE public.insights ALTER COLUMN user_id SET NOT NULL;

-- 4) Helpful index for common access pattern (my insights for a song, recent first)
CREATE INDEX IF NOT EXISTS idx_insights_user_song
ON public.insights (user_id, song_id, created_at DESC);

-- 5) Optional: prevent empty advice inserts from sloppy clients.
--    Uncomment to enforce (will apply to new rows only after VALIDATE).
-- ALTER TABLE public.insights
--   ADD CONSTRAINT advice_nonempty CHECK (trim(coalesce(advice, '')) <> '') NOT VALID;
-- ALTER TABLE public.insights VALIDATE CONSTRAINT advice_nonempty;

-- Done
SELECT 'Post-enhancement hardening complete' AS status;
