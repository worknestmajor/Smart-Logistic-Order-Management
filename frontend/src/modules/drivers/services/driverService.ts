import apiClient from '../../../services/apiClient';
import { unwrapApiData, unwrapApiList } from '../../../utils/api';
import type { Driver } from '../../../types';

export const driverService = {
  list: async () => unwrapApiList<Driver>(await apiClient.get('/api/drivers/')),
  create: async (payload: Omit<Driver, 'id'>) => unwrapApiData<Driver>(await apiClient.post('/api/drivers/', payload)),
};
