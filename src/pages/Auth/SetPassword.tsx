import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, LoaderCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

// Import our auth service
import { checkUserSession, updateUserPassword } from "@/services/authService";

export default function SetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Define password form schema with Zod
  const FormSchema = z
    .object({
      password: z.string().min(6, {
        message: t("auth.setPassword.passwordTooShort"),
      }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.setPassword.passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });

  // Initialize React Hook Form
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Check for active session
        const { session, hasActiveSession } = await checkUserSession();

        if (!hasActiveSession) {
          // No active session
          setError(t("auth.setPassword.noValidSession"));
          setIsSessionValid(false);
          return;
        }

        // User is logged in
        setUserEmail(session?.user?.email || null);
        setIsSessionValid(true);
      } catch (err) {
        console.error("Error initializing session:", err);
        setError(t("auth.setPassword.sessionError"));
        setIsSessionValid(false);
      }
    };

    initializeSession();
  }, [t]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!isSessionValid) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check for active session
      const { hasActiveSession } = await checkUserSession();

      if (!hasActiveSession) {
        setError(t("auth.setPassword.noValidSession"));
        return;
      }

      // Update the user's password
      await updateUserPassword(data.password);

      // Display success message
      toast.success(t("auth.setPassword.success", "Password Updated"), {
        description: t(
          "auth.setPassword.successDescription",
          "Your password has been successfully updated."
        ),
      });

      // Redirect to login
      navigate("/login");
    } catch (err) {
      console.error("Error setting password:", err);

      if (err instanceof Error) {
        if (err.message.includes("expired")) {
          setError(t("auth.setPassword.linkExpired"));
        } else if (err.message.includes("invalid")) {
          setError(t("auth.setPassword.invalidLink"));
        } else {
          setError(err.message);
        }
      } else {
        setError(t("auth.setPassword.errorGeneric"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {t("auth.setPassword.title", "Set Your Password")}
          </CardTitle>
          <CardDescription className="text-center">
            {t(
              "auth.setPassword.description",
              "Create a new password for your account"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSessionValid === false ? (
            <div className="text-center py-6 text-destructive">
              <p>{error || t("auth.setPassword.invalidLink")}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/auth/login")}
              >
                {t("auth.setPassword.goToLogin", "Go to Login")}
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {userEmail && (
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      {t("auth.setPassword.email", "Email")}
                    </Label>
                    <p className="font-medium">{userEmail}</p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="password">
                        {t("auth.setPassword.password", "Password")}
                      </Label>
                      <div className="relative">
                        <FormControl>
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className="pr-10"
                            disabled={isLoading}
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="confirmPassword">
                        {t(
                          "auth.setPassword.confirmPassword",
                          "Confirm Password"
                        )}
                      </Label>
                      <div className="relative">
                        <FormControl>
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            className={`pr-10 ${
                              form.formState.errors.confirmPassword
                                ? "border-destructive focus-visible:ring-destructive"
                                : form.getValues("confirmPassword") &&
                                  form.getValues("password") ===
                                    form.getValues("confirmPassword")
                                ? "border-green-500 focus-visible:ring-green-500"
                                : ""
                            }`}
                            disabled={isLoading}
                            placeholder="••••••••"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              // Trigger validation on confirmPassword when it changes
                              if (
                                form.getValues("password") &&
                                e.target.value
                              ) {
                                form.trigger("confirmPassword");
                              }
                            }}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showConfirmPassword
                              ? "Hide password"
                              : "Show password"}
                          </span>
                        </Button>
                      </div>
                      <FormMessage />
                      {form.getValues("confirmPassword") &&
                        form.getValues("password") ===
                          form.getValues("confirmPassword") &&
                        !form.formState.errors.confirmPassword && (
                          <p className="text-xs text-green-500 mt-1">
                            {t(
                              "auth.setPassword.passwordsMatch",
                              "Passwords match"
                            )}
                          </p>
                        )}
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="text-sm font-medium text-destructive">
                    {error}
                  </div>
                )}

                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      {t("auth.setPassword.setting", "Setting Password...")}
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      {t("auth.setPassword.submit", "Set Password")}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
