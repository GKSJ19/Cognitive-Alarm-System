import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  loginThunk, 
  registerThunk, 
  logoutThunk, 
  verifyEmailThunk, 
  socialLoginThunk,
  loadSessionThunk,
  clearError
} from '../store/slices/authSlice';
import { LoginRequest, RegisterRequest, SocialLoginRequest } from '../types/auth.types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { user, token, refreshToken, isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const login = (data: LoginRequest) => dispatch(loginThunk(data)).unwrap();
  const register = (data: RegisterRequest) => dispatch(registerThunk(data)).unwrap();
  const socialLogin = (data: SocialLoginRequest) => dispatch(socialLoginThunk(data)).unwrap();
  const verifyEmail = (token: string) => dispatch(verifyEmailThunk(token)).unwrap();
  const logout = () => dispatch(logoutThunk()).unwrap();
  const bootstrapSession = () => dispatch(loadSessionThunk()).unwrap();
  const clearAuthError = () => dispatch(clearError());

  return {
    user,
    token,
    refreshToken,
    isLoading,
    error,
    isAuthenticated,
    role: user?.role || null,
    login,
    register,
    socialLogin,
    verifyEmail,
    logout,
    bootstrapSession,
    clearAuthError,
  };
};
export default useAuth;
