-- ============================================================
-- AVATARS STORAGE BUCKET SETUP
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor
-- Or follow the manual steps in the comments below
-- ============================================================

-- Step 1: Create the avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true,  -- Public bucket so avatar URLs are accessible
  5242880,  -- 5MB file size limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']  -- Only allow images
);

-- Step 2: Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Create storage policies for the avatars bucket

-- Policy 1: Anyone can view avatars (public read)
CREATE POLICY "Public Access for Avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy 2: Authenticated users can upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Users can update their own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check if bucket was created successfully
SELECT * FROM storage.buckets WHERE name = 'avatars';

-- Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%avatar%';

-- ============================================================
-- MANUAL SETUP (Alternative to SQL)
-- ============================================================

/*

If you prefer using the Supabase Dashboard instead of SQL:

1. CREATE BUCKET:
   - Go to: Storage → Create a new bucket
   - Name: avatars
   - Public bucket: ✅ YES (checked)
   - File size limit: 5 MB
   - Allowed MIME types: image/png, image/jpeg, image/jpg, image/gif, image/webp
   - Click "Create bucket"

2. SET UP POLICIES:
   - Go to: Storage → avatars bucket → Policies tab
   - Click "New Policy" for each of the following:

   POLICY 1: Public Read Access
   - Name: Public Access for Avatars
   - Allowed operation: SELECT
   - Policy definition: true
   
   POLICY 2: Authenticated Upload
   - Name: Authenticated users can upload avatars
   - Allowed operation: INSERT
   - Target roles: authenticated
   - Policy definition: bucket_id = 'avatars'
   
   POLICY 3: Update Own Avatar
   - Name: Users can update own avatars
   - Allowed operation: UPDATE
   - Policy definition: (bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
   
   POLICY 4: Delete Own Avatar
   - Name: Users can delete own avatars
   - Allowed operation: DELETE
   - Policy definition: (bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)

*/
