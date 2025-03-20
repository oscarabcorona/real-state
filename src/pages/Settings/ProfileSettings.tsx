import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Camera,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { UserProfile } from "./interface";
import {
  uploadUserAvatar,
  updateUserProfile,
  fetchUserProfile,
} from "../../services/userSettingsService";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
];

const maxDate = new Date();
maxDate.setFullYear(maxDate.getFullYear() - 18);
const maxDateString = maxDate.toISOString().split("T")[0];

const profileFormSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .optional(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip_code: z.string().optional().nullable(),
  date_of_birth: z
    .string()
    .optional()
    .nullable()
    .refine(
      (dob) => {
        if (!dob) return true;
        const date = new Date(dob);
        return date <= maxDate;
      },
      { message: "You must be at least 18 years old." }
    ),
  bio: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileSettings() {
  const { user } = useAuthStore();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Initialize form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      date_of_birth: null,
      bio: "",
      avatar_url: "",
    },
  });

  // Load user profile
  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;

      try {
        const profileData = await fetchUserProfile(user.id);
        if (profileData) {
          setProfile(profileData);
          form.reset({
            full_name: profileData.full_name || "",
            email: user.email || "",
            phone: profileData.phone || "",
            address: profileData.address || "",
            city: profileData.city || "",
            state: profileData.state || "",
            zip_code: profileData.zip_code || "",
            date_of_birth: profileData.date_of_birth || null,
            bio: profileData.bio || "",
            avatar_url: profileData.avatar_url || "",
          });

          if (profileData.avatar_url) {
            setAvatarPreview(profileData.avatar_url);
          }
        }
      } catch (error) {
        toast.error("Error loading profile", {
          description:
            "We couldn't load your profile information. Please try again later.",
        });
      }
    }

    loadProfile();
  }, [user, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large", {
        description: "Image size must be less than 5MB",
      });
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload a JPG, PNG, or GIF image",
      });
      return;
    }

    setAvatarFile(file);
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
  };

  const handleUploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user?.id) return null;

    try {
      setUploadingAvatar(true);
      const publicUrl = await uploadUserAvatar(
        user.id,
        avatarFile,
        form.getValues().avatar_url || null
      );
      return publicUrl;
    } catch (error) {
      console.error("Error in handleUploadAvatar:", error);
      throw error;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user?.id) return;

    setIsSubmitting(true);

    try {
      let avatarUrl = data.avatar_url;

      if (avatarFile) {
        avatarUrl = (await handleUploadAvatar()) || "";
      }

      const updateData = {
        avatar_url: avatarUrl,
        full_name: data.full_name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        date_of_birth: data.date_of_birth,
        bio: data.bio,
      };

      await updateUserProfile(user.id, updateData);

      toast.success("Profile updated", {
        description: "Your profile has been updated successfully",
      });

      form.setValue("avatar_url", avatarUrl);
    } catch (error) {
      toast.error("Failed to update profile", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full mb-6 transition-all duration-200 hover:shadow-md">
      <CardHeader className="bg-muted/40">
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your personal information and how others see you on the
          platform
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Avatar Upload */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-4">
              <div className="relative group">
                <Avatar className="w-28 h-28 border-2 border-muted">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Profile picture" />
                  ) : (
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <User className="w-14 h-14" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg cursor-pointer hover:bg-primary/90 transition-all duration-200 transform group-hover:scale-110"
                  aria-label="Upload profile photo"
                >
                  <Camera className="w-4 h-4" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">Profile Photo</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a new profile photo. JPG, GIF or PNG. Max size of 5MB.
                </p>
                {avatarFile && (
                  <p className="text-xs text-primary mt-2">
                    New photo selected: {avatarFile.name}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="John Doe"
                          {...field}
                        />
                      </div>
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
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-10 bg-muted/40"
                          disabled
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Email cannot be changed</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="(555) 123-4567"
                          {...field}
                          value={field.value || ""}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          className="pl-10"
                          max={maxDateString}
                          {...field}
                          value={field.value || ""}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Must be at least 18 years old
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="123 Main St"
                          {...field}
                          value={field.value || ""}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="City"
                          {...field}
                          value={field.value || ""}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="State"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ZIP Code"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little about yourself..."
                        className="resize-none min-h-[120px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Let others know more about you
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || uploadingAvatar}
                className="min-w-[150px] transition-transform hover:-translate-y-0.5"
              >
                {isSubmitting || uploadingAvatar ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
