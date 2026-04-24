import apiClient from '../../../services/apiClient';
import type { Vehicle } from '../../../types';

export const vehicleService = {
  list: async () => (await apiClient.get('/api/vehicles/')).data,
  create: async (payload: Omit<Vehicle, 'id'>) => (await apiClient.post('/api/vehicles/', payload)).data,
};
