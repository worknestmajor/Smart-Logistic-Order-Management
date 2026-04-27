import apiClient from './apiClient';
import { unwrapApiData, unwrapApiList } from '../utils/api';
import type { AuthTokens, LoginPayload, Role, User } from '../types';
import type { Id } from '../types';

interface JwtPayload {
  user_id?: string | number;
  email?: string;
  username?: string;
  role?: string | number;
}

const debugAuth = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.log('[AUTH DEBUG]', ...args);
  }
};

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
    debugAuth('buildUserFromToken payload', payload);
    if (!payload) return null;
    return {
      id: payload.user_id,
      email: payload.email || payload.username || '',
      role: payload.role || '',
    };
  },
  getUserById: async (id?: Id) => {
    debugAuth('getUserById request', { id });
    if (!id) return null;
    const response = await apiClient.get(`/api/accounts/users/${id}/`);
    const user = unwrapApiData<User>(response);
    debugAuth('getUserById response', user);
    return user;
  },
  getUsers: async () => unwrapApiList<User>(await apiClient.get('/api/accounts/users/')),
  getRoles: async () => unwrapApiList<Role>(await apiClient.get('/api/accounts/roles/')),
  enrichUserRole: async (user: User) => {
    debugAuth('enrichUserRole input', user);
    if (!user) return user;
    const roleValue = user.role ?? user.user_role;
    if (!roleValue) return user;
    try {
      const roles = await authService.getRoles();
      const normalizedRoleValue = String(roleValue).toLowerCase();
      const matchedRole = roles.find((role) => {
        const idMatch = String(role.id) === String(roleValue);
        const codeMatch = String(role.code || '').toLowerCase() === normalizedRoleValue;
        const nameMatch = String(role.name || '').toLowerCase() === normalizedRoleValue;
        return idMatch || codeMatch || nameMatch;
      });
      debugAuth('enrichUserRole role resolution', { roleValue, matchedRole });
      if (!matchedRole) return user;
      const resolvedRole = matchedRole.code || matchedRole.name || String(roleValue);
      const resolvedUser = { ...user, role: resolvedRole, user_role: resolvedRole };
      debugAuth('enrichUserRole output', resolvedUser);
      return resolvedUser;
    } catch {
      debugAuth('enrichUserRole failed to fetch roles');
      return user;
    }
  },
};
