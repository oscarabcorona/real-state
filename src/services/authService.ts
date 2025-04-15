import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Check if there's an active session
 */
export const checkUserSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    return { 
      session: data.session,
      hasActiveSession: !!data.session
    };
  } catch (error) {
    console.error('Error checking session:', error);
    throw error;
  }
};

/**
 * Update the user's password
 */
export const updateUserPassword = async (password: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};
