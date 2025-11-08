# Mobile Authentication Redirect Fix

## Problem Identified
Your mobile authentication is redirecting to an old URL because of authentication configuration issues.

**Current Issue:** Mobile auth redirects to `supabasetest-six.vercel.app` instead of `auramanager.app`

**Root Cause:** The JWT token shows it's coming from the OLD Supabase project `snbwmkrubosvpibamivu` instead of your current project `cpylmxhrobrhqettudjg`

## Solution Steps

### 1. Update Supabase Authentication Settings

Go to your Supabase Dashboard: https://supabase.com/dashboard/project/cpylmxhrobrhqettudjg

Navigate to: **Authentication > Settings**

### 2. Update Redirect URLs

In the **Site URL** section:
- Site URL: `https://auramanager.app`

In the **Redirect URLs** section, add:
```
https://auramanager.app
https://auramanager.app/
https://auramanager.app/auth/callback
https://auramanager.app/dashboard
https://auramanager.app/account
```

### 3. Remove Old URLs

Remove any old Vercel URLs like:
- `supabasetest-six.vercel.app`
- `supabasetest-86tx2lxq1-thomas-oguns-projects.vercel.app`

### 4. Update OAuth Provider Settings

For **Google OAuth**:
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Navigate to APIs & Services > Credentials
3. Find your OAuth 2.0 Client ID
4. Update Authorized redirect URIs to:
   ```
   https://cpylmxhrobrhqettudjg.supabase.co/auth/v1/callback
   ```

### 5. Clear Browser Cache

After making these changes:
1. Clear your browser cache completely
2. Sign out of any existing sessions
3. Wait 2-3 minutes for changes to propagate
4. Test authentication again

## Verification Steps

1. Try logging in on mobile
2. Check that the redirect URL uses `auramanager.app`
3. Verify the JWT token contains `cpylmxhrobrhqettudjg` in the `iss` field

## If Issues Persist

1. Check Supabase logs in Dashboard > Logs
2. Ensure you're using the correct Supabase project
3. Verify all environment variables point to the current project