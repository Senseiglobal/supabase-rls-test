# Vercel Deployment Troubleshooting Guide

## Quick Fix Checklist

### 1. ✅ Ensure all files are committed and pushed to GitHub

```bash
# Check what files are staged
git status

# Stage all new files
git add .

# Commit changes
git commit -m "Add PayPal integration with notification system"

# Push to GitHub
git push origin main
```

### 2. ✅ Verify Vercel Environment Variables

Go to your Vercel dashboard (vercel.com):

1. Click on your project
2. Go to **Settings** → **Environment Variables**
3. Make sure these variables are set:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PAYPAL_CLIENT_ID=your-paypal-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-paypal-sandbox-secret
VERCEL_URL=https://your-app.vercel.app
```

**IMPORTANT:** Make sure these are set for the **Production** environment, not just Preview.

### 3. ✅ Clear Vercel Cache and Rebuild

1. Go to your Vercel project
2. Click **Deployments**
3. Find the latest failed deployment
4. Click the three dots (...) → **Redeploy**
5. Check the **build logs** for specific errors

Alternatively, go to **Settings** → **Git** and toggle "Vercel for Git" off/on to trigger a fresh build.

### 4. ✅ Check for Missing Dependencies

The new code uses only packages already in your `package.json`:
- `@supabase/supabase-js` ✅ (already installed)
- `lucide-react` ✅ (for icons)
- React/Next built-ins ✅

No new dependencies needed!

### 5. ✅ Verify API Routes Are Accessible

After deployment, test the endpoints:

```bash
# Test PayPal order creation
curl -X POST https://your-app.vercel.app/api/paypal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "planName": "Pro",
    "billingCycle": "monthly", 
    "priceInCents": 9900
  }'

# Should return: { "success": true, "orderId": "...", "approveUrl": "..." }
```

---

## Common Deployment Errors & Fixes

### Error: "Build failed - Module not found"

**Cause:** Missing import or incorrect file path

**Fix:** 
```bash
# Verify file exists
ls -la api/paypal.ts
ls -la api/checkout/paypal/return.ts
ls -la src/components/NotificationToast.tsx

# Check imports in files
grep -r "import" api/paypal.ts
```

### Error: "Cannot find module 'lucide-react'"

**Cause:** Icon imports in NotificationToast component

**Fix:** Icon names are correct and lucide-react is in dependencies. This shouldn't happen.

### Error: "Unexpected token" or "Syntax error"

**Cause:** TypeScript compilation issues

**Fix:**
```bash
# Verify TypeScript compilation locally
npx tsc --noEmit

# Check for syntax errors
npm run lint
```

### Error: "Function code too large"

**Cause:** API function exceeds Vercel's 50MB limit (unlikely)

**Fix:** Not applicable - our functions are tiny. This is a non-issue.

---

## Step-by-Step Deployment Fix

### Step 1: Check Git Status
```bash
cd AuraManager
git status
```

Expected to see:
- `api/paypal.ts` - modified
- `api/checkout/paypal/return.ts` - new
- `api/checkout/paypal/cancel.ts` - new
- `src/components/NotificationToast.tsx` - new
- `src/components/PaymentCheckout.tsx` - modified
- `src/pages/Billing.tsx` - modified
- `vercel.json` - modified
- `.vercelignore` - new

### Step 2: Push to GitHub
```bash
git add .
git commit -m "PayPal integration: Add payment flow, notifications, and connection status

- Enhanced PayPal API handler with error handling
- Created notification component for user feedback
- Added PayPal callback handlers (return/cancel)
- Integrated notifications into checkout and billing pages
- Updated Vercel configuration for API routes"

git push origin main
```

### Step 3: Trigger Vercel Rebuild

Option A - Automatic (Vercel detects GitHub push):
- Wait 1-2 minutes
- Check https://vercel.com/your-username/your-project/deployments
- Should see new deployment starting

Option B - Manual (from Vercel dashboard):
1. Go to vercel.com dashboard
2. Select your project
3. Click "Deployments" tab
4. Find latest deployment
5. Click "..." → "Redeploy"

### Step 4: Monitor Build Logs
1. In Vercel dashboard, click on the active deployment
2. Scroll down to see build output
3. Look for errors in:
   - **Install** phase (npm install)
   - **Build** phase (npm run build)
   - **Functions** phase (API routes)

### Step 5: Test the Deployment
Once deployment succeeds:

```bash
# Test from terminal
curl https://your-app.vercel.app/api/paypal
# Should get 401 error (Unauthorized) which is correct!
# This proves the API route exists

# Test in browser
# Go to https://your-app.vercel.app
# Check console for any errors
# Try the payment flow
```

---

## If Still Failing - Get Logs

Run this to see detailed Vercel build information:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Check last deployment logs
vercel logs --tail

# Or redeploy with verbose logging
vercel deploy --prod
```

---

## Configuration Files Updated ✅

| File | Status | Changes |
|------|--------|---------|
| `vercel.json` | ✅ Updated | Added API route configuration |
| `.vercelignore` | ✅ Created | Ignores unnecessary files |
| `package.json` | ✅ No change | All deps already present |
| `tsconfig.json` | ✅ Correct | Proper include paths |

---

## Environment Variables Checklist

### Required for PayPal
- [ ] `PAYPAL_CLIENT_ID` - From PayPal Developer Portal
- [ ] `PAYPAL_CLIENT_SECRET` - From PayPal Developer Portal

### Required for Supabase
- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Public API key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role (for API only)

### Optional but Recommended
- [ ] `VERCEL_URL` - Auto-set by Vercel, but you can override

### Check Current Settings
1. Open Vercel dashboard
2. Go to project Settings
3. Click Environment Variables
4. Verify all keys are set for "Production"
5. Not just "Preview" environment

---

## If Deployment Still Fails

Please provide:
1. The exact error message from Vercel build logs
2. The output of `git status` (what files changed)
3. The output of `npm run build` (local build test)
4. The Vercel project URL

This will help diagnose the exact issue!
