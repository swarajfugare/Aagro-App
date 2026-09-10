import apiClient from './client';
import { BuyerDemand } from '../../types';

export const demandService = {
  async getDemands(params?: { search?: string; status?: string; cropId?: string; page?: number; limit?: number }) {
    const res = await apiClient.get('/demand', { params });
    const data = res.data;
    if (Array.isArray(data)) {
      return { demands: data, total: data.length };
    }
    return {
      demands: data.demands || data.items || [],
      total: data.total || (data.demands || data.items || []).length,
    };
  },

  async getDemandById(id: string): Promise<BuyerDemand> {
    const res = await apiClient.get(`/demand/${id}`);
    return res.data;
  },
};

export const demandApi = {
  getAll: demandService.getDemands,
  getById: demandService.getDemandById,
};
