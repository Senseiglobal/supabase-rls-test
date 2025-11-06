# Complete Implementation Roadmap
## Music Insights App: Spotify + Google AI + Social Media

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DASHBOARD                          │
│  (React + Vite + UK Government Design System + Animations)     │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND                           │
│  • PostgreSQL Database (with schema you have)                   │
│  • Row-Level Security (RLS)                                     │
│  • Auth (Email/Password + OAuth)                                │
│  • Storage (Avatar images, generated cards)                     │
│  • Edge Functions (API integrations)                            │
└─────────────────────────────────────────────────────────────────┘
                              ↕
        ┌────────────────┬────────────────┬────────────────┐
        ↓                ↓                ↓                ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  SPOTIFY API │  │  GOOGLE AI   │  │  INSTAGRAM   │  │   TWITTER    │
│              │  │  (Gemini)    │  │     API      │  │     API      │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

---

## Phase 1: Database Migration (Week 1)

### 1.1 Current State Analysis
**Your Current Schema:**
- ✅ `profiles` - Basic user data
- ✅ `artists` - Manual CRUD, has `auth_uid`
- ✅ `songs` - Manual CRUD, linked to artists
- ✅ `insights` - Basic text content with `song_id` + `artist_id`

**Problems:**
- ❌ No Spotify integration fields
- ❌ No `user_id` in insights (complex RLS)
- ❌ No Google AI metadata
- ❌ No feed storage for raw Spotify data
- ❌ No integration logging

### 1.2 Migration Strategy

**Option A: Full Schema Replacement (Recommended)**
```sql
-- Run COMPLETE_SCHEMA_SPOTIFY_AI_SOCIAL.sql
-- This creates all new tables from scratch
-- Migrate existing data manually if needed
```

**Option B: Incremental Migration (Safer)**
```sql
-- Step 1: Enhance existing tables
ALTER TABLE public.profiles ADD COLUMN spotify_user_id TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN spotify_access_token TEXT;
-- ... (add all Spotify/Google fields)

ALTER TABLE public.artists ADD COLUMN spotify_id TEXT UNIQUE;
ALTER TABLE public.artists ADD COLUMN genres TEXT[];
-- ... (add Spotify metadata)

ALTER TABLE public.songs ADD COLUMN spotify_id TEXT UNIQUE;
ALTER TABLE public.songs ADD COLUMN energy FLOAT;
-- ... (add audio features)

-- Step 2: Create new tables
CREATE TABLE user_feeds (...);
CREATE TABLE integration_logs (...);
-- etc.

-- Step 3: Migrate insights table
-- Rename old insights table
ALTER TABLE public.insights RENAME TO insights_old;

-- Create new insights table with proper structure
CREATE TABLE public.user_insights (...);

-- Migrate data (manual SQL based on your data)
INSERT INTO public.user_insights (user_id, title, description, ...)
SELECT 
  a.auth_uid as user_id,
  'Migrated Insight' as title,
  i.content as description,
  ...
FROM insights_old i
JOIN songs s ON i.song_id = s.id
JOIN artists a ON s.artist_id = a.id;
```

### 1.3 Migration Checklist
- [ ] Backup current database (Supabase Dashboard > Database > Backups)
- [ ] Run new schema SQL in Supabase SQL Editor
- [ ] Update RLS policies (remove old complex ones)
- [ ] Test with dummy user account
- [ ] Migrate existing user data (if any)

---

## Phase 2: Spotify Integration (Week 2-3)

### 2.1 Spotify App Setup
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create app: "Music Insights App"
3. Get **Client ID** and **Client Secret**
4. Add Redirect URI: `https://supabasetest-six.vercel.app/auth/callback/spotify`
5. Request scopes:
   - `user-read-recently-played`
   - `user-top-read`
   - `user-library-read`
   - `user-read-playback-state`
   - `playlist-read-private`
   - `user-read-email`

### 2.2 OAuth Flow (Frontend)
Create `frontend/src/components/SpotifyConnect.jsx`:
```javascript
import { supabase } from '../supabaseClient'

export default function SpotifyConnect({ session }) {
  const connectSpotify = () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
    const redirectUri = `${window.location.origin}/auth/callback/spotify`
    const scopes = [
      'user-read-recently-played',
      'user-top-read',
      'user-library-read',
      'playlist-read-private'
    ].join(' ')
    
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}`
    
    window.location.href = authUrl
  }

  return (
    <button onClick={connectSpotify} className="govuk-button">
      Connect Spotify
    </button>
  )
}
```

### 2.3 Backend Token Exchange (Supabase Edge Function)
Create `supabase/functions/spotify-callback/index.ts`:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  
  // Exchange code for tokens
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    })
  })
  
  const tokens = await tokenResponse.json()
  
  // Store in profiles table
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  await supabase.from('profiles').update({
    spotify_access_token: tokens.access_token,
    spotify_refresh_token: tokens.refresh_token,
    spotify_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000),
    spotify_connected_at: new Date()
  }).eq('id', userId)
  
  return new Response(JSON.stringify({ success: true }))
})
```

### 2.4 Fetch Spotify Data (Edge Function)
Create `supabase/functions/sync-spotify-data/index.ts`:
```typescript
async function fetchRecentlyPlayed(accessToken: string) {
  const response = await fetch(
    'https://api.spotify.com/v1/me/player/recently-played?limit=50',
    { headers: { 'Authorization': `Bearer ${accessToken}` } }
  )
  return await response.json()
}

async function storeInUserFeeds(userId: string, data: any) {
  const supabase = createClient(...)
  
  for (const item of data.items) {
    // Ensure song exists
    const song = await upsertSong(item.track)
    
    // Store in user_feeds
    await supabase.from('user_feeds').insert({
      user_id: userId,
      feed_type: 'recently_played',
      song_id: song.id,
      played_at: item.played_at,
      raw_data: item,
      source: 'spotify'
    })
  }
}
```

---

## Phase 3: Google AI Integration (Week 4-5)

### 3.1 Google AI Setup
1. Go to [Google AI Studio](https://ai.google.dev)
2. Get API key for Gemini
3. Store in Supabase Secrets: `GOOGLE_AI_API_KEY`

### 3.2 AI Insight Generation (Edge Function)
Create `supabase/functions/generate-insights/index.ts`:
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

async function generateInsights(userId: string) {
  const supabase = createClient(...)
  
  // Get user's listening data
  const { data: feeds } = await supabase
    .from('user_feeds')
    .select('*, songs(*), artists(*)')
    .eq('user_id', userId)
    .eq('ai_analyzed', false)
    .limit(100)
    .order('played_at', { ascending: false })
  
  // Prepare data for AI
  const listeningPattern = analyzeListeningPattern(feeds)
  
  // Call Google AI
  const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
  
  const prompt = `
    Analyze this user's music listening pattern and generate 3 personalized insights:
    
    Listening Data:
    - Total plays: ${listeningPattern.totalPlays}
    - Top genres: ${listeningPattern.topGenres.join(', ')}
    - Average energy: ${listeningPattern.avgEnergy}
    - Average valence: ${listeningPattern.avgValence}
    - Most played time: ${listeningPattern.peakListeningTime}
    - Top artists: ${listeningPattern.topArtists.map(a => a.name).join(', ')}
    
    Generate insights in this JSON format:
    {
      "insights": [
        {
          "type": "mood_pattern",
          "title": "Your Late Night Vibes",
          "description": "...",
          "confidence": 0.85,
          "metrics": {...}
        },
        ...
      ]
    }
  `
  
  const result = await model.generateContent(prompt)
  const insights = JSON.parse(result.response.text())
  
  // Store insights in database
  for (const insight of insights.insights) {
    await supabase.from('user_insights').insert({
      user_id: userId,
      insight_type: insight.type,
      title: insight.title,
      description: insight.description,
      confidence_score: insight.confidence,
      metrics: insight.metrics,
      ai_model: 'google-gemini',
      generated_at: new Date()
    })
  }
  
  // Mark feeds as analyzed
  await supabase.from('user_feeds')
    .update({ ai_analyzed: true, ai_analyzed_at: new Date() })
    .in('id', feeds.map(f => f.id))
}
```

### 3.3 Scheduled AI Analysis (Cron Job)
Use Supabase Edge Functions with cron:
```typescript
// supabase/functions/_cron/generate-insights-daily/index.ts
serve(async (req) => {
  // Run daily at 6 AM
  const { data: users } = await supabase
    .from('profiles')
    .select('id')
    .eq('ai_insights_enabled', true)
  
  for (const user of users) {
    await generateInsights(user.id)
  }
})
```

---

## Phase 4: Frontend Dashboard (Week 6-7)

### 4.1 Insights Display Component
Create `frontend/src/components/InsightsDashboard.jsx`:
```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'

export default function InsightsDashboard({ session }) {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInsights()
  }, [])

  async function loadInsights() {
    try {
      const { data, error } = await supabase
        .from('user_insights')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('generated_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      setInsights(data)
    } catch (error) {
      toast.error('Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="insights-dashboard">
      <h2 className="govuk-heading-l">Your Music Insights</h2>
      
      {loading ? (
        <div className="govuk-spinner"></div>
      ) : insights.length > 0 ? (
        <div className="insights-grid">
          {insights.map(insight => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      ) : (
        <p>No insights yet. Connect your Spotify to get started!</p>
      )}
    </div>
  )
}

function InsightCard({ insight }) {
  return (
    <div className="insight-card" style={{
      background: `linear-gradient(135deg, ${insight.card_color_scheme || '#1d70b8'}, #003078)`,
      color: 'white',
      padding: '24px',
      borderRadius: '8px',
      marginBottom: '16px'
    }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>
        {insight.icon_emoji || '🎵'}
      </div>
      <h3 className="govuk-heading-m" style={{ color: 'white' }}>
        {insight.title}
      </h3>
      <p style={{ opacity: 0.9 }}>
        {insight.description}
      </p>
      {insight.confidence_score && (
        <div style={{ marginTop: '12px', fontSize: '12px', opacity: 0.7 }}>
          Confidence: {(insight.confidence_score * 100).toFixed(0)}%
        </div>
      )}
    </div>
  )
}
```

---

## Phase 5: Social Media Integration (Week 8-9)

### 5.1 Instagram Integration (for Artists)
Artists can add their Instagram handle:
```javascript
// In Artists.jsx
<input 
  type="text"
  placeholder="@instagram"
  value={instagramHandle}
  onChange={(e) => setInstagramHandle(e.target.value)}
/>
```

### 5.2 Fetch Instagram Data (Edge Function)
```typescript
// supabase/functions/sync-instagram/index.ts
async function syncInstagram(artistId: string, handle: string) {
  // Use Instagram Graph API
  const response = await fetch(
    `https://graph.instagram.com/me/media?fields=id,caption,media_type,like_count,comments_count&access_token=${token}`
  )
  
  const data = await response.json()
  
  // Store posts
  for (const post of data.data) {
    await supabase.from('social_media_posts').upsert({
      artist_id: artistId,
      platform: 'instagram',
      platform_post_id: post.id,
      caption: post.caption,
      like_count: post.like_count,
      comment_count: post.comments_count
    })
  }
}
```

---

## Phase 6: AI Correlation Analysis (Week 10)

### 6.1 Cross-Platform Insights
Google AI analyzes correlation between social posts and Spotify streams:

```typescript
const prompt = `
  Analyze the correlation between social media activity and music streaming:
  
  Instagram Posts (last 30 days): ${instagramPosts.length}
  Average Instagram Engagement: ${avgEngagement}
  
  Spotify Streams (last 30 days): ${spotifyStreams}
  
  Timeline:
  - [Date]: Instagram Reel posted → +500 new followers → +2,000 Spotify streams next day
  - [Date]: Behind-the-scenes post → High engagement → +1,500 streams
  
  Generate insight about social media impact on streaming numbers.
`
```

---

## Technology Stack Summary

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite |
| **UI Design** | UK Government Design System + Material Icons |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Security** | Row-Level Security (RLS) |
| **API Integrations** | Spotify API, Google AI (Gemini), Instagram Graph API |
| **Background Jobs** | Supabase Edge Functions + Cron |
| **Deployment** | Vercel (Frontend) + Supabase (Backend) |
| **AI** | Google Gemini Pro |

---

## Estimated Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Database Migration | 1 week | New schema deployed |
| Phase 2: Spotify Integration | 2 weeks | OAuth flow + data syncing |
| Phase 3: Google AI Integration | 2 weeks | Insight generation working |
| Phase 4: Frontend Dashboard | 2 weeks | Insights display + animations |
| Phase 5: Social Media | 2 weeks | Instagram/Twitter integration |
| Phase 6: Advanced AI | 1 week | Cross-platform correlation |
| **Total** | **10 weeks** | Full production app |

---

## Next Immediate Steps

1. **This Week:**
   - [ ] Review `COMPLETE_SCHEMA_SPOTIFY_AI_SOCIAL.sql`
   - [ ] Decide: full migration or incremental?
   - [ ] Backup current database
   - [ ] Run new schema in Supabase

2. **Next Week:**
   - [ ] Create Spotify Developer account
   - [ ] Get Spotify API credentials
   - [ ] Build OAuth connection flow
   - [ ] Test with your personal Spotify account

3. **Week 3:**
   - [ ] Fetch first batch of listening data
   - [ ] Store in `user_feeds` table
   - [ ] Verify data structure

Would you like me to start implementing any specific phase right now?
