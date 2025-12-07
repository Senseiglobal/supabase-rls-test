# Repository Cleanup Plan

## Summary of Changes Made

### 1. Fixed Critical Configuration Bug
- **Issue**: AuraManager was using inconsistent environment variable names (`VITE_SUPABASE_PUBLISHABLE_KEY` vs standard `VITE_SUPABASE_ANON_KEY`)
- **Fix**: Updated `src/integrations/supabase/client.ts` and `src/pages/Auth.tsx` to support both variables with fallback
- **Impact**: App will now work with standard Supabase configuration

### 2. Created Environment Template
- Added `AuraManager/.env.example` with proper variable names and documentation

## Recommended Cleanup Actions

### Duplicate Folders to Remove
The repository has multiple frontend implementations. **Keep AuraManager, remove others:**

```
✅ KEEP: AuraManager/          (Main production app)
❌ DELETE: frontend-legacy/     (Old implementation)
❌ DELETE: frontend-new/        (Duplicate implementation)
❌ DELETE: frontend-new-merged/ (Redundant merge)
❌ DELETE: correction/          (Unknown purpose)
❌ DELETE: supabase-rls-test/   (Duplicate of root)
```

### Root-Level Files to Organize

**Move to docs/ folder:**
- All .md files except README.md
- All .sql files

**Keep at root:**
- README.md
- package.json (if exists)
- vercel.json
- deno.json
- .gitignore

### Consolidate OAuth Documentation
Currently 15+ OAuth-related markdown files in AuraManager/:
- AUTH_TROUBLESHOOTING_STEPS.md
- GOOGLE_OAUTH_CONSENT_SETUP.md
- GOOGLE_OAUTH_FIX.md
- GOOGLE_OAUTH_SETUP_GUIDE.md
- GOOGLE_OAUTH_SETUP_INSTRUCTIONS.md
- GOOGLE_OAUTH_TROUBLESHOOTING.md
- IMMEDIATE_OAUTH_FIX.md
- MOBILE_AUTH_FIX.md
- MOBILE_AUTH_INVESTIGATION.md
- OAUTH_REDIRECT_FIX.md
- etc.

**Recommended**: Create single `docs/AUTH_SETUP_GUIDE.md` with all OAuth information

### Test Files Organization
Move to tests/ folder:
- auth_test.ts
- full_test.ts
- other_user_test.ts
- rls_test.ts
- rls_test_suite.ts
- rls_test.js.txt

## Directory Structure After Cleanup

```
supabase-rls-test/
├── AuraManager/              # Main application
│   ├── src/
│   ├── public/
│   ├── api/
│   ├── supabase/
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── docs/                     # Documentation
│   ├── AUTH_SETUP_GUIDE.md
│   ├── IMPLEMENTATION_ROADMAP.md
│   ├── SCHEMA_GUIDES/
│   │   ├── COMPLETE_SCHEMA_SPOTIFY_AI_SOCIAL.sql
│   │   ├── ENHANCE_EXISTING_SCHEMA.sql
│   │   └── SAFE_SCHEMA_ENHANCEMENT.sql
│   └── SETUP/
│       ├── ADMIN_SETUP.md
│       ├── PROFILE_SETUP.md
│       └── SETUP_STATUS.md
├── tests/                    # Test files
│   ├── auth_test.ts
│   ├── rls_test_suite.ts
│   └── run_tests.ps1
├── .github/
│   └── workflows/
├── README.md
├── deno.json
└── vercel.json
```

## Execution Commands

### PowerShell Commands to Clean Up:

```powershell
# 1. Remove duplicate frontend folders
Remove-Item -Recurse -Force frontend-legacy
Remove-Item -Recurse -Force frontend-new
Remove-Item -Recurse -Force frontend-new-merged
Remove-Item -Recurse -Force correction
Remove-Item -Recurse -Force supabase-rls-test

# 2. Create documentation folders
New-Item -ItemType Directory -Path docs
New-Item -ItemType Directory -Path docs/SCHEMA_GUIDES
New-Item -ItemType Directory -Path docs/SETUP
New-Item -ItemType Directory -Path tests

# 3. Move documentation files
Move-Item *.md docs/ -Exclude README.md
Move-Item *SCHEMA*.sql docs/SCHEMA_GUIDES/
Move-Item *SETUP*.md docs/SETUP/
Move-Item *setup*.sql docs/SETUP/

# 4. Move test files
Move-Item *_test.ts tests/
Move-Item run_tests.ps1 tests/

# 5. Clean up AuraManager docs
cd AuraManager
New-Item -ItemType Directory -Path docs
Move-Item *OAUTH*.md docs/
Move-Item *AUTH*.md docs/
Move-Item *IMPLEMENTATION*.md docs/
```

## Next Steps

1. **Review the changes**: Check that environment variables are now consistent
2. **Test the build**: Run `npm install` and `npm run build` in AuraManager
3. **Update Vercel environment variables**: Use `VITE_SUPABASE_ANON_KEY` instead of `VITE_SUPABASE_PUBLISHABLE_KEY`
4. **Execute cleanup**: Run the PowerShell commands above
5. **Update README**: Document the new structure
6. **Test the app**: Verify authentication and core features work

## Environment Variables Checklist

### Vercel/Production Settings
Update your Vercel project environment variables:
- ✅ `VITE_SUPABASE_URL` - Your Supabase project URL
- ✅ `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key (replaces PUBLISHABLE_KEY)
- ⚠️  Remove: `VITE_SUPABASE_PUBLISHABLE_KEY` (deprecated)
- 📋 Optional: `VITE_PUBLIC_BASE_URL` - Your production domain

### Local Development
Create `AuraManager/.env`:
```env
VITE_SUPABASE_URL=your-url-here
VITE_SUPABASE_ANON_KEY=your-key-here
```

## Issues Fixed

✅ Environment variable inconsistency  
✅ Missing .env.example file  
✅ Supabase client configuration  
✅ Auth page configuration  

## Known Issues to Monitor

⚠️ **OAuth Integration**: Multiple OAuth documents suggest there were/are OAuth issues. Test Google OAuth after cleanup.  
⚠️ **Mobile Auth**: Several mobile auth fix documents exist. Test on mobile devices.  
⚠️ **RLS Tests**: Ensure RLS tests still pass after cleanup.
