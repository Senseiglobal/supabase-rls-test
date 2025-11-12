# 🚀 AURA MANAGER UPGRADE - COMPLETE IMPLEMENTATION PLAN

## 📋 PROJECT OVERVIEW

**Project:** Aura Manager - AI-Powered Artist Management Platform
**Environment:** Vercel (Frontend + API), Supabase (Auth, Database, Realtime)
**Goal:** Add smart automation, AI personalization, and collaboration tools

---

## 🎯 IMPLEMENTATION PHASES

### PHASE 1: Foundation & Infrastructure

#### 1.1 Feature Flag System
**File:** `src/lib/featureFlags.ts`

```typescript
// Feature flags for gradual rollout
export interface FeatureFlags {
  smartInbox: boolean;
  aiReply: boolean;
  taskScheduler: boolean;
  messageCleanup: boolean;
  aiCustomization: boolean;
  whatsappIntegration: boolean;
  teamCollaboration: boolean;
  guidedOnboarding: boolean;
  personalizedDashboard: boolean;
}

export const defaultFeatureFlags: FeatureFlags = {
  smartInbox: false,
  aiReply: false,
  taskScheduler: false,
  messageCleanup: false,
  aiCustomization: false,
  whatsappIntegration: false,
  teamCollaboration: false,
  guidedOnboarding: true, // Always on for new users
  personalizedDashboard: false,
};

// Feature flag context
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const FeatureFlagContext = createContext<FeatureFlags>(defaultFeatureFlags);

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFeatureFlags);

  useEffect(() => {
    async function loadFeatureFlags() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_feature_flags')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setFlags(data.flags);
      }
    }
    loadFeatureFlags();
  }, []);

  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export const useFeatureFlags = () => useContext(FeatureFlagContext);
```


#### 1.2 Database Schema Updates
**File:** `supabase/migrations/001_aura_manager_upgrade.sql`

```sql
-- User Feature Flags Table
CREATE TABLE IF NOT EXISTS user_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User Permissions Table
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  inbox_access BOOLEAN DEFAULT false,
  ai_compose BOOLEAN DEFAULT false,
  calendar_sync BOOLEAN DEFAULT false,
  whatsapp_integration BOOLEAN DEFAULT false,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User Profile Extension
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS archetype VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type VARCHAR(50); -- 'musician' or 'vendor'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_personality JSONB DEFAULT '{"tone":"professional","humor":50,"speed":50}'::jsonb;

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending',
  google_calendar_event_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Feedback Table
CREATE TABLE IF NOT EXISTS ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature VARCHAR(50) NOT NULL,
  feedback_type VARCHAR(20), -- 'positive' or 'negative'
  message_context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  member_email VARCHAR(255) NOT NULL,
  member_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role VARCHAR(20) NOT NULL, -- 'owner', 'editor', 'viewer'
  invite_token VARCHAR(255) UNIQUE,
  invite_accepted BOOLEAN DEFAULT false,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inbox Highlights Table
CREATE TABLE IF NOT EXISTS inbox_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT,
  sender VARCHAR(255),
  summary TEXT,
  booking_related BOOLEAN DEFAULT false,
  received_at TIMESTAMPTZ,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_highlights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own feature flags" ON user_feature_flags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own permissions" ON user_permissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can log own feedback" ON ai_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view team members they invited" ON team_members FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = member_id);
CREATE POLICY "Users can view own inbox highlights" ON inbox_highlights FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_team_members_owner ON team_members(owner_id);
CREATE INDEX idx_inbox_highlights_user_id ON inbox_highlights(user_id);
```

---

### PHASE 2: Core Features Implementation

#### 2.1 Smart Inbox Assistant
**Files to create:**
- `src/services/inboxReader.ts`
- `src/components/InboxHighlights.tsx`
- `api/inbox/summary.ts`

**Implementation:**

**File: `src/services/inboxReader.ts`**
```typescript
import { supabase } from '@/integrations/supabase/client';

interface EmailSummary {
  subject: string;
  sender: string;
  summary: string;
  bookingRelated: boolean;
  receivedAt: string;
}

export class InboxReaderService {
  private static async hasInboxPermission(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('user_permissions')
      .select('inbox_access')
      .eq('user_id', user.id)
      .single();

    return data?.inbox_access || false;
  }

  static async fetchEmailSummaries(): Promise<EmailSummary[]> {
    const hasPermission = await this.hasInboxPermission();
    if (!hasPermission) {
      throw new Error('Inbox access not granted');
    }

    // Call backend API
    const response = await fetch('/api/inbox/summary', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) throw new Error('Failed to fetch email summaries');
    return response.json();
  }

  static async saveHighlights(summaries: EmailSummary[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const highlights = summaries.map(s => ({
      user_id: user.id,
      subject: s.subject,
      sender: s.sender,
      summary: s.summary,
      booking_related: s.bookingRelated,
      received_at: s.receivedAt,
    }));

    await supabase.from('inbox_highlights').insert(highlights);
  }
}
```

**File: `api/inbox/summary.ts`** (Vercel Serverless Function)
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

// Gmail OAuth integration
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from Supabase session
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      req.headers.authorization?.replace('Bearer ', '') || ''
    );

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check inbox permission
    const { data: permissions } = await supabase
      .from('user_permissions')
      .select('inbox_access')
      .eq('user_id', user.id)
      .single();

    if (!permissions?.inbox_access) {
      return res.status(403).json({ error: 'Inbox access not granted' });
    }

    // TODO: Implement Gmail OAuth flow
    // For now, return mock data
    const mockSummaries = [
      {
        subject: 'Booking Request - Jazz Festival 2025',
        sender: 'events@jazzfest.com',
        summary: 'Performance request for June 15-17, payment $5000',
        bookingRelated: true,
        receivedAt: new Date().toISOString(),
      },
    ];

    res.status(200).json(mockSummaries);
  } catch (error) {
    console.error('Inbox summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

**File: `src/components/InboxHighlights.tsx`**
```typescript
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Calendar, DollarSign } from 'lucide-react';
import { InboxReaderService } from '@/services/inboxReader';
import { useFeatureFlags } from '@/lib/featureFlags';

export function InboxHighlights() {
  const { smartInbox } = useFeatureFlags();

  const { data: highlights, isLoading } = useQuery({
    queryKey: ['inbox-highlights'],
    queryFn: () => InboxReaderService.fetchEmailSummaries(),
    enabled: smartInbox,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  if (!smartInbox || isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Inbox Highlights
        </CardTitle>
        <CardDescription>Latest booking-related emails</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {highlights?.map((email, idx) => (
            <div key={idx} className="border-b pb-3 last:border-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{email.subject}</p>
                  <p className="text-sm text-muted-foreground">{email.sender}</p>
                  <p className="text-sm mt-1">{email.summary}</p>
                </div>
                {email.bookingRelated && (
                  <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                    Booking
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 2.2 AI Reply Composer
**File: `api/ai/reply.ts`**
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { context, tone = 'professional' } = req.body;

    // Authenticate user
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser(
      req.headers.authorization?.replace('Bearer ', '') || ''
    );

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's AI personality settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('ai_personality')
      .eq('id', user.id)
      .single();

    const personality = profile?.ai_personality || { tone: 'professional' };

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const toneInstructions = {
      professional: 'formal, business-like tone',
      friendly: 'warm and approachable tone',
      casual: 'relaxed and conversational tone',
      negotiator: 'assertive yet diplomatic tone',
    };

    const prompt = `You are an AI assistant helping an artist respond to messages. 
Context: ${context}
Tone: ${toneInstructions[tone as keyof typeof toneInstructions]}
Write a brief, effective reply (max 150 words):`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.status(200).json({ reply });
  } catch (error) {
    console.error('AI reply error:', error);
    res.status(500).json({ error: 'Failed to generate reply' });
  }
}
```

**File: `src/components/AIReplyComposer.tsx`**
```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Tone = 'professional' | 'friendly' | 'casual' | 'negotiator';

export function AIReplyComposer({ context }: { context?: string }) {
  const [tone, setTone] = useState<Tone>('professional');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReply = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/ai/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ context, tone }),
      });

      const { reply } = await response.json();
      setGeneratedReply(reply);
      toast.success('Reply generated!');
    } catch (error) {
      toast.error('Failed to generate reply');
    } finally {
      setIsGenerating(false);
    }
  };

  const logFeedback = async (isPositive: boolean) => {
    await supabase.from('ai_feedback').insert({
      feature: 'ai_reply',
      feedback_type: isPositive ? 'positive' : 'negative',
      message_context: context,
    });
    toast.success('Thanks for your feedback!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI Reply Composer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Tone</label>
          <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="negotiator">Negotiator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={generateReply} disabled={isGenerating}>
          Generate Reply
        </Button>

        {generatedReply && (
          <div className="space-y-2">
            <Textarea value={generatedReply} readOnly rows={6} />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(generatedReply)}>
                <Copy className="h-4 w-4 mr-1" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={() => logFeedback(true)}>
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => logFeedback(false)}>
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### PHASE 3: Additional Features

#### 3.1 Team Collaboration
**File: `src/pages/Team.tsx`** - Full implementation in repo
**File: `api/team/invite.ts`** - Tokenized invite generation

#### 3.2 Guided Onboarding
**File: `src/pages/Onboarding.tsx`** - Already exists, enhance with archetype questions

#### 3.3 Privacy & GDPR Consent
**File: `src/components/GDPRConsent.tsx`**
**File: `src/pages/SettingsPrivacy.tsx`**

---

## 🛠️ ENVIRONMENT VARIABLES

Add to `.env` file:

```bash
# Existing
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key

# New - AI Services
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key # Alternative

# OAuth Integrations
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

---

## 📄 FILE STRUCTURE

```
Aura Manager/
├── api/
│   ├── ai/
│   │   ├── reply.ts
│   │   └── customize.ts
│   ├── inbox/
│   │   └── summary.ts
│   ├── team/
│   │   ├── invite.ts
│   │   └── accept.ts
│   └── cleanup/
│       └── messages.ts
├── src/
│   ├── components/
│   │   ├── InboxHighlights.tsx
│   │   ├── AIReplyComposer.tsx
│   │   ├── TaskScheduler.tsx
│   │   ├── GDPRConsent.tsx
│   │   └── PersonalizedGreeting.tsx
│   ├── services/
│   │   ├── inboxReader.ts
│   │   ├── whatsappIntegration.ts
│   │   └── permissionsService.ts (exists)
│   ├── pages/
│   │   ├── Team.tsx
│   │   ├── AIManager.tsx
│   │   └── SettingsPrivacy.tsx
│   └── lib/
│       ├── featureFlags.ts
│       └── utils.ts
└── supabase/
    └── migrations/
        └── 001_aura_manager_upgrade.sql
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Run database migrations in Supabase
- [ ] Add environment variables to Vercel
- [ ] Test feature flags system
- [ ] Review RLS policies
- [ ] Configure OAuth consent screens

### Staging Deployment
1. Create staging branch: `git checkout -b staging/aura-upgrade`
2. Push to GitHub: `git push origin staging/aura-upgrade`
3. Vercel auto-deploys to preview URL
4. Test all features with staging Supabase instance
5. Verify GDPR consent flows
6. Test all API endpoints

### Production Deployment
1. Merge to main: `git checkout main && git merge staging/aura-upgrade`
2. Tag release: `git tag -a v2.0.0 -m "Aura Manager Upgrade"`
3. Push: `git push origin main --tags`
4. Vercel auto-deploys to production
5. Enable feature flags gradually:
   - Day 1: `guidedOnboarding` = true
   - Day 3: `aiReply` = true
   - Week 2: Enable remaining features

---

## 📝 IMPLEMENTATION ORDER

### Week 1: Foundation
1. ✅ Create database schema
2. ✅ Implement feature flags
3. ✅ Setup environment variables
4. ✅ Deploy database migrations

### Week 2: Core AI Features
1. ✅ Smart Inbox Assistant
2. ✅ AI Reply Composer
3. ✅ AI Customization Hub

### Week 3: Productivity Features
1. ✅ Task Scheduler
2. ✅ Calendar integration
3. ✅ Message Cleanup service

### Week 4: Collaboration & UX
1. ✅ Team Collaboration module
2. ✅ Guided Onboarding flow
3. ✅ Personalized Dashboard
4. ✅ GDPR consent system

### Week 5: Optional & Polish
1. ✅ WhatsApp integration
2. ✅ Mobile navigation updates
3. ✅ Testing & bug fixes
4. ✅ Performance optimization

---

## 🔒 SECURITY CONSIDERATIONS

1. **OAuth Scopes**: Request minimal scopes
   - Gmail: `gmail.readonly` only
   - Calendar: `calendar.events` only

2. **Data Encryption**: All sensitive data encrypted at rest

3. **Rate Limiting**: Implement rate limits on AI endpoints
   ```typescript
   // api/ai/reply.ts
   const rateLimit = 20; // per hour per user
   ```

4. **Token Management**: Refresh tokens stored securely in Supabase

5. **RLS Policies**: All new tables have RLS enabled

6. **API Key Rotation**: Rotate API keys quarterly

---

## 📊 MONITORING & ANALYTICS

### Key Metrics to Track
- Feature adoption rates
- AI feedback (thumbs up/down)
- API response times
- Error rates by feature
- User onboarding completion

### Vercel Analytics
- Enable Web Analytics
- Track custom events:
  - `ai_reply_generated`
  - `inbox_highlights_viewed`
  - `team_invite_sent`

---

## 👥 USER DOCUMENTATION

Create help docs at `/help`:
- How to enable inbox access
- Using AI reply composer
- Team collaboration guide
- Privacy settings explained

---

## ✅ TESTING STRATEGY

### Unit Tests
```typescript
// tests/services/inboxReader.test.ts
import { InboxReaderService } from '@/services/inboxReader';

describe('InboxReaderService', () => {
  it('should check permissions before fetching', async () => {
    // Test implementation
  });
});
```

### Integration Tests
- Test OAuth flows end-to-end
- Verify RLS policies
- Test AI API integrations

### E2E Tests (Playwright)
- Onboarding flow
- Feature flag toggling
- Team invitation workflow

---

## 📞 SUPPORT & MAINTENANCE

### Ongoing Tasks
- Monitor AI costs (Gemini API usage)
- Review user feedback weekly
- Update AI prompts based on feedback
- Quarterly security audits

### Known Limitations
- Gmail OAuth requires Google Cloud project verification
- Gemini API rate limits: 60 RPM
- WhatsApp Business API requires Meta approval

---

## 🎓 ROLLBACK PLAN

If issues arise:

1. **Feature Level**: Disable via feature flags
   ```sql
   UPDATE user_feature_flags 
   SET flags = jsonb_set(flags, '{smartInbox}', 'false');
   ```

2. **Database Level**: Rollback migration
   ```bash
   psql $DATABASE_URL -f supabase/rollback/001_undo.sql
   ```

3. **Deployment Level**: Revert in Vercel
   - Go to Deployments
   - Find previous stable version
   - Click "Promote to Production"

---

## 💬 COMMUNICATION PLAN

### User Announcements
1. In-app banner: "New AI features available!"
2. Email to existing users
3. Blog post on website
4. Social media updates

### Changelog
Maintain `CHANGELOG.md`:

```markdown
## [2.0.0] - 2025-11-15

### Added
- Smart Inbox Assistant for booking emails
- AI Reply Composer with 4 tone options
- Team Collaboration module
- Guided Onboarding with archetype selection
- Privacy controls & GDPR consent
- Task Scheduler with calendar sync

### Enhanced
- Dashboard with personalized greeting
- AI personality customization

### Security
- Enhanced RLS policies
- OAuth token encryption
```

---

## 🎉 SUCCESS CRITERIA

### Launch Goals (30 days)
- ✅ 90% of new users complete onboarding
- ✅ 50% enable at least one AI feature
- ✅ 75% positive AI feedback rating
- ✅ < 2% error rate on API calls
- ✅ Zero security incidents

### Growth Metrics (90 days)
- 5,000 AI replies generated
- 1,000 inbox highlights viewed
- 500 team collaborations created
- 80% feature retention rate

---

## 📝 NEXT STEPS

1. **Review this plan** with the team
2. **Set up Supabase migrations**
3. **Create feature branches** for each module
4. **Start with Phase 1** (Foundation)
5. **Deploy to staging** weekly
6. **Gather feedback** from beta users
7. **Iterate and improve**

---

**Last Updated:** November 12, 2025
**Version:** 1.0
**Author:** AI Development Team
