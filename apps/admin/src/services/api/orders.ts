import apiClient from './client';
import { Order } from '../../types';

export const orderService = {
  async getOrders(params?: { search?: string; status?: string; buyerId?: string; page?: number; limit?: number }) {
    const res = await apiClient.get('/orders', { params });
    const data = res.data;
    if (Array.isArray(data)) {
      return { orders: data, total: data.length };
    }
    return {
      orders: data.orders || data.items || [],
      total: data.total || (data.orders || data.items || []).length,
    };
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data;
  },

  async updateOrderStatus(id: string, payload: { status: string; reason?: string }): Promise<Order> {
    const res = await apiClient.patch(`/orders/${id}/status`, payload);
    return res.data;
  },
};

export const ordersApi = {
  getAll: orderService.getOrders,
  getById: orderService.getOrderById,
  updateStatus: orderService.updateOrderStatus,
};
