'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PostWithUser } from '@/types/post';

export default function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState<PostWithUser[]>([]);
  const [recentBlogPosts, setRecentBlogPosts] = useState<{
    id: number;
    title: string;
    excerpt: string;
    date: string;
    slug: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomePageData = async () => {
      try {
        // Fetch featured projects (latest 3 posts)
        const { data: projects, error: projectsError } = await supabase
          .from('posts')
          .select(`
            *,
            user:users(username, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(3);

        if (projectsError) throw projectsError;
        setFeaturedProjects(projects as PostWithUser[]);

        // For now, we'll create some mock blog posts
        // Later you can create a separate blog table
        setRecentBlogPosts([
          {
            id: 1,
            title: 'Welcome to mini_share',
            excerpt: 'Discover amazing projects and connect with creators around the world.',
            date: '2024-11-15',
            slug: 'welcome-to-mini-share'
          },
          {
            id: 2,
            title: 'How to Share Your First Project',
            excerpt: 'A step-by-step guide to sharing your creative work on our platform.',
            date: '2024-11-14',
            slug: 'how-to-share-your-first-project'
          }
        ]);

      } catch (error) {
        console.error('Error loading home page data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomePageData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              mini_share
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/projects" className="text-muted-foreground hover:text-foreground">
                Projects
              </Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                Blog
              </Link>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-linear-to-b from-background to-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Share Your Creative
            <span className="block bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Projects
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover amazing projects, connect with creators, and showcase your own work to the world.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/projects">
              <Button size="lg">
                Explore Projects
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline">
                Start Sharing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Featured Projects</h2>
              <p className="text-muted-foreground mt-2">Check out these amazing projects from our community</p>
            </div>
            <Link href="/projects">
              <Button variant="outline">View All Projects</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No projects yet. Be the first to share!</p>
                <Link href="/posts/new" className="mt-4 inline-block">
                  <Button>Share Your Project</Button>
                </Link>
              </div>
            ) : (
              featuredProjects.map((project) => (
                <Card key={project.id} className="group overflow-hidden transition-all hover:shadow-lg">
                  <div className="aspect-square overflow-hidden">
                    <Image
                      src={project.image_url}
                      alt={project.title}
                      width={400}
                      height={400}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {project.user && (
                      <p className="text-sm text-muted-foreground">
                        by {project.user.username || 'Anonymous'}
                      </p>
                    )}
                    <Link href={`/posts/${project.id}`} className="mt-4 inline-block">
                      <Button variant="outline" size="sm">View Project</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Latest from Blog</h2>
              <p className="text-muted-foreground mt-2">Tips, tutorials, and community highlights</p>
            </div>
            <Link href="/blog">
              <Button variant="outline">View All Posts</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentBlogPosts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{post.date}</span>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="outline" size="sm">Read More</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">mini_share</h3>
          <p className="text-muted-foreground mb-6">
            Share your creativity with the world
          </p>
          <div className="flex justify-center gap-6">
            <Link href="/projects" className="text-muted-foreground hover:text-foreground">
              Projects
            </Link>
            <Link href="/blog" className="text-muted-foreground hover:text-foreground">
              Blog
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
