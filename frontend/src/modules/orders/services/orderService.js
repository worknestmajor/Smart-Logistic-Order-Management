import apiClient from '../../../services/apiClient';

export const orderService = {
  list: async () => (await apiClient.get('/api/orders/')).data,
  create: async (payload) => (await apiClient.post('/api/orders/', payload)).data,
  transition: async (id, target_status) => (await apiClient.post(`/api/orders/${id}/transition-status/`, { target_status })).data,
  tracking: async (id, current_location) => (await apiClient.post(`/api/orders/${id}/tracking/`, { current_location })).data,
};
