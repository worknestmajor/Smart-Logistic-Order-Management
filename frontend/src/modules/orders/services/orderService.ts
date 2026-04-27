import apiClient from '../../../services/apiClient';
import { unwrapApiData, unwrapApiList } from '../../../utils/api';
import type { Order } from '../../../types';

export type OrderCreatePayload = Omit<Order, 'id' | 'order_number' | 'status' | 'total_price'>;

export const orderService = {
  list: async () => unwrapApiList<Order>(await apiClient.get('/api/orders/')),
  create: async (payload: OrderCreatePayload) => unwrapApiData<Order>(await apiClient.post('/api/orders/', payload)),
  transition: async (id: number, target_status: string) => unwrapApiData<Order>(await apiClient.post(`/api/orders/${id}/transition-status/`, { target_status })),
  tracking: async (id: number, current_location: string) => unwrapApiData<Order>(await apiClient.post(`/api/orders/${id}/tracking/`, { current_location })),
};
