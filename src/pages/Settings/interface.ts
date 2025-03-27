export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  date_of_birth: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileForm {
  avatar_url: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  date_of_birth: string | null;
  bio: string;
}

export interface ProfileUpdateData {
  avatar_url: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  date_of_birth: string | null;
  bio: string;
}

export interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MessageState {
  type: "success" | "error" | "";
  text: string;
}
