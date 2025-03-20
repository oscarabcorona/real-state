import { Database } from "./database.types";

export type UserType = Database["public"]["Tables"]["users"]["Row"];
export type WorkspaceType = Database["public"]["Tables"]["workspaces"]["Row"] & {
  userRole: string;
};

export interface AuthState {
  user: UserType | null;
  workspace: WorkspaceType | null;
  workspaces: WorkspaceType[];
  loading: boolean;
  error: string | null;
  
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, role: string, workspaceName?: string) => Promise<{
    user: UserType;
    workspace: WorkspaceType | null;
    workspaces: WorkspaceType[];
  }>;
  signIn: (email: string, password: string) => Promise<{
    user: UserType;
    workspace: WorkspaceType | null;
    workspaces: WorkspaceType[];
  }>;
  signOut: () => Promise<void>;
  setWorkspace: (workspaceId: string) => Promise<WorkspaceType | undefined>;
  createWorkspace: (workspaceData: {
    name: string;
    description?: string;
    region?: string;
    currency?: string;
    timezone?: string;
  }) => Promise<WorkspaceType>;
}
