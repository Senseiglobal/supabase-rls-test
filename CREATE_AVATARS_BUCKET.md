# Creating the Avatars Storage Bucket - Quick Guide

## 🚀 Quick Start (Choose One Method)

### Method 1: Using SQL (Fastest - 30 seconds)

1. **Open Supabase SQL Editor**
   - Go to your Supabase project: https://supabase.com/dashboard
   - Click on your project (snbwmkrubosvpibamivu)
   - Navigate to: **SQL Editor** (in left sidebar)

2. **Run the Setup Script**
   - Open the file: `setup_storage_bucket.sql`
   - Copy ALL the SQL code
   - Paste into the SQL Editor
   - Click **"Run"** button
   - Wait for success message ✅

3. **Verify It Worked**
   - Go to **Storage** in the left sidebar
   - You should see **avatars** bucket listed
   - Click on it to confirm it's set to "Public"

---

### Method 2: Using Dashboard (Visual - 3 minutes)

#### Step 1: Create the Bucket

1. Go to your Supabase Dashboard
2. Click **Storage** in left sidebar
3. Click **"Create a new bucket"** button
4. Fill in the form:

   ```
   Name: avatars
   Public bucket: ✅ (CHECK THIS BOX - IMPORTANT!)
   File size limit: 5 MB
   Allowed MIME types: image/png, image/jpeg, image/jpg, image/gif, image/webp
   ```

5. Click **"Create bucket"**

#### Step 2: Add Storage Policies

1. Click on the **avatars** bucket you just created
2. Click the **"Policies"** tab at the top
3. Click **"New Policy"** button
4. Add these 4 policies one by one:

---

**POLICY 1: Public Read Access**

```
Button: "New Policy" → "For full customization"

Name: Public Access for Avatars
Allowed operation: SELECT (read)
Policy definition: 
  true
```

Click "Review" → "Save policy"

---

**POLICY 2: Authenticated Upload**

```
Button: "New Policy" → "For full customization"

Name: Authenticated users can upload avatars
Allowed operation: INSERT (create)
Target roles: authenticated ✅
Policy definition:
  bucket_id = 'avatars'
```

Click "Review" → "Save policy"

---

**POLICY 3: Update Own Avatar**

```
Button: "New Policy" → "For full customization"

Name: Users can update own avatars
Allowed operation: UPDATE
Policy definition:
  (bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

Click "Review" → "Save policy"

---

**POLICY 4: Delete Own Avatar**

```
Button: "New Policy" → "For full customization"

Name: Users can delete own avatars
Allowed operation: DELETE
Policy definition:
  (bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

Click "Review" → "Save policy"

---

## ✅ Verification

After setup, verify everything works:

1. **Check bucket exists:**
   - Go to Storage → Should see "avatars" bucket
   - Should show "Public" badge

2. **Run the checker script:**
   ```powershell
   deno run --allow-net --allow-env --allow-read check_supabase_setup.ts
   ```
   
   Should now show:
   ```
   ✅ avatars bucket: OK (public)
   ```

3. **Test in the app:**
   - Visit: https://supabasetest-six.vercel.app
   - Sign in
   - Go to Profile page
   - Click "Upload Avatar"
   - Select an image
   - Should upload successfully! 🎉

---

## 🔧 Troubleshooting

### Issue: "Bucket already exists"
- ✅ Great! It's already created
- Just add the 4 policies if they're missing

### Issue: "Permission denied" when uploading
- ❌ Bucket might not be public
- Fix: Storage → avatars → Settings → Make it Public

### Issue: Policies not working
- ❌ Check policy definitions match exactly
- Run: `SELECT * FROM pg_policies WHERE tablename = 'objects';`
- Should see 4 policies with names containing "avatar"

### Issue: File upload fails with "Invalid MIME type"
- ❌ File might not be an image
- Only PNG, JPEG, JPG, GIF, WEBP are allowed
- File size must be under 5MB

---

## 📊 What This Enables

After creating the avatars bucket:

✅ Users can upload profile pictures  
✅ Avatars are publicly accessible (anyone can view)  
✅ Only the owner can update/delete their avatar  
✅ Files are limited to 5MB max  
✅ Only image files are allowed  
✅ Profile page fully functional  

---

## 🎯 Quick Links

- **Your Supabase Dashboard**: https://supabase.com/dashboard/project/snbwmkrubosvpibamivu
- **Storage Section**: https://supabase.com/dashboard/project/snbwmkrubosvpibamivu/storage/buckets
- **SQL Editor**: https://supabase.com/dashboard/project/snbwmkrubosvpibamivu/sql/new
- **Your App**: https://supabasetest-six.vercel.app

---

**Time Required**: 30 seconds (SQL method) or 3 minutes (Dashboard method)  
**Difficulty**: Easy ⭐  
**Next Step**: Test the Profile page avatar upload!
