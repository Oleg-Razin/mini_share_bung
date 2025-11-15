import type { Database } from './database';

export type Post = Database['public']['Tables']['posts']['Row'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type PostUpdate = Database['public']['Tables']['posts']['Update'];

export interface PostWithUser extends Post {
  user?: {
    username: string | null;
    avatar_url: string | null;
  };
}
