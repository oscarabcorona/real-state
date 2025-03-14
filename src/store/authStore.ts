import { create } from 'zustand';
import { AuthState } from '../types/auth';
import { supabase } from '../lib/supabase';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (session?.user) {
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          set({ user: userData || null, loading: false });
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          set({ user: null, loading: false });
        }
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ error: (error as Error).message, loading: false, user: null });
    }
  },

  signUp: async (email: string, password: string, role: string) => {
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!user) throw new Error('No user returned after signup');

      // Create user profile in the users table
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email,
            role: role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (profileError) throw profileError;

      // Don't fetch the profile immediately after creation
      // as it might not be immediately available due to RLS
      set({ error: null });
      return { id: user.id, email: user.email, role: role };
    } catch (error) {
      console.error('Sign up error:', error);
      const message = error instanceof Error ? error.message : 'Failed to create account';
      set({ error: message });
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!session?.user) throw new Error('No session returned after sign in');

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!userData) {
        throw new Error('User profile not found');
      }

      set({ user: userData, error: null });
      return userData;
    } catch (error) {
      console.error('Sign in error:', error);
      const message = error instanceof Error ? error.message : 'Invalid email or password';
      set({ error: message });
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, error: null });
    } catch (error) {
      console.error('Sign out error:', error);
      const message = error instanceof Error ? error.message : 'Failed to sign out';
      set({ error: message });
      throw error;
    }
  },
}));