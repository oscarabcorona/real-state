import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/lib/supabase";

interface AuthUIProps {
  theme: string;
}

export function AuthUI({ theme }: AuthUIProps) {
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

  return (
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
  );
}
