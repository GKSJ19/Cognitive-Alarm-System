import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import alarmReducer from './alarmSlice';
import profileReducer from './profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    alarms: alarmReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
