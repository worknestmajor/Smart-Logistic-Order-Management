import apiClient from '../../../services/apiClient';
import { unwrapApiData, unwrapApiList } from '../../../utils/api';
import type { Vehicle } from '../../../types';

export const vehicleService = {
  list: async () => unwrapApiList<Vehicle>(await apiClient.get('/api/vehicles/')),
  create: async (payload: Omit<Vehicle, 'id'>) => unwrapApiData<Vehicle>(await apiClient.post('/api/vehicles/', payload)),
};
