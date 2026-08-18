import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import coachService from '../../services/coachService';
import { User } from '../../types/auth.types';
import { 
  CoachState, 
  CoachDashboardSummary, 
  AssignedUserCard, 
  CoachNotificationItem, 
  CoachMessage,
  CoachDashboardStats
} from '../../types/coach.types';
import { UserAnalyticsData } from '../../types/admin.types';

const initialState: CoachState = {
  assignedUsers: [],
  assignedUserCards: [],
  selectedUserAnalytics: null,
  dashboardSummary: null,
  notifications: [],
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

export const fetchCoachDashboardSummaryThunk = createAsyncThunk(
  'coach/fetchDashboardSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await coachService.getDashboardSummary();
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchMyUsersThunk = createAsyncThunk(
  'coach/fetchMyUsers',
  async (args: { search?: string; status?: string } | undefined, { rejectWithValue }) => {
    try {
      return await coachService.getMyUsers(args?.search, args?.status);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchAssignedUserAnalyticsThunk = createAsyncThunk(
  'coach/fetchAssignedUserAnalytics',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await coachService.getAssignedUserAnalytics(userId);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchNotificationsThunk = createAsyncThunk(
  'coach/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      return await coachService.getNotifications();
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

// Backward compatibility thunks
export const fetchCoachDashboardThunk = createAsyncThunk('coach/fetchDashboard', async (_, { dispatch }) => {
  return dispatch(fetchCoachDashboardSummaryThunk());
});
export const fetchAssignedUsersThunk = createAsyncThunk('coach/fetchUsers', async (_, { dispatch }) => {
  return dispatch(fetchMyUsersThunk());
});
export const fetchUserProgressThunk = createAsyncThunk('coach/fetchProgress', async (userId: string, { dispatch }) => {
  return dispatch(fetchAssignedUserAnalyticsThunk(userId));
});

const coachSlice = createSlice({
  name: 'coach',
  initialState,
  reducers: {
    clearCoachError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Dashboard Summary
    builder.addCase(fetchCoachDashboardSummaryThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCoachDashboardSummaryThunk.fulfilled, (state, action: PayloadAction<CoachDashboardSummary>) => {
      state.isLoading = false;
      state.dashboardSummary = action.payload;
      state.notifications = action.payload.notifications;
      const s = action.payload.summary_cards;
      state.dashboardStats = {
        total_assigned_users: s.assigned_users,
        active_users: s.active_users_today,
        todays_wakeups: s.active_users_today,
        habit_completion_rate: s.average_habit_score,
        alarm_success_rate: s.average_habit_score,
        challenge_success_rate: s.average_habit_score,
      };
    });
    builder.addCase(fetchCoachDashboardSummaryThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch My Users
    builder.addCase(fetchMyUsersThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMyUsersThunk.fulfilled, (state, action: PayloadAction<AssignedUserCard[]>) => {
      state.isLoading = false;
      state.assignedUserCards = action.payload;
    });
    builder.addCase(fetchMyUsersThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Assigned User Analytics
    builder.addCase(fetchAssignedUserAnalyticsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAssignedUserAnalyticsThunk.fulfilled, (state, action: PayloadAction<UserAnalyticsData>) => {
      state.isLoading = false;
      state.selectedUserAnalytics = action.payload;
    });
    builder.addCase(fetchAssignedUserAnalyticsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Notifications
    builder.addCase(fetchNotificationsThunk.fulfilled, (state, action: PayloadAction<CoachNotificationItem[]>) => {
      state.notifications = action.payload;
    });

    // Send Message
    builder.addCase(sendCoachMessageThunk.fulfilled, (state, action: PayloadAction<CoachMessage>) => {
      state.messages.push(action.payload);
    });
  },
});

export const { clearCoachError } = coachSlice.actions;
export default coachSlice.reducer;
