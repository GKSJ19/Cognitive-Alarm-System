export interface Profile {
  profile_id: string;
  user_id: string;
  profile_photo: string | null;
  phone_number: string | null;
  gender: string | null;
  date_of_birth: string | null;
  occupation: string | null;
  timezone: string;
  preferred_wakeup_time: string | null;
  preferred_sleep_time: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
}
