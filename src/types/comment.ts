import type { Database } from './database';

export type Comment = Database['public']['Tables']['comments']['Row'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type CommentUpdate = Database['public']['Tables']['comments']['Update'];

export interface CommentWithUser extends Comment {
  user?: {
    username: string | null;
    avatar_url: string | null;
  };
}
