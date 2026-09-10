import apiClient from './client';
import { Trip } from '../../types';

export const tripService = {
  async getTrips(params?: { search?: string; status?: string; driverId?: string; page?: number; limit?: number }) {
    const res = await apiClient.get('/trips', { params });
    const data = res.data;
    if (Array.isArray(data)) {
      return { trips: data, total: data.length };
    }
    return {
      trips: data.trips || data.items || [],
      total: data.total || (data.trips || data.items || []).length,
    };
  },

  async getTripById(id: string): Promise<Trip> {
    const res = await apiClient.get(`/trips/${id}`);
    return res.data;
  },
};

export const tripsApi = {
  getAll: tripService.getTrips,
  getById: tripService.getTripById,
};
