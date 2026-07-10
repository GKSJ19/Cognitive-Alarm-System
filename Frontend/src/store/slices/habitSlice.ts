import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import habitService from '../../services/habitService';
import { Habit, HabitProgress, HabitState } from '../../types/habit.types';

const initialState: HabitState = {
  habits: [],
  progress: [],
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

export const fetchHabitsThunk = createAsyncThunk(
  'habits/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await habitService.getHabits();
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createHabitThunk = createAsyncThunk(
  'habits/create',
  async (data: Partial<Habit>, { rejectWithValue }) => {
    try {
      return await habitService.createHabit(data);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateHabitThunk = createAsyncThunk(
  'habits/update',
  async ({ habitId, data }: { habitId: string; data: Partial<Habit> }, { rejectWithValue }) => {
    try {
      return await habitService.updateHabit(habitId, data);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteHabitThunk = createAsyncThunk(
  'habits/delete',
  async (habitId: string, { rejectWithValue }) => {
    try {
      await habitService.deleteHabit(habitId);
      return habitId;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchProgressThunk = createAsyncThunk(
  'habits/fetchProgress',
  async (_, { rejectWithValue }) => {
    try {
      return await habitService.getProgress();
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const completeHabitThunk = createAsyncThunk(
  'habits/complete',
  async ({ habitId, date, status }: { habitId: string; date: string; status?: string }, { rejectWithValue }) => {
    try {
      return await habitService.completeHabit(habitId, date, status);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const habitSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    clearHabitError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Habits
    builder.addCase(fetchHabitsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchHabitsThunk.fulfilled, (state, action: PayloadAction<Habit[]>) => {
      state.isLoading = false;
      state.habits = action.payload;
    });
    builder.addCase(fetchHabitsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create Habit
    builder.addCase(createHabitThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createHabitThunk.fulfilled, (state, action: PayloadAction<Habit>) => {
      state.isLoading = false;
      state.habits.push(action.payload);
    });
    builder.addCase(createHabitThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update Habit
    builder.addCase(updateHabitThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateHabitThunk.fulfilled, (state, action: PayloadAction<Habit>) => {
      state.isLoading = false;
      const index = state.habits.findIndex(h => h.habit_id === action.payload.habit_id);
      if (index !== -1) {
        state.habits[index] = action.payload;
      }
    });
    builder.addCase(updateHabitThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete Habit
    builder.addCase(deleteHabitThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteHabitThunk.fulfilled, (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.habits = state.habits.filter(h => h.habit_id !== action.payload);
      state.progress = state.progress.filter(p => p.habit_id !== action.payload);
    });
    builder.addCase(deleteHabitThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Progress
    builder.addCase(fetchProgressThunk.fulfilled, (state, action: PayloadAction<HabitProgress[]>) => {
      state.progress = action.payload;
    });

    // Complete Habit
    builder.addCase(completeHabitThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(completeHabitThunk.fulfilled, (state, action: PayloadAction<HabitProgress>) => {
      state.isLoading = false;
      const idx = state.progress.findIndex(
        p => p.habit_id === action.payload.habit_id && p.completion_date === action.payload.completion_date
      );
      if (idx !== -1) {
        state.progress[idx] = action.payload;
      } else {
        state.progress.push(action.payload);
      }
    });
    builder.addCase(completeHabitThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearHabitError } = habitSlice.actions;
export default habitSlice.reducer;
