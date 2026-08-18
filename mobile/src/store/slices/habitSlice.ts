import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import habitService from '../../services/habitService';
import { 
  ChallengeResult, 
  HabitDashboardData, 
  RecordChallengeRequest, 
  HabitState 
} from '../../types/habit.types';

const initialState: HabitState = {
  dashboardData: null,
  history: [],
  latestScore: 0,
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

export const fetchHabitDashboardThunk = createAsyncThunk(
  'habits/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await habitService.getHabitDashboard();
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const recordChallengeResultThunk = createAsyncThunk(
  'habits/recordChallengeResult',
  async (data: RecordChallengeRequest, { dispatch, rejectWithValue }) => {
    try {
      const result = await habitService.recordChallengeResult(data);
      // Automatically refresh dashboard analytics in real-time
      dispatch(fetchHabitDashboardThunk());
      return result;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchChallengeHistoryThunk = createAsyncThunk(
  'habits/fetchHistory',
  async (limit: number | undefined, { rejectWithValue }) => {
    try {
      return await habitService.getChallengeHistory(limit);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchLatestScoreThunk = createAsyncThunk(
  'habits/fetchLatestScore',
  async (_, { rejectWithValue }) => {
    try {
      const res = await habitService.getLatestScore();
      return res.latest_habit_score;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// --- Legacy Thunks (Preserved for backwards compatibility) ---
export const fetchHabitsThunk = createAsyncThunk(
  'habits/fetch',
  async (_, { dispatch }) => {
    dispatch(fetchHabitDashboardThunk());
    return [];
  }
);

export const createHabitThunk = createAsyncThunk('habits/create', async () => ({}));
export const updateHabitThunk = createAsyncThunk('habits/update', async () => ({}));
export const deleteHabitThunk = createAsyncThunk('habits/delete', async () => ({}));
export const fetchProgressThunk = createAsyncThunk('habits/fetchProgress', async () => []);
export const completeHabitThunk = createAsyncThunk('habits/complete', async () => ({}));

const habitSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    clearHabitError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Dashboard
    builder.addCase(fetchHabitDashboardThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchHabitDashboardThunk.fulfilled, (state, action: PayloadAction<HabitDashboardData>) => {
      state.isLoading = false;
      state.dashboardData = action.payload;
      state.latestScore = action.payload.current_habit_score;
      state.history = action.payload.recent_history;
    });
    builder.addCase(fetchHabitDashboardThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Record Challenge Result
    builder.addCase(recordChallengeResultThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(recordChallengeResultThunk.fulfilled, (state, action: PayloadAction<ChallengeResult>) => {
      state.isLoading = false;
      state.latestScore = action.payload.habit_score;
      state.history.unshift(action.payload);
    });
    builder.addCase(recordChallengeResultThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch History
    builder.addCase(fetchChallengeHistoryThunk.fulfilled, (state, action: PayloadAction<ChallengeResult[]>) => {
      state.history = action.payload;
    });

    // Fetch Latest Score
    builder.addCase(fetchLatestScoreThunk.fulfilled, (state, action: PayloadAction<number>) => {
      state.latestScore = action.payload;
    });
  },
});

export const { clearHabitError } = habitSlice.actions;
export default habitSlice.reducer;
