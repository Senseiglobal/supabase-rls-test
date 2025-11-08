# Google OAuth Console Configuration Fix

## Current Issue
Your Google OAuth console has mixed old and new URLs causing mobile authentication to redirect to wrong domains.

## Required Configuration

### Authorized JavaScript Origins
```
https://auramanager.app
https://cpylmxhrobrhqettudjg.supabase.co
```

### Authorized Redirect URIs  
```
https://cpylmxhrobrhqettudjg.supabase.co/auth/v1/callback
https://auramanager.app
https://auramanager.app/auth/callback
```

## Step-by-Step Fix

1. **Go to Google Cloud Console:**
   https://console.cloud.google.com/apis/credentials

2. **Find your OAuth 2.0 Client (Web client 1)**

3. **Update Authorized JavaScript Origins:**
   - ❌ **REMOVE:** `https://supabasetest-six.vercel.app`
   - ❌ **REMOVE:** `https://snbwmkrubosvpibamivu.supabase.co` 
   - ✅ **ADD:** `https://auramanager.app`
   - ✅ **KEEP:** `https://cpylmxhrobrhqettudjg.supabase.co`

4. **Update Authorized Redirect URIs:**
   - ❌ **REMOVE:** `https://snbwmkrubosvpibamivu.supabase.co/auth/v1/callback`
   - ❌ **REMOVE:** `https://supabasetest-six.vercel.app`
   - ✅ **KEEP:** `https://cpylmxhrobrhqettudjg.supabase.co/auth/v1/callback`
   - ✅ **ADD:** `https://auramanager.app`
   - ✅ **ADD:** `https://auramanager.app/auth/callback`

5. **Save Changes**

6. **Wait 2-3 minutes for propagation**

7. **Test mobile authentication**

## Final Configuration Should Look Like:

### Authorized JavaScript Origins:
- https://auramanager.app
- https://cpylmxhrobrhqettudjg.supabase.co

### Authorized Redirect URIs:
- https://cpylmxhrobrhqettudjg.supabase.co/auth/v1/callback
- https://auramanager.app
- https://auramanager.app/auth/callback

## Why This Fixes Mobile Auth

The old URLs (`supabasetest-six.vercel.app` and `snbwmkrubosvpibamivu.supabase.co`) are causing Google to redirect mobile users to outdated domains instead of your current custom domain `auramanager.app`.

After this fix, mobile authentication will properly redirect to `auramanager.app` instead of the old Vercel URLs.