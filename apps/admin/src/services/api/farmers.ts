import apiClient from './client';
import { Farmer } from '../../types';

export const farmerService = {
  async getFarmers(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    const res = await apiClient.get('/farmers', { params });
    const data = res.data;
    if (Array.isArray(data)) {
      return { farmers: data, total: data.length };
    }
    return {
      farmers: data.farmers || data.items || [],
      total: data.total || (data.farmers || data.items || []).length,
    };
  },

  async getFarmerById(id: string): Promise<Farmer> {
    const res = await apiClient.get(`/farmers/${id}`);
    return res.data;
  },

  async verifyFarmer(id: string, payload: { status: 'VERIFIED' | 'REJECTED' | string; reviewNotes?: string }): Promise<Farmer> {
    const res = await apiClient.patch(`/farmers/${id}/verify`, payload);
    return res.data;
  },
};

export const farmersApi = {
  getAll: farmerService.getFarmers,
  getById: farmerService.getFarmerById,
  updateVerification: (id: string, kycStatus: string) => farmerService.verifyFarmer(id, { status: kycStatus }),
};
