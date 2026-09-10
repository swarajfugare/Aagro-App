import apiClient from './client';
import { UserProfile } from '@/types';

export const authApi = {
  async getMe(): Promise<UserProfile> {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
};
