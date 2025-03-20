import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Session } from "@supabase/supabase-js";
import { useTheme } from "@/components/ui/theme-provider";

export function LoginForm() {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
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

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        if (session) {
          try {
            await initialize();
            navigate("/dashboard");
          } catch (err) {
            const message =
              err instanceof Error
                ? err.message
                : "Failed to initialize user data";
            setError(message);
          }
        }
      });

      return () => subscription.unsubscribe();
    };

    initAuth();
  }, [navigate, initialize]);

  if (session) {
    return (
      <div className="flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
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
        appearance={{ theme: customTheme }}
        providers={["google", "github"]}
        redirectTo={window.location.origin + "/dashboard"}
        theme={theme === "dark" ? "dark" : "default"}
        socialLayout="horizontal"
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
