'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ensureUserExists } from '@/lib/auth-helpers';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    let isMounted = true;

    const handleAuthCallback = async () => {
      try {
        setStatus('Checking authentication...');
        
        // First, check if there's a session in the URL (from OAuth redirect)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          setStatus('Setting up session...');
          
          // Set the session from the tokens
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (error) throw error;

          if (session?.user && isMounted) {
            setStatus('Setting up user profile...');
            // Ensure user profile exists in database
            await ensureUserExists(session.user.id, session.user.email);
            
            setStatus('Redirecting...');
            // Clean the URL and redirect
            window.history.replaceState({}, document.title, '/callback');
            router.push('/dashboard');
            return;
          }
        }

        // If no tokens in URL, check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error during auth callback:', error);
          if (isMounted) {
            setStatus('Authentication failed');
            setTimeout(() => router.push('/login?error=auth_callback_error'), 2000);
          }
          return;
        }

        if (session?.user && isMounted) {
          // Ensure user profile exists in database
          await ensureUserExists(session.user.id, session.user.email);
          
          setStatus('Redirecting...');
          router.push('/dashboard');
        } else if (isMounted) {
          // No session, redirect to login
          setStatus('No authentication found');
          setTimeout(() => router.push('/login'), 2000);
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        if (isMounted) {
          setStatus('Authentication error occurred');
          setTimeout(() => router.push('/login?error=unexpected_error'), 2000);
        }
      }
    };

    // Handle the auth callback
    handleAuthCallback();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        setStatus('User authenticated, setting up profile...');
        await ensureUserExists(session.user.id, session.user.email);
        setStatus('Redirecting to dashboard...');
        router.push('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
        </div>
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}