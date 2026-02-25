'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { authApi } from '@/services/api/auth';
import { toast } from 'react-toastify';
import logger from '@/utils/logger';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('E-posta adresi gereklidir');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Geçerli bir e-posta adresi girin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Backend'de forgot-password endpoint'i olmalı
      // Şimdilik mock response
      await authApi.forgotPassword({ email });

      setSuccess(true);
      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');

      // 3 saniye sonra login sayfasına yönlendir
      setTimeout(() => {
        router.push('/admin/login');
      }, 3000);
    } catch (error: any) {
      logger.error('Şifre sıfırlama hatası:', error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Şifre sıfırlama işlemi sırasında bir hata oluştu';
      setError(errorMessage);
      toast.error(errorMessage);
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
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Şifremi Unuttum</h1>
          <p className="text-white/90 mt-2">Şifrenizi sıfırlamak için e-posta adresinizi girin</p>
        </div>
        <div className="p-8">
          {success ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">E-posta gönderildi!</p>
                <p className="text-sm mt-2">
                  Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi.
                  Lütfen e-posta kutunuzu kontrol edin.
                </p>
              </div>
              <Link
                href="/admin/login"
                className="text-[#0066CC] dark:text-primary-light hover:underline text-sm"
              >
                Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm">
                  {error}
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-black focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white ${error ? 'border-red-500 dark:border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="ornek@skproduction.com"
                    disabled={loading}
                  />
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
                      Gönderiliyor...
                    </div>
                  ) : 'Şifre Sıfırlama Bağlantısı Gönder'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/admin/login"
                  className="text-sm text-[#0066CC] dark:text-primary-light hover:underline"
                >
                  ← Giriş sayfasına dön
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

