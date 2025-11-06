-- ============================================================
-- RECOMMENDED DATABASE SCHEMA FOR SPOTIFY + AI INSIGHTS APP
-- ============================================================
-- This schema is optimized for:
-- 1. Importing Spotify data via API
-- 2. Storing AI-generated insights with metadata
-- 3. Tracking user listening patterns
-- 4. Supporting future analytics features
-- ============================================================

-- ============================================================
-- PROFILES TABLE (Enhanced with Spotify connection)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    username TEXT UNIQUE,
    website TEXT,
    avatar_url TEXT,
    
    -- Spotify Integration
    spotify_user_id TEXT UNIQUE,
    spotify_access_token TEXT,
    spotify_refresh_token TEXT,
    spotify_token_expires_at TIMESTAMPTZ,
    spotify_connected_at TIMESTAMPTZ,
    last_spotify_sync TIMESTAMPTZ,
    
    -- Preferences
    preferred_insights_frequency TEXT DEFAULT 'weekly', -- daily, weekly, monthly
    insights_enabled BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- ============================================================
-- ARTISTS TABLE (Spotify-sourced)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.artists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Spotify Data
    spotify_id TEXT NOT NULL, -- Spotify's unique artist ID
    spotify_uri TEXT,
    name TEXT NOT NULL,
    
    -- Metadata from Spotify
    genres TEXT[], -- Array of genre strings
    popularity INTEGER, -- 0-100 popularity score from Spotify
    followers_count INTEGER,
    image_url TEXT,
    external_url TEXT, -- Link to Spotify artist page
    
    -- User Engagement (calculated from listening data)
    total_play_count INTEGER DEFAULT 0,
    last_played_at TIMESTAMPTZ,
    first_discovered_at TIMESTAMPTZ,
    is_top_artist BOOLEAN DEFAULT false, -- Top 50 artists for user
    
    -- Sync Tracking
    imported_at TIMESTAMPTZ DEFAULT NOW(),
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    sync_status TEXT DEFAULT 'active', -- active, stale, removed
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: one Spotify artist per user
    UNIQUE(user_id, spotify_id)
);

-- Index for fast lookups
CREATE INDEX idx_artists_user_id ON public.artists(user_id);
CREATE INDEX idx_artists_spotify_id ON public.artists(spotify_id);
CREATE INDEX idx_artists_top ON public.artists(user_id, is_top_artist) WHERE is_top_artist = true;

-- ============================================================
-- SONGS (TRACKS) TABLE (Spotify-sourced)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
    
    -- Spotify Data
    spotify_id TEXT NOT NULL,
    spotify_uri TEXT,
    title TEXT NOT NULL,
    album_name TEXT,
    album_spotify_id TEXT,
    
    -- Audio Features (from Spotify Audio Features API)
    duration_ms INTEGER,
    tempo FLOAT,
    energy FLOAT, -- 0.0 to 1.0
    danceability FLOAT, -- 0.0 to 1.0
    valence FLOAT, -- 0.0 to 1.0 (musical positivity)
    acousticness FLOAT,
    instrumentalness FLOAT,
    liveness FLOAT,
    speechiness FLOAT,
    loudness FLOAT,
    key INTEGER, -- Musical key (0-11)
    mode INTEGER, -- Major (1) or Minor (0)
    time_signature INTEGER,
    
    -- Metadata
    popularity INTEGER, -- 0-100
    explicit BOOLEAN DEFAULT false,
    preview_url TEXT, -- 30-second preview
    external_url TEXT,
    image_url TEXT, -- Album art
    
    -- User Listening Data
    play_count INTEGER DEFAULT 0,
    last_played_at TIMESTAMPTZ,
    first_played_at TIMESTAMPTZ,
    is_saved BOOLEAN DEFAULT false, -- User saved to library
    is_top_track BOOLEAN DEFAULT false,
    
    -- Sync Tracking
    imported_at TIMESTAMPTZ DEFAULT NOW(),
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, spotify_id)
);

CREATE INDEX idx_songs_user_id ON public.songs(user_id);
CREATE INDEX idx_songs_artist_id ON public.songs(artist_id);
CREATE INDEX idx_songs_spotify_id ON public.songs(spotify_id);
CREATE INDEX idx_songs_top ON public.songs(user_id, is_top_track) WHERE is_top_track = true;

-- ============================================================
-- LISTENING HISTORY TABLE (Optional - for detailed tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.listening_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    
    played_at TIMESTAMPTZ NOT NULL,
    context_type TEXT, -- playlist, album, artist, search, etc.
    context_uri TEXT, -- Spotify URI of the context
    
    -- Listening session data
    duration_played_ms INTEGER, -- How much they actually listened
    skip_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listening_user_played ON public.listening_history(user_id, played_at DESC);
CREATE INDEX idx_listening_song ON public.listening_history(song_id);

-- ============================================================
-- AI INSIGHTS TABLE (Completely restructured)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- What the insight is about (nullable because insights can be about multiple things)
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    
    -- Insight Classification
    insight_type TEXT NOT NULL, -- 'mood_pattern', 'genre_shift', 'energy_trend', 'tempo_preference', etc.
    category TEXT NOT NULL, -- 'listening_pattern', 'music_taste', 'recommendation', 'achievement', etc.
    
    -- AI-Generated Content
    title TEXT NOT NULL, -- e.g., "Your Late Night Vibes"
    content TEXT NOT NULL, -- Rich text explanation
    summary TEXT, -- Short version for cards
    
    -- AI Metadata
    ai_model_version TEXT, -- Track which model version generated this
    confidence_score FLOAT, -- 0.0 to 1.0 - how confident is the AI
    data_points_analyzed INTEGER, -- How many songs/plays were analyzed
    
    -- Supporting Data (JSONB for flexibility)
    metadata JSONB, -- Store any additional structured data
    -- Example metadata:
    -- {
    --   "time_period": "last_30_days",
    --   "top_genres": ["indie rock", "electronic"],
    --   "avg_energy": 0.65,
    --   "total_plays": 342,
    --   "mood_distribution": {"happy": 45, "sad": 20, "energetic": 35}
    -- }
    
    -- Time Period
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    
    -- User Interaction
    viewed_at TIMESTAMPTZ,
    is_dismissed BOOLEAN DEFAULT false,
    user_rating INTEGER, -- 1-5 stars, optional user feedback
    user_feedback TEXT,
    
    -- Visibility
    is_active BOOLEAN DEFAULT true, -- Can be hidden/archived
    priority INTEGER DEFAULT 0, -- Higher = show first
    
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insights_user_id ON public.insights(user_id);
CREATE INDEX idx_insights_song_id ON public.insights(song_id) WHERE song_id IS NOT NULL;
CREATE INDEX idx_insights_artist_id ON public.insights(artist_id) WHERE artist_id IS NOT NULL;
CREATE INDEX idx_insights_type ON public.insights(insight_type);
CREATE INDEX idx_insights_active ON public.insights(user_id, is_active, priority DESC) WHERE is_active = true;
CREATE INDEX idx_insights_generated ON public.insights(user_id, generated_at DESC);

-- ============================================================
-- USER PREFERENCES TABLE (For AI personalization)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Insight Preferences
    favorite_insight_types TEXT[], -- Array of insight types user likes
    hidden_insight_types TEXT[], -- Types they've dismissed
    
    -- Music Preferences (learned from behavior)
    preferred_genres TEXT[],
    preferred_moods TEXT[],
    preferred_energy_range FLOAT[], -- [min, max] e.g., [0.4, 0.8]
    
    -- Privacy Settings
    share_insights BOOLEAN DEFAULT false,
    public_profile BOOLEAN DEFAULT false,
    
    -- Notification Settings
    email_insights BOOLEAN DEFAULT true,
    push_insights BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS POLICIES (Security)
-- ============================================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ARTISTS
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own artists" ON public.artists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own artists" ON public.artists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own artists" ON public.artists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own artists" ON public.artists FOR DELETE USING (auth.uid() = user_id);

-- SONGS
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own songs" ON public.songs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own songs" ON public.songs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own songs" ON public.songs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own songs" ON public.songs FOR DELETE USING (auth.uid() = user_id);

-- LISTENING HISTORY
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own history" ON public.listening_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON public.listening_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- INSIGHTS (Simplified - no complex joins needed)
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own insights" ON public.insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON public.insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON public.insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own insights" ON public.insights FOR DELETE USING (auth.uid() = user_id);

-- USER PREFERENCES
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON public.artists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON public.songs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insights_updated_at BEFORE UPDATE ON public.insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- EXAMPLE INSIGHT TYPES
-- ============================================================
-- For reference, here are insight types your AI could generate:
--
-- LISTENING PATTERNS:
--   - 'most_played_artist'
--   - 'weekend_vs_weekday'
--   - 'time_of_day_pattern'
--   - 'listening_streak'
--
-- MUSIC TASTE:
--   - 'genre_evolution'
--   - 'mood_distribution'
--   - 'energy_preference'
--   - 'tempo_range'
--   - 'discovery_rate' (new vs familiar music)
--
-- RECOMMENDATIONS:
--   - 'similar_artists'
--   - 'mood_based_playlist'
--   - 'decade_dive' (explore different eras)
--
-- ACHIEVEMENTS:
--   - 'top_fan' (top 1% listener of an artist)
--   - 'diverse_listener'
--   - 'early_adopter' (found artists before they got popular)
--   - 'consistency_champion'
--
-- SOCIAL:
--   - 'shared_taste' (compare with friends)
--   - 'unique_taste' (songs no one else listens to)
--
-- ============================================================
