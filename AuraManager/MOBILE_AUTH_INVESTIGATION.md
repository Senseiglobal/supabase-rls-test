# Mobile Authentication Fix - Temporary Solution

## Current Issue Analysis

The mobile authentication is redirecting to `supabasetest-six.vercel.app` which suggests:

1. **Browser Cache Issue**: Mobile browser has cached authentication from old configuration
2. **Google OAuth Remnants**: Google OAuth may still have old URLs configured
3. **Session Persistence**: Old JWT tokens are still active

## Immediate Fix Options

### Option 1: Add Temporary Redirect (Quick Fix)
Add `supabasetest-six.vercel.app` to Supabase redirect URLs temporarily:

**Steps:**
1. Go to: https://supabase.com/dashboard/project/cpylmxhrobrhqettudjg/auth/settings
2. In "Redirect URLs" section, add:
   ```
   https://supabasetest-six.vercel.app
   ```
3. Save changes
4. Test mobile authentication

**Pros:** Mobile auth works immediately
**Cons:** Users still redirect to old URL instead of auramanager.app

### Option 2: Force Complete Cache Clear (Recommended)
Clear all authentication state to force fresh login:

**Steps:**
1. On mobile device:
   - Clear browser cache completely
   - Clear all site data for both auramanager.app and vercel.app domains
   - Sign out of Google account completely
   - Sign back into Google account
   - Try authentication again

2. If still issues, temporarily revoke Google OAuth access:
   - Go to: https://myaccount.google.com/permissions
   - Remove "Aura Manager" or any related apps
   - Try authentication again

## Long-term Solution

The real fix is ensuring all authentication flows point to the current configuration:

### Current Correct Configuration:
- **Supabase Project:** `cpylmxhrobrhqettudjg`
- **Custom Domain:** `auramanager.app` 
- **OAuth Redirect:** `https://cpylmxhrobrhqettudjg.supabase.co/auth/v1/callback`

### Google OAuth Console Should Have:
**Authorized JavaScript Origins:**
- `https://auramanager.app`
- `https://cpylmxhrobrhqettudjg.supabase.co`

**Authorized Redirect URIs:**
- `https://cpylmxhrobrhqettudjg.supabase.co/auth/v1/callback`
- `https://auramanager.app`

## Testing Steps

After implementing either solution:

1. **Test Desktop:** https://auramanager.app/auth
2. **Test Mobile:** Navigate to https://auramanager.app/auth on mobile
3. **Verify Redirect:** Ensure final redirect is to auramanager.app/dashboard
4. **Check JWT:** Verify JWT token contains `cpylmxhrobrhqettudjg` in the issuer field

## Recommendation

I recommend **Option 2** (complete cache clear) first, as it addresses the root cause. If that doesn't work, we can implement **Option 1** as a temporary workaround while investigating further.