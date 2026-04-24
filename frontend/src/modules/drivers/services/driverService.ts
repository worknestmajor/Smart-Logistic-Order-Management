import apiClient from '../../../services/apiClient';
import type { Driver } from '../../../types';

export const driverService = {
  list: async () => (await apiClient.get('/api/drivers/')).data,
  create: async (payload: Omit<Driver, 'id'>) => (await apiClient.post('/api/drivers/', payload)).data,
};
