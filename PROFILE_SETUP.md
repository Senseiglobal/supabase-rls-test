# Profile & Avatar Setup Instructions

## 1. Create Profiles Table

Run the SQL in `setup_profiles.sql` in your Supabase SQL Editor:
- Go to Supabase Dashboard → SQL Editor
- Copy and paste the contents of `setup_profiles.sql`
- Click "Run"

This will:
- Create the `profiles` table
- Enable RLS policies
- Set up a trigger to auto-create profiles on user signup

## 2. Create Storage Bucket for Avatars

### Option A: Using Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Name: `avatars`
4. Public bucket: **YES** ✓
5. Click "Create bucket"

### Option B: Using SQL

Run these commands in SQL Editor:

```sql
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);
```

## 3. Set Storage Policies

After creating the bucket, set up RLS policies for the storage bucket:

1. Go to Storage → avatars bucket → Policies
2. Click "New Policy" and add these policies:

### Policy 1: Public Read Access
- **Name**: Avatar images are publicly accessible
- **Allowed operation**: SELECT
- **Policy definition**: `true`

### Policy 2: Authenticated Upload
- **Name**: Users can upload their own avatar
- **Allowed operation**: INSERT
- **Policy definition**:
```sql
(bucket_id = 'avatars'::text) AND (auth.uid() = owner)
```

### Policy 3: Authenticated Update
- **Name**: Users can update their own avatar
- **Allowed operation**: UPDATE
- **Policy definition**:
```sql
(bucket_id = 'avatars'::text) AND (auth.uid() = owner)
```

### Policy 4: Authenticated Delete
- **Name**: Users can delete their own avatar
- **Allowed operation**: DELETE
- **Policy definition**:
```sql
(bucket_id = 'avatars'::text) AND (auth.uid() = owner)
```

## 4. Verify Setup

1. Sign in to your app
2. Navigate to Profile page
3. Try uploading an avatar image
4. Update your profile information
5. Verify changes persist after page refresh

## Notes

- Avatar uploads are limited to image files only
- The storage bucket is public, so avatar URLs are accessible to anyone
- Profile data (name, username, website) is protected by RLS
- Each user can only see and edit their own profile
