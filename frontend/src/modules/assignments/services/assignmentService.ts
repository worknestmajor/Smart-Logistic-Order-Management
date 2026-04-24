import apiClient from '../../../services/apiClient';
import type { Assignment } from '../../../types';

export const assignmentService = {
  list: async () => (await apiClient.get('/api/assignments/')).data,
  create: async (payload: Omit<Assignment, 'id' | 'assigned_at'>) => (await apiClient.post('/api/assignments/', payload)).data,
};
