import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Property } from "../../types";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  user: {
    id?: string;
    name?: string;
    email?: string;
  } | null;
}

export function AppointmentModal({
  isOpen,
  onClose,
  property,
  user,
}: AppointmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    date: "",
    time: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAppointmentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!property) return;

    try {
      setIsSubmitting(true);

      const { error } = await supabase.from("appointments").insert([
        {
          property_id: property.id,
          name: appointmentForm.name,
          email: appointmentForm.email,
          phone: appointmentForm.phone,
          preferred_date: appointmentForm.date,
          preferred_time: appointmentForm.time,
          message: appointmentForm.message,
          status: "pending",
          tenant_user_id: user?.id || null,
        },
      ]);

      if (error) throw error;

      toast.success("Appointment request submitted", {
        description:
          "We'll get back to you soon to confirm your viewing appointment.",
      });

      onClose();
      setAppointmentForm({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        date: "",
        time: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting appointment:", error);
      toast.error("Appointment request failed", {
        description: "Failed to submit appointment request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Schedule Viewing
          </DialogTitle>
          <DialogDescription>
            Request a viewing for {property.name} at {property.address}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={appointmentForm.name}
              onChange={handleInputChange}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={appointmentForm.email}
              onChange={handleInputChange}
              placeholder="Your email"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              name="phone"
              value={appointmentForm.phone}
              onChange={handleInputChange}
              placeholder="Your phone number"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Preferred Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={appointmentForm.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Preferred Time</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={appointmentForm.time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              name="message"
              value={appointmentForm.message}
              onChange={handleInputChange}
              placeholder="Any specific questions or requirements"
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !appointmentForm.name ||
              !appointmentForm.email ||
              !appointmentForm.date ||
              !appointmentForm.time
            }
          >
            {isSubmitting ? "Submitting..." : "Request Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
