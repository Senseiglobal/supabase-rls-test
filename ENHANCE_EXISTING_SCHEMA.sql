-- ============================================================
-- AI ARTIST MANAGER - SIMPLIFIED SCHEMA ENHANCEMENT
-- ============================================================
-- Keeps your existing tables: profiles, artists, songs, insights
-- Adds minimal new tables for AI manager functionality
-- No need to start fresh - just run these ALTER/CREATE statements
-- ============================================================

-- ============================================================
-- STEP 1: ENHANCE EXISTING PROFILES TABLE
-- ============================================================
-- Add fields for Spotify and AI manager preferences

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
    spotify_user_id TEXT;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
    spotify_access_token TEXT; -- Store encrypted in production

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
    spotify_refresh_token TEXT;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
    spotify_token_expires_at TIMESTAMPTZ;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
    spotify_connected_at TIMESTAMPTZ;

-- AI Manager Preferences
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
    ai_manager_enabled BOOLEAN DEFAULT true;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
    manager_personality TEXT DEFAULT 'professional'; 
    -- 'professional', 'friendly', 'direct', 'motivational'

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
    goals TEXT; -- Artist's stated goals: "grow fanbase", "release album", etc.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
    target_audience TEXT; -- Who they want to reach

-- ============================================================
-- STEP 2: ENHANCE EXISTING ARTISTS TABLE
-- ============================================================
-- Add Spotify and social media fields

ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS 
    spotify_id TEXT UNIQUE;

ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS 
    spotify_uri TEXT;

ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS 
    genres TEXT[];

ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS 
    spotify_followers INTEGER DEFAULT 0;

ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS 
    spotify_popularity INTEGER DEFAULT 0; -- 0-100 score

-- Social Media Handles
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS 
    instagram_handle TEXT;

ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS 
    tiktok_handle TEXT;

ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS 
    youtube_channel TEXT;

ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS 
    twitter_handle TEXT;

-- Aggregated Stats (cached from APIs)
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS 
    total_social_followers INTEGER DEFAULT 0;

ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS 
    monthly_listeners INTEGER DEFAULT 0;

ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS 
    last_synced_at TIMESTAMPTZ;

-- ============================================================
-- STEP 3: ENHANCE EXISTING SONGS TABLE
-- ============================================================
-- Add Spotify metadata and performance tracking

ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS 
    spotify_id TEXT UNIQUE;

ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS 
    spotify_uri TEXT;

ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS 
    release_date DATE;

ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS 
    spotify_streams INTEGER DEFAULT 0;

ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS 
    spotify_popularity INTEGER DEFAULT 0; -- 0-100

-- Audio Features (for AI analysis)
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS 
    tempo FLOAT;

ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS 
    energy FLOAT; -- 0.0 to 1.0

ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS 
    danceability FLOAT;

ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS 
    valence FLOAT; -- Musical positivity/happiness

ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS 
    acousticness FLOAT;

ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS 
    duration_ms INTEGER;

-- Performance Tracking
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS 
    playlist_adds INTEGER DEFAULT 0;

ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS 
    saves INTEGER DEFAULT 0;

ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS 
    skip_rate FLOAT; -- Percentage of skips

-- ============================================================
-- STEP 4: TRANSFORM INSIGHTS TABLE INTO AI MANAGER ADVICE
-- ============================================================
-- Keep existing insights table structure, but repurpose it

-- FIRST: Drop old RLS policies that depend on artist_id
DROP POLICY IF EXISTS "insights_select_own" ON public.insights;
DROP POLICY IF EXISTS "insights_insert_own" ON public.insights;
DROP POLICY IF EXISTS "insights_update_own" ON public.insights;
DROP POLICY IF EXISTS "insights_delete_own" ON public.insights;

-- NOW we can drop the problematic artist_id column (it's redundant)
ALTER TABLE public.insights DROP COLUMN IF EXISTS artist_id;

-- Add user_id for simpler RLS
ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS 
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add AI Manager fields
ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS 
    advice_type TEXT DEFAULT 'creative_direction';
    -- Types: 'creative_direction', 'marketing_strategy', 'release_timing',
    --        'audience_growth', 'content_ideas', 'collaboration_suggestion',
    --        'performance_feedback', 'goal_tracking'

ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS 
    priority TEXT DEFAULT 'medium'; -- 'low', 'medium', 'high', 'urgent'

ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS 
    category TEXT DEFAULT 'advice'; -- 'advice', 'warning', 'opportunity', 'achievement'

ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS 
    title TEXT;

ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS 
    ai_confidence FLOAT; -- 0.0 to 1.0

ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS 
    action_items TEXT[]; -- Array of actionable steps

ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS 
    expected_impact TEXT; -- "Could increase streams by 20-30%"

ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS 
    data_source TEXT; -- 'spotify', 'social_media', 'combined'

ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS 
    is_read BOOLEAN DEFAULT false;

ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS 
    is_archived BOOLEAN DEFAULT false;

ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS 
    user_feedback TEXT; -- Artist can respond/ask questions

ALTER TABLE public.insights ADD COLUMN IF NOT EXISTS 
    generated_at TIMESTAMPTZ DEFAULT NOW();

-- Rename 'content' column to 'advice' for clarity
DO $$ 
BEGIN
    IF EXISTS(SELECT 1 FROM information_schema.columns 
              WHERE table_name='insights' AND column_name='content') THEN
        ALTER TABLE public.insights RENAME COLUMN content TO advice;
    END IF;
END $$;

-- ============================================================
-- STEP 5: CREATE NEW MANAGER_CONVERSATIONS TABLE
-- ============================================================
-- Chat-like interface with AI manager

CREATE TABLE IF NOT EXISTS public.manager_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Conversation tracking
    thread_id UUID DEFAULT gen_random_uuid(), -- Group related messages
    
    -- Message
    role TEXT NOT NULL, -- 'user' or 'assistant' (AI manager)
    message TEXT NOT NULL,
    
    -- Context (what was the artist asking about?)
    context_type TEXT, -- 'song_feedback', 'strategy_question', 'general_advice'
    related_song_id UUID REFERENCES public.songs(id) ON DELETE SET NULL,
    related_artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
    
    -- AI Metadata
    ai_model TEXT DEFAULT 'google-gemini',
    tokens_used INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON public.manager_conversations(user_id, created_at DESC);
CREATE INDEX idx_conversations_thread ON public.manager_conversations(thread_id, created_at ASC);

-- ============================================================
-- STEP 6: CREATE GOALS_TRACKER TABLE
-- ============================================================
-- Track artist goals and AI manager helps achieve them

CREATE TABLE IF NOT EXISTS public.goals_tracker (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Goal Details
    goal_type TEXT NOT NULL, -- 'streams', 'followers', 'releases', 'playlists', 'custom'
    goal_title TEXT NOT NULL,
    goal_description TEXT,
    
    -- Metrics
    target_value INTEGER, -- e.g., 10000 streams
    current_value INTEGER DEFAULT 0,
    starting_value INTEGER DEFAULT 0,
    
    -- Timeline
    deadline DATE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Status
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused', 'abandoned'
    progress_percentage INTEGER DEFAULT 0,
    
    -- AI Manager Support
    ai_suggested BOOLEAN DEFAULT false, -- Did AI suggest this goal?
    ai_action_plan TEXT, -- AI-generated plan to achieve goal
    last_ai_update TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_goals_user ON public.goals_tracker(user_id);
CREATE INDEX idx_goals_active ON public.goals_tracker(user_id, status) WHERE status = 'active';

-- ============================================================
-- STEP 7: SIMPLIFIED RLS POLICIES FOR INSIGHTS
-- ============================================================

-- Drop old complex policies
DROP POLICY IF EXISTS "Users can view insights for their songs" ON public.insights;
DROP POLICY IF EXISTS "Users can insert insights for their songs" ON public.insights;
DROP POLICY IF EXISTS "Users can update insights for their songs" ON public.insights;
DROP POLICY IF EXISTS "Users can delete insights for their songs" ON public.insights;

-- Create simple user_id-based policies
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

-- ============================================================
-- STEP 8: RLS FOR NEW TABLES
-- ============================================================

-- MANAGER_CONVERSATIONS
ALTER TABLE public.manager_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" 
    ON public.manager_conversations FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" 
    ON public.manager_conversations FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- GOALS_TRACKER
ALTER TABLE public.goals_tracker ENABLE ROW LEVEL SECURITY;

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
-- STEP 9: HELPER FUNCTIONS
-- ============================================================

-- Function to populate user_id in existing insights
CREATE OR REPLACE FUNCTION backfill_insights_user_id()
RETURNS void AS $$
BEGIN
    -- Update insights with user_id from songs->artists->auth_uid
    UPDATE public.insights i
    SET user_id = a.auth_uid
    FROM public.songs s
    JOIN public.artists a ON s.artist_id = a.id
    WHERE i.song_id = s.id
    AND i.user_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Run the backfill
SELECT backfill_insights_user_id();

-- ============================================================
-- STEP 10: TRIGGER TO AUTO-UPDATE GOALS PROGRESS
-- ============================================================

CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-calculate progress percentage
    IF NEW.target_value > 0 THEN
        NEW.progress_percentage := LEAST(100, GREATEST(0, 
            ROUND(((NEW.current_value - NEW.starting_value)::FLOAT / 
                   (NEW.target_value - NEW.starting_value)::FLOAT * 100)::INTEGER)
        ));
        
        -- Auto-complete if target reached
        IF NEW.current_value >= NEW.target_value AND NEW.status = 'active' THEN
            NEW.status := 'completed';
            NEW.completed_at := NOW();
        END IF;
    END IF;
    
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goals_update_progress 
    BEFORE UPDATE ON public.goals_tracker
    FOR EACH ROW 
    EXECUTE FUNCTION update_goal_progress();

-- ============================================================
-- MIGRATION COMPLETE!
-- ============================================================
-- Your existing data is preserved
-- New columns added with defaults
-- Old complex RLS replaced with simple user_id checks
-- New tables for AI manager features added
-- ============================================================
