import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { authApi, userApi } from '../../services/api';
import type { User } from '../../types';

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    return null;
  }
  const profile = await userApi.getProfile();
  return { token, user: profile.data };
});

export const loginUser = createAsyncThunk('auth/login', async (payload: { email: string; password: string }, thunkApi) => {
  try {
    const response = await authApi.login(payload);
    const data = response.data;
    await AsyncStorage.setItem('accessToken', data.access_token);
    await AsyncStorage.setItem('refreshToken', data.refresh_token || '');
    const profile = await userApi.getProfile();
    return { token: data.access_token, user: profile.data };
  } catch (error: any) {
    return thunkApi.rejectWithValue(error.response?.data?.detail || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (payload: { name: string; email: string; password: string }, thunkApi) => {
  try {
    const response = await authApi.register(payload);
    const data = response.data;
    await AsyncStorage.setItem('accessToken', data.access_token);
    await AsyncStorage.setItem('refreshToken', data.refresh_token || '');
    const profile = await userApi.getProfile();
    return { token: data.access_token, user: profile.data };
  } catch (error: any) {
    return thunkApi.rejectWithValue(error.response?.data?.detail || 'Registration failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = Boolean(action.payload);
        state.token = action.payload?.token || null;
        state.user = action.payload?.user || null;
      })
      .addCase(bootstrapAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to restore session';
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = null;
      });
  },
});

export default authSlice.reducer;
