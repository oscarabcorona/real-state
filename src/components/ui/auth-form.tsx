import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "./button";
import { Input } from "./input";
import { PasswordInput } from "./password-input";
import { Label } from "./label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./form";

const AUTH_VIEWS = {
  SIGN_IN: "sign_in",
  SIGN_UP: "sign_up",
  FORGOTTEN_PASSWORD: "forgotten_password",
  UPDATE_PASSWORD: "update_password",
} as const;

type AuthView = (typeof AUTH_VIEWS)[keyof typeof AUTH_VIEWS];

interface AuthFormProps extends React.ComponentPropsWithoutRef<"div"> {
  view: AuthView;
  title?: string;
  subtitle?: string;
}

type SupabaseErrorMessage =
  | "Invalid login credentials"
  | "Email not confirmed"
  | "User already registered"
  | "Password should be at least 6 characters"
  | "Rate limit exceeded"
  | "Popup blocked"
  | "Connection error"
  | "Provider not supported";

const ERROR_MESSAGES: Record<SupabaseErrorMessage, string> = {
  "Invalid login credentials": "Invalid email or password. Please try again.",
  "Email not confirmed": "Please verify your email address before signing in.",
  "User already registered": "An account with this email already exists.",
  "Password should be at least 6 characters":
    "Password must be at least 6 characters long.",
  "Rate limit exceeded": "Too many attempts. Please try again later.",
  "Popup blocked": "Please allow popups to sign in with Google.",
  "Connection error":
    "Unable to connect to Google. Please check your internet connection.",
  "Provider not supported": "Google sign-in is not configured properly.",
};

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const passwordSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const authSchema = {
  [AUTH_VIEWS.SIGN_IN]: z.object({
    email: emailSchema.shape.email,
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
  [AUTH_VIEWS.SIGN_UP]: z.object({
    email: emailSchema.shape.email,
    password: passwordSchema.shape.password,
  }),
  [AUTH_VIEWS.FORGOTTEN_PASSWORD]: emailSchema,
  [AUTH_VIEWS.UPDATE_PASSWORD]: passwordSchema,
} as const;

type AuthSchemaType = {
  [K in AuthView]: z.infer<(typeof authSchema)[K]>;
};

const defaultConfig = {
  [AUTH_VIEWS.SIGN_IN]: {
    title: "Login",
    description: "Enter your email below to login to your account",
  },
  [AUTH_VIEWS.SIGN_UP]: {
    title: "Create an account",
    description: "Enter your email below to create your account",
  },
  [AUTH_VIEWS.FORGOTTEN_PASSWORD]: {
    title: "Reset password",
    description: "Enter your email address and we'll send you a reset link",
  },
  [AUTH_VIEWS.UPDATE_PASSWORD]: {
    title: "Update password",
    description: "Enter your new password below",
  },
} as const;

export function AuthForm({
  view: initialView,
  title,
  subtitle,
  className,
  ...props
}: AuthFormProps) {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const [loading, setLoading] = useState(false);

  const formConfig = useMemo(
    () => ({
      resolver: zodResolver(
        authSchema[currentView] as z.ZodType<AuthSchemaType[typeof currentView]>
      ),
      defaultValues: {
        ...(currentView !== AUTH_VIEWS.UPDATE_PASSWORD ? { email: "" } : {}),
        ...(currentView !== AUTH_VIEWS.FORGOTTEN_PASSWORD
          ? { password: "" }
          : {}),
      },
    }),
    [currentView]
  );

  const form = useForm<AuthSchemaType[typeof currentView]>(formConfig);

  const handleAuthError = useCallback((error: unknown) => {
    console.error("Error:", error);
    let errorMessage = "An unexpected error occurred. Please try again.";

    if (error instanceof Error) {
      errorMessage =
        ERROR_MESSAGES[error.message as SupabaseErrorMessage] || error.message;
    }

    toast.error(errorMessage);
  }, []);

  const onSubmit = useCallback(
    async (data: AuthSchemaType[typeof currentView]) => {
      setLoading(true);

      try {
        switch (currentView) {
          case AUTH_VIEWS.SIGN_IN: {
            const { error } = await supabase.auth.signInWithPassword({
              email: (data as AuthSchemaType["sign_in"]).email,
              password: (data as AuthSchemaType["sign_in"]).password,
            });
            if (error) throw error;
            toast.success("You have been signed in successfully");
            break;
          }
          case AUTH_VIEWS.SIGN_UP: {
            const { error } = await supabase.auth.signUp({
              email: (data as AuthSchemaType["sign_up"]).email,
              password: (data as AuthSchemaType["sign_up"]).password,
            });
            if (error) throw error;
            toast.success("We've sent you a confirmation link!", {
              description: "Please check your email",
            });
            break;
          }
          case AUTH_VIEWS.FORGOTTEN_PASSWORD: {
            const { error } = await supabase.auth.resetPasswordForEmail(
              (data as AuthSchemaType["forgotten_password"]).email,
              {
                redirectTo: `${window.location.origin}/update-password`,
              }
            );
            if (error) throw error;
            toast.success("We've sent you a password reset link!", {
              description: "Please check your email",
            });
            break;
          }
          case AUTH_VIEWS.UPDATE_PASSWORD: {
            const { error } = await supabase.auth.updateUser({
              password: (data as AuthSchemaType["update_password"]).password,
            });
            if (error) throw error;
            toast.success("Your password has been updated successfully!");
            break;
          }
        }
      } catch (error) {
        handleAuthError(error);
      } finally {
        setLoading(false);
      }
    },
    [currentView, handleAuthError]
  );

  const handleOAuthSignIn = useCallback(
    async (provider: "google") => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
        });
        if (error) throw error;
      } catch (error) {
        handleAuthError(error);
      }
    },
    [handleAuthError]
  );

  type NonUpdatePasswordView = Exclude<
    AuthView,
    typeof AUTH_VIEWS.UPDATE_PASSWORD
  >;
  const onViewChange = useCallback((view: NonUpdatePasswordView) => {
    setCurrentView(view);
  }, []);

  const showEmailField = currentView !== AUTH_VIEWS.UPDATE_PASSWORD;
  const showPasswordField = currentView !== AUTH_VIEWS.FORGOTTEN_PASSWORD;
  const showOAuthOptions =
    currentView === AUTH_VIEWS.SIGN_IN || currentView === AUTH_VIEWS.SIGN_UP;

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <div className="w-full">
        <div className="flex flex-col gap-6">
          {title || subtitle ? (
            <div className="flex flex-col gap-2 text-center">
              {title && <h1 className="text-2xl font-bold">{title}</h1>}
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          ) : null}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <div className="grid gap-4">
                {showEmailField && (
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              id="email"
                              type="email"
                              placeholder="m@example.com"
                              autoComplete="email"
                              className="h-10"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {showPasswordField && (
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">
                        {currentView === AUTH_VIEWS.UPDATE_PASSWORD
                          ? "New Password"
                          : "Password"}
                      </Label>
                      {currentView === AUTH_VIEWS.SIGN_IN && (
                        <button
                          type="button"
                          onClick={() =>
                            onViewChange(AUTH_VIEWS.FORGOTTEN_PASSWORD)
                          }
                          className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </button>
                      )}
                    </div>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <PasswordInput
                              id="password"
                              autoComplete={
                                currentView === AUTH_VIEWS.SIGN_IN
                                  ? "current-password"
                                  : "new-password"
                              }
                              placeholder={
                                currentView === AUTH_VIEWS.UPDATE_PASSWORD
                                  ? "Enter new password"
                                  : "••••••••"
                              }
                              className="h-10"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-10 mt-2"
                  disabled={loading}
                >
                  {loading ? "Loading..." : defaultConfig[currentView].title}
                </Button>
              </div>

              {showOAuthOptions && (
                <>
                  <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10"
                    onClick={() => handleOAuthSignIn("google")}
                  >
                    {currentView === AUTH_VIEWS.SIGN_IN
                      ? "Login with Google"
                      : "Sign up with Google"}
                  </Button>
                </>
              )}

              {currentView !== AUTH_VIEWS.UPDATE_PASSWORD && (
                <div className="text-center text-sm text-muted-foreground">
                  {currentView === AUTH_VIEWS.SIGN_IN ? (
                    <>
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => onViewChange(AUTH_VIEWS.SIGN_UP)}
                        className="font-medium underline underline-offset-4 hover:text-primary"
                      >
                        Sign up
                      </button>
                    </>
                  ) : currentView === AUTH_VIEWS.SIGN_UP ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => onViewChange(AUTH_VIEWS.SIGN_IN)}
                        className="font-medium underline underline-offset-4 hover:text-primary"
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      Remember your password?{" "}
                      <button
                        type="button"
                        onClick={() => onViewChange(AUTH_VIEWS.SIGN_IN)}
                        className="font-medium underline underline-offset-4 hover:text-primary"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
