# Spotify Integration - Complete Diagnostic & Fix Guide

## Current URLs
- **Vercel Production**: https://supabasetest-six.vercel.app
- **Supabase Project**: https://snbwmkrubosvpibamivu.supabase.co
- **Spotify Callback**: https://snbwmkrubosvpibamivu.supabase.co/auth/v1/callback

---

## ISSUE 1: Blank Screen on Vercel

### Cause
Missing or incorrect environment variables in Vercel.

### Fix Steps

#### 1. Add Environment Variables in Vercel
Go to: https://vercel.com/thomas-oguns-projects/supabasetest/settings/environment-variables

Add these TWO variables:

**Variable 1:**
- Name: `VITE_SUPABASE_URL`
- Value: `https://snbwmkrubosvpibamivu.supabase.co`
- Environments: ✅ Production ✅ Preview ✅ Development

**Variable 2:**
- Name: `VITE_SUPABASE_PUBLISHABLE_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuYndta3J1Ym9zdnBpYmFtaXZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODc5MDMsImV4cCI6MjA3Nzg2MzkwM30.1tWvpThgFEchdx1suzTSvrirya5Xannv7Ewfo8J3MkQ`
- Environments: ✅ Production ✅ Preview ✅ Development

#### 2. Redeploy
- Go to: https://vercel.com/thomas-oguns-projects/supabasetest
- Click **Deployments**
- Find latest deployment → Click ••• → **Redeploy**
- Wait 1-2 minutes

#### 3. Verify Build Succeeded
- After redeploy, click on the deployment
- Check **Build Logs** - should end with "✓ Build Completed"
- If errors, copy them and investigate

---

## ISSUE 2: Supabase Redirect URLs

### Cause
Supabase doesn't recognize your app's URL for OAuth callbacks.

### Fix Steps

Go to: https://supabase.com/dashboard/project/snbwmkrubosvpibamivu/auth/url-configuration

#### Set Site URL:
```
https://supabasetest-six.vercel.app
```

#### Set Additional Redirect URLs (one per line):
```
http://localhost:8080
http://localhost:3000
https://supabasetest-six.vercel.app
https://supabasetest-six.vercel.app/dashboard
```

Click **Save**.

---

## ISSUE 3: Spotify Developer App Settings

### Cause
Spotify doesn't have the correct callback URI.

### Fix Steps

1. Go to: https://developer.spotify.com/dashboard
2. Click on your app (ArtistBuddy or whatever you named it)
3. Click **Edit Settings**
4. Scroll to **Redirect URIs**

#### Should have EXACTLY this:
```
https://snbwmkrubosvpibamivu.supabase.co/auth/v1/callback
```

5. Click **Add** if missing
6. Click **Save** at bottom

---

## ISSUE 4: Supabase Spotify Provider

### Verify Enabled

Go to: https://supabase.com/dashboard/project/snbwmkrubosvpibamivu/auth/providers

1. Find **Spotify** in the list
2. Make sure toggle is **ON** (green)
3. Verify **Client ID** and **Client Secret** are filled in (from Spotify dashboard)
4. Click **Save** if you made changes

---

## Testing Checklist

After completing ALL fixes above:

### 1. Test App Loads
- [ ] Visit: https://supabasetest-six.vercel.app
- [ ] Page loads (not blank)
- [ ] Can sign in / create account
- [ ] Dashboard appears with sidebar

### 2. Test Spotify Connection
- [ ] Scroll to "Integrations" section on Dashboard
- [ ] Click "Connect Spotify"
- [ ] Redirects to Spotify
- [ ] After approving, returns to Dashboard
- [ ] Shows "✓ Connected" badge
- [ ] Does NOT log you out

### 3. Test Data Sync
- [ ] Click "Sync Data" button
- [ ] Shows "Syncing..." then "Last sync HH:MM:SS"
- [ ] Go to Supabase → Table Editor
- [ ] Check `spotify_profiles` table - has your row
- [ ] Check `spotify_recent_plays` table - has your tracks

---

## Common Errors & Solutions

### "Invalid redirect URI"
→ Check Spotify app settings has exact callback URL

### Gets logged out after Spotify auth
→ Check Supabase Additional Redirect URLs includes your Vercel domain

### Blank screen persists
→ Check browser console (F12) for errors
→ Check Vercel build logs for failures
→ Verify environment variables are set correctly

### "No Spotify access token"
→ Reconnect Spotify (disconnect first if needed)
→ Check provider_token is present in session

---

## Quick Verification Commands

Run these in PowerShell to verify local setup:

```powershell
# Check if tables exist in SQL file
Select-String -Path "c:\supabase-rls-test\spotify_tables.sql" -Pattern "create table"

# Check if API routes exist
Test-Path "c:\supabase-rls-test\frontend-new\api\spotify\profile.ts"
Test-Path "c:\supabase-rls-test\frontend-new\api\spotify\recent.ts"

# Check if ConnectSpotify component exists
Test-Path "c:\supabase-rls-test\frontend-new\src\components\ConnectSpotify.tsx"
```

---

## Need Help?

If after ALL these steps something still doesn't work:

1. Open browser console (F12) on the blank page
2. Copy ALL red error messages
3. Go to Vercel deployment logs and copy any build errors
4. Share those specific error messages

The error messages will tell us exactly what's broken!
