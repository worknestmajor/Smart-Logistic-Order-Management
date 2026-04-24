import apiClient from './apiClient';
import { unwrapApiData, unwrapApiList } from '../utils/api';
import type { AuthTokens, LoginPayload, Role, User } from '../types';

interface JwtPayload {
  user_id?: number;
  email?: string;
  username?: string;
  role?: string | number;
}

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const payloadPart = token?.split('.')[1];
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const authService = {
  login: async (credentials: LoginPayload) => (await apiClient.post<AuthTokens>('/api/accounts/auth/token/', credentials)).data,
  refreshToken: async (refresh: string) => (await apiClient.post<AuthTokens>('/api/accounts/auth/token/refresh/', { refresh })).data,
  buildUserFromToken: (token: string): User | null => {
    const payload = decodeJwtPayload(token);
    if (!payload) return null;
    return {
      id: payload.user_id,
      email: payload.email || payload.username || '',
      role: payload.role || '',
    };
  },
  getUserById: async (id?: number) => {
    if (!id) return null;
    const response = await apiClient.get(`/api/accounts/users/${id}/`);
    return unwrapApiData<User>(response);
  },
  getUsers: async () => unwrapApiList<User>(await apiClient.get('/api/accounts/users/')),
  getRoles: async () => unwrapApiList<Role>(await apiClient.get('/api/accounts/roles/')),
  enrichUserRole: async (user: User) => {
    if (!user || typeof user.role !== 'number') return user;
    try {
      const roles = await authService.getRoles();
      const matchedRole = roles.find((role) => role.id === user.role);
      if (!matchedRole) return user;
      return { ...user, role: matchedRole.code || matchedRole.name || user.role };
    } catch {
      return user;
    }
  },
};
