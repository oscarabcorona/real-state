import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, LoaderCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isInvitation, setIsInvitation] = useState(false);
  const [invitationData, setInvitationData] = useState<{
    invitationId?: string;
    propertyId?: string;
    propertyName?: string;
    inviteType?: string;
    inviterName?: string;
  } | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Extract hash parameters if they exist
        let token = null;
        let invitationId = null;
        let tokenType = null;

        if (location.hash) {
          const hashParams = new URLSearchParams(location.hash.substring(1));
          token = hashParams.get("access_token");
          tokenType = hashParams.get("type");
        }

        // Check query params for invitation ID
        const searchParams = new URLSearchParams(location.search);
        invitationId = searchParams.get("invitation");

        if (invitationId) {
          setIsInvitation(true);
        }

        // Verify the user is authenticated
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData.session) {
          // No active session, check if we have a token to sign in with
          if (token && tokenType === "recovery") {
            // This is a recovery flow, which is what inviteUserByEmail uses
            const { data: userData, error: userError } =
              await supabase.auth.getUser(token);

            if (userError || !userData.user) {
              setError(t("auth.setPassword.invalidOrExpiredLink"));
              setIsTokenValid(false);
              return;
            }

            setUserEmail(userData.user.email || null);

            // If this is an invitation, get the metadata
            if (userData.user.user_metadata) {
              const metadata = userData.user.user_metadata;

              if (metadata.invitation_id) {
                setInvitationData({
                  invitationId: metadata.invitation_id,
                  propertyId: metadata.property_id,
                  propertyName: metadata.property_name,
                  inviteType: metadata.invite_type,
                  inviterName: metadata.inviter_name,
                });

                setIsInvitation(true);
              }
            }

            setIsTokenValid(true);
          } else {
            setError(t("auth.setPassword.noValidSession"));
            setIsTokenValid(false);
          }
        } else {
          // User is already logged in
          setUserEmail(sessionData.session.user.email);

          // If there's an invitation ID, get the details
          if (invitationId) {
            // For logged-in users, we can check the invite directly
            const { data: inviteData, error: inviteError } = await supabase
              .from("property_invites")
              .select(
                `
                id, 
                property_id, 
                invite_type, 
                email, 
                status, 
                properties:property_id (name), 
                users:created_by (full_name)
              `
              )
              .eq("id", invitationId)
              .single();

            if (!inviteError && inviteData) {
              setInvitationData({
                invitationId: inviteData.id,
                propertyId: inviteData.property_id,
                propertyName: inviteData.properties?.name,
                inviteType: inviteData.invite_type,
                inviterName: inviteData.users?.full_name,
              });
            }
          }

          setIsTokenValid(true);
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setError(t("auth.setPassword.sessionError"));
        setIsTokenValid(false);
      }
    };

    checkSession();
  }, [location, t]);

  // Validate password strength
  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return t("auth.setPassword.passwordTooShort");
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error state
    setError(null);

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Confirm passwords match
    if (password !== confirmPassword) {
      setError(t("auth.setPassword.passwordsDoNotMatch"));
      return;
    }

    setIsLoading(true);

    try {
      // Get current session
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        // No session - use the recovery flow to set password
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
          throw error;
        }

        // Try to sign in if we have an email
        if (userEmail) {
          await supabase.auth.signInWithPassword({
            email: userEmail,
            password,
          });
        }
      }

      // After setting password or for already logged-in users
      // If we have invitation data, accept it
      if (isInvitation && invitationData?.invitationId) {
        // Now we need to get the current user ID
        const { data: userData } = await supabase.auth.getUser();

        if (userData?.user) {
          // Accept the invitation
          await supabase.functions.invoke("set-password", {
            body: {
              invitationId: invitationData.invitationId,
              userId: userData.user.id,
            },
          });
        }
      }

      // Display appropriate success message
      if (isInvitation) {
        toast.success(
          t("auth.setPassword.inviteSuccess", "Invitation Accepted"),
          {
            description: t(
              "auth.setPassword.inviteSuccessDescription",
              "Your password has been set and you now have access to the property."
            ),
          }
        );

        // Redirect to property dashboard or similar
        navigate("/dashboard");
      } else {
        toast.success(t("auth.setPassword.success", "Password Updated"), {
          description: t(
            "auth.setPassword.successDescription",
            "Your password has been successfully updated."
          ),
        });

        // If not an invitation, go to login
        navigate("/auth/login");
      }
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
            {isInvitation
              ? t("auth.setPassword.inviteTitle", "Accept Invitation")
              : t("auth.setPassword.title", "Set Your Password")}
          </CardTitle>
          <CardDescription className="text-center">
            {isInvitation
              ? t(
                  "auth.setPassword.inviteDescription",
                  "Create a password to access your new account"
                )
              : t(
                  "auth.setPassword.description",
                  "Create a new password for your account"
                )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTokenValid === false ? (
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {userEmail && (
                <div>
                  <Label className="text-sm text-muted-foreground">
                    {t("auth.setPassword.email", "Email")}
                  </Label>
                  <p className="font-medium">{userEmail}</p>
                </div>
              )}

              {isInvitation && invitationData && (
                <div className="space-y-3 mb-2">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      {t("auth.setPassword.property", "Property")}
                    </Label>
                    <p className="font-medium">{invitationData.propertyName}</p>
                  </div>

                  {invitationData.inviteType && (
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        {t("auth.setPassword.role", "Your Role")}
                      </Label>
                      <p className="font-medium">{invitationData.inviteType}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">
                  {t("auth.setPassword.password", "Password")}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                    disabled={isLoading}
                  />
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t("auth.setPassword.confirmPassword", "Confirm Password")}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>
              {error && (
                <div className="text-sm font-medium text-destructive">
                  {error}
                </div>
              )}
            </form>
          )}
        </CardContent>
        {isTokenValid !== false && (
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.setPassword.setting", "Setting Password...")}
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  {isInvitation
                    ? t(
                        "auth.setPassword.acceptInvite",
                        "Accept & Set Password"
                      )
                    : t("auth.setPassword.submit", "Set Password")}
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
