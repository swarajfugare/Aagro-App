import apiClient from './client';
import { Buyer } from '../../types';

export const buyerService = {
  async getBuyers(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    const res = await apiClient.get('/buyers', { params });
    const data = res.data;
    if (Array.isArray(data)) {
      return { buyers: data, total: data.length };
    }
    return {
      buyers: data.buyers || data.items || [],
      total: data.total || (data.buyers || data.items || []).length,
    };
  },

  async getBuyerById(id: string): Promise<Buyer> {
    const res = await apiClient.get(`/buyers/${id}`);
    return res.data;
  },

  async verifyBuyer(id: string, payload: { status: 'VERIFIED' | 'REJECTED' | string; reviewNotes?: string }): Promise<Buyer> {
    const res = await apiClient.patch(`/buyers/${id}/verify`, payload);
    return res.data;
  },
};

export const buyersApi = {
  getAll: buyerService.getBuyers,
  getById: buyerService.getBuyerById,
  updateVerification: (id: string, status: string) => buyerService.verifyBuyer(id, { status }),
};
