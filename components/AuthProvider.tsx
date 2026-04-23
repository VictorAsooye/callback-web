'use client';

import { useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

/**
 * Hydrates the Zustand auth store from Supabase's cookie-based session.
 * Must be rendered inside the root layout so every page gets the session.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession, setIsInitialized } = useAuthStore();

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Hydrate immediately from existing session (covers OAuth callback redirect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitialized(true);
    });

    // Keep store in sync for future sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setIsInitialized]);

  return <>{children}</>;
}
