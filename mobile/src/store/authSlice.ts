import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Platform } from 'react-native';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: any | null;
  isAuthenticated: boolean;
}

const getStoredToken = (): string | null => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('userToken');
  }
  return null;
};

const initialState: AuthState = {
  token: getStoredToken(),
  refreshToken: null,
  user: null,
  isAuthenticated: !!getStoredToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      if (Platform.OS === 'web') {
        localStorage.setItem('userToken', action.payload);
      }
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      state.refreshToken = action.payload;
      if (Platform.OS === 'web') {
        localStorage.setItem('refreshToken', action.payload);
      }
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      if (Platform.OS === 'web') {
        localStorage.removeItem('userToken');
        localStorage.removeItem('refreshToken');
      }
    },
  },
});

export const { setToken, setRefreshToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
