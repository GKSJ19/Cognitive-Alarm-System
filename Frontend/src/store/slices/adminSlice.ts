import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import adminService from '../../services/adminService';
import { User } from '../../types/auth.types';
import { 
  AdminState, 
  AdminDashboardOverview, 
  DetailedUserCard, 
  DetailedCoachCard, 
  UserAnalyticsData 
} from '../../types/admin.types';

const initialState: AdminState = {
  users: [],
  detailedUsers: [],
  coaches: [],
  detailedCoaches: [],
  selectedUserAnalytics: null,
  dashboardOverview: null,
  dashboardStats: null,
  logs: [],
  settings: null,
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

export const fetchDashboardOverviewThunk = createAsyncThunk(
  'admin/fetchDashboardOverview',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getDashboardOverview();
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchDetailedUsersThunk = createAsyncThunk(
  'admin/fetchDetailedUsers',
  async (args: { search?: string; status?: string; coachStatus?: string } | undefined, { rejectWithValue }) => {
    try {
      return await adminService.getDetailedUsers(args?.search, args?.status, args?.coachStatus);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchUserAnalyticsThunk = createAsyncThunk(
  'admin/fetchUserAnalytics',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await adminService.getUserAnalytics(userId);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchDetailedCoachesThunk = createAsyncThunk(
  'admin/fetchDetailedCoaches',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getDetailedCoaches();
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const assignCoachThunk = createAsyncThunk(
  'admin/assignCoach',
  async ({ coachId, userId }: { coachId: string; userId: string }, { dispatch, rejectWithValue }) => {
    try {
      const res = await adminService.assignCoach(coachId, userId);
      dispatch(fetchDetailedUsersThunk());
      dispatch(fetchDetailedCoachesThunk());
      return res;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const reassignCoachThunk = createAsyncThunk(
  'admin/reassignCoach',
  async ({ userId, newCoachId }: { userId: string; newCoachId: string }, { dispatch, rejectWithValue }) => {
    try {
      const res = await adminService.reassignCoach(userId, newCoachId);
      dispatch(fetchDetailedUsersThunk());
      dispatch(fetchDetailedCoachesThunk());
      return res;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const removeCoachAssignmentThunk = createAsyncThunk(
  'admin/removeCoachAssignment',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      await adminService.removeCoachAssignment(userId);
      dispatch(fetchDetailedUsersThunk());
      dispatch(fetchDetailedCoachesThunk());
      return userId;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createCoachThunk = createAsyncThunk(
  'admin/createCoach',
  async (data: any, { dispatch, rejectWithValue }) => {
    try {
      const coach = await adminService.createCoach(data);
      dispatch(fetchDetailedCoachesThunk());
      return coach;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteCoachThunk = createAsyncThunk(
  'admin/deleteCoach',
  async (coachId: string, { dispatch, rejectWithValue }) => {
    try {
      await adminService.deleteCoach(coachId);
      dispatch(fetchDetailedCoachesThunk());
      return coachId;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Backward compatibility thunks
export const fetchAdminDashboardThunk = createAsyncThunk('admin/fetchDashboard', async (_, { dispatch }) => {
  return dispatch(fetchDashboardOverviewThunk());
});
export const fetchUsersThunk = createAsyncThunk('admin/fetchUsers', async (_, { dispatch }) => {
  return dispatch(fetchDetailedUsersThunk());
});
export const createUserThunk = createAsyncThunk('admin/createUser', async (data: any, { dispatch, rejectWithValue }) => {
  try {
    const res = await adminService.createUser(data);
    dispatch(fetchDetailedUsersThunk());
    return res;
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err));
  }
});
export const updateUserThunk = createAsyncThunk('admin/updateUser', async ({ userId, data }: { userId: string; data: any }, { dispatch, rejectWithValue }) => {
  try {
    const res = await adminService.updateUser(userId, data);
    dispatch(fetchDetailedUsersThunk());
    return res;
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err));
  }
});
export const deleteUserThunk = createAsyncThunk('admin/deleteUser', async (userId: string, { dispatch, rejectWithValue }) => {
  try {
    await adminService.deleteUser(userId);
    dispatch(fetchDetailedUsersThunk());
    return userId;
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err));
  }
});
export const toggleUserStatusThunk = createAsyncThunk('admin/toggleStatus', async ({ userId, suspend }: { userId: string; suspend: boolean }, { dispatch, rejectWithValue }) => {
  try {
    const res = suspend ? await adminService.suspendUser(userId) : await adminService.activateUser(userId);
    dispatch(fetchDetailedUsersThunk());
    return res;
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err));
  }
});
export const fetchCoachesThunk = createAsyncThunk('admin/fetchCoaches', async (_, { dispatch }) => {
  return dispatch(fetchDetailedCoachesThunk());
});
export const fetchLogsThunk = createAsyncThunk('admin/fetchLogs', async () => []);
export const fetchSettingsThunk = createAsyncThunk('admin/fetchSettings', async () => ({}));
export const updateSettingsThunk = createAsyncThunk('admin/updateSettings', async (settings: any) => settings);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Dashboard Overview
    builder.addCase(fetchDashboardOverviewThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDashboardOverviewThunk.fulfilled, (state, action: PayloadAction<AdminDashboardOverview>) => {
      state.isLoading = false;
      state.dashboardOverview = action.payload;
      state.dashboardStats = action.payload.overview_cards;
    });
    builder.addCase(fetchDashboardOverviewThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Detailed Users
    builder.addCase(fetchDetailedUsersThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDetailedUsersThunk.fulfilled, (state, action: PayloadAction<DetailedUserCard[]>) => {
      state.isLoading = false;
      state.detailedUsers = action.payload;
    });
    builder.addCase(fetchDetailedUsersThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch User Analytics
    builder.addCase(fetchUserAnalyticsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUserAnalyticsThunk.fulfilled, (state, action: PayloadAction<UserAnalyticsData>) => {
      state.isLoading = false;
      state.selectedUserAnalytics = action.payload;
    });
    builder.addCase(fetchUserAnalyticsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Detailed Coaches
    builder.addCase(fetchDetailedCoachesThunk.fulfilled, (state, action: PayloadAction<DetailedCoachCard[]>) => {
      state.detailedCoaches = action.payload;
    });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
