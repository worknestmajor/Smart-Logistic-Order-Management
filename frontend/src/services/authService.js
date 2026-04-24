import apiClient from './apiClient';

export const authService = {
  login: async (credentials) => (await apiClient.post('/api/accounts/auth/token/', credentials)).data,
  refreshToken: async (refresh) => (await apiClient.post('/api/accounts/auth/token/refresh/', { refresh })).data,
};
