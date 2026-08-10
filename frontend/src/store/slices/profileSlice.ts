import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import profileService from '../../services/profileService';
import { Profile, ProfileState } from '../../types/profile.types';

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
};

const getErrorMessage = (error: any): string => {
  if (error.response?.data?.detail) {
    if (typeof error.response.data.detail === 'string') {
      return error.response.data.detail;
    } else if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail[0]?.msg || 'Validation error';
    }
  }
  return error.message || 'An unexpected error occurred';
};

export const fetchProfileThunk = createAsyncThunk(
  'profile/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await profileService.getProfile();
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  'profile/update',
  async (data: Partial<Profile>, { rejectWithValue }) => {
    try {
      return await profileService.updateProfile(data);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const uploadPhotoThunk = createAsyncThunk(
  'profile/uploadPhoto',
  async ({ uri, name, type }: { uri: string; name: string; type: string }, { rejectWithValue }) => {
    try {
      return await profileService.uploadPhoto(uri, name, type);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deletePhotoThunk = createAsyncThunk(
  'profile/deletePhoto',
  async (_, { rejectWithValue }) => {
    try {
      return await profileService.deletePhoto();
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    resetProfile: (state) => {
      state.profile = null;
      state.error = null;
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchProfileThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProfileThunk.fulfilled, (state, action: PayloadAction<Profile>) => {
      state.isLoading = false;
      state.profile = action.payload;
    });
    builder.addCase(fetchProfileThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update
    builder.addCase(updateProfileThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateProfileThunk.fulfilled, (state, action: PayloadAction<Profile>) => {
      state.isLoading = false;
      state.profile = action.payload;
    });
    builder.addCase(updateProfileThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Upload Photo
    builder.addCase(uploadPhotoThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(uploadPhotoThunk.fulfilled, (state, action: PayloadAction<Profile>) => {
      state.isLoading = false;
      state.profile = action.payload;
    });
    builder.addCase(uploadPhotoThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete Photo
    builder.addCase(deletePhotoThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deletePhotoThunk.fulfilled, (state, action: PayloadAction<Profile>) => {
      state.isLoading = false;
      state.profile = action.payload;
    });
    builder.addCase(deletePhotoThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearProfileError, resetProfile } = profileSlice.actions;
export default profileSlice.reducer;
