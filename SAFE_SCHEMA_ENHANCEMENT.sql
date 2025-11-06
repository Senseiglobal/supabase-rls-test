-- ============================================================
-- SAFE SCHEMA ENHANCEMENT - RUN THIS INSTEAD
-- ============================================================
-- This version handles all dependencies properly
-- ============================================================

-- ============================================================
-- PART 1: ENHANCE PROFILES TABLE
-- ============================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS spotify_user_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS spotify_access_token TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS spotify_refresh_token TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS spotify_token_expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS spotify_connected_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_manager_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS manager_personality TEXT DEFAULT 'professional';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goals TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_audience TEXT;

-- ============================================================
-- PART 2: ENHANCE ARTISTS TABLE
-- ============================================================
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS spotify_id TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS spotify_uri TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS genres TEXT[];
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS spotify_followers INTEGER DEFAULT 0;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS spotify_popularity INTEGER DEFAULT 0;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS tiktok_handle TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS youtube_channel TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS total_social_followers INTEGER DEFAULT 0;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS monthly_listeners INTEGER DEFAULT 0;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- Add unique constraint for spotify_id (only if column doesn't already have it)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'artists_spotify_id_key'
    ) THEN
        ALTER TABLE public.artists ADD CONSTRAINT artists_spotify_id_key UNIQUE (spotify_id);
    END IF;
END $$;

-- ============================================================
-- PART 3: ENHANCE SONGS TABLE
-- ============================================================
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS spotify_id TEXT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS spotify_uri TEXT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS release_date DATE;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS spotify_streams INTEGER DEFAULT 0;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS spotify_popularity INTEGER DEFAULT 0;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS tempo FLOAT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS energy FLOAT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS danceability FLOAT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS valence FLOAT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS acousticness FLOAT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS duration_ms INTEGER;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS playlist_adds INTEGER DEFAULT 0;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS saves INTEGER DEFAULT 0;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS skip_rate FLOAT;

-- Add unique constraint for spotify_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'songs_spotify_id_key'
    ) THEN
        ALTER TABLE public.songs ADD CONSTRAINT songs_spotify_id_key UNIQUE (spotify_id);
    END IF;
END $$;

-- ============================================================
-- PART 4: FIX INSIGHTS TABLE (CAREFULLY!)
-- ============================================================

-- Step 1: Add user_id column FIRST (before dropping artist_id)
ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS user_id UUID;

-- Step 2: Backfill user_id from existing relationships
UPDATE public.insights i
SET user_id = a.auth_uid::uuid
FROM public.songs s
JOIN public.artists a ON s.artist_id = a.id
WHERE i.song_id = s.id
AND i.user_id IS NULL;

-- Step 3: Add foreign key constraint to user_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'insights_user_id_fkey'
    ) THEN
        ALTER TABLE public.insights 
        ADD CONSTRAINT insights_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 4: Add all other new columns to insights
ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS advice_type TEXT DEFAULT 'creative_direction';
ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'advice';
ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS ai_confidence FLOAT;
ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS action_items TEXT[];
ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS expected_impact TEXT;
ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS data_source TEXT;
ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS user_feedback TEXT;
ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 5: Rename content to advice (only if content exists and advice doesn't)
DO $$ 
BEGIN
    IF EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='insights' AND column_name='content'
    ) AND NOT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='insights' AND column_name='advice'
    ) THEN
        ALTER TABLE public.insights RENAME COLUMN content TO advice;
    END IF;
END $$;

-- Step 6: NOW drop old RLS policies (they reference artist_id)
DROP POLICY IF EXISTS "Users can view insights for their songs" ON public.insights;
DROP POLICY IF EXISTS "Users can insert insights for their songs" ON public.insights;
DROP POLICY IF EXISTS "Users can update insights for their songs" ON public.insights;
DROP POLICY IF EXISTS "Users can delete insights for their songs" ON public.insights;
DROP POLICY IF EXISTS "insights_select_own" ON public.insights;
DROP POLICY IF EXISTS "insights_insert_own" ON public.insights;
DROP POLICY IF EXISTS "insights_update_own" ON public.insights;
DROP POLICY IF EXISTS "insights_delete_own" ON public.insights;

-- Step 7: Create new simple RLS policies (using user_id)
DROP POLICY IF EXISTS "Users can view own insights" ON public.insights;
DROP POLICY IF EXISTS "Users can insert own insights" ON public.insights;
DROP POLICY IF EXISTS "Users can update own insights" ON public.insights;
DROP POLICY IF EXISTS "Users can delete own insights" ON public.insights;

CREATE POLICY "Users can view own insights" 
    ON public.insights FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights" 
    ON public.insights FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" 
    ON public.insights FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights" 
    ON public.insights FOR DELETE 
    USING (auth.uid() = user_id);

-- Step 8: FINALLY drop artist_id column (policies are gone, safe now)
ALTER TABLE public.insights DROP COLUMN IF EXISTS artist_id CASCADE;

-- ============================================================
-- PART 5: CREATE NEW TABLES
-- ============================================================

-- Manager Conversations Table
CREATE TABLE IF NOT EXISTS public.manager_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    thread_id UUID DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    message TEXT NOT NULL,
    context_type TEXT,
    related_song_id UUID REFERENCES public.songs(id) ON DELETE SET NULL,
    related_artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
    ai_model TEXT DEFAULT 'google-gemini',
    tokens_used INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON public.manager_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_thread ON public.manager_conversations(thread_id, created_at ASC);

-- Goals Tracker Table
CREATE TABLE IF NOT EXISTS public.goals_tracker (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    goal_type TEXT NOT NULL,
    goal_title TEXT NOT NULL,
    goal_description TEXT,
    target_value INTEGER,
    current_value INTEGER DEFAULT 0,
    starting_value INTEGER DEFAULT 0,
    deadline DATE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    progress_percentage INTEGER DEFAULT 0,
    ai_suggested BOOLEAN DEFAULT false,
    ai_action_plan TEXT,
    last_ai_update TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_user ON public.goals_tracker(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_active ON public.goals_tracker(user_id, status) WHERE status = 'active';

-- ============================================================
-- PART 6: RLS FOR NEW TABLES
-- ============================================================

ALTER TABLE public.manager_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.manager_conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON public.manager_conversations;

CREATE POLICY "Users can view own conversations" 
    ON public.manager_conversations FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" 
    ON public.manager_conversations FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.goals_tracker ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own goals" ON public.goals_tracker;
DROP POLICY IF EXISTS "Users can insert own goals" ON public.goals_tracker;
DROP POLICY IF EXISTS "Users can update own goals" ON public.goals_tracker;
DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals_tracker;

CREATE POLICY "Users can view own goals" 
    ON public.goals_tracker FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" 
    ON public.goals_tracker FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" 
    ON public.goals_tracker FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" 
    ON public.goals_tracker FOR DELETE 
    USING (auth.uid() = user_id);

-- ============================================================
-- PART 7: HELPER FUNCTIONS & TRIGGERS
-- ============================================================

-- Goal progress auto-update trigger
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.target_value > 0 THEN
        NEW.progress_percentage := LEAST(100, GREATEST(0, 
            ROUND(((NEW.current_value - NEW.starting_value)::FLOAT / 
                   (NEW.target_value - NEW.starting_value)::FLOAT * 100)::INTEGER)
        ));
        
        IF NEW.current_value >= NEW.target_value AND NEW.status = 'active' THEN
            NEW.status := 'completed';
            NEW.completed_at := NOW();
        END IF;
    END IF;
    
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS goals_update_progress ON public.goals_tracker;
CREATE TRIGGER goals_update_progress 
    BEFORE UPDATE ON public.goals_tracker
    FOR EACH ROW 
    EXECUTE FUNCTION update_goal_progress();

-- ============================================================
-- DONE! 
-- ============================================================
SELECT 'Schema enhancement completed successfully!' as status;
