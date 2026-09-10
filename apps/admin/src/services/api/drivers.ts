import apiClient from './client';
import { Driver } from '../../types';

export const driverService = {
  async getDrivers(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    const res = await apiClient.get('/drivers', { params });
    const data = res.data;
    if (Array.isArray(data)) {
      return { drivers: data, total: data.length };
    }
    return {
      drivers: data.drivers || data.items || [],
      total: data.total || (data.drivers || data.items || []).length,
    };
  },

  async getDriverById(id: string): Promise<Driver> {
    const res = await apiClient.get(`/drivers/${id}`);
    return res.data;
  },

  async verifyDriver(id: string, payload: { status: 'VERIFIED' | 'REJECTED' | string; reviewNotes?: string }): Promise<Driver> {
    const res = await apiClient.patch(`/drivers/${id}/verify`, payload);
    return res.data;
  },
};

export const driversApi = {
  getAll: driverService.getDrivers,
  getById: driverService.getDriverById,
  updateVerification: (id: string, status: string) => driverService.verifyDriver(id, { status }),
};
