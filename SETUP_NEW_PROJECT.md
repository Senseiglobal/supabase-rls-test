# Step-by-Step Setup Guide: Fresh Supabase Project
## Music Insights App with Spotify + Google AI + Social Media

---

## Part 1: Create New Supabase Project (15 minutes)

### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. **Project Details:**
   - Name: `music-insights-app`
   - Database Password: (Generate strong password - save it!)
   - Region: Choose closest to your users
   - Pricing Plan: Free tier is fine to start

4. Wait ~2 minutes for project to provision

### 1.2 Get Project Credentials
1. Go to **Project Settings** > **API**
2. Copy and save:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (this is safe for frontend)
   - **service_role key**: `eyJhbGc...` (keep secret! server-only)

### 1.3 Update Environment Variables
Create `frontend/.env` (or update existing):
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...
VITE_SPOTIFY_CLIENT_ID=your-spotify-client-id
VITE_GOOGLE_AI_API_KEY=your-google-ai-key
```

**Important:** Add `.env` to `.gitignore` if not already there!

---

## Part 2: Run Database Schema (10 minutes)

### 2.1 Open SQL Editor
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**

### 2.2 Run Complete Schema
Copy the entire contents of `COMPLETE_SCHEMA_SPOTIFY_AI_SOCIAL.sql` and paste into the SQL Editor.

Click **RUN** (or press Ctrl+Enter)

### 2.3 Verify Tables Created
Go to **Table Editor** on the left sidebar. You should see:
- ✅ profiles
- ✅ artists
- ✅ songs
- ✅ user_feeds
- ✅ user_insights
- ✅ social_media_handles
- ✅ social_media_posts
- ✅ integration_logs
- ✅ user_playlists
- ✅ playlist_tracks

### 2.4 Check RLS Policies
Go to **Authentication** > **Policies**

Each table should have RLS enabled with appropriate policies:
- `profiles`: Users can view/update own profile
- `user_feeds`: Users can view/insert own feeds
- `user_insights`: Users can view/insert own insights
- `artists`: Public read, owners can update
- etc.

---

## Part 3: Configure Authentication (10 minutes)

### 3.1 Email Authentication
1. Go to **Authentication** > **Providers**
2. **Email** should be enabled by default
3. **Settings:**
   - Enable email confirmations: ✅ (recommended)
   - Email templates: Customize later if needed

### 3.2 Google OAuth (Optional for now)
1. Go to **Authentication** > **Providers** > **Google**
2. You'll need Google Cloud Console credentials
3. **Skip for now** - focus on email auth first
4. Can add later when ready

### 3.3 Spotify OAuth (Critical - Will Set Up Later)
Note: Spotify OAuth will be handled in your app via custom flow
We'll implement this in the next phase

---

## Part 4: Update Frontend Code (30 minutes)

### 4.1 Update Supabase Client
File: `frontend/src/supabaseClient.js`

**Replace entire file:**
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Helper to check if user has connected Spotify
export async function hasSpotifyConnected(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('spotify_connected_at')
    .eq('id', userId)
    .single()
  
  return data?.spotify_connected_at !== null
}

// Helper to get user's latest insights
export async function getUserInsights(userId, limit = 10) {
  const { data, error } = await supabase
    .from('user_insights')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('priority', { ascending: false })
    .order('generated_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}
```

### 4.2 Create New Dashboard Component
File: `frontend/src/components/Dashboard.jsx`

```javascript
import { useEffect, useState } from 'react'
import { supabase, hasSpotifyConnected, getUserInsights } from '../supabaseClient'
import toast from 'react-hot-toast'

export default function Dashboard({ session }) {
  const [spotifyConnected, setSpotifyConnected] = useState(false)
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkConnections()
    loadInsights()
  }, [])

  async function checkConnections() {
    try {
      const connected = await hasSpotifyConnected(session.user.id)
      setSpotifyConnected(connected)
    } catch (error) {
      console.error('Error checking Spotify connection:', error)
    }
  }

  async function loadInsights() {
    try {
      setLoading(true)
      const data = await getUserInsights(session.user.id)
      setInsights(data)
    } catch (error) {
      toast.error('Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  async function connectSpotify() {
    // TODO: Implement Spotify OAuth in Phase 2
    toast.error('Spotify integration coming soon!')
  }

  return (
    <div style={{ padding: '30px' }}>
      <h1 className="govuk-heading-xl">Your Music Insights Dashboard</h1>

      {/* Connection Status */}
      <div style={{ marginBottom: '30px', padding: '20px', background: '#f3f2f1', borderRadius: '8px' }}>
        <h2 className="govuk-heading-m">Connections</h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div>
            <strong>Spotify:</strong> {spotifyConnected ? '✅ Connected' : '❌ Not Connected'}
          </div>
          {!spotifyConnected && (
            <button onClick={connectSpotify} className="govuk-button" style={{ marginBottom: 0 }}>
              Connect Spotify
            </button>
          )}
        </div>
      </div>

      {/* Insights Section */}
      <div>
        <h2 className="govuk-heading-l">Your Insights</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="govuk-spinner"></div>
            <p style={{ marginTop: '10px' }}>Loading your insights...</p>
          </div>
        ) : insights.length > 0 ? (
          <div className="insights-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            {insights.map(insight => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: '#f8f8f8',
            borderRadius: '8px',
            border: '2px dashed #b1b4b6'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
            <h3 className="govuk-heading-m">No Insights Yet</h3>
            <p className="govuk-body">
              {spotifyConnected 
                ? 'We\'re analyzing your listening data. Check back soon!'
                : 'Connect your Spotify account to get personalized music insights!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function InsightCard({ insight }) {
  const [isExpanded, setIsExpanded] = useState(false)

  async function markAsViewed() {
    if (!insight.viewed) {
      await supabase
        .from('user_insights')
        .update({ viewed: true, viewed_at: new Date().toISOString() })
        .eq('id', insight.id)
    }
  }

  return (
    <div 
      className="insight-card"
      onClick={() => {
        setIsExpanded(!isExpanded)
        markAsViewed()
      }}
      style={{
        background: insight.card_color_scheme || 'linear-gradient(135deg, #1d70b8, #003078)',
        color: 'white',
        padding: '24px',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>
        {insight.icon_emoji || '🎵'}
      </div>
      
      <h3 style={{ 
        fontSize: '20px', 
        fontWeight: 'bold', 
        marginBottom: '8px',
        color: 'white' 
      }}>
        {insight.title}
      </h3>

      <p style={{ 
        fontSize: '14px', 
        lineHeight: '1.5',
        opacity: 0.95,
        marginBottom: '12px'
      }}>
        {isExpanded ? insight.description : insight.summary || insight.description}
      </p>

      {insight.confidence_score && (
        <div style={{ 
          fontSize: '11px', 
          opacity: 0.7,
          marginTop: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Confidence: {(insight.confidence_score * 100).toFixed(0)}%</span>
          <span>{new Date(insight.generated_at).toLocaleDateString()}</span>
        </div>
      )}

      {!insight.viewed && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: '#d4351c',
          color: 'white',
          fontSize: '10px',
          padding: '4px 8px',
          borderRadius: '12px',
          fontWeight: 'bold'
        }}>
          NEW
        </div>
      )}
    </div>
  )
}
```

### 4.3 Update App.jsx
File: `frontend/src/App.jsx`

**Add Dashboard import and tab:**
```javascript
import Dashboard from './components/Dashboard'

// Inside App component, add new tab:
const [activeTab, setActiveTab] = useState('dashboard') // Change default to 'dashboard'

// Add Dashboard tab button:
<button 
  onClick={() => setActiveTab('dashboard')}
  className={activeTab === 'dashboard' ? 'govuk-button' : 'govuk-button govuk-button--secondary'}
  style={{ marginRight: 10 }}
>
  Dashboard
</button>

// Add Dashboard component:
{activeTab === 'dashboard' && <Dashboard session={session} />}
```

---

## Part 5: Test the New Setup (15 minutes)

### 5.1 Start Development Server
```bash
cd frontend
npm run dev
```

### 5.2 Test Authentication
1. Go to `http://localhost:5173`
2. Sign up with a new email
3. Check email for confirmation (if enabled)
4. Sign in

### 5.3 Verify Database
1. Go to Supabase Dashboard > **Table Editor** > **profiles**
2. You should see your new user record
3. Check that `id` matches your auth user ID

### 5.4 Test Dashboard
1. Click "Dashboard" tab
2. Should show "No Insights Yet" message
3. "Connect Spotify" button should show (won't work yet - that's Phase 2)

---

## Part 6: Clean Up Old Code (Optional)

Since you're starting fresh, you can optionally:

### 6.1 Keep Old Components for Reference
```bash
# Create backup folder
mkdir frontend/src/components/_old

# Move old CRUD components
mv frontend/src/components/Artists.jsx frontend/src/components/_old/
mv frontend/src/components/Songs.jsx frontend/src/components/_old/
mv frontend/src/components/Insights.jsx frontend/src/components/_old/
```

### 6.2 Or Keep Them for Now
You can keep the old Artists/Songs/Insights components as tabs in the app for manual data entry while you build the Spotify integration. They won't interfere with the new schema since you're using a fresh database.

---

## Part 7: Deploy to Vercel (10 minutes)

### 7.1 Update Environment Variables in Vercel
1. Go to [vercel.com](https://vercel.com)
2. Select your project: `supabasetest-six`
3. Go to **Settings** > **Environment Variables**
4. Update:
   - `VITE_SUPABASE_URL` = your new project URL
   - `VITE_SUPABASE_ANON_KEY` = your new anon key

### 7.2 Trigger Deployment
```bash
git add -A
git commit -m "feat: migrate to new Supabase project with complete schema"
git push origin main
```

Vercel will auto-deploy with new environment variables.

---

## Part 8: Verify Production Deployment

### 8.1 Test Live App
1. Go to `https://supabasetest-six.vercel.app`
2. Sign up with a new account
3. Verify Dashboard loads
4. Check Supabase Dashboard to see new user in `profiles` table

---

## What You've Accomplished ✅

- ✅ New Supabase project with production-ready schema
- ✅ All tables for Spotify + Google AI + Social Media
- ✅ Simplified RLS policies (no complex joins)
- ✅ Dashboard component with insights display
- ✅ Connection status UI
- ✅ Beautiful insight cards with animations
- ✅ Deployed to production

---

## Next Steps (Phase 2: Spotify Integration)

**Ready when you are:**
1. Create Spotify Developer App
2. Implement OAuth flow
3. Fetch user's listening history
4. Store in `user_feeds` table
5. Trigger Google AI analysis
6. Display insights on Dashboard

**Estimated time:** 2-3 hours for basic Spotify connection working

---

## Questions to Consider

**Before proceeding to Phase 2:**
1. Do you want to keep the old Artists/Songs CRUD as a backup feature?
2. Should we focus on "listener" experience first, or "artist" analytics?
3. Do you have a Spotify Premium account for testing? (some APIs require Premium)

Let me know when you're ready to tackle Spotify OAuth! 🎵
