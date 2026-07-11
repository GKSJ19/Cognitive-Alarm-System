import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Alarm {
  _id?: string;
  user_id?: string;
  label: string;
  time: string;
  alarm_type: 'daily' | 'weekday' | 'weekend' | 'one-time';
  days_active: number[];
  is_active: boolean;
  sound_name: string;
  snooze_duration: number;
  vibration: boolean;
  snooze_enabled: boolean;
  difficulty: string;
  created_at?: string;
  updated_at?: string;
}

interface AlarmState {
  alarms: Alarm[];
  loading: boolean;
  error: string | null;
}

const initialState: AlarmState = {
  alarms: [],
  loading: false,
  error: null,
};

const alarmSlice = createSlice({
  name: 'alarms',
  initialState,
  reducers: {
    setAlarms: (state, action: PayloadAction<Alarm[]>) => {
      state.alarms = action.payload;
    },
    addAlarm: (state, action: PayloadAction<Alarm>) => {
      state.alarms.unshift(action.payload);
    },
    updateAlarm: (state, action: PayloadAction<Alarm>) => {
      const idx = state.alarms.findIndex(a => a._id === action.payload._id);
      if (idx !== -1) state.alarms[idx] = action.payload;
    },
    removeAlarm: (state, action: PayloadAction<string>) => {
      state.alarms = state.alarms.filter(a => a._id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setAlarms, addAlarm, updateAlarm, removeAlarm, setLoading, setError } = alarmSlice.actions;
export default alarmSlice.reducer;
