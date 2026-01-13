import apiClient from './axios';
import { LoginForm, RegisterForm } from '@/types/auth';

export const authApi = {
  login: (data: LoginForm) => apiClient.post('/auth/login', data),
  register: (data: RegisterForm) => apiClient.post('/auth/register', data),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh-token'),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data: Partial<RegisterForm>) => apiClient.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    apiClient.put('/auth/change-password', data)
}; 