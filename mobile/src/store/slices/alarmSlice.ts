import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import alarmService from '../../services/alarmService';
import { Alarm, AlarmHistory, AlarmState } from '../../types/alarm.types';

const initialState: AlarmState = {
  alarms: [],
  history: [],
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

export const fetchAlarmsThunk = createAsyncThunk(
  'alarms/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await alarmService.getAlarms();
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createAlarmThunk = createAsyncThunk(
  'alarms/create',
  async (data: Partial<Alarm>, { rejectWithValue }) => {
    try {
      return await alarmService.createAlarm(data);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateAlarmThunk = createAsyncThunk(
  'alarms/update',
  async ({ alarmId, data }: { alarmId: string; data: Partial<Alarm> }, { rejectWithValue }) => {
    try {
      return await alarmService.updateAlarm(alarmId, data);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteAlarmThunk = createAsyncThunk(
  'alarms/delete',
  async (alarmId: string, { rejectWithValue }) => {
    try {
      await alarmService.deleteAlarm(alarmId);
      return alarmId;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchAlarmHistoryThunk = createAsyncThunk(
  'alarms/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      return await alarmService.getHistory();
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const dismissAlarmThunk = createAsyncThunk(
  'alarms/dismiss',
  async (
    { alarmId, wakeTime, solved, solveTime }: { alarmId: string; wakeTime: string; solved: boolean; solveTime: number },
    { rejectWithValue }
  ) => {
    try {
      return await alarmService.dismissAlarm(alarmId, wakeTime, solved, solveTime);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const alarmSlice = createSlice({
  name: 'alarms',
  initialState,
  reducers: {
    clearAlarmError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Alarms
    builder.addCase(fetchAlarmsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAlarmsThunk.fulfilled, (state, action: PayloadAction<Alarm[]>) => {
      state.isLoading = false;
      state.alarms = action.payload;
    });
    builder.addCase(fetchAlarmsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create Alarm
    builder.addCase(createAlarmThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createAlarmThunk.fulfilled, (state, action: PayloadAction<Alarm>) => {
      state.isLoading = false;
      state.alarms.push(action.payload);
    });
    builder.addCase(createAlarmThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update Alarm
    builder.addCase(updateAlarmThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateAlarmThunk.fulfilled, (state, action: PayloadAction<Alarm>) => {
      state.isLoading = false;
      const index = state.alarms.findIndex(a => a.alarm_id === action.payload.alarm_id);
      if (index !== -1) {
        state.alarms[index] = action.payload;
      }
    });
    builder.addCase(updateAlarmThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete Alarm
    builder.addCase(deleteAlarmThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteAlarmThunk.fulfilled, (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.alarms = state.alarms.filter(a => a.alarm_id !== action.payload);
    });
    builder.addCase(deleteAlarmThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch History
    builder.addCase(fetchAlarmHistoryThunk.fulfilled, (state, action: PayloadAction<AlarmHistory[]>) => {
      state.history = action.payload;
    });

    // Dismiss Alarm
    builder.addCase(dismissAlarmThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(dismissAlarmThunk.fulfilled, (state, action: PayloadAction<AlarmHistory>) => {
      state.isLoading = false;
      state.history.push(action.payload);
    });
    builder.addCase(dismissAlarmThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearAlarmError } = alarmSlice.actions;
export default alarmSlice.reducer;
