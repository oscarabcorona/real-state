import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { useTheme } from "@/components/ui/theme-provider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { initialize } = useAuthStore();
  const { theme } = useTheme();

  // Define a custom theme for the Auth UI
  const customTheme = {
    default: {
      colors: {
        brand: "var(--primary)",
        brandAccent: "var(--primary)",
        brandButtonText: "var(--primary-foreground)",
        defaultButtonBackground: "var(--secondary)",
        defaultButtonBackgroundHover: "var(--muted)",
        defaultButtonBorder: "var(--border)",
        defaultButtonText: "var(--secondary-foreground)",
        dividerBackground: "var(--border)",
        inputBackground: "var(--background)",
        inputBorder: "var(--input)",
        inputBorderHover: "var(--ring)",
        inputBorderFocus: "var(--ring)",
        inputText: "var(--foreground)",
        inputLabelText: "var(--foreground)",
        inputPlaceholder: "var(--muted-foreground)",
        messageText: "var(--foreground)",
        messageTextDanger: "var(--destructive)",
        anchorTextColor: "var(--primary)",
        anchorTextHoverColor: "var(--primary)",
      },
      space: {
        buttonPadding: "10px 15px",
        inputPadding: "10px 15px",
      },
      borderWidths: {
        buttonBorderWidth: "1px",
        inputBorderWidth: "1px",
      },
      radii: {
        borderRadiusButton: "var(--radius)",
        buttonBorderRadius: "var(--radius)",
        inputBorderRadius: "var(--radius)",
      },
      fontSizes: {
        baseBodySize: "14px",
        baseInputSize: "14px",
        baseLabelSize: "14px",
        baseButtonSize: "14px",
      },
      fonts: {
        bodyFontFamily: `var(--font-sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif)`,
        buttonFontFamily: `var(--font-sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif)`,
        inputFontFamily: `var(--font-sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif)`,
        labelFontFamily: `var(--font-sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif)`,
      },
    },
    dark: {
      colors: {
        brand: "var(--primary)",
        brandAccent: "var(--primary)",
        brandButtonText: "var(--primary-foreground)",
        defaultButtonBackground: "var(--secondary)",
        defaultButtonBackgroundHover: "var(--muted)",
        defaultButtonBorder: "var(--border)",
        defaultButtonText: "var(--secondary-foreground)",
        dividerBackground: "var(--border)",
        inputBackground: "var(--background)",
        inputBorder: "var(--input)",
        inputBorderHover: "var(--ring)",
        inputBorderFocus: "var(--ring)",
        inputText: "var(--foreground)",
        inputLabelText: "var(--foreground)",
        inputPlaceholder: "var(--muted-foreground)",
        messageText: "var(--foreground)",
        messageTextDanger: "var(--destructive)",
        anchorTextColor: "var(--primary)",
        anchorTextHoverColor: "var(--primary)",
      },
    },
  };

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

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // Show role selection UI after initial signup
  if (showRoleSelection) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Complete Your Account
          </h1>
          <p className="text-muted-foreground text-sm">
            Select your role to continue
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleRoleSubmit} className="flex flex-col gap-4">
          <div className="space-y-4">
            <RadioGroup
              value={selectedRole}
              onValueChange={setSelectedRole}
              className="gap-4"
            >
              <div className="flex items-start space-x-2 rounded-md border p-3">
                <RadioGroupItem value="tenant" id="tenant" />
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="tenant"
                    className="font-medium cursor-pointer"
                  >
                    I am a Tenant
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Looking to rent a property
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 rounded-md border p-3">
                <RadioGroupItem value="lessor" id="lessor" />
                <div className="flex flex-col gap-1 w-full">
                  <Label
                    htmlFor="lessor"
                    className="font-medium cursor-pointer"
                  >
                    I am a Property Owner
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    I want to manage my properties
                  </p>

                  {selectedRole === "lessor" && (
                    <div className="mt-3">
                      <Label htmlFor="workspace-name">Workspace Name</Label>
                      <Input
                        id="workspace-name"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        placeholder="My Properties"
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" disabled={isLoading || !selectedRole}>
            {isLoading ? "Processing..." : "Complete Setup"}
          </Button>
        </form>
      </div>
    );
  }

  if (session || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <p className="text-sm text-muted-foreground">
          Preparing your dashboard...
        </p>
      </div>
    );
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

      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: customTheme,
        }}
        providers={[]}
        redirectTo={window.location.origin + "/auth/callback"}
        theme={theme === "dark" ? "dark" : "default"}
        socialLayout="horizontal"
        view="sign_in"
        localization={{
          variables: {
            sign_in: {
              email_label: "Email address",
              password_label: "Password",
            },
            sign_up: {
              email_label: "Email address",
              password_label: "Create a password",
            },
          },
        }}
      />
    </div>
  );
}
