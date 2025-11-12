# Google OAuth Setup Guide for AuraManager

## Issue Fixed
✅ **Fixed environment variable naming**: Changed `VITE_SUPABASE_ANON_KEY` to `VITE_SUPABASE_PUBLISHABLE_KEY`
✅ **Improved error handling**: Better debugging and error messages for OAuth issues
✅ **Fixed window references**: Updated to use `globalThis` instead of `window`

## Required Supabase Configuration

### 1. Google OAuth Provider Setup

Go to your Supabase Dashboard → Authentication → Providers → Google and ensure:

**Client ID**: (Your Google Cloud Console OAuth 2.0 Client ID)
**Client Secret**: (Your Google Cloud Console OAuth 2.0 Client Secret)

### 2. Redirect URLs Configuration

In Supabase Dashboard → Authentication → URL Configuration, add these URLs:

**Site URL**: `https://auramanager.app`

**Redirect URLs** (add all of these):
```
https://auramanager.app
https://auramanager.app/
https://auramanager.app/dashboard
https://auramanager.app/auth
http://localhost:5173
http://localhost:5173/
http://localhost:5173/dashboard
http://localhost:5173/auth
```

### 3. Google Cloud Console Configuration

In your Google Cloud Console → APIs & Credentials → OAuth 2.0 Client IDs:

**Authorized JavaScript origins**:
```
https://auramanager.app
https://snbwmkrubosvpibamivu.supabase.co
http://localhost:5173
```

**Authorized redirect URIs**:
```
https://snbwmkrubosvpibamivu.supabase.co/auth/v1/callback
https://auramanager.app/auth/callback
```

### 4. Vercel Environment Variables

Ensure these are set in your Vercel project settings:

```bash
VITE_SUPABASE_URL=https://snbwmkrubosvpibamivu.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuYndta3J1Ym9zdnBpYmFtaXZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyNjI1MzIsImV4cCI6MjA0NjgzODUzMn0.1BTCGQroeEyWrb1JqJuG1_xxYFD3Z8mLfBHUilJT_ns
VITE_PUBLIC_BASE_URL=https://auramanager.app
VITE_GOOGLE_AI_API_KEY=AIzaSyBSm0m1-8m_zTinusb5L4NNZ1AL8dcPM_c
VITE_GOOGLE_AI_MODEL=gemini-2.0-flash-exp
```

## Troubleshooting Steps

### If Google sign-in still fails:

1. **Check browser console** for detailed error messages
2. **Verify redirect URLs** match exactly (no trailing slashes issues)
3. **Ensure Google OAuth consent screen** is properly configured
4. **Check domain verification** in Google Cloud Console
5. **Test locally first** with localhost URLs

### Common Issues:

- **"redirect_uri_mismatch"**: Add the exact URI shown in error to Google Cloud Console
- **"unauthorized_client"**: Verify Client ID/Secret in Supabase match Google Cloud Console
- **"invalid_client"**: Check that OAuth consent screen is published (not in testing mode)

## Testing

1. **Local development**: Should work with `http://localhost:5173`
2. **Production**: Should work with `https://auramanager.app`

The app now has improved error logging to help diagnose OAuth issues.