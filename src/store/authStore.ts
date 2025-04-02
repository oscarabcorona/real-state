import { create } from 'zustand';
import { AuthState, WorkspaceType } from '../types/auth';
import { supabase } from '../lib/supabase';
import type { Country } from '@/pages/Documents/types';

// Map of country codes to our Country type
const COUNTRY_MAPPINGS: Record<string, Country> = {
  'US': 'USA',
  'GT': 'GUATEMALA',
  'CA': 'CANADA',
  'MX': 'MEXICO'
};

interface LocationState {
  country: Country;
  isLoading: boolean;
}

export const useAuthStore = create<AuthState & LocationState>((set, get) => ({
  user: null,
  workspace: null,
  workspaces: [],
  loading: true,
  error: null,
  country: 'USA',
  isLoading: true,

  initialize: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (session?.user) {
        try {
          // Fetch user profile
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!userData) {
            set({ user: null, workspace: null, workspaces: [], loading: false });
            return;
          }

          // Fetch user's workspaces
          const { data: workspacesData } = await supabase
            .from('user_workspaces')
            .select(`
              workspace_id,
              role,
              workspaces:workspace_id (*)
            `)
            .eq('user_id', session.user.id);

          const workspaces: WorkspaceType[] = workspacesData?.map(item => ({
            ...item.workspaces,
            userRole: item.role
          })) || [];

          // Determine active workspace
          let activeWorkspace: WorkspaceType | null = null;
          if (userData.preferred_workspace_id && workspaces.length > 0) {
            activeWorkspace = workspaces.find(w => w.id === userData.preferred_workspace_id) || workspaces[0];
          } else if (workspaces.length > 0) {
            // Try to find default workspace first
            activeWorkspace = workspaces.find(w => w.is_default) || workspaces[0];
          }

          // Get user's location
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                try {
                  const { latitude, longitude } = position.coords;
                  // Use reverse geocoding to get country code
                  const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                  );
                  const data = await response.json();
                  const countryCode = data.address.country_code.toUpperCase();
                  
                  // Map country code to our Country type
                  const mappedCountry = COUNTRY_MAPPINGS[countryCode] || 'USA';
                  set({ country: mappedCountry, isLoading: false });
                } catch (error) {
                  console.error('Error getting country from location:', error);
                  // Fallback to USA if there's an error
                  set({ country: 'USA', isLoading: false });
                }
              },
              (error) => {
                console.error('Error getting location:', error);
                // Fallback to USA if user denies location access
                set({ country: 'USA', isLoading: false });
              }
            );
          } else {
            // Fallback to USA if geolocation is not supported
            set({ country: 'USA', isLoading: false });
          }

          set({ 
            user: userData, 
            workspace: activeWorkspace, 
            workspaces,
            loading: false 
          });
        } catch (error) {
          console.error('Failed to fetch user profile or workspaces:', error);
          set({ user: null, workspace: null, workspaces: [], loading: false });
        }
      } else {
        set({ user: null, workspace: null, workspaces: [], loading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ 
        error: (error as Error).message, 
        loading: false, 
        user: null,
        workspace: null,
        workspaces: []
      });
    }
  },

  signUp: async (email: string, password: string, role: string, workspaceName?: string) => {
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!user) throw new Error('No user returned after signup');

      // Create user profile in the users table
      const { error: profileError, data: userData } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: email,  
          role: role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // For lessors, create a default workspace if name provided
      let workspace: WorkspaceType | null = null;
      if (role === 'lessor') {
        const defaultWorkspaceName = workspaceName || 'My Properties';
        
        const { data: workspaceData, error: workspaceError } = await supabase
          .from('workspaces')
          .insert([
            {
              name: defaultWorkspaceName,
              description: 'My default workspace',
              owner_id: user.id,
              is_default: true
            }
          ])
          .select()
          .single();
          
        if (workspaceError) throw workspaceError;
        
        // Add user to workspace
        const { error: membershipError } = await supabase
          .from('user_workspaces')
          .insert([
            {
              user_id: user.id,
              workspace_id: workspaceData.id,
              role: 'owner'
            }
          ]);
          
        if (membershipError) throw membershipError;
        
        workspace = {
          ...workspaceData,
          userRole: 'owner'
        };
        
        // Update user's preferred workspace
        await supabase
          .from('users')
          .update({ preferred_workspace_id: workspaceData.id })
          .eq('id', user.id);
      }

      const workspaces = workspace ? [workspace] : [];

      set({ 
        error: null,
        user: userData,
        workspace,
        workspaces
      });
      
      return { 
        user: userData, 
        workspace,
        workspaces
      };
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

      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (userError) throw userError;
      if (!userData) throw new Error('User profile not found');

      // Fetch user's workspaces
      const { data: workspacesData, error: workspacesError } = await supabase
        .from('user_workspaces')
        .select(`
          workspace_id,
          role,
          workspaces:workspace_id (*)
        `)
        .eq('user_id', session.user.id);

      if (workspacesError) throw workspacesError;

      const workspaces: WorkspaceType[] = workspacesData?.map(item => ({
        ...item.workspaces,
        userRole: item.role
      })) || [];

      // Determine active workspace
      let activeWorkspace = null;
      if (userData.preferred_workspace_id && workspaces.length > 0) {
        activeWorkspace = workspaces.find(w => w.id === userData.preferred_workspace_id) || workspaces[0];
      } else if (workspaces.length > 0) {
        // Try to find default workspace first
        activeWorkspace = workspaces.find(w => w.is_default) || workspaces[0];
      }

      set({ 
        user: userData, 
        workspace: activeWorkspace, 
        workspaces,
        error: null 
      });
      
      return { 
        user: userData, 
        workspace: activeWorkspace, 
        workspaces 
      };
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
      set({ user: null, workspace: null, workspaces: [], error: null });
    } catch (error) {
      console.error('Sign out error:', error);
      const message = error instanceof Error ? error.message : 'Failed to sign out';
      set({ error: message });
      throw error;
    }
  },

  setWorkspace: async (workspaceId: string) => {
    const { workspaces, user } = get();
    
    if (!user || !workspaces.length) return;
    
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) return;
    
    try {
      // Update user's preferred workspace
      await supabase
        .from('users')
        .update({ preferred_workspace_id: workspaceId })
        .eq('id', user.id);
        
      set({ 
        workspace,
        user: { ...user, preferred_workspace_id: workspaceId } 
      });
      
      return workspace;
    } catch (error) {
      console.error('Error setting workspace:', error);
      throw error;
    }
  },

  createWorkspace: async (workspaceData: {
    name: string;
    description?: string;
    region?: string;
    currency?: string;
    timezone?: string;
  }) => {
    const { user } = get();
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Create new workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert([
          {
            ...workspaceData,
            owner_id: user.id
          }
        ])
        .select()
        .single();
        
      if (workspaceError) throw workspaceError;
      
      // Add user to workspace
      const { error: membershipError } = await supabase
        .from('user_workspaces')
        .insert([
          {
            user_id: user.id,
            workspace_id: workspace.id,
            role: 'owner'
          }
        ]);
        
      if (membershipError) throw membershipError;
      
      // Add to state
      const newWorkspace: WorkspaceType = {
        ...workspace,
        userRole: 'owner'
      };
      
      const updatedWorkspaces = [...get().workspaces, newWorkspace];
      
      set({
        workspaces: updatedWorkspaces,
        workspace: newWorkspace
      });
      
      // Update user preference
      await supabase
        .from('users')
        .update({ preferred_workspace_id: workspace.id })
        .eq('id', user.id);
        
      set({
        user: { ...user, preferred_workspace_id: workspace.id }
      });
      
      return newWorkspace;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  }
}));