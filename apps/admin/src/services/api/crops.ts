import apiClient from './client';
import { Crop } from '../../types';

export const cropService = {
  async getCrops(params?: { search?: string; category?: string; page?: number; limit?: number }) {
    const res = await apiClient.get('/crops', { params });
    const data = res.data;
    if (Array.isArray(data)) {
      return { crops: data, total: data.length };
    }
    return {
      crops: data.crops || data.items || [],
      total: data.total || (data.crops || data.items || []).length,
    };
  },

  async getCropById(id: string): Promise<Crop> {
    const res = await apiClient.get(`/crops/${id}`);
    return res.data;
  },

  async createCrop(payload: {
    name: string;
    scientificName?: string;
    category: string;
    defaultUnit?: string;
    shelfLifeDays?: number;
    idealStorageTempMin?: number;
    idealStorageTempMax?: number;
    description?: string;
  }): Promise<Crop> {
    const res = await apiClient.post('/crops', payload);
    return res.data;
  },

  async addVariety(
    cropId: string,
    payload: {
      name: string;
      localName?: string;
      season?: string;
      maturityDays?: number;
      expectedYieldPerAcre?: number;
    },
  ) {
    const res = await apiClient.post(`/crops/${cropId}/varieties`, payload);
    return res.data;
  },
};

export const cropsApi = {
  getAll: cropService.getCrops,
  getById: cropService.getCropById,
  create: cropService.createCrop,
  addVariety: cropService.addVariety,
};
