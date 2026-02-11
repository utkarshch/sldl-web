import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();

      // Check if we're handling an OAuth redirect
      const isRedirect = window.location.search.includes('code=') ||
        window.location.hash.includes('access_token') ||
        window.location.hash.includes('error_description');

      // Only set loading to false if we have a session OR if we're not waiting for a redirect
      // If we are redirecting, we'll let the onAuthStateChange handler allow the session to settle
      if (session || !isRedirect) {
        set({
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session,
          isLoading: false
        });
      }

      // Listen for changes
      supabase.auth.onAuthStateChange((event, session) => {
        // If we're handling a redirect and get an initial null session, wait for the actual sign in
        if (event === 'INITIAL_SESSION' && !session && isRedirect) {
          return;
        }

        set({
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session,
          isLoading: false
        });
      });

      // Safety timeout: if we're stuck loading for too long implementation, stop loading
      if (isRedirect) {
        setTimeout(() => {
          const current = get();
          if (current.isLoading) {
            set({ isLoading: false });
          }
        }, 5000);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, isAuthenticated: false });
  }
}));
