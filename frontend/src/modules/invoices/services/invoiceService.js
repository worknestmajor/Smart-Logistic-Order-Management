import apiClient from '../../../services/apiClient';

export const invoiceService = {
  list: async () => (await apiClient.get('/api/invoices/')).data,
  create: async (payload) => (await apiClient.post('/api/invoices/', payload)).data,
  issue: async (id) => (await apiClient.post(`/api/invoices/${id}/issue/`, { confirm: true })).data,
};
