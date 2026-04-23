'use client';

import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  isOnboarded: boolean;
  isInitialized: boolean;
  setSession: (session: Session | null) => void;
  setIsOnboarded: (value: boolean) => void;
  setIsInitialized: (value: boolean) => void;
  checkOnboardingStatus: (userId: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isOnboarded: false,
  isInitialized: false,

  setSession: (session) => set({ session }),
  setIsOnboarded: (isOnboarded) => set({ isOnboarded }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),

  checkOnboardingStatus: async (userId: string) => {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('users')
      .select('resume_text')
      .eq('id', userId)
      .single();
    set({ isOnboarded: !!data?.resume_text });
  },

  signIn: async (email, password) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signUp: async (email, password, name?: string) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: name ? { data: { full_name: name } } : undefined,
    });
    if (error) throw error;
  },

  signInWithGoogle: async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  },

  signOut: async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    set({ session: null, isOnboarded: false });
  },
}));
