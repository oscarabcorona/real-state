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
import { Settings as SettingsIcon, Key } from "lucide-react";

export function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
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
    <div className="container max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Account Settings</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Manage your account settings and preferences
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <SettingsIcon className="h-4 w-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "password"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Key className="h-4 w-4" />
            Password
          </button>
        </div>

        <div className="bg-card rounded-lg border">
          {activeTab === "profile" && (
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
          )}

          {activeTab === "password" && (
            <PasswordSettings
              passwordForm={passwordForm}
              setPasswordForm={setPasswordForm}
              loading={loading}
              setLoading={setLoading}
              message={message}
              setMessage={setMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
