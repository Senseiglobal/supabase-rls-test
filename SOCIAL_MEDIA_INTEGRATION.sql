-- ============================================================
-- SOCIAL MEDIA INTEGRATION SCHEMA
-- ============================================================
-- Extends your existing schema to include social media feeds
-- for artists, allowing AI to analyze cross-platform presence
-- ============================================================

-- ============================================================
-- SOCIAL MEDIA HANDLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.social_media_handles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Platform & Handle
    platform TEXT NOT NULL, -- 'instagram', 'twitter', 'tiktok', 'youtube', 'facebook'
    handle TEXT NOT NULL, -- Username without @ symbol
    profile_url TEXT, -- Full URL to profile
    
    -- Verification
    is_verified BOOLEAN DEFAULT false, -- Platform verification badge
    is_official BOOLEAN DEFAULT true, -- User confirmed this is the official account
    
    -- Profile Metadata (cached from API)
    display_name TEXT,
    bio TEXT,
    profile_image_url TEXT,
    follower_count INTEGER,
    following_count INTEGER,
    post_count INTEGER,
    
    -- Sync Status
    last_synced_at TIMESTAMPTZ,
    sync_enabled BOOLEAN DEFAULT true,
    sync_error TEXT, -- Store last error if sync failed
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One handle per platform per artist
    UNIQUE(artist_id, platform)
);

CREATE INDEX idx_social_handles_artist ON public.social_media_handles(artist_id);
CREATE INDEX idx_social_handles_platform ON public.social_media_handles(platform);

-- ============================================================
-- SOCIAL MEDIA POSTS/CONTENT TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.social_media_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    handle_id UUID REFERENCES public.social_media_handles(id) ON DELETE CASCADE NOT NULL,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Post Identifiers
    platform TEXT NOT NULL,
    platform_post_id TEXT NOT NULL, -- Original ID from the platform
    post_url TEXT,
    
    -- Content
    content_type TEXT, -- 'photo', 'video', 'text', 'carousel', 'reel', 'story', 'short'
    caption TEXT,
    media_urls TEXT[], -- Array of image/video URLs
    thumbnail_url TEXT,
    
    -- Engagement Metrics
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Timestamps
    posted_at TIMESTAMPTZ NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Content Analysis (for AI)
    hashtags TEXT[], -- Extracted hashtags
    mentions TEXT[], -- Mentioned users
    sentiment_score FLOAT, -- -1.0 (negative) to 1.0 (positive)
    topics TEXT[], -- AI-detected topics
    
    -- Metadata
    is_pinned BOOLEAN DEFAULT false,
    is_sponsored BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(platform, platform_post_id)
);

CREATE INDEX idx_posts_handle ON public.social_media_posts(handle_id);
CREATE INDEX idx_posts_artist ON public.social_media_posts(artist_id);
CREATE INDEX idx_posts_platform_posted ON public.social_media_posts(platform, posted_at DESC);
CREATE INDEX idx_posts_user_recent ON public.social_media_posts(user_id, posted_at DESC);

-- ============================================================
-- SOCIAL INSIGHTS TABLE (AI Analysis of Social Data)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.social_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    
    -- Insight Classification
    insight_type TEXT NOT NULL, 
    -- Types: 'engagement_trend', 'posting_frequency', 'content_strategy', 
    --        'audience_growth', 'cross_platform_comparison', 'viral_moment',
    --        'collaboration_detected', 'tour_announcement', 'release_pattern'
    
    platform TEXT, -- Specific platform or 'all' for cross-platform insights
    
    -- Content
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- AI Analysis Data
    confidence_score FLOAT, -- 0.0 to 1.0
    data_points_analyzed INTEGER,
    
    -- Supporting Data (JSONB for flexibility)
    metrics JSONB,
    -- Example metrics for 'engagement_trend':
    -- {
    --   "avg_likes_before": 5000,
    --   "avg_likes_after": 12000,
    --   "growth_percentage": 140,
    --   "timeframe": "last_30_days",
    --   "top_performing_content": ["reel", "photo"],
    --   "best_posting_times": ["18:00-20:00", "12:00-14:00"]
    -- }
    
    -- Time Period
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    
    -- User Interaction
    is_active BOOLEAN DEFAULT true,
    viewed_at TIMESTAMPTZ,
    
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_social_insights_user ON public.social_insights(user_id);
CREATE INDEX idx_social_insights_artist ON public.social_insights(artist_id);
CREATE INDEX idx_social_insights_type ON public.social_insights(insight_type);

-- ============================================================
-- ENHANCED ARTISTS TABLE (Add social media summary fields)
-- ============================================================
-- Run these to add summary fields to your existing artists table

ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS 
    total_social_followers INTEGER DEFAULT 0;

ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS 
    social_engagement_score FLOAT DEFAULT 0.0; -- Calculated metric

ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS 
    most_active_platform TEXT; -- 'instagram', 'tiktok', etc.

ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS 
    social_metadata JSONB; -- Store aggregated social stats
-- Example:
-- {
--   "instagram": {"followers": 50000, "engagement_rate": 4.5},
--   "twitter": {"followers": 20000, "engagement_rate": 2.1},
--   "youtube": {"subscribers": 100000, "avg_views": 50000}
-- }

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- SOCIAL MEDIA HANDLES
ALTER TABLE public.social_media_handles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own social handles" 
    ON public.social_media_handles FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social handles" 
    ON public.social_media_handles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social handles" 
    ON public.social_media_handles FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social handles" 
    ON public.social_media_handles FOR DELETE 
    USING (auth.uid() = user_id);

-- SOCIAL MEDIA POSTS
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own social posts" 
    ON public.social_media_posts FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social posts" 
    ON public.social_media_posts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social posts" 
    ON public.social_media_posts FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social posts" 
    ON public.social_media_posts FOR DELETE 
    USING (auth.uid() = user_id);

-- SOCIAL INSIGHTS
ALTER TABLE public.social_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own social insights" 
    ON public.social_insights FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social insights" 
    ON public.social_insights FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social insights" 
    ON public.social_insights FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social insights" 
    ON public.social_insights FOR DELETE 
    USING (auth.uid() = user_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to calculate total social followers for an artist
CREATE OR REPLACE FUNCTION calculate_total_followers(artist_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total INTEGER;
BEGIN
    SELECT COALESCE(SUM(follower_count), 0)
    INTO total
    FROM public.social_media_handles
    WHERE artist_id = artist_uuid;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Function to get most active platform
CREATE OR REPLACE FUNCTION get_most_active_platform(artist_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    top_platform TEXT;
BEGIN
    SELECT platform
    INTO top_platform
    FROM public.social_media_handles
    WHERE artist_id = artist_uuid
    ORDER BY follower_count DESC
    LIMIT 1;
    
    RETURN top_platform;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update artist social stats when handles change
CREATE OR REPLACE FUNCTION update_artist_social_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.artists
    SET 
        total_social_followers = calculate_total_followers(NEW.artist_id),
        most_active_platform = get_most_active_platform(NEW.artist_id),
        updated_at = NOW()
    WHERE id = NEW.artist_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER social_handles_update_stats
AFTER INSERT OR UPDATE ON public.social_media_handles
FOR EACH ROW
EXECUTE FUNCTION update_artist_social_stats();

-- ============================================================
-- EXAMPLE QUERIES FOR AI INSIGHTS
-- ============================================================

-- Get engagement trend for an artist across all platforms
/*
SELECT 
    platform,
    DATE_TRUNC('week', posted_at) as week,
    AVG(like_count) as avg_likes,
    AVG(comment_count) as avg_comments,
    COUNT(*) as post_count
FROM public.social_media_posts
WHERE artist_id = 'YOUR_ARTIST_ID'
    AND posted_at > NOW() - INTERVAL '3 months'
GROUP BY platform, week
ORDER BY platform, week;
*/

-- Find best posting times
/*
SELECT 
    EXTRACT(DOW FROM posted_at) as day_of_week,
    EXTRACT(HOUR FROM posted_at) as hour_of_day,
    AVG(like_count + comment_count) as avg_engagement,
    COUNT(*) as post_count
FROM public.social_media_posts
WHERE artist_id = 'YOUR_ARTIST_ID'
    AND posted_at > NOW() - INTERVAL '6 months'
GROUP BY day_of_week, hour_of_day
HAVING COUNT(*) >= 3
ORDER BY avg_engagement DESC
LIMIT 10;
*/

-- Detect content types that perform best
/*
SELECT 
    content_type,
    platform,
    AVG(like_count) as avg_likes,
    AVG(comment_count) as avg_comments,
    AVG(view_count) as avg_views,
    COUNT(*) as total_posts
FROM public.social_media_posts
WHERE artist_id = 'YOUR_ARTIST_ID'
    AND posted_at > NOW() - INTERVAL '3 months'
GROUP BY content_type, platform
ORDER BY avg_likes DESC;
*/

-- ============================================================
-- PLATFORM-SPECIFIC NOTES
-- ============================================================

/*
INSTAGRAM:
- API: Instagram Graph API (requires Business/Creator account)
- Rate Limits: 200 calls/hour per user
- Data Available: Posts, Reels, Stories (24h), metrics, hashtags
- Authentication: OAuth via Facebook

TWITTER (X):
- API: Twitter API v2 (requires approval)
- Rate Limits: Varies by tier (Free, Basic, Pro)
- Data Available: Tweets, replies, likes, retweets, metrics
- Authentication: OAuth 2.0

TIKTOK:
- API: TikTok API for Business
- Rate Limits: Limited access, requires approval
- Data Available: Videos, metrics, user info
- Authentication: OAuth 2.0
- Note: Public data scraping is against TOS

YOUTUBE:
- API: YouTube Data API v3
- Rate Limits: 10,000 quota units/day
- Data Available: Videos, playlists, channels, stats
- Authentication: OAuth 2.0

FACEBOOK:
- API: Graph API
- Rate Limits: 200 calls/hour per user
- Data Available: Posts, photos, videos, metrics
- Authentication: OAuth via Facebook

ALTERNATIVE (No API Access):
- Use web scraping (check platform TOS)
- Use third-party aggregators like RapidAPI
- Manual data entry with Chrome extension
*/

-- ============================================================
