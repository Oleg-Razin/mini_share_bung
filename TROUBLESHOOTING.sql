-- ============================================================
-- TROUBLESHOOTING: Row Level Security Fix
-- Run this in your Supabase SQL Editor if you get RLS errors
-- ============================================================

-- First, let's check if the user profile exists
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
-- SELECT * FROM auth.users; -- Run this first to get your user ID
-- SELECT * FROM users WHERE id = 'YOUR_USER_ID';

-- If no user profile exists, the trigger might not have worked
-- Let's manually create it (replace with your actual user data):
-- INSERT INTO users (id, username) 
-- SELECT id, COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1))
-- FROM auth.users 
-- WHERE id NOT IN (SELECT id FROM users);

-- ============================================================
-- Fix RLS Policies (if needed)
-- ============================================================

-- Drop and recreate posts policies with better debugging
DROP POLICY IF EXISTS "Users can create posts" ON posts;

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id 
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
  );

-- ============================================================
-- Storage Bucket Setup
-- If you haven't created the 'artworks' bucket yet:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create bucket named 'artworks'
-- 3. Make it public
-- 4. Then uncomment and run the policies below
-- ============================================================

-- Uncomment these AFTER creating the bucket:
/*
DROP POLICY IF EXISTS "Anyone can view artworks" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload artworks" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own artworks" ON storage.objects;

CREATE POLICY "Anyone can view artworks"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'artworks');

CREATE POLICY "Authenticated users can upload artworks"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'artworks'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own artworks"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'artworks'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
*/

-- ============================================================
-- Debug Queries
-- Run these to check your setup:
-- ============================================================

-- Check if user profiles exist
-- SELECT 'Users in auth.users:' as info, count(*) as count FROM auth.users
-- UNION ALL
-- SELECT 'Users in users table:' as info, count(*) as count FROM users;

-- Check current user and auth status
-- SELECT 
--   'Current user:' as info,
--   auth.uid() as user_id,
--   auth.role() as role;

-- Check if storage bucket exists
-- SELECT * FROM storage.buckets WHERE id = 'artworks';