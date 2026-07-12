import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { alarmsApi } from '../../services/api';
import type { Alarm } from '../../types';

type AlarmsState = {
  items: Alarm[];
  loading: boolean;
  error: string | null;
};

const initialState: AlarmsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchAlarms = createAsyncThunk('alarms/fetch', async (_, thunkApi) => {
  try {
    const response = await alarmsApi.list();
    return response.data as Alarm[];
  } catch (error: any) {
    return thunkApi.rejectWithValue(error.response?.data?.detail || 'Unable to load alarms');
  }
});

export const createAlarm = createAsyncThunk('alarms/create', async (payload: Record<string, any>, thunkApi) => {
  try {
    const resp = await alarmsApi.create(payload);
    return resp.data as Alarm;
  } catch (error: any) {
    return thunkApi.rejectWithValue(error.response?.data?.detail || 'Unable to create alarm');
  }
});

export const updateAlarm = createAsyncThunk('alarms/update', async ({ id, payload }: { id: string; payload: Record<string, any> }, thunkApi) => {
  try {
    const resp = await alarmsApi.update(id, payload);
    return resp.data as Alarm;
  } catch (error: any) {
    return thunkApi.rejectWithValue(error.response?.data?.detail || 'Unable to update alarm');
  }
});

export const deleteAlarm = createAsyncThunk('alarms/delete', async (id: string, thunkApi) => {
  try {
    await alarmsApi.remove(id);
    return id;
  } catch (error: any) {
    return thunkApi.rejectWithValue(error.response?.data?.detail || 'Unable to delete alarm');
  }
});

const alarmsSlice = createSlice({
  name: 'alarms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlarms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlarms.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAlarms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(createAlarm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAlarm.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createAlarm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateAlarm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAlarm.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((i) => (i.id === action.payload.id ? action.payload : i));
      })
      .addCase(updateAlarm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteAlarm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAlarm.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((i) => i.id !== action.payload);
      })
      .addCase(deleteAlarm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default alarmsSlice.reducer;
