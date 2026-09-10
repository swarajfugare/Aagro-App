import apiClient from './client';
import { DashboardStats } from '../../types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await apiClient.get('/admin/dashboard');
    return res.data;
  },
};

export const dashboardApi = {
  getOverview: dashboardService.getStats,
};
