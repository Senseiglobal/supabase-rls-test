# Google OAuth Setup Instructions

## Problem
Error: `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}`

## Root Cause
Google OAuth provider is not enabled in Supabase project configuration.

## Solution Steps

### 1. Enable Google OAuth in Supabase
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `snbwmkrubosvpibamivu`
3. Navigate to **Authentication > Providers**
4. Find "Google" and toggle it **ON**

### 2. Get Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the Google+ API
4. Go to **Credentials > Create Credentials > OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add authorized redirect URIs:
   ```
   https://snbwmkrubosvpibamivu.supabase.co/auth/v1/callback
   http://localhost:54321/auth/v1/callback (for local development)
   ```

### 3. Configure in Supabase
1. In Supabase Authentication > Providers > Google:
   - **Client ID**: Paste your Google OAuth Client ID
   - **Client Secret**: Paste your Google OAuth Client Secret
   - **Redirect URL**: Should auto-populate as `https://snbwmkrubosvpibamivu.supabase.co/auth/v1/callback`

### 4. Add Site URLs (Important!)
In Supabase Authentication > URL Configuration, add:
- **Site URL**: `https://auramanager.app` (or your production domain)
- **Additional Redirect URLs**:
  ```
  http://localhost:8080/dashboard
  http://localhost:8081/dashboard
  http://localhost:8082/dashboard
  https://auramanager.app/dashboard
  https://your-vercel-domain.vercel.app/dashboard
  ```

### 5. Test
1. Deploy changes to production
2. Test OAuth login from your live domain
3. Verify user can sign in and gets redirected properly

## Current Code Status
✅ The authentication code is properly implemented
✅ Error handling is comprehensive
✅ Environment variables are correctly configured
❌ Google OAuth provider needs to be enabled in Supabase

## Next Steps
1. Complete Supabase Google OAuth setup (steps above)
2. Test authentication flow
3. Verify user data is properly stored in profiles table