import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteTypes, InviteType } from "./columns";
import { sendPropertyInvite } from "@/services/inviteService";
import { useAuthStore } from "@/store/authStore";

interface InviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  onSuccess?: () => void;
}

export function InviteDialog({
  isOpen,
  onClose,
  propertyId,
  onSuccess,
}: InviteDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [inviteType, setInviteType] = useState<InviteType>("tenant");
  const [message, setMessage] = useState("");

  // Form validation
  const isEmailValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    return isEmailValid() && inviteType && propertyId;
  };

  // Reset form
  const resetForm = () => {
    setEmail("");
    setInviteType("tenant");
    setMessage("");
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid() || !user?.id) {
      return;
    }

    setIsSubmitting(true);

    try {
      await sendPropertyInvite({
        propertyId,
        email,
        inviteType,
        message,
        userId: user.id,
      });

      toast.success(t("invites.dialog.success", "Invitation sent"), {
        description: t(
          "invites.dialog.successDescription",
          "An invitation email has been sent to {{email}}",
          { email }
        ),
      });

      resetForm();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error(t("invites.dialog.error", "Failed to send invitation"), {
        description: t(
          "invites.dialog.errorDescription",
          "Please try again later"
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {t("invites.dialog.title", "Invite to Property")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "invites.dialog.description",
                "Send an invitation to access this property"
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">
                {t("invites.dialog.email", "Email")}
                <span className="text-destructive"> *</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className={!isEmailValid() && email ? "border-destructive" : ""}
              />
              {!isEmailValid() && email && (
                <p className="text-xs text-destructive">
                  {t(
                    "invites.dialog.invalidEmail",
                    "Please enter a valid email address"
                  )}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="inviteType">
                {t("invites.dialog.role", "Role")}
                <span className="text-destructive"> *</span>
              </Label>
              <Select
                value={inviteType}
                onValueChange={(value) => setInviteType(value as InviteType)}
              >
                <SelectTrigger id="inviteType">
                  <SelectValue
                    placeholder={t(
                      "invites.dialog.selectRole",
                      "Select a role"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {inviteTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {t(`invites.types.${type.value}`, type.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">
                {t("invites.dialog.message", "Personal Message")} (
                <span className="text-muted-foreground text-xs">
                  {t("invites.dialog.optional", "optional")}
                </span>
                )
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t(
                  "invites.dialog.messagePlaceholder",
                  "Add a personal message to the invitation email..."
                )}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button type="submit" disabled={!isFormValid() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="mr-2">
                    {t("invites.dialog.sending", "Sending...")}
                  </span>
                  <span className="loading loading-spinner loading-xs"></span>
                </>
              ) : (
                t("invites.dialog.send", "Send Invitation")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
