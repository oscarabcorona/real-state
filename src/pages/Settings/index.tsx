import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  MessageState,
  PasswordForm,
  ProfileForm,
  UserProfile,
} from "./interface";
import { ProfileSettings } from "./ProfileSettings";
import { PasswordSettings } from "./PasswordSettings";
import { fetchUserProfile } from "../../services/userSettingsService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Key } from "lucide-react";
import { Toaster } from "sonner";

export function Settings() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<MessageState>({ type: "", text: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Initialize form with empty strings instead of null values
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    avatar_url: user?.avatar_url || "",
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    zip_code: user?.zip_code || "",
    date_of_birth: user?.date_of_birth || null,
    bio: user?.bio || "",
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.id) return;

    try {
      const data = await fetchUserProfile(user.id);

      if (data) {
        setProfileForm({
          avatar_url: data.avatar_url || "",
          full_name: data.full_name || "",
          email: user?.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          zip_code: data.zip_code || "",
          date_of_birth: data.date_of_birth || null,
          bio: data.bio || "",
        });

        if (data.avatar_url) {
          setAvatarPreview(data.avatar_url);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span>Password</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <ProfileSettings
            user={user as UserProfile}
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            loading={loading}
            setLoading={setLoading}
            message={message}
            setMessage={setMessage}
            avatarFile={avatarFile}
            setAvatarFile={setAvatarFile}
            avatarPreview={avatarPreview}
            setAvatarPreview={setAvatarPreview}
            uploadingAvatar={uploadingAvatar}
            setUploadingAvatar={setUploadingAvatar}
            refreshProfile={loadUserProfile}
          />
        </TabsContent>

        <TabsContent value="password" className="mt-0">
          <PasswordSettings
            passwordForm={passwordForm}
            setPasswordForm={setPasswordForm}
            loading={loading}
            setLoading={setLoading}
            message={message}
            setMessage={setMessage}
          />
        </TabsContent>
      </Tabs>

      {/* Global toast container */}
      <Toaster position="top-right" closeButton />
    </div>
  );
}
