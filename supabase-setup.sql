-- ============================================================
-- mini_share - Supabase Database Setup
-- Run this entire script in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Tables
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reactions table
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id, type)
);

-- Blog table
CREATE TABLE IF NOT EXISTS blog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Automatic User Profile Creation
-- ============================================================

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Users can create posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

DROP POLICY IF EXISTS "Reactions are viewable by everyone" ON reactions;
DROP POLICY IF EXISTS "Users can create reactions" ON reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON reactions;

DROP POLICY IF EXISTS "Blog posts are viewable by everyone" ON blog;

-- Users table policies
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Posts table policies
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- Comments table policies
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Reactions table policies
CREATE POLICY "Reactions are viewable by everyone"
  ON reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can create reactions"
  ON reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Blog table policies
CREATE POLICY "Blog posts are viewable by everyone"
  ON blog FOR SELECT
  USING (true);

-- ============================================================
-- Storage Bucket Setup
-- Instructions:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create a new bucket named 'artworks'
-- 3. Make it public
-- 4. Then run the policies below
-- ============================================================

-- Storage policies (run these AFTER creating the 'artworks' bucket)
-- DROP POLICY IF EXISTS "Anyone can view artworks" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload artworks" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete own artworks" ON storage.objects;

-- CREATE POLICY "Anyone can view artworks"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'artworks');

-- CREATE POLICY "Authenticated users can upload artworks"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'artworks'
--     AND auth.role() = 'authenticated'
--   );

-- CREATE POLICY "Users can delete own artworks"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'artworks'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- ============================================================
-- Sample Blog Posts (Optional)
-- ============================================================

INSERT INTO blog (title, slug, content, created_at)
VALUES
  (
    'Welcome to mini_share!',
    'welcome-to-mini-share',
    'Welcome to mini_share, the ultimate community for miniature artists! Here you can share your amazing artwork, get inspired by others, and connect with fellow miniature enthusiasts.

We''re excited to have you join our growing community. Feel free to upload your latest creations and engage with other artists through comments and reactions.

Happy painting!',
    NOW()
  ),
  (
    'Tips for Photographing Miniatures',
    'tips-for-photographing-miniatures',
    'Getting great photos of your miniatures can be challenging, but with these tips, you''ll be capturing stunning images in no time:

1. Lighting is Everything - Use diffused natural light or a lightbox for best results
2. Background Matters - Use a neutral background to make your miniature pop
3. Get Close - Macro lenses or macro mode on your phone work wonders
4. Steady Your Shot - Use a tripod or stable surface to avoid blur
5. Multiple Angles - Show off different sides of your work

Remember, the better your photos, the more love your posts will get!',
    NOW()
  ),
  (
    'Community Guidelines',
    'community-guidelines',
    'To keep mini_share a friendly and inspiring place for everyone, please follow these simple guidelines:

- Be respectful and constructive in your comments
- Only post your own original work
- Give credit where credit is due
- No spam or self-promotion outside of your artwork posts
- Report any inappropriate content to moderators

Together, we can build an amazing community of miniature artists. Thank you for being part of mini_share!',
    NOW()
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Setup Complete!
-- ============================================================
-- Next steps:
-- 1. Go to Storage and create 'artworks' bucket
-- 2. Make the bucket public
-- 3. Uncomment and run the storage policies above
-- 4. Configure your .env.local with Supabase credentials
-- 5. Start building!
-- ============================================================
