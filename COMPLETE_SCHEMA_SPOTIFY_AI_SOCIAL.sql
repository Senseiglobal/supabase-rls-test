-- ============================================================
-- COMPLETE MUSIC INSIGHTS APP SCHEMA
-- ============================================================
-- Integrations: Spotify API + Google AI + Social Media APIs
-- Purpose: Personalized music insights, trends, recommendations
-- Backend: Supabase (PostgreSQL + RLS + Storage + Auth)
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE (Enhanced for Multi-Platform Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    
    -- Basic Profile
    full_name TEXT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    
    -- User Type
    user_type TEXT DEFAULT 'listener', -- 'listener', 'artist', 'both'
    is_verified_artist BOOLEAN DEFAULT false,
    
    -- Spotify Integration
    spotify_user_id TEXT UNIQUE,
    spotify_display_name TEXT,
    spotify_email TEXT,
    spotify_access_token TEXT, -- Encrypted in production
    spotify_refresh_token TEXT, -- Encrypted in production
    spotify_token_expires_at TIMESTAMPTZ,
    spotify_connected_at TIMESTAMPTZ,
    spotify_last_sync TIMESTAMPTZ,
    spotify_account_type TEXT, -- 'free', 'premium'
    
    -- Google AI Integration
    google_user_id TEXT UNIQUE,
    google_email TEXT,
    google_access_token TEXT, -- Encrypted in production
    google_refresh_token TEXT, -- Encrypted in production
    google_token_expires_at TIMESTAMPTZ,
    google_connected_at TIMESTAMPTZ,
    ai_insights_enabled BOOLEAN DEFAULT true,
    
    -- Preferences
    preferred_genres TEXT[],
    language_preference TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    insights_frequency TEXT DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT false,
    
    -- Privacy
    profile_visibility TEXT DEFAULT 'private', -- 'public', 'private', 'friends'
    share_listening_data BOOLEAN DEFAULT false,
    
    -- Metadata
    onboarding_completed BOOLEAN DEFAULT false,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_spotify_id ON public.profiles(spotify_user_id);
CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);

-- ============================================================
-- 2. ARTISTS TABLE (Spotify-Linked Artists)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.artists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Ownership (if user is an artist managing their profile)
    owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    claimed BOOLEAN DEFAULT false,
    
    -- Spotify Data
    spotify_id TEXT UNIQUE NOT NULL,
    spotify_uri TEXT,
    name TEXT NOT NULL,
    
    -- Metadata
    genres TEXT[],
    popularity INTEGER, -- 0-100 from Spotify
    followers_count INTEGER,
    image_url TEXT,
    external_url TEXT,
    
    -- Social Media (from your social integration)
    instagram_handle TEXT,
    twitter_handle TEXT,
    tiktok_handle TEXT,
    youtube_channel TEXT,
    facebook_page TEXT,
    
    -- Aggregated Social Stats
    total_social_followers INTEGER DEFAULT 0,
    social_engagement_score FLOAT DEFAULT 0.0,
    
    -- Sync
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    sync_status TEXT DEFAULT 'active', -- 'active', 'stale', 'removed'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_artists_spotify_id ON public.artists(spotify_id);
CREATE INDEX idx_artists_owner ON public.artists(owner_user_id);
CREATE INDEX idx_artists_claimed ON public.artists(claimed) WHERE claimed = true;
CREATE INDEX idx_artists_name ON public.artists(name);

-- ============================================================
-- 3. SONGS (TRACKS) TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Spotify Data
    spotify_id TEXT UNIQUE NOT NULL,
    spotify_uri TEXT,
    title TEXT NOT NULL,
    artist_ids UUID[], -- Array of artist IDs (for multi-artist tracks)
    primary_artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    
    -- Album Info
    album_name TEXT,
    album_spotify_id TEXT,
    album_image_url TEXT,
    release_date DATE,
    
    -- Audio Features (Spotify Audio Features API)
    duration_ms INTEGER,
    tempo FLOAT,
    energy FLOAT, -- 0.0 to 1.0
    danceability FLOAT,
    valence FLOAT, -- Musical positivity
    acousticness FLOAT,
    instrumentalness FLOAT,
    liveness FLOAT,
    speechiness FLOAT,
    loudness FLOAT,
    key INTEGER, -- 0-11
    mode INTEGER, -- Major=1, Minor=0
    time_signature INTEGER,
    
    -- Metadata
    popularity INTEGER, -- 0-100
    explicit BOOLEAN DEFAULT false,
    preview_url TEXT,
    external_url TEXT,
    isrc TEXT, -- International Standard Recording Code
    
    -- Sync
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_songs_spotify_id ON public.songs(spotify_id);
CREATE INDEX idx_songs_primary_artist ON public.songs(primary_artist_id);
CREATE INDEX idx_songs_album ON public.songs(album_spotify_id);
CREATE INDEX idx_songs_title ON public.songs(title);

-- ============================================================
-- 4. USER_FEEDS TABLE (Raw Spotify Listening Data)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_feeds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Feed Type
    feed_type TEXT NOT NULL, 
    -- 'recently_played', 'top_tracks', 'top_artists', 'saved_tracks', 
    -- 'playlists', 'current_playback', 'listening_history'
    
    -- Source
    source TEXT DEFAULT 'spotify', -- 'spotify', 'google', 'manual'
    
    -- Content References
    song_id UUID REFERENCES public.songs(id) ON DELETE SET NULL,
    artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
    
    -- Raw Data (JSONB for flexibility)
    raw_data JSONB NOT NULL,
    -- Example for 'recently_played':
    -- {
    --   "track": {...spotify track object...},
    --   "played_at": "2025-11-06T18:30:00Z",
    --   "context": {"type": "playlist", "uri": "spotify:playlist:..."}
    -- }
    
    -- Extracted Fields (for faster queries)
    played_at TIMESTAMPTZ,
    context_type TEXT, -- 'playlist', 'album', 'artist', 'search'
    context_uri TEXT,
    
    -- Processing Status
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    ai_analyzed BOOLEAN DEFAULT false,
    ai_analyzed_at TIMESTAMPTZ,
    
    -- Time Period (for top tracks/artists)
    time_range TEXT, -- 'short_term' (4 weeks), 'medium_term' (6 months), 'long_term' (years)
    
    -- Metadata
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_feeds_user ON public.user_feeds(user_id, played_at DESC);
CREATE INDEX idx_user_feeds_type ON public.user_feeds(feed_type);
CREATE INDEX idx_user_feeds_song ON public.user_feeds(song_id);
CREATE INDEX idx_user_feeds_artist ON public.user_feeds(artist_id);
CREATE INDEX idx_user_feeds_processed ON public.user_feeds(processed) WHERE processed = false;
CREATE INDEX idx_user_feeds_ai_pending ON public.user_feeds(ai_analyzed) WHERE ai_analyzed = false;

-- ============================================================
-- 5. USER_INSIGHTS TABLE (Google AI Generated Insights)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Insight Classification
    insight_type TEXT NOT NULL,
    -- MUSIC INSIGHTS:
    -- 'top_genre_shift', 'mood_pattern', 'listening_time_analysis',
    -- 'discovery_vs_repeat', 'energy_trend', 'artist_loyalty',
    -- 'playlist_personality', 'seasonal_preferences'
    -- 
    -- RECOMMENDATIONS:
    -- 'similar_artists', 'mood_playlist', 'genre_exploration',
    -- 'decade_dive', 'hidden_gems', 'social_recommendations'
    --
    -- ACHIEVEMENTS:
    -- 'top_fan_badge', 'early_adopter', 'genre_explorer',
    -- 'consistency_streak', 'diverse_listener'
    
    category TEXT NOT NULL, -- 'pattern', 'recommendation', 'achievement', 'social', 'prediction'
    
    -- AI-Generated Content
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    summary TEXT, -- Short version for cards
    
    -- Visual Assets
    card_image_url TEXT, -- Generated card image
    card_color_scheme TEXT, -- Hex colors for theming
    icon_emoji TEXT, -- 🎵 🎸 🎤 📈 🔥 ⭐
    
    -- AI Metadata
    ai_model TEXT DEFAULT 'google-gemini', -- 'google-gemini', 'openai-gpt', 'custom'
    ai_model_version TEXT,
    confidence_score FLOAT, -- 0.0 to 1.0
    
    -- Analysis Data
    data_points_analyzed INTEGER,
    analysis_period_start TIMESTAMPTZ,
    analysis_period_end TIMESTAMPTZ,
    
    -- Supporting Data (JSONB)
    metrics JSONB,
    -- Example for 'mood_pattern':
    -- {
    --   "dominant_mood": "energetic",
    --   "mood_distribution": {"happy": 45, "sad": 10, "energetic": 35, "calm": 10},
    --   "mood_by_time": {"morning": "calm", "afternoon": "energetic", "evening": "happy"},
    --   "avg_valence": 0.68,
    --   "avg_energy": 0.72
    -- }
    
    recommendations JSONB,
    -- Example:
    -- {
    --   "songs": [{"spotify_id": "...", "reason": "..."}, ...],
    --   "artists": [{"spotify_id": "...", "reason": "..."}, ...],
    --   "playlists": [{"name": "...", "description": "..."}, ...]
    -- }
    
    -- Related Content
    related_songs UUID[], -- Array of song IDs
    related_artists UUID[], -- Array of artist IDs
    
    -- User Interaction
    viewed BOOLEAN DEFAULT false,
    viewed_at TIMESTAMPTZ,
    user_rating INTEGER, -- 1-5 stars
    user_feedback TEXT,
    is_saved BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    
    -- Visibility & Priority
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Higher = show first
    expires_at TIMESTAMPTZ, -- Some insights are time-sensitive
    
    -- Metadata
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insights_user ON public.user_insights(user_id);
CREATE INDEX idx_insights_type ON public.user_insights(insight_type);
CREATE INDEX idx_insights_category ON public.user_insights(category);
CREATE INDEX idx_insights_active ON public.user_insights(user_id, is_active, priority DESC) WHERE is_active = true;
CREATE INDEX idx_insights_generated ON public.user_insights(user_id, generated_at DESC);
CREATE INDEX idx_insights_unviewed ON public.user_insights(user_id, viewed) WHERE viewed = false;

-- ============================================================
-- 6. SOCIAL_MEDIA_HANDLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.social_media_handles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
    
    -- Platform & Handle
    platform TEXT NOT NULL, -- 'instagram', 'twitter', 'tiktok', 'youtube', 'facebook'
    handle TEXT NOT NULL,
    profile_url TEXT,
    
    -- Metrics (cached from APIs)
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER,
    post_count INTEGER,
    engagement_rate FLOAT, -- Calculated: (likes + comments) / followers
    
    -- Status
    is_verified BOOLEAN DEFAULT false,
    last_synced_at TIMESTAMPTZ,
    sync_enabled BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(artist_id, platform)
);

CREATE INDEX idx_social_handles_artist ON public.social_media_handles(artist_id);

-- ============================================================
-- 7. SOCIAL_MEDIA_POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.social_media_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    handle_id UUID REFERENCES public.social_media_handles(id) ON DELETE CASCADE NOT NULL,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
    
    -- Post Data
    platform TEXT NOT NULL,
    platform_post_id TEXT NOT NULL,
    post_url TEXT,
    
    -- Content
    content_type TEXT, -- 'photo', 'video', 'carousel', 'reel', 'story'
    caption TEXT,
    media_urls TEXT[],
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Analysis
    sentiment_score FLOAT, -- -1.0 to 1.0
    hashtags TEXT[],
    mentions TEXT[],
    
    -- Timestamps
    posted_at TIMESTAMPTZ NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(platform, platform_post_id)
);

CREATE INDEX idx_social_posts_handle ON public.social_media_posts(handle_id);
CREATE INDEX idx_social_posts_artist ON public.social_media_posts(artist_id);
CREATE INDEX idx_social_posts_posted ON public.social_media_posts(posted_at DESC);

-- ============================================================
-- 8. INTEGRATION_LOGS TABLE (Track API Calls & Errors)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.integration_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Integration Details
    service TEXT NOT NULL, -- 'spotify', 'google_ai', 'instagram', 'twitter', etc.
    operation TEXT NOT NULL, -- 'fetch_recently_played', 'generate_insight', 'sync_profile'
    endpoint TEXT, -- API endpoint called
    
    -- Request/Response
    request_method TEXT, -- 'GET', 'POST', 'PUT', 'DELETE'
    request_payload JSONB,
    response_status INTEGER, -- HTTP status code
    response_body JSONB,
    
    -- Status
    status TEXT NOT NULL, -- 'success', 'error', 'pending', 'timeout'
    error_message TEXT,
    error_code TEXT,
    
    -- Performance
    duration_ms INTEGER, -- How long the API call took
    retry_count INTEGER DEFAULT 0,
    
    -- Rate Limiting
    rate_limit_remaining INTEGER,
    rate_limit_reset_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_integration_logs_user ON public.integration_logs(user_id, created_at DESC);
CREATE INDEX idx_integration_logs_service ON public.integration_logs(service, status);
CREATE INDEX idx_integration_logs_errors ON public.integration_logs(status) WHERE status = 'error';
CREATE INDEX idx_integration_logs_created ON public.integration_logs(created_at DESC);

-- ============================================================
-- 9. USER_PLAYLISTS TABLE (Spotify Playlists)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_playlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Spotify Data
    spotify_playlist_id TEXT UNIQUE NOT NULL,
    spotify_uri TEXT,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Metadata
    is_public BOOLEAN DEFAULT false,
    is_collaborative BOOLEAN DEFAULT false,
    owner_spotify_id TEXT,
    is_owner BOOLEAN DEFAULT true,
    
    -- Content
    track_count INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    image_url TEXT,
    
    -- AI Analysis
    ai_generated_description TEXT, -- Google AI summary of playlist vibe
    detected_mood TEXT, -- 'energetic', 'chill', 'sad', 'party', etc.
    avg_energy FLOAT,
    avg_valence FLOAT,
    dominant_genres TEXT[],
    
    -- Sync
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_playlists_user ON public.user_playlists(user_id);
CREATE INDEX idx_playlists_spotify_id ON public.user_playlists(spotify_playlist_id);

-- ============================================================
-- 10. PLAYLIST_TRACKS TABLE (Junction Table)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.playlist_tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID REFERENCES public.user_playlists(id) ON DELETE CASCADE NOT NULL,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
    
    -- Position in playlist
    position INTEGER NOT NULL,
    added_at TIMESTAMPTZ,
    added_by_spotify_id TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(playlist_id, song_id)
);

CREATE INDEX idx_playlist_tracks_playlist ON public.playlist_tracks(playlist_id, position);
CREATE INDEX idx_playlist_tracks_song ON public.playlist_tracks(song_id);

-- ============================================================
-- RLS POLICIES (Row-Level Security)
-- ============================================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ARTISTS (Public read, owners can update)
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view artists" ON public.artists FOR SELECT USING (true);
CREATE POLICY "Owners can update their artist profile" ON public.artists FOR UPDATE USING (auth.uid() = owner_user_id);

-- SONGS (Public read)
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view songs" ON public.songs FOR SELECT USING (true);

-- USER_FEEDS
ALTER TABLE public.user_feeds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own feeds" ON public.user_feeds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feeds" ON public.user_feeds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own feeds" ON public.user_feeds FOR UPDATE USING (auth.uid() = user_id);

-- USER_INSIGHTS
ALTER TABLE public.user_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own insights" ON public.user_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON public.user_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON public.user_insights FOR UPDATE USING (auth.uid() = user_id);

-- SOCIAL_MEDIA_HANDLES (Public read)
ALTER TABLE public.social_media_handles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view social handles" ON public.social_media_handles FOR SELECT USING (true);

-- SOCIAL_MEDIA_POSTS (Public read)
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view social posts" ON public.social_media_posts FOR SELECT USING (true);

-- INTEGRATION_LOGS
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own logs" ON public.integration_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON public.integration_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- USER_PLAYLISTS
ALTER TABLE public.user_playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own playlists" ON public.user_playlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own playlists" ON public.user_playlists FOR INSERT WITH CHECK (auth.uid() = user_id);

-- PLAYLIST_TRACKS
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view tracks in their playlists" ON public.playlist_tracks FOR SELECT 
USING (playlist_id IN (SELECT id FROM public.user_playlists WHERE user_id = auth.uid()));

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
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

CREATE TRIGGER update_user_insights_updated_at BEFORE UPDATE ON public.user_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- EXAMPLE DATA FLOW
-- ============================================================

/*
1. USER CONNECTS SPOTIFY:
   - OAuth flow stores tokens in profiles.spotify_access_token
   - Log in integration_logs: service='spotify', operation='oauth_connect'

2. FETCH SPOTIFY DATA:
   - Call Spotify API: Get Recently Played
   - Store raw response in user_feeds: feed_type='recently_played', raw_data=<json>
   - Extract song/artist, create/update records in songs and artists tables
   - Log in integration_logs: service='spotify', operation='fetch_recently_played', status='success'

3. GOOGLE AI ANALYSIS:
   - Batch unprocessed user_feeds records
   - Send to Google AI with prompt: "Analyze this user's listening patterns..."
   - Receive insights JSON from AI
   - Create records in user_insights table
   - Mark user_feeds as ai_analyzed=true
   - Log in integration_logs: service='google_ai', operation='generate_insights'

4. USER DASHBOARD:
   - Query user_insights WHERE user_id=<user> AND is_active=true ORDER BY priority DESC
   - Display insights as cards
   - Show recommendations, trends, achievements

5. SOCIAL MEDIA SYNC (for Artists):
   - Fetch Instagram posts via API
   - Store in social_media_posts
   - Google AI analyzes social engagement + music streams correlation
   - Generate insight: "Your Instagram Reels boost streams by 40%"
*/

-- ============================================================
