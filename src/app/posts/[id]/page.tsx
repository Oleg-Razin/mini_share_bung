'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth-helpers';
import type { PostWithUser } from '@/types/post';
import type { CommentWithUser, CommentInsert } from '@/types/comment';
import type { Reaction, ReactionInsert } from '@/types/reaction';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function PostPage() {
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<PostWithUser | null>(null);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    fetchPost();
    fetchComments();
    fetchReactions();
  }, [postId]);

  const checkUser = async () => {
    const { user } = await getCurrentUser();
    setUser(user);
  };

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(username, avatar_url)
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;
      setPost(data as PostWithUser);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data as CommentWithUser[]);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('post_id', postId);

      if (error) throw error;
      setReactions(data);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      const commentData: CommentInsert = {
        post_id: postId,
        user_id: user.id,
        content: newComment,
      };

      const { error } = await (supabase
        .from('comments')
        .insert as any)(commentData);

      if (error) throw error;

      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const addReaction = async (type: 'like' | 'love' | 'wow') => {
    if (!user) return;

    try {
      // Check if user already reacted
      const existing = reactions.find(
        (r) => r.user_id === user.id && r.type === type
      );

      if (existing) {
        // Remove reaction
        await supabase.from('reactions').delete().eq('id', existing.id);
      } else {
        // Add reaction
        const reactionData: ReactionInsert = {
          post_id: postId,
          user_id: user.id,
          type,
        };
        await (supabase.from('reactions').insert as any)(reactionData);
      }

      fetchReactions();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const getReactionCount = (type: string) => {
    return reactions.filter((r) => r.type === type).length;
  };

  const hasUserReacted = (type: string) => {
    return user && reactions.some((r) => r.user_id === user.id && r.type === type);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Post not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4">
        <Link href="/projects">
          <Button variant="ghost">← Back to Projects</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div>
              <p className="font-semibold">
                {post.user?.username || 'Anonymous'}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg">
            <img
              src={post.image_url}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <p className="mt-2 text-muted-foreground">{post.description}</p>
          </div>

          {/* Reactions */}
          <div className="flex gap-2">
            {['like', 'love', 'wow'].map((type) => (
              <Button
                key={type}
                variant={hasUserReacted(type) ? 'default' : 'outline'}
                size="sm"
                onClick={() => addReaction(type as any)}
                disabled={!user}
              >
                {type === 'like' && '👍'}
                {type === 'love' && '❤️'}
                {type === 'wow' && '😮'}
                <span className="ml-1">{getReactionCount(type)}</span>
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start space-y-4">
          <h2 className="text-lg font-semibold">Comments</h2>

          {user ? (
            <div className="w-full space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button onClick={addComment}>Post Comment</Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>{' '}
              to comment
            </p>
          )}

          <div className="w-full space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border p-3">
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      {comment.user?.username || 'Anonymous'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {comment.content}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
