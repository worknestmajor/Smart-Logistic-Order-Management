import apiClient from '../../../services/apiClient';
import type { Invoice } from '../../../types';

export const invoiceService = {
  list: async () => (await apiClient.get('/api/invoices/')).data,
  create: async (payload: Omit<Invoice, 'id' | 'amount' | 'status'>) => (await apiClient.post('/api/invoices/', payload)).data,
  issue: async (id: number) => (await apiClient.post(`/api/invoices/${id}/issue/`, { confirm: true })).data,
};
