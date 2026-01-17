import axios from 'axios';
import Constants from 'expo-constants';
import { tokenStorage } from '../auth/tokenStorage';

const apiUrlFromExtra =
  (Constants.expoConfig?.extra as any)?.apiUrl ||
  (Constants.manifest2 as any)?.extra?.expoClient?.extra?.apiUrl;

const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined) ||
  (typeof apiUrlFromExtra === 'string' ? apiUrlFromExtra : undefined) ||
  'http://localhost:5001/api';

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'x-client': 'mobile'
  }
});

let isRefreshing = false;
let refreshWaiters: Array<(token: string | null) => void> = [];

const notifyRefreshWaiters = (token: string | null) => {
  refreshWaiters.forEach((cb) => cb(token));
  refreshWaiters = [];
};

http.interceptors.request.use(async (config) => {
  const accessToken = await tokenStorage.getAccessToken();
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config;
    const status = error?.response?.status;

    if (!original || status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      const token = await new Promise<string | null>((resolve) => refreshWaiters.push(resolve));
      if (!token) return Promise.reject(error);
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${token}`;
      return http(original);
    }

    isRefreshing = true;
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) {
        notifyRefreshWaiters(null);
        return Promise.reject(error);
      }

      const refreshRes = await axios.post(
        `${API_BASE_URL}/auth/refresh-token`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json', 'x-client': 'mobile' }, timeout: 15000 }
      );

      const newAccessToken: string | undefined = refreshRes.data?.accessToken;
      const newRefreshToken: string | undefined = refreshRes.data?.refreshToken;

      if (!newAccessToken) {
        notifyRefreshWaiters(null);
        return Promise.reject(error);
      }

      await tokenStorage.setAccessToken(newAccessToken);
      if (newRefreshToken) {
        await tokenStorage.setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });
      }

      notifyRefreshWaiters(newAccessToken);
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return http(original);
    } catch (e) {
      notifyRefreshWaiters(null);
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

