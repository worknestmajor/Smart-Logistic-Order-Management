import apiClient from './apiClient';
import { unwrapApiData, unwrapApiList } from '../utils/api';
import type { Role, User } from '../types';

export const adminService = {
  listUsers: async () => unwrapApiList<User>(await apiClient.get('/api/accounts/users/')),
  listRoles: async () => unwrapApiList<Role>(await apiClient.get('/api/accounts/roles/')),
  createUser: async (payload: Partial<User> & { password: string; role: string | number }) => unwrapApiData<User>(await apiClient.post('/api/accounts/users/', payload)),
  updateUser: async (id: string | number, payload: Partial<User> & { password?: string }) => unwrapApiData<User>(await apiClient.patch(`/api/accounts/users/${id}/`, payload)),
  createRole: async (payload: Pick<Role, 'name' | 'code' | 'description'>) => unwrapApiData<Role>(await apiClient.post('/api/accounts/roles/', payload)),
  updateRole: async (id: string | number, payload: Partial<Pick<Role, 'name' | 'code' | 'description'>>) =>
    unwrapApiData<Role>(await apiClient.patch(`/api/accounts/roles/${id}/`, payload)),
};
