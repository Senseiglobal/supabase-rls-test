# Google OAuth Troubleshooting Script

## Step 1: Check Supabase Dashboard

Go to: https://supabase.com/dashboard/project/snbwmkrubosvpibamivu/auth/providers

### Required Google OAuth Settings:

1. **Enable Google Provider**: ✅ Must be turned ON
2. **Client ID**: Should be your Google OAuth 2.0 Client ID
3. **Client Secret**: Should be your Google OAuth 2.0 Client Secret

## Step 2: Check Google Cloud Console

Go to: https://console.cloud.google.com/apis/credentials

### OAuth 2.0 Client Setup:

**Application type**: Web application

**Authorized JavaScript origins**:
```
https://auramanager.app
https://snbwmkrubosvpibamivu.supabase.co
http://localhost:5173
```

**Authorized redirect URIs**:
```
https://snbwmkrubosvpibamivu.supabase.co/auth/v1/callback
```

## Step 3: Test Locally

Run the app locally and check the console for detailed error messages:

```bash
npm run dev
```

Visit: http://localhost:5173/auth

Click "Test Google Auth" button and check browser console.

## Common Issues and Solutions:

### "Google OAuth not configured"
- ❌ Google provider not enabled in Supabase
- ✅ Go to Supabase Dashboard > Auth > Providers > Enable Google

### "redirect_uri_mismatch" 
- ❌ Redirect URI not added to Google Cloud Console
- ✅ Add: `https://snbwmkrubosvpibamivu.supabase.co/auth/v1/callback`

### "unauthorized_client"
- ❌ Client ID/Secret mismatch
- ✅ Copy exact values from Google Cloud Console to Supabase

### "invalid_client"
- ❌ OAuth consent screen not published
- ✅ Publish OAuth consent screen in Google Cloud Console

## Step 4: Manual Test

Try this URL directly (replace CLIENT_ID):
```
https://accounts.google.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=https://snbwmkrubosvpibamivu.supabase.co/auth/v1/callback&response_type=code&scope=openid email profile
```

If this works, the issue is in the Supabase configuration.
If this doesn't work, the issue is in Google Cloud Console setup.