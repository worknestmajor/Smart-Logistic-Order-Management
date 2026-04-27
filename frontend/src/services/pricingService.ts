import apiClient from './apiClient';
import { unwrapApiData, unwrapApiList } from '../utils/api';
import type { PricingConfig } from '../types';

export const pricingService = {
  list: async () => unwrapApiList<PricingConfig>(await apiClient.get('/api/pricing-configs/')),
  create: async (payload: Omit<PricingConfig, 'id'>) => unwrapApiData<PricingConfig>(await apiClient.post('/api/pricing-configs/', payload)),
  update: async (id: number, payload: Partial<Omit<PricingConfig, 'id'>>) => unwrapApiData<PricingConfig>(await apiClient.patch(`/api/pricing-configs/${id}/`, payload)),
  archive: async (id: number) => unwrapApiData<{ success?: boolean }>(await apiClient.delete(`/api/pricing-configs/${id}/`)),
};
