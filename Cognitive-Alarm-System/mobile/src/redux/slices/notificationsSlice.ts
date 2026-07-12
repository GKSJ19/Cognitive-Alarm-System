import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { notificationsApi } from '../../services/api';
import type { NotificationItem } from '../../types';

type NotificationsState = {
  items: NotificationItem[];
  loading: boolean;
  error: string | null;
};

const initialState: NotificationsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, thunkApi) => {
  try {
    const response = await notificationsApi.list();
    return response.data as NotificationItem[];
  } catch (error: any) {
    return thunkApi.rejectWithValue(error.response?.data?.detail || 'Unable to load notifications');
  }
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default notificationsSlice.reducer;
