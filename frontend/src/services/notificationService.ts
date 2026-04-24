import apiClient from './apiClient';
import { unwrapApiList } from '../utils/api';
import type { NotificationItem } from '../types';

export const notificationService = {
  list: async () => unwrapApiList<NotificationItem>(await apiClient.get('/api/notifications/')),
};
