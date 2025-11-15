export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          title: string
          image_url: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          image_url: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          image_url?: string
          description?: string | null
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      reactions: {
        Row: {
          id: string
          post_id: string
          user_id: string
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          type: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          type?: string
          created_at?: string
        }
      }
      blog: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          created_at?: string
        }
      }
    }
  }
}
