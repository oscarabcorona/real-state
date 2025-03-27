import {
  Building2,
  Calendar,
  Camera,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuthStore } from "../../store/authStore";
import { UserProfile, MessageState, ProfileUpdateData } from "./interface";
import {
  uploadUserAvatar,
  updateUserProfile,
  fetchUserProfile,
} from "../../services/userSettingsService";
import { toast } from "sonner";

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
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip_code: z.string().min(1, "ZIP code is required"),
  date_of_birth: z
    .string()
    .nullable()
    .refine(
      (dob) => {
        if (!dob) return true;
        const date = new Date(dob);
        return date <= maxDate;
      },
      { message: "You must be at least 18 years old." }
    ),
  bio: z.string().min(1, "Bio is required"),
  avatar_url: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileSettingsProps {
  user: UserProfile;
  profileForm: ProfileFormValues;
  setProfileForm: (form: ProfileFormValues) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  message: MessageState;
  setMessage: (message: MessageState) => void;
  avatarFile: File | null;
  setAvatarFile: (file: File | null) => void;
  avatarPreview: string | null;
  setAvatarPreview: (preview: string | null) => void;
  uploadingAvatar: boolean;
  setUploadingAvatar: (uploading: boolean) => void;
  refreshProfile: () => Promise<void>;
}

export function ProfileSettings({
  profileForm: initialProfileForm,
  setProfileForm: setParentProfileForm,
  setLoading: setParentLoading,
  setMessage,
  avatarFile,
  setAvatarFile,
  avatarPreview,
  setAvatarPreview,
  uploadingAvatar,
  setUploadingAvatar,
  refreshProfile,
}: ProfileSettingsProps) {
  const { user: authUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with empty strings for null values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      ...initialProfileForm,
      phone: initialProfileForm.phone || "",
      address: initialProfileForm.address || "",
      city: initialProfileForm.city || "",
      state: initialProfileForm.state || "",
      zip_code: initialProfileForm.zip_code || "",
      bio: initialProfileForm.bio || "",
    },
  });

  // Load user profile
  useEffect(() => {
    async function loadProfile() {
      if (!authUser?.id) return;

      try {
        const profileData = await fetchUserProfile(authUser.id);
        if (profileData) {
          setProfile(profileData);
          form.reset({
            full_name: profileData.full_name,
            email: authUser.email,
            phone: profileData.phone || "",
            address: profileData.address || "",
            city: profileData.city || "",
            state: profileData.state || "",
            zip_code: profileData.zip_code || "",
            date_of_birth: profileData.date_of_birth,
            bio: profileData.bio || "",
            avatar_url: profileData.avatar_url || "",
          });

          if (profileData.avatar_url) {
            setAvatarPreview(profileData.avatar_url);
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setMessage({
          type: "error",
          text: "Failed to load profile. Please try again later.",
        });
      }
    }

    loadProfile();
  }, [authUser, form, setMessage]);

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
    if (!avatarFile || !authUser?.id) return null;

    try {
      setUploadingAvatar(true);
      const publicUrl = await uploadUserAvatar(
        authUser.id,
        avatarFile,
        form.getValues().avatar_url
      );
      return publicUrl;
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      setMessage({
        type: "error",
        text: "Failed to upload avatar. Please try again.",
      });
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!authUser?.id) return;

    setIsSubmitting(true);
    setParentLoading(true);

    try {
      let avatarUrl = data.avatar_url;

      if (avatarFile) {
        const uploadedUrl = await handleUploadAvatar();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const updateData: ProfileUpdateData = {
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

      await updateUserProfile(authUser.id, updateData);
      setParentProfileForm({ ...data, avatar_url: avatarUrl });
      await refreshProfile();

      toast.success("Profile updated", {
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setMessage({
        type: "error",
        text: `Failed to update profile: ${errorMessage}`,
      });
    } finally {
      setIsSubmitting(false);
      setParentLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium">Profile Settings</h2>
        <p className="text-sm text-muted-foreground">
          Update your personal information and how others see you on the
          platform
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="bg-primary/10">
                  {profile?.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
              >
                <Camera className="h-5 w-5" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <h3 className="text-sm font-medium">Profile Photo</h3>
              <p className="text-sm text-muted-foreground">
                Upload a new profile photo. JPG, GIF or PNG. Max size of 5MB.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
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
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        type="email"
                        disabled
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Contact support to change your email address
                  </FormDescription>
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
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        placeholder="(555) 123-4567"
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
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        type="date"
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
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        placeholder="123 Main St"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="City"
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
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
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
                      <Input placeholder="ZIP Code" {...field} />
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
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little about yourself..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || uploadingAvatar}
              className="min-w-[120px]"
            >
              {(isSubmitting || uploadingAvatar) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
