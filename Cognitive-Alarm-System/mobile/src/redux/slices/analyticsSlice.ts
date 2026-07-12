import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { analyticsApi } from '../../services/api';
import type { AnalyticsSummary } from '../../types';

type AnalyticsState = {
  summary: AnalyticsSummary | null;
  loading: boolean;
  error: string | null;
};

const initialState: AnalyticsState = {
  summary: null,
  loading: false,
  error: null,
};

export const fetchAnalytics = createAsyncThunk('analytics/fetch', async (_, thunkApi) => {
  try {
    const response = await analyticsApi.getSummary();
    const profile = response.data;
    return {
      alarms: 0,
      activeAlarms: 0,
      habitScore: 82,
      sleepGoal: profile.sleep_duration_mins ? `${profile.sleep_duration_mins} mins` : '8 hrs',
      wakeGoal: profile.preferred_wake_time || '06:30',
    } as AnalyticsSummary;
  } catch (error: any) {
    return thunkApi.rejectWithValue(error.response?.data?.detail || 'Unable to load analytics');
  }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default analyticsSlice.reducer;
