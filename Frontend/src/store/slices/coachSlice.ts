import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import coachService from '../../services/coachService';
import { User } from '../../types/auth.types';
import { CoachDashboardStats, CoachMessage, CoachState } from '../../types/coach.types';

const initialState: CoachState = {
  assignedUsers: [],
  selectedUserProgress: null,
  dashboardStats: null,
  messages: [],
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

export const fetchCoachDashboardThunk = createAsyncThunk(
  'coach/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await coachService.getDashboard();
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchAssignedUsersThunk = createAsyncThunk(
  'coach/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await coachService.getUsers();
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchUserProgressThunk = createAsyncThunk(
  'coach/fetchProgress',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await coachService.getUserProgress(userId);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const sendCoachMessageThunk = createAsyncThunk(
  'coach/sendMessage',
  async ({ userId, title, message }: { userId: string; title: string; message: string }, { rejectWithValue }) => {
    try {
      return await coachService.sendMessage(userId, title, message);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const coachSlice = createSlice({
  name: 'coach',
  initialState,
  reducers: {
    clearCoachError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Dashboard
    builder.addCase(fetchCoachDashboardThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCoachDashboardThunk.fulfilled, (state, action: PayloadAction<CoachDashboardStats>) => {
      state.isLoading = false;
      state.dashboardStats = action.payload;
    });
    builder.addCase(fetchCoachDashboardThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Assigned Users
    builder.addCase(fetchAssignedUsersThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAssignedUsersThunk.fulfilled, (state, action: PayloadAction<User[]>) => {
      state.isLoading = false;
      state.assignedUsers = action.payload;
    });
    builder.addCase(fetchAssignedUsersThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch User Progress
    builder.addCase(fetchUserProgressThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUserProgressThunk.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.selectedUserProgress = action.payload;
    });
    builder.addCase(fetchUserProgressThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Send Message
    builder.addCase(sendCoachMessageThunk.fulfilled, (state, action: PayloadAction<CoachMessage>) => {
      state.messages.push(action.payload);
    });
  },
});

export const { clearCoachError } = coachSlice.actions;
export default coachSlice.reducer;
