export interface UserProfile {
  id: string;
  avatar_url: string | null;
  full_name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  date_of_birth: string | null;
  bio: string | null;
  company_name?: string | null;
  role?: string;
  created_at?: string | null;
  updated_at?: string | null;
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
  type: "" | "success" | "error";
  text: string;
}
