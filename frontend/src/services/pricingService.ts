import apiClient from './apiClient';
import { unwrapApiData, unwrapApiList } from '../utils/api';
import type { PricingConfig } from '../types';

export const pricingService = {
  list: async () => unwrapApiList<PricingConfig>(await apiClient.get('/api/pricing-configs/')),
  create: async (payload: Omit<PricingConfig, 'id'>) => unwrapApiData<PricingConfig>(await apiClient.post('/api/pricing-configs/', payload)),
};
