import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import habitReducer from './slices/habitSlice';
import alarmReducer from './slices/alarmSlice';
import coachReducer from './slices/coachSlice';
import adminReducer from './slices/adminSlice';
import notificationReducer from './slices/notificationSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    habits: habitReducer,
    alarms: alarmReducer,
    coach: coachReducer,
    admin: adminReducer,
    notifications: notificationReducer,
    chat: chatReducer,
  },


  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
