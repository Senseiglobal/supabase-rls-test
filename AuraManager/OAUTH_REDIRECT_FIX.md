# OAuth Redirect URI Mismatch Fix

## 🚨 Issue Identified: Error 400 - redirect_uri_mismatch

Based on your Google OAuth configuration analysis, the redirect URI being used by Aura Manager doesn't exactly match what's configured in Google Cloud Console.

## 🔍 Current Google OAuth Configuration

**Authorized Redirect URIs:**
1. ✅ `https://cpylmxhrobrhqettudjg.supabase.co/auth/v1/callback`
2. ✅ `https://auramanager.app`  
3. ✅ `https://cpylmxhrobrhqettudjg.supabase.co`

## 🎯 The Problem

The app is likely trying to use a redirect URI that's NOT in your list, such as:
- `https://auramanager.app/auth/callback`
- `https://auramanager.app/auth/v1/callback`
- `https://auramanager.app/dashboard`
- Or some other variation

## ✅ Complete Fix Solution

### Step 1: Add Missing Redirect URIs to Google Console

Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and add these URIs:

```
https://cpylmxhrobrhqettudjg.supabase.co/auth/v1/callback
https://auramanager.app
https://auramanager.app/auth/callback  
https://auramanager.app/dashboard
https://auramanager.app/account
https://auramanager.app/
```

### Step 2: Verify Supabase Configuration

1. **Go to Supabase Dashboard:** https://supabase.com/dashboard/project/cpylmxhrobrhqettudjg/auth/settings

2. **Check Site URL:**
   ```
   https://auramanager.app
   ```

3. **Check Redirect URLs (should include):**
   ```
   https://auramanager.app
   https://auramanager.app/
   https://auramanager.app/dashboard  
   https://auramanager.app/account
   https://auramanager.app/auth/callback
   ```

### Step 3: Update Frontend Auth Configuration

The app should use the correct redirect URL in auth calls:

**For Google OAuth via Supabase:**
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://auramanager.app/dashboard'
  }
})
```

### Step 4: Test the Fix

1. **Clear browser cache completely**
2. **Sign out of Google account**  
3. **Wait 2-3 minutes for Google changes to propagate**
4. **Try Google sign-in at:** https://auramanager.app/auth
5. **Verify redirect works to:** https://auramanager.app/dashboard

## 🔧 Quick Debugging Steps

### Check Current Redirect URI:
1. Open browser developer tools
2. Go to Network tab
3. Try Google sign-in
4. Look for the redirect request - it will show the exact URI being used
5. Compare with your Google Console configuration

### Common Redirect URI Patterns:
- **Supabase Default:** `https://<project>.supabase.co/auth/v1/callback`
- **Custom Domain:** `https://auramanager.app/dashboard`
- **Auth Callback:** `https://auramanager.app/auth/callback`

## 📋 Final Google OAuth Configuration Should Be:

**Authorized JavaScript Origins:**
```
https://auramanager.app
https://cpylmxhrobrhqettudjg.supabase.co
```

**Authorized Redirect URIs:**
```
https://cpylmxhrobrhqettudjg.supabase.co/auth/v1/callback
https://auramanager.app
https://auramanager.app/
https://auramanager.app/dashboard
https://auramanager.app/account  
https://auramanager.app/auth/callback
```

This comprehensive list covers all possible redirect scenarios and should eliminate the redirect_uri_mismatch error.

## ⚡ Pro Tip

After making these changes:
1. **Save in Google Console**
2. **Wait 2-3 minutes** (Google needs time to propagate changes)
3. **Clear browser cache**
4. **Test authentication**

The Error 400 should be resolved once the redirect URIs match exactly!