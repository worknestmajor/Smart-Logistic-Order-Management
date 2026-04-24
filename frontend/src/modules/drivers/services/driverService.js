import apiClient from '../../../services/apiClient';

export const driverService = {
  list: async () => (await apiClient.get('/api/drivers/')).data,
  create: async (payload) => (await apiClient.post('/api/drivers/', payload)).data,
};
