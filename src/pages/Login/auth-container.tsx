import { Alert, AlertDescription } from "@/components/ui/alert";
import { RoleSelectionForm } from "./role-selection-form";
import { LoadingIndicator } from "./loading-indicator";
import { AuthForm } from "@/components/ui/auth-form";
import { useAuthLogic } from "../../hooks/auth/useAuthLogic";
import { useRoleSelection } from "../../hooks/auth/useRoleSelection";

export function AuthContainer({ view }: { view: "sign_in" | "sign_up" }) {
  const {
    session,
    error,
    setError,
    isLoading,
    setIsLoading,
    showRoleSelection,
    email,
    userId,
  } = useAuthLogic();

  const { handleRoleSubmit } = useRoleSelection({
    userId,
    email,
    setError,
    setIsLoading,
  });

  // Render appropriate UI based on state
  if (showRoleSelection) {
    return (
      <div className="w-full max-w-md mx-auto">
        <RoleSelectionForm
          error={error}
          isLoading={isLoading}
          onSubmit={handleRoleSubmit}
        />
      </div>
    );
  }

  if (session || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="w-full">
      {error && (
        <Alert
          variant="destructive"
          className="mb-6 animate-in fade-in-50 duration-300"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AuthForm
        view={view}
        title="Welcome to Real Estate Management"
        subtitle="Sign in or create an account to continue"
      />
    </div>
  );
}
