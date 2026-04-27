import apiClient from '../../../services/apiClient';
import { unwrapApiData, unwrapApiList } from '../../../utils/api';
import type { Invoice } from '../../../types';

export const invoiceService = {
  list: async () => unwrapApiList<Invoice>(await apiClient.get('/api/invoices/')),
  create: async (payload: Omit<Invoice, 'id' | 'amount' | 'status'>) => unwrapApiData<Invoice>(await apiClient.post('/api/invoices/', payload)),
  issue: async (id: number) => unwrapApiData<Invoice>(await apiClient.post(`/api/invoices/${id}/issue/`, { confirm: true })),
};
