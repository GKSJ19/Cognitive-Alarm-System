import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  _id?: string;
  user_id?: string;
  full_name: string;
  phone?: string;
  profile_image?: string;
  age?: number;
  gender?: string;
  time_zone?: string;
  preferred_wakeup_time?: string;
  sleep_duration_goal?: number;
  productivity_goals?: string[];
  difficulty_preference?: string;
  habit_preferences?: string[];
}

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    updateProfileField: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    clearProfile: (state) => {
      state.profile = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setProfile, updateProfileField, clearProfile, setLoading, setError } = profileSlice.actions;
export default profileSlice.reducer;
