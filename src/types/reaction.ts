import type { Database } from './database';

export type Reaction = Database['public']['Tables']['reactions']['Row'];
export type ReactionInsert = Database['public']['Tables']['reactions']['Insert'];
export type ReactionUpdate = Database['public']['Tables']['reactions']['Update'];

export type ReactionType = 'like' | 'love' | 'wow';
