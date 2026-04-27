import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { APP_CONFIG } from '../config/appConfig';

const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

const flushPendingRequests = (token: string) => {
  pendingRequests.forEach((resolve) => resolve(token));
  pendingRequests = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config as RetriableRequestConfig;
    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshResponse = await axios.post(`${APP_CONFIG.apiBaseUrl}/api/accounts/auth/token/refresh/`, { refresh });
        const newAccessToken = refreshResponse?.data?.access;
        if (!newAccessToken) {
          throw new Error('Access token missing in refresh response');
        }
        localStorage.setItem('access_token', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        flushPendingRequests(newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error?.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export default apiClient;
