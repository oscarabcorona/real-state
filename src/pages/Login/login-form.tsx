import { useTheme } from "@/components/ui/theme-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RoleSelectionForm } from "./role-selection-form";
import { LoadingIndicator } from "./loading-indicator";
import { AuthUI } from "./auth-ui";
import { useAuthLogic } from "../../hooks/auth/useAuthLogic";
import { useRoleSelection } from "../../hooks/auth/useRoleSelection";

export function LoginForm() {
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

  const { theme } = useTheme();

  // Render appropriate UI based on state
  if (showRoleSelection) {
    return (
      <RoleSelectionForm
        error={error}
        isLoading={isLoading}
        onSubmit={handleRoleSubmit}
      />
    );
  }

  if (session || isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to Real Estate Management
        </h1>
        <p className="text-muted-foreground text-sm">
          Sign in or create an account to continue
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AuthUI theme={theme} />
    </div>
  );
}
