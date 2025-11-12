# Spotify OAuth Configuration Guide

## Problem: "invalid_client invalid redirect" Error

This error occurs when the Spotify app configuration doesn't match the OAuth request parameters.

## Step 1: Spotify Developer Console Configuration

1. Go to https://developer.spotify.com/dashboard
2. Select your app (or create one if you don't have it)
3. Click "Settings"

### Required Settings:

**App Name:** Your choice (e.g., "AuraManager")
**App Description:** Your choice
**Website:** https://auramanager.app
**Redirect URIs:** Add ALL of these:

```
https://cpylmxhrobrhqettudjg.supabase.co/auth/v1/callback
https://auramanager.app/account?connected=spotify
https://localhost:3000/account?connected=spotify
```

**API/SDK:** Web API
**Users and Access:** Add your email to users if in development mode

## Step 2: Supabase Configuration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/cpylmxhrobrhqettudjg
2. Navigate to Authentication > Providers
3. Find Spotify and configure:

**Enable Spotify:** ✅ Enabled
**Client ID:** 2b48c7729298483c9588820c99bdbaef (from Spotify app)
**Client Secret:** [Your secret from Spotify app]
**Redirect URL:** https://cpylmxhrobrhqettudjg.supabase.co/auth/v1/callback

## Step 3: Vercel Domain Configuration (Optional but Recommended)

The changing Vercel URLs are causing redirect URI mismatches. Consider:

1. Set up a custom domain in Vercel
2. Or use the Vercel project domain format
3. Update all redirect URIs when URLs change

## Current Deployment URL
**Custom Domain:** https://auramanager.app ✅ **STABLE URL - USE THIS FOR OAUTH**
Latest Vercel URL: https://supabasetest-2hify4lqc-thomas-oguns-projects.vercel.app

## Testing Steps

1. Use the debug panel in the Account page to see current origin
2. Ensure Spotify redirect URIs include the exact URL shown
3. Test connection from both sidebar and account page
4. Check browser network tab for OAuth redirect details

## Common Issues

- **Client ID mismatch**: Supabase and Spotify must have identical Client ID
- **Missing redirect URI**: Every possible redirect must be registered
- **Development vs Production**: Spotify apps in development mode require user approval
- **Changing URLs**: Vercel deployment URLs change, breaking registered redirects

## Verification

After configuration, the Spotify button should:
1. Show proper connection status in sidebar
2. Successfully redirect to Spotify authorization
3. Return to your app with connection established
4. Display "Connected" status with green indicator

## Debug Information

Current Supabase Project ID: cpylmxhrobrhqettudjg
Current Client ID in code: 2b48c7729298483c9588820c99bdbaef
**Production Domain:** https://auramanager.app (STABLE - Recommended for OAuth)
Latest Vercel Deployment: https://supabasetest-868rhzj83-thomas-oguns-projects.vercel.app

## ✅ FIXED ISSUES:
- ✅ **MAJOR FIX:** Updated Supabase project URL from old project to current: `cpylmxhrobrhqettudjg.supabase.co`
- ✅ Stable domain redirect URI: https://auramanager.app/account?connected=spotify  
- ✅ DEV_MODE disabled - authenticated users go to /dashboard
- ✅ Disconnect options added for all platform connections
- ✅ Improved user experience - hides technical OAuth details from users
- ✅ Better error messages and loading states