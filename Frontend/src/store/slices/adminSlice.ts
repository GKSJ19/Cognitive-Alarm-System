import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import adminService from '../../services/adminService';
import { User } from '../../types/auth.types';
import { AdminDashboardStats, AdminState } from '../../types/admin.types';

const initialState: AdminState = {
  users: [],
  coaches: [],
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

export const fetchAdminDashboardThunk = createAsyncThunk(
  'admin/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getDashboard();
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchUsersThunk = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getUsers();
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createUserThunk = createAsyncThunk(
  'admin/createUser',
  async (data: any, { rejectWithValue }) => {
    try {
      return await adminService.createUser(data);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateUserThunk = createAsyncThunk(
  'admin/updateUser',
  async ({ userId, data }: { userId: string; data: any }, { rejectWithValue }) => {
    try {
      return await adminService.updateUser(userId, data);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteUserThunk = createAsyncThunk(
  'admin/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await adminService.deleteUser(userId);
      return userId;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const toggleUserStatusThunk = createAsyncThunk(
  'admin/toggleStatus',
  async ({ userId, suspend }: { userId: string; suspend: boolean }, { rejectWithValue }) => {
    try {
      if (suspend) {
        return await adminService.suspendUser(userId);
      } else {
        return await adminService.activateUser(userId);
      }
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchCoachesThunk = createAsyncThunk(
  'admin/fetchCoaches',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getCoaches();
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchLogsThunk = createAsyncThunk(
  'admin/fetchLogs',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getLogs();
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchSettingsThunk = createAsyncThunk(
  'admin/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getSettings();
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateSettingsThunk = createAsyncThunk(
  'admin/updateSettings',
  async (settings: any, { rejectWithValue }) => {
    try {
      return await adminService.updateSettings(settings);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Dashboard
    builder.addCase(fetchAdminDashboardThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminDashboardThunk.fulfilled, (state, action: PayloadAction<AdminDashboardStats>) => {
      state.isLoading = false;
      state.dashboardStats = action.payload;
    });
    builder.addCase(fetchAdminDashboardThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Users
    builder.addCase(fetchUsersThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUsersThunk.fulfilled, (state, action: PayloadAction<User[]>) => {
      state.isLoading = false;
      state.users = action.payload;
    });
    builder.addCase(fetchUsersThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create User
    builder.addCase(createUserThunk.fulfilled, (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    });

    // Update User
    builder.addCase(updateUserThunk.fulfilled, (state, action: PayloadAction<User>) => {
      const idx = state.users.findIndex(u => u.id === action.payload.id);
      if (idx !== -1) {
        state.users[idx] = action.payload;
      }
    });

    // Delete User
    builder.addCase(deleteUserThunk.fulfilled, (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(u => u.id !== action.payload);
    });

    // Toggle Status
    builder.addCase(toggleUserStatusThunk.fulfilled, (state, action: PayloadAction<User>) => {
      const idx = state.users.findIndex(u => u.id === action.payload.id);
      if (idx !== -1) {
        state.users[idx] = action.payload;
      }
    });

    // Fetch Coaches
    builder.addCase(fetchCoachesThunk.fulfilled, (state, action: PayloadAction<User[]>) => {
      state.coaches = action.payload;
    });

    // Fetch Logs
    builder.addCase(fetchLogsThunk.fulfilled, (state, action: PayloadAction<any[]>) => {
      state.logs = action.payload;
    });

    // Settings
    builder.addCase(fetchSettingsThunk.fulfilled, (state, action: PayloadAction<any>) => {
      state.settings = action.payload;
    });
    builder.addCase(updateSettingsThunk.fulfilled, (state, action: PayloadAction<any>) => {
      state.settings = action.payload;
    });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
