'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { authApi } from '@/services/api/auth';
import PasswordInput from '@/components/ui/PasswordInput';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Hata mesajlarını temizle
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    // Email validasyonu
    if (!formData.email) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    
    // Şifre validasyonu
    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setLoginError('');
    
    try {
      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
      });
      
      console.log('Login response:', response.data); // Debug için
      
      if (response.data && response.data.success) {
        // Token'ı kaydet - "Beni hatırla" seçiliyse localStorage, değilse sessionStorage kullan
        if (response.data.accessToken) {
          if (formData.rememberMe) {
            localStorage.setItem('accessToken', response.data.accessToken);
          } else {
            sessionStorage.setItem('accessToken', response.data.accessToken);
          }
        }
        
        // Kullanıcı bilgilerini kaydet
        if (response.data.user) {
          if (formData.rememberMe) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          } else {
            sessionStorage.setItem('user', JSON.stringify(response.data.user));
          }
        }
        
        // Dashboard'a yönlendir
        router.push('/admin/dashboard');
      } else {
        const errorMsg = response.data?.message || 'Giriş başarısız';
        console.error('Login failed:', errorMsg);
        setLoginError(errorMsg);
      }
    } catch (error: any) {
      console.error('Giriş hatası:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Giriş işlemi sırasında bir hata oluştu';
      setLoginError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="bg-black dark:bg-black p-6 text-center">
          <div className="flex justify-center mb-4">
            <div>
              <Image 
                src="/images/sk-logo.png" 
                alt="SK Production Logo"
                width={120}
                height={40}
                priority
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">SK Production Admin</h1>
          <p className="text-white/90 mt-2">Yönetim paneline giriş yapın</p>
        </div>
        <div className="p-8">
          {loginError && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm">
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-posta Adresi
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-black focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                }`}
                placeholder="ornek@skproduction.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Şifre
                </label>
                <Link 
                  href={{
                    pathname: '/admin/forgot-password'
                  }}
                  className="text-sm text-black dark:text-gray-300 hover:underline"
                >
                  Şifremi Unuttum
                </Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-black focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-black dark:text-black focus:ring-black dark:focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Beni hatırla
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-black dark:bg-black text-white rounded-lg font-medium hover:bg-gray-900 dark:hover:bg-gray-900 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-black/50 dark:focus:ring-black/50 disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Giriş Yapılıyor...
                </div>
              ) : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 