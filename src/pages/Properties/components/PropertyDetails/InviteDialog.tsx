import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Users, Send } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sendPropertyInvite } from "@/services/inviteService";
import { useAuthStore } from "@/store/authStore";

interface InviteDialogProps {
  propertyId: string;
}

export function InviteDialog({ propertyId }: InviteDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteType, setInviteType] = useState<
    "tenant" | "lawyer" | "contractor" | "agent"
  >("tenant");
  const [message, setMessage] = useState("");

  const handleSendInvite = async () => {
    if (!email) {
      toast.error(t("common.error"), {
        description: t("properties.invite.emailRequired"),
      });
      return;
    }

    if (!user?.id) {
      toast.error(t("common.error"), {
        description: t("common.unauthorized"),
      });
      return;
    }

    setIsLoading(true);

    try {
      await sendPropertyInvite({
        propertyId,
        email,
        inviteType,
        message,
        userId: user.id,
      });

      toast.success(t("properties.invite.success"), {
        description: t("properties.invite.successDescription", { email }),
      });

      // Reset form and close dialog
      setEmail("");
      setInviteType("tenant");
      setMessage("");
      setOpen(false);
    } catch (error: Error | unknown) {
      console.error("Error sending invite:", error);

      // Convert to Error type for type safety
      const err = error instanceof Error ? error : new Error(String(error));

      // Handle different error cases with specific messages
      if (err.message.includes("already has access")) {
        toast.error(t("properties.invite.errorTitle"), {
          description: t(
            "properties.invite.errorAlreadyAccess",
            "This user already has access to this property."
          ),
        });
      } else if (err.message.includes("Invalid email")) {
        toast.error(t("properties.invite.errorTitle"), {
          description: t(
            "properties.invite.errorInvalidEmail",
            "Please provide a valid email address."
          ),
        });
      } else if (err.message.includes("Failed to create invitation")) {
        toast.error(t("properties.invite.errorTitle"), {
          description: t(
            "properties.invite.errorCreateInvite",
            "Failed to create the invitation. Please try again."
          ),
        });
      } else if (err.message.includes("property details")) {
        toast.error(t("properties.invite.errorTitle"), {
          description: t(
            "properties.invite.errorPropertyDetails",
            "Could not retrieve property details. Please try again."
          ),
        });
      } else if (err.message.includes("user details")) {
        toast.error(t("properties.invite.errorTitle"), {
          description: t(
            "properties.invite.errorUserDetails",
            "Could not retrieve your user details. Please try again."
          ),
        });
      } else if (err.message.includes("email delivery")) {
        // Email was created but delivery failed
        toast.warning(t("properties.invite.warnTitle"), {
          description: t(
            "properties.invite.warnEmailDelivery",
            "Invite created but there was a problem sending the email."
          ),
        });
        // Reset form and close dialog since invite was created
        setEmail("");
        setInviteType("tenant");
        setMessage("");
        setOpen(false);
      } else {
        // Generic error fallback
        toast.error(t("properties.invite.errorTitle", "Invitation Failed"), {
          description: t(
            "properties.invite.errorGeneric",
            "There was a problem sending the invitation. Please try again later."
          ),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="h-4 w-4 mr-2" />
          {t("properties.invite.invite", "Invite")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {t("properties.invite.title", "Invite Someone")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "properties.invite.description",
              "Send an invitation to access this property to tenants, lawyers, contractors, or agents."
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid items-center gap-2">
            <Label htmlFor="email">
              {t("properties.invite.email", "Email")}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid items-center gap-2">
            <Label htmlFor="invite-type">
              {t("properties.invite.role", "Role")}
            </Label>
            <Select
              value={inviteType}
              onValueChange={(value: string) =>
                setInviteType(
                  value as "tenant" | "lawyer" | "contractor" | "agent"
                )
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("properties.invite.selectRole", "Select role")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tenant">
                  {t("properties.invite.roles.tenant", "Tenant")}
                </SelectItem>
                <SelectItem value="lawyer">
                  {t("properties.invite.roles.lawyer", "Legal Advisor")}
                </SelectItem>
                <SelectItem value="contractor">
                  {t("properties.invite.roles.contractor", "Contractor")}
                </SelectItem>
                <SelectItem value="agent">
                  {t("properties.invite.roles.agent", "Real Estate Agent")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid items-center gap-2">
            <Label htmlFor="message">
              {t("properties.invite.message", "Message (optional)")}
            </Label>
            <Textarea
              id="message"
              placeholder={t(
                "properties.invite.messagePlaceholder",
                "Include a personal message..."
              )}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSendInvite} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">↻</span>
                {t("common.sending", "Sending...")}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {t("properties.invite.send", "Send Invitation")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
