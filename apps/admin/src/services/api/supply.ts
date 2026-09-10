import apiClient from './client';
import { SupplyBatch } from '../../types';

export const supplyService = {
  async getSupplyBatches(params?: { search?: string; status?: string; cropId?: string; page?: number; limit?: number }) {
    const res = await apiClient.get('/supply', { params });
    const data = res.data;
    if (Array.isArray(data)) {
      return { batches: data, total: data.length };
    }
    return {
      batches: data.batches || data.items || [],
      total: data.total || (data.batches || data.items || []).length,
    };
  },

  async getSupplyBatchById(id: string): Promise<SupplyBatch> {
    const res = await apiClient.get(`/supply/${id}`);
    return res.data;
  },
};

export const supplyApi = {
  getAll: supplyService.getSupplyBatches,
  getById: supplyService.getSupplyBatchById,
};
