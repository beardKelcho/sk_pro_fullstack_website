import axios from 'axios';
import { LoginForm, RegisterForm } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const authApi = {
  login: (data: LoginForm) => axios.post(`${API_URL}/auth/login`, data),
  register: (data: RegisterForm) => axios.post(`${API_URL}/auth/register`, data),
  logout: () => axios.post(`${API_URL}/auth/logout`),
  refreshToken: () => axios.post(`${API_URL}/auth/refresh`),
  getProfile: () => axios.get(`${API_URL}/auth/profile`),
  updateProfile: (data: Partial<RegisterForm>) => axios.put(`${API_URL}/auth/profile`, data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    axios.put(`${API_URL}/auth/change-password`, data)
}; 