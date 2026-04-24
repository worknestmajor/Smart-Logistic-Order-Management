import apiClient from '../../../services/apiClient';

export const assignmentService = {
  list: async () => (await apiClient.get('/api/assignments/')).data,
  create: async (payload) => (await apiClient.post('/api/assignments/', payload)).data,
};
