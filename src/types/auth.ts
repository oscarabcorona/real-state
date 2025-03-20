import { Json } from './database.types';

export interface User {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  display_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  date_of_birth: string | null;
  bio: string | null;
  preferred_workspace_id: string | null;
  settings: Json | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  region: string | null;
  currency: string | null;
  timezone: string | null;
  is_default: boolean | null;
  settings: Json | null;
  userRole?: string; // owner, admin, member
  created_at: string | null;
  updated_at: string | null;
  owner_id?: string;
}

export interface AuthState {
  user: User | null;
  workspace: Workspace | null;
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
  
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, role: string, workspaceName?: string) => Promise<{
    user: User;
    workspace: Workspace | null;
    workspaces: Workspace[];
  }>;
  signIn: (email: string, password: string) => Promise<{
    user: User;
    workspace: Workspace | null;
    workspaces: Workspace[];
  }>;
  signOut: () => Promise<void>;
  setWorkspace: (workspaceId: string) => Promise<Workspace | undefined>;
  createWorkspace: (workspaceData: {
    name: string;
    description?: string;
    region?: string;
    currency?: string;
    timezone?: string;
  }) => Promise<Workspace>;
}
