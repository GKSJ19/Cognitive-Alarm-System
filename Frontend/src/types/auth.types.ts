export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'coach' | 'admin';
  is_active: boolean;
  is_verified: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: 'user' | 'coach' | 'admin';
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface SocialLoginRequest {
  provider: 'google' | 'apple';
  identity_token: string;
  email?: string;
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}
