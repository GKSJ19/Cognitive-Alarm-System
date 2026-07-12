import { configureStore } from '@reduxjs/toolkit';

import alarmsReducer from './slices/alarmsSlice';
import analyticsReducer from './slices/analyticsSlice';
import authReducer from './slices/authSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    alarms: alarmsReducer,
    analytics: analyticsReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
