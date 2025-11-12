# 🚨 CRITICAL FIX: Folder Rename Required for Vercel Deployment

## Problem

Vercel deployment is failing with error:
```
A Serverless Function has an invalid name: "Aura Manager/api/inbox/sync.js". 
They must be less than 128 characters long and must not contain any space.
```

**Root Cause:** The folder name "Aura Manager" contains a space, which Vercel doesn't allow in Serverless Function paths.

## Solution

Rename "Aura Manager" folder to "AuraManager" (without space).

---

## Option 1: Using Git Locally (RECOMMENDED)

This is the cleanest and fastest method:

```bash
# 1. Clone the repository (if not already cloned)
git clone https://github.com/Senseiglobal/supabase-rls-test.git
cd supabase-rls-test

# 2. Rename the folder
git mv "Aura Manager" AuraManager

# 3. Commit the change
git commit -m "fix: rename 'Aura Manager' to 'AuraManager' for Vercel compatibility"

# 4. Push to GitHub
git push origin main
```

**That's it!** Vercel will automatically detect the change and redeploy successfully.

---

## Option 2: Using GitHub Desktop

1. Open GitHub Desktop
2. Clone the repository (if not already)
3. In your file explorer, rename "Aura Manager" → "AuraManager"
4. Return to GitHub Desktop - it will detect the rename
5. Commit with message: `fix: rename folder for Vercel compatibility`
6. Push to origin

---

## Option 3: Manual Web UI Workaround (NOT RECOMMENDED)

⚠️ **Warning:** This is tedious and error-prone. Only use if you cannot access Git locally.

You would need to:
1. Create a new "AuraManager" folder
2. Manually recreate the entire folder structure
3. Copy all files one by one
4. Delete the old "Aura Manager" folder

**This is NOT recommended** due to the large number of files and potential for errors.

---

## What Happens After Renaming?

### ✅ Automatic Changes
- Vercel will automatically redeploy
- GitHub Actions (if any) will trigger
- The deployment should succeed this time

### ❌ Manual Updates Needed

**In Vercel Dashboard:**
1. Go to Project Settings
2. If "Root Directory" is set to "Aura Manager", change it to "AuraManager"
3. Click Save

**No code changes needed!** The application code doesn't reference the root folder name.

---

## Verification Checklist

After renaming, verify:

- [ ] Folder is now named "AuraManager" (no space)
- [ ] All files are present in the new folder
- [ ] Vercel deployment triggered automatically
- [ ] Deployment shows "Building" or "Ready" (not "Error")
- [ ] Application loads at `auramanager.app`

---

## Expected Deployment Timeline

1. **Rename & Push:** 2 minutes
2. **Vercel Auto-Deploy:** 1-3 minutes
3. **Build & Deploy:** 2-5 minutes

**Total Time:** ~10 minutes from fix to live deployment

---

## Additional Context

### Current Project Structure
```
supabase-rls-test/
├── .github/
├── .vscode/
├── Aura Manager/          ← RENAME THIS
│   ├── api/
│   │   ├── ai/
│   │   ├── inbox/
│   │   ├── scheduler/
│   │   └── team/
│   ├── public/
│   ├── src/
│   ├── supabase/
│   ├── package.json
│   └── vercel.json
└── other folders...
```

### After Rename
```
supabase-rls-test/
├── .github/
├── .vscode/
├── AuraManager/           ← RENAMED (no space)
│   ├── api/
│   │   ├── ai/
│   │   ├── inbox/
│   │   ├── scheduler/
│   │   └── team/
│   ├── public/
│   ├── src/
│   ├── supabase/
│   ├── package.json
│   └── vercel.json
└── other folders...
```

---

## Why This Error Occurred

Vercel Serverless Functions are created from files in the `/api` directory. The function name is derived from the file path:

❌ **Current:** `Aura Manager/api/inbox/sync.ts` → Function name: `"Aura Manager/api/inbox/sync"`
✅ **After Fix:** `AuraManager/api/inbox/sync.ts` → Function name: `"AuraManager/api/inbox/sync"`

Spaces are not allowed in function names, hence the error.

---

## Recent Fixes Already Applied

✅ **Database Migrations:** Created `inbox_highlights` table
✅ **API Runtime:** Changed from `edge` to `nodejs` runtime
✅ **Implementation Plan:** Comprehensive 860-line guide created

**This folder rename is the FINAL fix needed for successful deployment!**

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify folder was renamed correctly (no space)
3. Ensure Vercel project settings point to "AuraManager"

---

**Priority:** 🔴 **CRITICAL** - Deployment is currently blocked
**Effort:** ⚡ **2 minutes** with Git command
**Impact:** 🚀 **Unblocks entire deployment pipeline**

---

*Created: November 12, 2025*
*Status: Ready to execute*
