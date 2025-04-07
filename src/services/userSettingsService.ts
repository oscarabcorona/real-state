import { supabase } from "../lib/supabase";
import { ProfileUpdateData, UserProfile } from "../pages/Settings/interface";

/**
 * Fetch user profile data
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    
    return data as UserProfile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
}

/**
 * Upload user avatar to storage
 */
export async function uploadUserAvatar(
  userId: string,
  avatarFile: File,
  existingAvatarUrl: string | null
): Promise<string> {
  try {
    const fileExt = avatarFile.name.split(".").pop();
    const fileName = `${userId}/${Math.random().toString(36).substring(7)}.${fileExt}`;

    // First, try to delete any existing avatar
    if (existingAvatarUrl) {
      const oldFilePath = existingAvatarUrl.split("/").pop();
      if (oldFilePath) {
        await supabase.storage
          .from("avatars")
          .remove([`${userId}/${oldFilePath}`]);
      }
    }

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw error;
  }
}

/**
 * Update user profile in database
 */
export async function updateUserProfile(
  userId: string,
  profileData: ProfileUpdateData
): Promise<void> {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

/**
 * Validate user's date of birth (must be at least 18)
 */
export function validateDateOfBirth(date: string | null): boolean {
  if (!date) return true; // Null dates are valid

  const birthDate = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust age if birthday hasn't occurred this year
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    return age - 1 >= 18;
  }

  return age >= 18;
}

/**
 * Update user password
 */
export async function updateUserPassword(
  newPassword: string
): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
}
