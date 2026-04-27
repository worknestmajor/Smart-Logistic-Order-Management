import apiClient from '../../../services/apiClient';
import { unwrapApiData, unwrapApiList } from '../../../utils/api';
import type { Assignment } from '../../../types';

export const assignmentService = {
  list: async () => unwrapApiList<Assignment>(await apiClient.get('/api/assignments/')),
  create: async (payload: Omit<Assignment, 'id' | 'assigned_at'>) => unwrapApiData<Assignment>(await apiClient.post('/api/assignments/', payload)),
};
