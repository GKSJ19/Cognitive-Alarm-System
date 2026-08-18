import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchProfileThunk, 
  updateProfileThunk, 
  uploadPhotoThunk, 
  deletePhotoThunk, 
  clearProfileError 
} from '../store/slices/profileSlice';
import { Profile } from '../types/profile.types';

export const useProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, isLoading, error } = useSelector((state: RootState) => state.profile);

  const getProfile = useCallback(() => {
    return dispatch(fetchProfileThunk());
  }, [dispatch]);

  const updateProfile = useCallback((data: Partial<Profile>) => {
    return dispatch(updateProfileThunk(data));
  }, [dispatch]);

  const uploadPhoto = useCallback((uri: string, name: string, type: string) => {
    return dispatch(uploadPhotoThunk({ uri, name, type }));
  }, [dispatch]);

  const deletePhoto = useCallback(() => {
    return dispatch(deletePhotoThunk());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearProfileError());
  }, [dispatch]);

  return {
    profile,
    isLoading,
    error,
    getProfile,
    updateProfile,
    uploadPhoto,
    deletePhoto,
    clearError,
  };
};

export default useProfile;
