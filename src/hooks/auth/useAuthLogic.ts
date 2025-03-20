import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

export function useAuthLogic() {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { initialize } = useAuthStore();

  // Handle session initialization
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setSession(data.session);
        setUserId(data.session.user.id);

        try {
          // Check if user exists in our database
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", data.session.user.id)
            .maybeSingle();

          if (userError) throw userError;

          if (userData) {
            // User already exists, initialize and redirect
            await initialize();
            const { user } = useAuthStore.getState();

            if (user && user.role) {
              navigate("/dashboard");
            } else {
              // User exists but no role set, show role selection
              setShowRoleSelection(true);
              setEmail(data.session.user.email || "");
            }
          } else {
            // New user, show role selection
            setShowRoleSelection(true);
            setEmail(data.session.user.email || "");
          }
        } catch (err) {
          console.error("Error checking user:", err);
          setError("Failed to retrieve user information");
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession) => {
        console.log("Auth state changed:", event);

        // Fix: Use a type-safe approach for checking auth events
        const isNewUser = event === "USER_UPDATED" && !showRoleSelection;
        const isSignedIn = event === "SIGNED_IN";

        if (isSignedIn || isNewUser) {
          setSession(newSession);
          setUserId(newSession?.user.id || null);

          if (newSession && !showRoleSelection) {
            setIsLoading(true);
            try {
              // Check if user exists in our database
              const { data: userData, error: userError } = await supabase
                .from("users")
                .select("*")
                .eq("id", newSession.user.id)
                .maybeSingle();

              if (userError) throw userError;

              if (userData) {
                // User already exists, initialize and redirect
                await initialize();
                const { user } = useAuthStore.getState();

                if (user && user.role) {
                  navigate("/dashboard");
                } else {
                  // User exists but no role set, show role selection
                  setShowRoleSelection(true);
                  setEmail(newSession.user.email || "");
                }
              } else {
                // New user from sign up, show role selection
                setShowRoleSelection(true);
                setEmail(newSession.user.email || "");
              }
            } catch (err) {
              console.error("Error handling auth state change:", err);
              setError("Failed to process authentication");
            } finally {
              setIsLoading(false);
            }
          }
        }

        if (event === "SIGNED_OUT") {
          setSession(null);
          setUserId(null);
          setShowRoleSelection(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [initialize, navigate, showRoleSelection]);

  return {
    session,
    error,
    setError,
    isLoading,
    setIsLoading,
    showRoleSelection,
    email,
    userId
  };
}
