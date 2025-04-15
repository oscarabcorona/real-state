import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createClient } from "@supabase/supabase-js";
import { UserCheck, Loader2, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function InviteAccept() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteDetails, setInviteDetails] = useState<{
    propertyName?: string;
    inviteType?: string;
    inviterName?: string;
    invitationId?: string;
  } | null>(null);

  useEffect(() => {
    const checkInvite = async () => {
      try {
        // Try to get invite token from query parameters
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get("token");

        if (!token) {
          setError(
            t("invites.accept.noTokenFound", "No invitation token found")
          );
          setLoading(false);
          return;
        }

        setInviteToken(token);

        // Check if token is valid and get property details
        const { data, error: inviteError } = await supabase.functions.invoke(
          "validate-invite",
          {
            body: { token },
          }
        );

        if (inviteError || !data?.valid) {
          console.error(
            "Error validating invite:",
            inviteError || "Invalid invite"
          );
          setError(
            t(
              "invites.accept.invalidToken",
              "This invitation is invalid or has expired"
            )
          );
          setLoading(false);
          return;
        }

        setInviteDetails({
          propertyName: data.propertyName,
          inviteType: data.inviteType,
          inviterName: data.inviterName,
          invitationId: data.invitationId,
        });

        // If there's a session hash (from password reset), redirect to SetPassword
        if (location.hash && location.hash.includes("access_token")) {
          const inviteId = data.invitationId;
          navigate(`/auth/set-password?invitation=${inviteId}${location.hash}`);
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error("Error in invite acceptance:", err);
        setError(
          t("invites.accept.errorProcessing", "Error processing invitation")
        );
        setLoading(false);
      }
    };

    checkInvite();
  }, [location, navigate, t]);

  const handleAcceptInvite = async () => {
    if (!inviteToken || !inviteDetails?.invitationId) return;

    setLoading(true);

    try {
      // Accept the invitation and trigger password reset flow
      const { error } = await supabase.functions.invoke("accept-invite", {
        body: {
          token: inviteToken,
          invitationId: inviteDetails.invitationId,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Will navigate to set-password page automatically when redirected by Supabase
    } catch (err) {
      console.error("Error accepting invite:", err);
      setError(
        t("invites.accept.errorAccepting", "Error accepting invitation")
      );
      setLoading(false);
    }
  };

  // Translate invite type to user-friendly text
  const getInviteTypeText = (type?: string) => {
    if (!type) return "";

    switch (type) {
      case "tenant":
        return t("invites.types.tenant", "Tenant");
      case "lawyer":
        return t("invites.types.lawyer", "Legal Advisor");
      case "contractor":
        return t("invites.types.contractor", "Contractor");
      case "agent":
        return t("invites.types.agent", "Real Estate Agent");
      default:
        return type;
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {t("invites.accept.title", "Property Invitation")}
          </CardTitle>
          <CardDescription className="text-center">
            {t(
              "invites.accept.description",
              "You've been invited to access a property"
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-center text-muted-foreground">
                {t("invites.accept.loading", "Processing your invitation...")}
              </p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={() => navigate("/")}>
                  <Home className="mr-2 h-4 w-4" />
                  {t("common.returnHome", "Return Home")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">
                  {t("invites.accept.property", "Property")}
                </h3>
                <p className="text-lg font-medium">
                  {inviteDetails?.propertyName}
                </p>
              </div>

              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    {t("invites.accept.invitedBy", "Invited By")}
                  </h3>
                  <p>{inviteDetails?.inviterName}</p>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    {t("invites.accept.role", "Your Role")}
                  </h3>
                  <p>{getInviteTypeText(inviteDetails?.inviteType)}</p>
                </div>
              </div>

              <Separator />

              <p className="text-sm text-center">
                {t(
                  "invites.accept.setPasswordPrompt",
                  "Click below to accept this invitation and set your password to access the property."
                )}
              </p>
            </div>
          )}
        </CardContent>

        {!loading && !error && (
          <CardFooter className="flex flex-col gap-4">
            <Button
              className="w-full"
              onClick={handleAcceptInvite}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserCheck className="mr-2 h-4 w-4" />
              )}
              {t(
                "invites.accept.acceptAndSetPassword",
                "Accept & Set Password"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {t("invites.accept.alreadyAccount", "Already have an account?")}{" "}
              <Link to="/auth/login" className="text-primary hover:underline">
                {t("auth.login.login", "Log in")}
              </Link>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
