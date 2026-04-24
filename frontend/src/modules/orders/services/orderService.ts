import apiClient from '../../../services/apiClient';
import type { Order } from '../../../types';

export const orderService = {
  list: async () => (await apiClient.get('/api/orders/')).data,
  create: async (payload: Omit<Order, 'id' | 'status' | 'total_price'>) => (await apiClient.post('/api/orders/', payload)).data,
  transition: async (id: number, target_status: string) => (await apiClient.post(`/api/orders/${id}/transition-status/`, { target_status })).data,
  tracking: async (id: number, current_location: string) => (await apiClient.post(`/api/orders/${id}/tracking/`, { current_location })).data,
};
