import api from './api';
import { Profile } from '../types/profile.types';

export const profileService = {
  async getProfile(): Promise<Profile> {
    const response = await api.get<Profile>('/profile');
    return response.data;
  },

  async updateProfile(data: Partial<Profile>): Promise<Profile> {
    const response = await api.put<Profile>('/profile', data);
    return response.data;
  },

  async uploadPhoto(uri: string, name: string, type: string): Promise<Profile> {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name,
      type,
    } as any);
    
    const response = await api.post<Profile>('/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deletePhoto(): Promise<Profile> {
    const response = await api.delete<Profile>('/profile/photo');
    return response.data;
  }
};

export default profileService;
