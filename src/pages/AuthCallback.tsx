import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

export function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { initialize } = useAuthStore();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        console.log("Auth callback: Handling redirect");
        // Check if we have a session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error("No session found");
        }

        console.log("Auth callback: Session found, checking user");

        // Check if user exists in our database
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (userError) throw userError;

        if (userData) {
          console.log("Auth callback: User found, initializing");
          // User exists, initialize and redirect
          await initialize();
          navigate("/dashboard");
        } else {
          console.log("Auth callback: New user, redirecting to role selection");
          // New user, redirect to role selection
          navigate("/login");
        }
      } catch (err) {
        console.error("Error during auth callback:", err);
        setError(err instanceof Error ? err.message : "Authentication error");
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleRedirect();
  }, [initialize, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-destructive/10 p-4 rounded-md text-destructive max-w-md">
          <h2 className="font-semibold mb-2">Authentication Error</h2>
          <p>{error}</p>
          <p className="mt-2 text-sm">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <p>Completing authentication...</p>
      </div>
    </div>
  );
}
