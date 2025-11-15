import { supabase } from './supabaseClient';

/**
 * Ensures that a user profile exists in the users table.
 * This is important for OAuth users who may not have a profile created yet.
 */
export async function ensureUserExists(userId: string, email?: string) {
  try {
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    // If user doesn't exist, create them
    if (!existingUser && fetchError) {
      const username = email?.split('@')[0] || `user_${userId.substring(0, 8)}`;

      const { error: insertError } = await (supabase
        .from('users')
        .insert as any)({
          id: userId,
          username,
        });

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return { success: false, error: insertError };
      }

      return { success: true, created: true };
    }

    return { success: true, created: false };
  } catch (error) {
    console.error('Error in ensureUserExists:', error);
    return { success: false, error };
  }
}

/**
 * Gets the current authenticated user and ensures their profile exists
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error };
  }

  // Ensure user profile exists in database
  await ensureUserExists(user.id, user.email);

  return { user, error: null };
}
