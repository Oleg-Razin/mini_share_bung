# mini_share Setup Guide

## Quick Start

Your mini_share project is ready to go! Here's everything you need to know to get it running.

## ✅ What's Already Done

- ✅ Next.js 15 project initialized with TypeScript
- ✅ TailwindCSS and shadcn/ui components configured
- ✅ Supabase client setup
- ✅ Complete authentication system (Email + Google OAuth)
- ✅ All pages and routes created
- ✅ TypeScript types defined
- ✅ Database schema SQL file ready
- ✅ Automatic user profile creation helper
- ✅ Build verified and passing

## 🚀 Getting Started

### Step 1: Set up Supabase

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project
3. Wait for the database to be provisioned

### Step 2: Run the Database Setup

1. In your Supabase project, go to the **SQL Editor**
2. Copy the contents of `supabase-setup.sql`
3. Paste and run it in the SQL Editor

This will:
- Create all database tables (users, posts, comments, reactions, blog)
- Set up Row Level Security policies
- **Create an automatic trigger that fixes the "RLS policy" error**
- Add sample blog posts

### Step 3: Create Storage Bucket

1. In Supabase, go to **Storage**
2. Create a new bucket named `artworks`
3. Make it **public**
4. Go back to SQL Editor and run the storage policies from `supabase-setup.sql` (they're commented out at the bottom)

### Step 4: Get Your Supabase Credentials

1. In Supabase, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**

### Step 5: Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you should see your app!

## 🎉 You're Done!

You can now:
- Sign up for an account
- Create posts with images
- Like, love, and react to posts
- Comment on posts
- Read blog posts

## 🔧 The "RLS Policy" Error Fix

The error you encountered ("new row violates row-level security policy") has been fixed in multiple ways:

### 1. Database Trigger (Primary Fix)
The `supabase-setup.sql` file includes a database trigger that automatically creates a user profile whenever someone signs up. This works for:
- Email/password signups
- Google OAuth
- Any other auth method

### 2. Helper Function (Backup)
The `getCurrentUser()` function in `src/lib/auth-helpers.ts` ensures a user profile exists before performing database operations.

### 3. Updated Code
All pages that create database records now use the `getCurrentUser()` helper to ensure the user exists.

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login page
│   │   └── signup/page.tsx         # Signup page
│   ├── dashboard/page.tsx          # Main gallery
│   ├── posts/
│   │   ├── [id]/page.tsx          # View post with comments & reactions
│   │   └── new/page.tsx           # Create new post
│   ├── blog/
│   │   ├── [slug]/page.tsx        # Individual blog post
│   │   └── page.tsx               # Blog list
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Home (redirects to dashboard)
├── components/
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── supabaseClient.ts          # Supabase client
│   ├── auth-helpers.ts            # Auth helper functions
│   └── utils.ts                    # Utility functions
└── types/
    ├── database.ts                 # Database schema types
    ├── user.ts, post.ts, etc.     # Type definitions
```

## 🛠️ Available Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🌐 Routes

- `/` - Redirects to dashboard
- `/login` - Login page
- `/signup` - Signup page
- `/dashboard` - Main gallery
- `/posts/new` - Create new post (requires auth)
- `/posts/[id]` - View individual post
- `/blog` - Blog list
- `/blog/[slug]` - Individual blog post

## 🔒 Authentication Flow

1. User signs up via email or Google OAuth
2. Supabase Auth creates the auth user
3. Database trigger automatically creates user profile in `users` table
4. User can now create posts, comments, and reactions

## 🐛 Troubleshooting

### "Row violates RLS policy" errors
- Make sure you ran the complete `supabase-setup.sql` script
- Check that the database trigger was created
- Verify your environment variables are correct

### Images not uploading
- Make sure you created the `artworks` storage bucket
- Verify it's set to public
- Run the storage policies from the SQL file

### Build errors
- The project uses type assertions (`as any`) for Supabase inserts to work around type issues when env vars aren't set during build
- This is normal and will work fine at runtime

## 📚 Next Steps

1. Customize the styling in `src/app/globals.css`
2. Add more blog posts via Supabase
3. Customize the authentication flow
4. Add user profiles
5. Deploy to Vercel

## 🚢 Deployment

The project is ready to deploy to Vercel:

1. Push your code to GitHub
2. Import the repo in Vercel
3. Add your Supabase environment variables
4. Deploy!

Happy building! 🎨
