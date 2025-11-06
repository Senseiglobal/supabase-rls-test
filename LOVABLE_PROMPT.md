# Lovable.dev Prompt for AI Artist Manager App

## Copy this entire prompt into Lovable to auto-generate your app

---

**App Name:** AI Artist Manager

**App Description:**  
Build a complete AI-powered artist management platform for solo musicians and creators. The app provides data-driven creative direction, release strategy, audience insights, and 24/7 AI manager chat - solving trust and affordability issues with traditional human managers.

**IMPORTANT: Backend Setup**
I already have a Supabase backend fully configured with tables, RLS policies, and data. Just generate the frontend UI and components. I will connect it to my existing Supabase project after export.

---

## Core Features Required

### 1. **User Authentication & Onboarding**
- Email/password authentication via Supabase Auth
- OAuth integration ready for Spotify and Google
- Onboarding flow:
  - Step 1: Create account
  - Step 2: Set up artist profile (name, genre, goals)
  - Step 3: Connect Spotify for Artists
  - Step 4: Choose AI manager personality (Professional, Friendly, Direct, Motivational)
- User profile page with settings for AI preferences

### 2. **Main Dashboard (Home)**
Layout: Responsive grid with cards showing:

**Top Section - Quick Stats:**
- Total monthly listeners (from Spotify)
- Total social followers (Instagram + TikTok + YouTube)
- Active goals progress (show 1-3 active goals with progress bars)
- Unread AI insights count

**Middle Section - AI Insights Feed:**
- Card-based layout showing AI-generated advice
- Each card displays:
  - Icon/emoji based on advice_type
  - Title
  - Summary (expandable to full description)
  - Priority badge (low/medium/high/urgent)
  - Category badge (advice/warning/opportunity/achievement)
  - Timestamp
  - "Mark as Read" button
- Filter by: All / Unread / Priority / Category
- Infinite scroll or pagination

**Bottom Section - Recent Activity:**
- Latest song performance updates
- Social media highlights
- Goal milestones

### 3. **AI Manager Chat Interface**
Full-screen chat similar to ChatGPT/Claude:

**Left Sidebar (Desktop) / Hamburger Menu (Mobile):**
- New conversation button
- Conversation history (grouped by date)
- Quick actions:
  - "Analyze my latest release"
  - "Review my strategy"
  - "Set a new goal"
  - "Ask a question"

**Main Chat Area:**
- Message thread with user messages (right-aligned, blue)
- AI manager responses (left-aligned, gray with avatar)
- Input box at bottom with:
  - Text area for typing
  - File upload for sharing song links/screenshots
  - Send button
  - Voice input (optional)
- Context awareness: Show which song/artist the conversation is about
- Typing indicator when AI is responding
- Markdown support in AI responses

**AI Personality Selector (Top Right):**
- Dropdown to switch between personality types:
  - 🎩 Professional
  - 😊 Friendly  
  - 🎯 Direct
  - 💪 Motivational

### 4. **Music Catalog (Songs & Artists)**

**Artists Tab:**
- If user is solo: Show their single artist profile
- If user has multiple projects: Grid of artist cards
- Each artist card shows:
  - Artist name
  - Avatar/photo
  - Spotify followers
  - Monthly listeners
  - Top genre
  - Social media handles (clickable icons)
  - "View Details" button

**Artist Detail Page:**
- Header: Artist photo, name, Spotify badge, social icons
- Stats section: Followers, listeners, popularity score
- Songs list (table view):
  - Columns: Title, Release Date, Streams, Saves, Popularity, Actions
  - Sort by: Date, Streams, Popularity
  - Filter by: Year, All/Singles/Album tracks
- Performance chart: Streams over time (last 30/60/90 days)
- AI insights specific to this artist

**Songs Tab:**
- Table view of all songs across all artists
- Columns: Title, Artist, Release Date, Streams, Saves, Skip Rate, Popularity, Audio Features
- Click row to expand: Show audio features graph (energy, danceability, valence, etc.)
- Bulk actions: Compare songs, Request AI analysis
- Add song manually (for unreleased tracks)

### 5. **Goals & Progress Tracker**

**Goals Dashboard:**
- Hero section: "Your Active Goals" with progress summary
- Goal cards (grid layout):
  - Goal title and description
  - Progress bar with percentage
  - Current value / Target value
  - Days remaining until deadline
  - Status badge (On Track / Behind / Ahead / Completed)
  - AI-suggested action items (expandable list)
  - "Update Progress" button
  - "Ask AI for Help" button

**Create New Goal Flow:**
- Goal type selector: Streams, Followers, Releases, Playlists, Custom
- Input target value and deadline
- AI suggests realistic targets based on current trajectory
- Option to accept AI action plan

**Goal Detail Page:**
- Full timeline view with milestones
- Progress chart
- AI recommendations history for this goal
- Activity log (manual updates, auto-synced data)
- Related insights

### 6. **Social Media Hub**

**Overview Tab:**
- Connected accounts status (Instagram, TikTok, Twitter/X, YouTube)
- Total followers across all platforms
- Engagement rate comparison
- Platform performance cards

**Platform-Specific Tabs:**
Each platform shows:
- Recent posts grid (images/videos)
- Post performance metrics (likes, comments, shares, views)
- Best performing content
- AI insights: "Your Reels drive 3x more Spotify clicks than photos"

**Connect Platform Flow:**
- OAuth connection for each platform
- Guide user through API access setup
- Manual handle entry as fallback

### 7. **Insights Library (Archive)**

**All Insights View:**
- Searchable and filterable list
- Categories:
  - Creative Direction
  - Marketing Strategy
  - Release Timing
  - Audience Growth
  - Content Ideas
  - Collaboration Suggestions
  - Performance Feedback
  - Goal Tracking
- Sort by: Date, Priority, Read/Unread
- Bulk actions: Archive, Delete, Export
- Save favorites

**Insight Detail Page:**
- Full advice with all context
- Data sources used
- Confidence score
- Action items checklist
- User feedback textarea ("This helped!" or ask follow-up)
- Related insights
- Share insight (export as image/PDF)

### 8. **Analytics & Reports**

**Performance Dashboard:**
- Time range selector: 7 days, 30 days, 90 days, 1 year, All time
- Key metrics cards: Total streams, listener growth %, top song, top country
- Charts:
  - Streams over time (line chart)
  - Geographic distribution (map or bar chart)
  - Genre performance (pie chart)
  - Platform comparison (Spotify vs social media correlation)
- Export report as PDF

**Audience Insights:**
- Demographics: Age, gender, location
- Listening habits: Peak times, device types, playlist adds
- Engagement funnel: Discovery → Play → Save → Follow
- Retention analysis: New vs returning listeners

---

## Technical Integrations

### **Supabase Backend** (Primary Database)

**Tables to connect:**
- `profiles` - User authentication and preferences
- `artists` - Artist profiles with Spotify IDs
- `songs` - Track catalog with audio features
- `insights` - AI-generated advice (use as `user_insights`)
- `manager_conversations` - Chat history
- `goals_tracker` - Goal tracking
- `social_media_handles` - Connected social accounts
- `social_media_posts` - Cached posts data

**Auth:**
- Use Supabase Auth for login/signup
- OAuth providers: Spotify, Google
- Session management

**Real-time:**
- Subscribe to new insights (show notification badge)
- Real-time chat updates
- Live goal progress updates

### **Spotify API Integration**

**OAuth Flow:**
- "Connect Spotify" button triggers OAuth
- Scopes needed:
  - `user-read-email`
  - `user-read-private`
  - `user-top-read`
  - `user-read-recently-played`

**Data to Fetch:**
- Artist profile: followers, popularity, genres
- Top tracks: streams, saves, playlist adds
- Audio features: energy, danceability, valence, tempo
- Recently played history

**Display:**
- Show Spotify data in artist/song cards
- Sync button to refresh data
- Last synced timestamp

### **Google AI (Gemini) Integration**

**Use Cases:**
1. **Generate Insights:** Analyze song performance → create advice in `insights` table
2. **Chat Interface:** Real-time conversational responses
3. **Goal Suggestions:** Recommend realistic targets based on data
4. **Content Ideas:** Suggest social media posts, song titles, marketing copy

**API Calls:**
- Background: Daily cron job to generate insights
- Real-time: Chat messages
- On-demand: "Ask AI" buttons throughout app

**Prompt Engineering:**
- Include user's personality preference
- Provide context: current stats, goals, recent activity
- Request structured JSON responses for parsing

### **Social Media APIs (Optional for MVP)**

**Instagram Graph API:**
- Fetch posts, reels, stories (24h)
- Metrics: likes, comments, reach, saves
- Profile stats: followers, posts count

**TikTok API:**
- Video metrics: views, likes, shares, comments
- Profile stats

**YouTube Data API:**
- Video views, subscribers, watch time
- Channel analytics

**Twitter API:**
- Tweet engagement
- Follower count

**Fallback:** Manual entry of handles + public scraping

---

## Design System

### **Color Palette:**
- Primary: `#1d70b8` (UK GDS blue) - for buttons, links
- Success: `#00703c` (green) - for positive metrics, achievements
- Warning: `#f47738` (orange) - for warnings, medium priority
- Danger: `#d4351c` (red) - for urgent items, errors
- Background: `#f3f2f1` (light gray)
- Cards: `#ffffff` (white) with subtle shadow
- Text: `#0b0c0c` (almost black) for primary, `#505a5f` for secondary

### **Typography:**
- Headings: Bold, sans-serif (Inter or similar)
- Body: Regular, readable (16px minimum)
- Monospace: For stats/numbers

### **UI Components:**
- Buttons: Rounded corners (8px), hover lift effect
- Cards: 12px border radius, subtle shadow, hover scale(1.02)
- Inputs: 8px border radius, focus ring
- Badges: Small pills with category colors
- Progress bars: Animated, gradient fill
- Charts: Clean, minimal, use brand colors

### **Layout:**
- Responsive grid: Mobile-first approach
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Sidebar navigation on desktop, bottom nav on mobile
- Max content width: 1440px, centered

### **Animations:**
- Page transitions: Fade + slide
- Card hover: Slight lift (translateY(-4px))
- Button press: Scale down (0.98)
- Loading states: Skeleton screens
- Toast notifications: Slide in from top-right

---

## User Flows

### **New User Onboarding:**
1. Sign up (email/password or Google OAuth)
2. "Welcome! Let's set up your AI artist manager"
3. Enter artist name, genre, location
4. "What are your main goals?" (checkboxes: Grow fanbase, Release music, Get playlisted, etc.)
5. "Connect your Spotify" → OAuth flow
6. "Choose your AI manager style" → Personality selector with preview
7. "You're all set! Generating your first insights..." → Loading animation
8. Redirect to dashboard with welcome tour (optional tooltips)

### **Daily User Flow:**
1. Login → Dashboard
2. Check unread insights → Read 2-3 new advice cards
3. Click "Ask AI Manager" → Chat interface opens
4. Ask: "Should I release my new single this week or next?"
5. AI responds with data-backed recommendation
6. User creates goal: "Reach 5K streams in first week"
7. AI generates action plan
8. User navigates to Songs tab → Reviews performance
9. Clicks "Update Progress" on active goal
10. Logout

### **Weekly Review Flow:**
1. Notification: "Your weekly report is ready"
2. User opens Analytics → 7-day performance
3. Views charts: Streams up 15%, followers up 8%
4. AI insight auto-generated: "Your Instagram Reels drove 40% of new listeners"
5. User clicks "Tell me more" → Chat opens with context
6. AI suggests: "Post 3 more Reels this week with [specific hooks]"
7. User saves action items to goal tracker

---

## Pages & Routes

### **Public Routes (No Auth Required):**
- `/` - Landing page (marketing copy, features, pricing)
- `/login` - Sign in form
- `/signup` - Sign up form
- `/forgot-password` - Password reset

### **Protected Routes (Auth Required):**
- `/dashboard` - Main dashboard (default after login)
- `/chat` - AI manager chat interface
- `/artists` - Artist catalog
- `/artists/:id` - Artist detail page
- `/songs` - Song catalog
- `/songs/:id` - Song detail page
- `/goals` - Goals tracker
- `/goals/:id` - Goal detail
- `/insights` - Insights library
- `/insights/:id` - Insight detail
- `/analytics` - Performance reports
- `/social` - Social media hub
- `/settings` - User settings and preferences
- `/settings/profile` - Edit profile
- `/settings/integrations` - Manage connected accounts
- `/settings/ai-preferences` - AI manager personality and settings

### **Special Routes:**
- `/onboarding` - New user setup wizard
- `/auth/callback/spotify` - Spotify OAuth redirect
- `/auth/callback/google` - Google OAuth redirect

---

## Mobile Considerations

### **Navigation:**
- Bottom tab bar with icons:
  - 🏠 Dashboard
  - 💬 AI Chat
  - 🎵 Music
  - 🎯 Goals
  - 📊 Analytics

### **Mobile-Specific Features:**
- Swipe actions on insight cards (mark read, archive, delete)
- Pull-to-refresh on feeds
- Floating action button for "Ask AI"
- Share sheet integration for exporting reports
- Push notifications for new insights and goal milestones

### **Responsive Adjustments:**
- Stack cards vertically on mobile
- Hide sidebar, show hamburger menu
- Simplify charts (fewer data points on small screens)
- Collapsible sections
- Touch-friendly buttons (min 44px height)

---

## Additional Features (Nice-to-Have)

### **Collaboration:**
- Invite band members or team (shared access)
- Role-based permissions (admin, viewer)
- Activity feed showing who did what

### **Notifications:**
- Email digests (weekly reports)
- Push notifications for:
  - New AI insights
  - Goal milestones
  - Significant performance changes
- In-app notification center

### **Gamification:**
- Achievement badges (unlocked by hitting milestones)
- Streak tracking (consistent posting, goal progress)
- Leaderboard (optional, compare with similar artists anonymously)

### **Export & Sharing:**
- Export reports as PDF
- Generate shareable insight cards (Instagram-ready images)
- Public artist profile page (optional opt-in)

### **AI Features:**
- Voice input for chat
- AI-generated social media captions
- A/B testing suggestions ("Try two different hooks")
- Predictive analytics ("If you maintain this pace, you'll hit 10K by March")

---

## Environment Variables to Configure in Vercel

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SPOTIFY_CLIENT_ID=your-spotify-client-id
VITE_SPOTIFY_CLIENT_SECRET=your-spotify-secret
VITE_GOOGLE_AI_API_KEY=your-gemini-api-key
VITE_INSTAGRAM_CLIENT_ID=your-instagram-id (optional)
VITE_TIKTOK_CLIENT_ID=your-tiktok-id (optional)
```

---

## Success Metrics to Track

- User sign-ups
- Spotify connection rate
- Daily active users
- Average insights read per user
- Chat messages sent
- Goals created and completed
- Session duration
- Feature adoption (which pages get most traffic)

---

## Final Notes for Lovable

**Tone & Voice:**
- Encouraging and supportive (this is a creative tool)
- Data-driven but not overwhelming
- Clear, actionable language
- Avoid industry jargon unless necessary

**Accessibility:**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader friendly
- Color contrast ratios
- Alt text for images

**Performance:**
- Lazy load images and charts
- Code splitting for routes
- Optimize bundle size
- Cache Spotify/social data
- Debounce AI requests

---

## Lovable-Specific Instructions

1. **Start with Dashboard as the main page** - this is the core experience
2. **Build mobile-first** - most musicians use phones
3. **Use shadcn/ui components** - consistent, accessible, customizable
4. **Implement dark mode toggle** - creative people love dark mode
5. **Add loading skeletons** - never show blank screens
6. **Use optimistic UI updates** - make it feel instant
7. **Add empty states** - guide users when no data exists
8. **Error boundaries** - graceful error handling
9. **Toast notifications** - for all user actions
10. **Progressive enhancement** - core features work without JS

---

**Ready to build! Paste this into Lovable and let the AI generate your app structure.**

After generation, you can:
1. Refine UI visually in Lovable's editor
2. Connect Supabase tables using Lovable's data connector
3. Hook up Google AI API calls
4. Test user flows
5. Deploy directly to Vercel from Lovable

**Estimated build time in Lovable:** 2-4 hours for full app structure + integrations

**Manual refinement needed:** 4-8 hours for polishing UX, adding custom logic, testing edge cases

**Total time to production:** 1-2 days instead of 4-6 weeks of manual coding!
