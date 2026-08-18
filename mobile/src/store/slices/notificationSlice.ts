import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NotificationState, BroadcastNotification, NotificationCreateReq } from '../../types/notification.types';
import notificationService from '../../services/notificationService';

const initialState: NotificationState = {
  notifications: [],
  adminNotifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getNotifications();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch notifications');
    }
  }
);

export const fetchAdminNotifications = createAsyncThunk(
  'notifications/fetchAdminNotifications',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getAdminNotifications();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch admin notifications');
    }
  }
);

export const publishNotification = createAsyncThunk(
  'notifications/publishNotification',
  async (data: NotificationCreateReq, { rejectWithValue, dispatch }) => {
    try {
      const res = await notificationService.publishNotification(data);
      dispatch(fetchAdminNotifications());
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to publish notification');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (notificationId: string, { rejectWithValue, dispatch }) => {
    try {
      await notificationService.markAsRead(notificationId);
      dispatch(fetchNotifications());
      return notificationId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to mark notification read');
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await notificationService.markAllAsRead();
      dispatch(fetchNotifications());
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to mark all read');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unread_count;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAdminNotifications.fulfilled, (state, action) => {
        state.adminNotifications = action.payload;
      });
  },
});

export const { clearNotificationError } = notificationSlice.actions;
export default notificationSlice.reducer;
