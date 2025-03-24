import { AlertCircle, CalendarIcon } from "lucide-react";
import { addDays, format, isAfter, isBefore } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { VIEWING_RULES } from "@/pages/Marketplace/const";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const FormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string().min(1, "Please select a time"),
  message: z.string().optional(),
});

type ViewingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  onSuccess: () => void;
};

export function ViewingModal({
  open,
  onOpenChange,
  propertyId,
  userId,
  userEmail,
  userName,
  onSuccess,
}: ViewingModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [timeError, setTimeError] = useState("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: userName || "",
      email: userEmail || "",
      phone: "",
      message: "",
    },
  });

  const validateAppointmentTime = (date: Date, time: string): boolean => {
    if (!date || !time) {
      setTimeError("Please select both date and time");
      return false;
    }

    const [hours, minutes] = time.split(":");
    const appointmentDateTime = new Date(date);
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

    const now = new Date();
    const minDateTime = new Date(
      now.getTime() + VIEWING_RULES.minNotice * 60 * 60 * 1000
    );
    const maxDateTime = addDays(now, VIEWING_RULES.daysInAdvance);

    if (isBefore(appointmentDateTime, minDateTime)) {
      setTimeError(
        `Please select a time at least ${VIEWING_RULES.minNotice} hours in advance`
      );
      return false;
    }

    if (isAfter(appointmentDateTime, maxDateTime)) {
      setTimeError(
        `Appointments can only be scheduled up to ${VIEWING_RULES.daysInAdvance} days in advance`
      );
      return false;
    }

    return true;
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setTimeError("");

    if (!validateAppointmentTime(data.date, data.time)) {
      return;
    }

    setSubmitting(true);

    try {
      // Format date as a simple string without time component
      const formattedDate = format(data.date, "yyyy-MM-dd");

      // Manual conflict check
      const { data: existingAppointments, error: queryError } = await supabase
        .from("appointments")
        .select("*")
        .eq("property_id", propertyId)
        .eq("preferred_date", formattedDate)
        .neq("status", "cancelled");

      if (queryError) {
        console.error("Error checking existing appointments:", queryError);
        throw queryError;
      }

      // Check for time conflicts (assuming 60 minute appointments)
      const hasConflict = existingAppointments?.some((appointment) => {
        const [appHours, appMinutes] = appointment.preferred_time.split(":");
        const [newHours, newMinutes] = data.time.split(":");

        const appTime = new Date(
          0,
          0,
          0,
          parseInt(appHours),
          parseInt(appMinutes)
        );
        const newTime = new Date(
          0,
          0,
          0,
          parseInt(newHours),
          parseInt(newMinutes)
        );

        // Add 60 minutes to appointment time
        const appEndTime = new Date(appTime);
        appEndTime.setMinutes(appEndTime.getMinutes() + 60);

        // Add 60 minutes to new appointment time
        const newEndTime = new Date(newTime);
        newEndTime.setMinutes(newEndTime.getMinutes() + 60);

        // Check for overlap
        return (
          (newTime <= appTime && newEndTime > appTime) ||
          (appTime <= newTime && appEndTime > newTime)
        );
      });

      if (hasConflict) {
        setTimeError(
          "This time slot is already booked. Please select a different time."
        );
        setSubmitting(false);
        return;
      }

      // Insert with explicit casting to strings, avoiding any automatic type conversion
      const { error } = await supabase.from("appointments").insert({
        property_id: propertyId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        preferred_date: formattedDate,
        preferred_time: data.time,
        message: data.message || "",
        status: "pending",
        tenant_user_id: userId || null,
      });

      if (error) throw error;

      onSuccess();
      onOpenChange(false);
      form.reset();

      toast.success("Appointment scheduled successfully!");
    } catch (error) {
      console.error("Error submitting appointment:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const [date, setDate] = useState<Date | null>(new Date());

  const availableTimes = Array.from({ length: 9 }, (_, i) => {
    const hour = i + 9; // 9 AM to 5 PM
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule a Viewing</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Preferred Date</FormLabel>

                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        value={date}
                        onChange={(date) => {
                          setDate(date);
                          field.onChange(date);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Time</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Available Times</SelectLabel>
                          {availableTimes.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {timeError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{timeError}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Submitting...
                </>
              ) : (
                "Schedule Viewing"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
