# mini_share

A community web app for miniature artists to share, discover, and interact with amazing artwork.

## Features

- **User Authentication** - Email/Password and Google OAuth via Supabase Auth
- **Post Gallery** - Browse artworks in a responsive grid layout
- **High-res Image Uploads** - Share your miniature art with the community
- **Social Interactions** - Like, love, and react to posts
- **Comments** - Engage with the community through comments
- **User Profiles** - Manage your profile and artwork
- **Blog** - Read community posts and updates
- **Light/Dark Mode** - Automatic theme switching

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Styling:** TailwindCSS + shadcn/ui
- **Backend:** Supabase (Auth, Database, Storage)
- **Database:** PostgreSQL (via Supabase)
- **Deployment:** Vercel

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account (free tier works great!)
- npm or yarn package manager

## Getting Started

### 1. Clone the repository

```bash
git clone git@github.com:Oleg-Razin/mini_share_bung.git
cd mini_share
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [https://app.supabase.com](https://app.supabase.com)
2. Go to **Settings > API** and copy your project URL and anon key
3. Set up the database schema (see Database Schema section below)
4. Create a storage bucket named `artworks` and set it to public

### 4. Configure environment variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Set up the database schema

Copy the contents of `supabase-setup.sql` and run it in your Supabase SQL editor.

This script will:
- Create all necessary tables
- Set up Row Level Security policies
- Create an automatic trigger to create user profiles (fixes RLS issues!)
- Add sample blog posts

Alternatively, you can run these SQL commands manually in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reactions table
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id, type)
);

-- Blog table
CREATE TABLE blog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for posts table
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Policies for comments table
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Policies for reactions table
CREATE POLICY "Reactions are viewable by everyone" ON reactions FOR SELECT USING (true);
CREATE POLICY "Users can create reactions" ON reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions" ON reactions FOR DELETE USING (auth.uid() = user_id);

-- Policies for blog table
CREATE POLICY "Blog posts are viewable by everyone" ON blog FOR SELECT USING (true);
```

### 6. Configure Google OAuth (Optional)

1. Go to **Authentication > Providers** in Supabase
2. Enable Google provider
3. Add your Google OAuth credentials
4. Add authorized redirect URLs

### 7. Create storage bucket

1. Go to **Storage** in Supabase
2. Create a new bucket named `artworks`
3. Make it **public**
4. Set up storage policies:

```sql
-- Storage policies for artworks bucket
CREATE POLICY "Anyone can view artworks"
ON storage.objects FOR SELECT
USING (bucket_id = 'artworks');

CREATE POLICY "Authenticated users can upload artworks"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'artworks' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own artworks"
ON storage.objects FOR DELETE
USING (bucket_id = 'artworks' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 8. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login page
│   │   └── signup/page.tsx         # Signup page
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard layout
│   │   └── page.tsx                # Main gallery page
│   ├── (posts)/
│   │   ├── [id]/page.tsx          # Individual post view
│   │   └── new/page.tsx           # Create new post
│   ├── (blog)/
│   │   ├── [slug]/page.tsx        # Blog post view
│   │   └── page.tsx               # Blog list
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home page (redirects to dashboard)
│   └── globals.css                 # Global styles
├── components/
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── supabaseClient.ts          # Supabase client setup
│   └── utils.ts                    # Utility functions
└── types/
    ├── database.ts                 # Database types
    ├── user.ts                     # User types
    ├── post.ts                     # Post types
    ├── comment.ts                  # Comment types
    └── reaction.ts                 # Reaction types
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Oleg-Razin/mini_share_bung)

## Development Roadmap

### MVP (Complete)
- ✅ Authentication
- ✅ Post uploads
- ✅ Gallery view
- ✅ Basic interactions

### v2 (In Progress)
- ✅ Comments
- ✅ Reactions
- ✅ Blog

### v3 (Planned)
- 🔲 User profiles
- 🔲 Follow system
- 🔲 Notifications

### v4 (Future)
- 🔲 Search functionality
- 🔲 Filters and tags
- 🔲 Pagination
- 🔲 Image optimization

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions, please open an issue on GitHub.
