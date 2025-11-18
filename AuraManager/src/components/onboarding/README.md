# AURA Onboarding Flow

A beautiful 3-screen onboarding experience for the AURA Music Manager app.

## 📁 Files

- **OnboardingFlow.tsx** - Main component with all 3 screens
- **OnboardingFlow.css** - Complete styling matching AURA theme

## 🎯 Features

### Screen 1: Welcome (5 seconds)
- Eye-catching hero message
- Animated dashboard preview with fake stats
- Pulsing stat cards showing:
  - Monthly streams (12.5K, +24.5%)
  - Active fans (3,450, +180 new)
  - Engagement rate (8.4%, +2.5%)

### Screen 2: Connect Data Sources (15 seconds)
- **Biolinks Card** - Linktree, Beacons, Tap.bio integration
- **Music & Social Card** - Spotify, Instagram, TikTok tracking
- Hover effects on connection cards
- Skip option for later setup

### Screen 3: AI Personalization (10 seconds)
- Name input (optional)
- Primary goal selection (5 radio options + custom)
- Career stage dropdown
- Genre text input
- Two preference toggles:
  - Remember preferences
  - Use conversation history

## 💻 Installation

### Quick Start

```bash
# Pull the feature branch
git checkout feature/onboarding-flow
git pull origin feature/onboarding-flow
```

### Usage in Your App

```tsx
import OnboardingFlow from './components/onboarding/OnboardingFlow';

function App() {
  const handleComplete = (data) => {
    console.log('Onboarding data:', data);
    // Save to database and redirect
  };

  return <OnboardingFlow onComplete={handleComplete} />;
}
```

## 🔗 Integration with Supabase

### 1. Create User Preferences Table

```sql
create table user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null unique,
  name text,
  goal text,
  career_stage text,
  genre text,
  remember_prefs boolean default false,
  use_history boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table user_preferences enable row level security;

-- Policy: Users can only see/update their own preferences
create policy "Users can manage own preferences"
  on user_preferences
  for all
  using (auth.uid() = user_id);
```

### 2. Save Onboarding Data

```tsx
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import OnboardingFlow from './components/onboarding/OnboardingFlow';

export default function OnboardingPage() {
  const navigate = useNavigate();

  const handleOnboardingComplete = async (data) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      // Save preferences
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          name: data.name,
          goal: data.goal,
          career_stage: data.careerStage,
          genre: data.genre,
          remember_prefs: data.rememberPrefs || false,
          use_history: data.useHistory || false,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Mark onboarding as complete
      await supabase.auth.updateUser({
        data: { onboarding_completed: true }
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  return <OnboardingFlow onComplete={handleOnboardingComplete} />;
}
```

## 🛣️ Routing Setup

Add to your router configuration:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OnboardingPage from './pages/OnboardingPage';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        {/* Other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

## 🔄 Redirect New Users

Automatically send new users to onboarding after signup:

```tsx
// In your Auth.tsx or signup handler
const handleSignup = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (!error && data.user) {
    // Redirect to onboarding
    navigate('/onboarding');
  }
};
```

## 🎨 Design System

### Colors
- **Background Gradient**: `hsl(39 75% 68%)` → `hsl(28 100% 56%)`
- **Card Background**: `hsl(0 0% 0%)` (Deep Black)
- **Accent Color**: `hsl(28 100% 56%)` (AURA Orange)
- **Text Primary**: `hsl(0 0% 96%)`
- **Text Secondary**: `hsl(0 0% 70%)`

### Animations
- **Fade In**: 0.5s ease-out on screen transitions
- **Pulse**: 2s infinite on stat cards
- **Hover Effects**: Transform and shadow on cards

## 📊 Data Structure

The `onComplete` callback receives:

```typescript
interface OnboardingData {
  name?: string;              // User's preferred name
  goal?: string;              // Primary goal
  careerStage?: string;       // Career stage
  genre?: string;             // Primary genre
  rememberPrefs?: boolean;    // Save preferences
  useHistory?: boolean;       // Use conversation history
}
```

## 🧪 Testing

### Local Testing

```bash
# Start your dev server
npm run dev

# Navigate to:
http://localhost:5173/onboarding
```

### Test Scenarios

1. ✅ Complete full flow with all fields
2. ✅ Skip screens 2 and 3
3. ✅ Fill only required fields
4. ✅ Select "Something else" goal
5. ✅ Test on mobile viewport
6. ✅ Test all hover states

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

All screens adapt beautifully to any screen size.

## 🚀 Deployment

### To Production

```bash
# Merge to main
git checkout main
git merge feature/onboarding-flow
git push origin main

# Vercel will auto-deploy
```

### Environment Variables

No additional environment variables needed. Uses your existing Supabase config.

## 🎯 Next Steps

1. **Test the flow** - Navigate to `/onboarding` in your app
2. **Customize screens** - Adjust text, colors, or fields as needed
3. **Add analytics** - Track completion rates
4. **A/B test** - Try different copy or screen orders
5. **Connect biolinks** - Implement actual API integrations

## 💡 Tips

- **Keep it fast**: Don't add too many required fields
- **Show value early**: The welcome screen sells the vision
- **Allow skipping**: Users can always complete later
- **Save progress**: Consider saving partial completions
- **Mobile-first**: Most users will see this on mobile

## 🐛 Troubleshooting

### Styles not loading?
Ensure `OnboardingFlow.css` is imported in your component.

### TypeScript errors?
Make sure you have `@types/react` and `@types/react-router-dom` installed.

### Animations janky?
Check for conflicting CSS or reduce `animation-duration`.

### Can't navigate?
Verify react-router-dom is installed: `npm install react-router-dom`

## 📝 License

Part of the AURA Music Manager application.

## 🙋 Support

Questions? Check the main README or create an issue.

---

**Built with** ❤️ **for AURA Music Manager**
