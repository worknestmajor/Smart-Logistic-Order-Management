import apiClient from '../../../services/apiClient';

export const vehicleService = {
  list: async () => (await apiClient.get('/api/vehicles/')).data,
  create: async (payload) => (await apiClient.post('/api/vehicles/', payload)).data,
};
