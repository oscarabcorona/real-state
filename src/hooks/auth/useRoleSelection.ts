 
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

interface UseRoleSelectionProps {
  userId: string | null;
  email: string;
  setError: (error: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export function useRoleSelection({ 
  userId, 
  email, 
  setError, 
  setIsLoading 
}: UseRoleSelectionProps) {
  const navigate = useNavigate();
  const { initialize } = useAuthStore();
  
  const handleRoleSubmit = async (
    selectedRole: string,
    workspaceName: string
  ) => {
    setIsLoading(true);
    setError("");

    if (!userId) {
      setError("User ID is missing. Please try logging in again.");
      setIsLoading(false);
      return;
    }

    try {
      if (!selectedRole) {
        throw new Error("Please select a role");
      }

      if (selectedRole === "lessor" && !workspaceName.trim()) {
        throw new Error("Please provide a workspace name");
      }

      console.log("Creating user with role:", selectedRole);

      // Create the user record with role
      const { error: userError } = await supabase.from("users").upsert({
        id: userId,
        email,
        role: selectedRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (userError) throw userError;

      // For lessors, create a workspace
      if (selectedRole === "lessor") {
        const { error: workspaceError } = await supabase
          .from("workspaces")
          .insert([
            {
              name: workspaceName,
              description: "My default workspace",
              owner_id: userId,
              is_default: true,
            },
          ]);

        if (workspaceError) throw workspaceError;
      }

      // Initialize user data after creating their profile
      await initialize();

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Role selection error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to complete signup"
      );
      setIsLoading(false);
    }
  };

  return { handleRoleSubmit };
}
