'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth-helpers';
import type { PostWithUser } from '@/types/post';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

export default function DashboardPage() {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const checkUser = useCallback(async () => {
    const { user } = await getCurrentUser();
    setUser(user);
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data as PostWithUser[]);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkUserAndFetchData = useCallback(async () => {
    await checkUser();
    await fetchPosts();
  }, [checkUser, fetchPosts]);

  useEffect(() => {
    checkUserAndFetchData();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login');
      } else if (event === 'SIGNED_IN' && session.user) {
        await checkUser();
        await fetchPosts();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, checkUserAndFetchData, checkUser, fetchPosts]);



  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">mini_share</h1>
        <div className="flex gap-4">
          {user && (
            <>
              <Link href="/posts/new">
                <Button>Create Post</Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          )}
          {!user && (
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="group overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
            >
              <div className="aspect-square overflow-hidden">
                <Image
                  src={post.image_url}
                  alt={post.title}
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold line-clamp-1">{post.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {post.description}
                </p>
                {post.user && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    by {post.user.username || 'Anonymous'}
                  </p>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
