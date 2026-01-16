'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { authApi } from '@/services/api/auth';
import PasswordInput from '@/components/ui/PasswordInput';
import { useVerify2FALogin } from '@/services/twoFactorService';
import { toast } from 'react-toastify';
import logger from '@/utils/logger';

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
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [twoFactorBackupCode, setTwoFactorBackupCode] = useState('');
  const verify2FAMutation = useVerify2FALogin();

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
    
    // Email / telefon validasyonu
    if (!formData.email) {
      newErrors.email = 'E-posta veya telefon gereklidir';
    } else {
      const v = formData.email.trim();
      const isEmail = /\S+@\S+\.\S+/.test(v);
      const normalizedPhone = v.replace(/[^\d+]/g, '');
      const isPhone = /^\+?[0-9]{10,15}$/.test(normalizedPhone);
      if (!isEmail && !isPhone) {
        newErrors.email = 'Geçerli bir e-posta veya telefon girin';
      }
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
      
      logger.debug('Login response:', response.data);
      
      if (response.data && response.data.success) {
        // 2FA kontrolü
        if (response.data.requires2FA) {
          setRequires2FA(true);
          setLoading(false);
          return;
        }

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
        logger.error('Login failed:', errorMsg);
        setLoginError(errorMsg);
      }
    } catch (error: any) {
      logger.error('Giriş hatası:', error);
      logger.error('Error response:', error.response?.data);
      const backend = error.response?.data;
      const validationMsg =
        Array.isArray(backend?.errors) && backend.errors.length
          ? backend.errors.map((e: any) => e.msg).filter(Boolean).join(' • ')
          : '';
      const errorMessage =
        validationMsg ||
        backend?.message ||
        backend?.error ||
        error.message ||
        'Giriş işlemi sırasında bir hata oluştu';
      setLoginError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!twoFactorToken && !twoFactorBackupCode) {
      setLoginError('Lütfen doğrulama kodu veya backup kod girin');
      return;
    }

    setLoading(true);
    setLoginError('');

    try {
      const response = await verify2FAMutation.mutateAsync({
        email: formData.email,
        token: twoFactorToken || undefined,
        backupCode: twoFactorBackupCode || undefined,
      });

      if (response.success && response.accessToken) {
        // Token'ı kaydet
        if (formData.rememberMe) {
          localStorage.setItem('accessToken', response.accessToken);
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }
        } else {
          sessionStorage.setItem('accessToken', response.accessToken);
          if (response.user) {
            sessionStorage.setItem('user', JSON.stringify(response.user));
          }
        }

        // Dashboard'a yönlendir
        router.push('/admin/dashboard');
      } else {
        setLoginError(response.message || '2FA doğrulama başarısız');
      }
    } catch (error: any) {
      logger.error('2FA doğrulama hatası:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          '2FA doğrulama sırasında bir hata oluştu';
      setLoginError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* background */}
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#0066CC]/25 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-[#00C49F]/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:28px_28px]" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
          {/* left panel */}
          <div className="hidden lg:flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-2xl">
            <div>
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#0066CC] to-[#00C49F] shadow-lg shadow-[#0066CC]/20" />
                <div>
                  <p className="text-sm font-semibold tracking-wide text-white/90">SK Production</p>
                  <p className="text-xs text-white/60">Admin Panel</p>
                </div>
              </div>

              <h1 className="mt-8 text-3xl font-bold leading-tight">Operasyonlarını tek panelden yönet.</h1>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                Ekipman, proje, görev ve bakım süreçlerini güvenli şekilde takip et. Real-time bildirimler ve monitoring
                kartları ile her şey kontrol altında.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  'Rol tabanlı erişim (RBAC) + güvenli oturum',
                  'Monitoring & Analytics dashboardları',
                  'Gerçek zamanlı bildirimler (SSE)',
                ].map((t) => (
                  <div key={t} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/10 border border-white/10">
                      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-white/80" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.293a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 011.414-1.414l2.793 2.793 6.793-6.793a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-white/70">{t}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-white/50">
              Güvenlik notu: Şüpheli girişlerde rate limit ve 2FA koruması devrededir.
            </p>
          </div>

          {/* right panel */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="p-8 sm:p-10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/sk-logo.png"
                    alt="SK Production Logo"
                    width={132}
                    height={44}
                    priority
                    style={{ width: 'auto', height: 'auto' }}
                  />
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-white">Admin Girişi</p>
                    <p className="text-xs text-white/60">Yetkili kullanıcılar için</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00C49F]" />
                  Secure
                </div>
              </div>

              <div className="mt-8">
                {loginError ? (
                  <div
                    className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                    role="alert"
                  >
                    {loginError}
                  </div>
                ) : null}

                {!requires2FA ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                        E-posta / Telefon
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.6"
                              d="M21 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8m18 0a2 2 0 00-2-2H5a2 2 0 00-2 2m18 0l-9 6-9-6"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          autoComplete="username"
                          inputMode="email"
                          className={`w-full rounded-xl border bg-black/30 px-4 py-3 pl-11 text-white placeholder-white/30 outline-none transition focus:ring-4 ${
                            errors.email
                              ? 'border-red-500/50 focus:ring-red-500/20'
                              : 'border-white/10 focus:border-white/20 focus:ring-white/10'
                          }`}
                          placeholder="ornek@skproduction.com veya +905xxxxxxxxx"
                          aria-invalid={Boolean(errors.email)}
                        />
                      </div>
                      {errors.email ? <p className="mt-2 text-xs text-red-200">{errors.email}</p> : null}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="password" className="block text-sm font-medium text-white/80">
                          Şifre
                        </label>
                        <Link
                          href={{ pathname: '/admin/forgot-password' }}
                          className="text-xs text-white/60 hover:text-white underline-offset-4 hover:underline"
                        >
                          Şifremi unuttum
                        </Link>
                      </div>
                      <PasswordInput
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        placeholder="••••••••"
                        className={`w-full rounded-xl border bg-black/30 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:ring-4 ${
                          errors.password
                            ? 'border-red-500/50 focus:ring-red-500/20'
                            : 'border-white/10 focus:border-white/20 focus:ring-white/10'
                        }`}
                      />
                      {errors.password ? <p className="mt-2 text-xs text-red-200">{errors.password}</p> : null}
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-white/70">
                        <input
                          type="checkbox"
                          id="rememberMe"
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-white/20 bg-black/30 text-[#00C49F] focus:ring-4 focus:ring-white/10"
                        />
                        Beni hatırla
                      </label>
                      <span className="text-xs text-white/50">1 saatlik oturum • refresh token</span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-xl bg-gradient-to-r from-[#0066CC] to-[#00C49F] px-4 py-3 font-semibold text-white shadow-lg shadow-[#0066CC]/20 transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#0066CC]/30 disabled:opacity-70"
                    >
                      {loading ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                            <path
                              d="M4 12a8 8 0 018-8"
                              stroke="currentColor"
                              strokeWidth="4"
                              strokeLinecap="round"
                              opacity="0.85"
                            />
                          </svg>
                          Giriş yapılıyor…
                        </span>
                      ) : (
                        'Giriş Yap'
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handle2FAVerify} className="space-y-5">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/80" fill="none" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.6"
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">2FA doğrulaması</p>
                          <p className="text-xs text-white/60">
                            Authenticator kodunu gir veya backup kod kullan.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="twoFactorToken" className="block text-sm font-medium text-white/80 mb-2">
                        Doğrulama Kodu (6 hane)
                      </label>
                      <input
                        type="text"
                        id="twoFactorToken"
                        value={twoFactorToken}
                        onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-center text-2xl tracking-[0.35em] text-white outline-none transition focus:border-white/20 focus:ring-4 focus:ring-white/10"
                      />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-white/50">
                      <div className="h-px flex-1 bg-white/10" />
                      veya
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div>
                      <label htmlFor="twoFactorBackupCode" className="block text-sm font-medium text-white/80 mb-2">
                        Backup Kod
                      </label>
                      <input
                        type="text"
                        id="twoFactorBackupCode"
                        value={twoFactorBackupCode}
                        onChange={(e) => setTwoFactorBackupCode(e.target.value.toUpperCase())}
                        placeholder="XXXX-XXXX"
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-center font-mono text-white outline-none transition focus:border-white/20 focus:ring-4 focus:ring-white/10"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setRequires2FA(false);
                          setTwoFactorToken('');
                          setTwoFactorBackupCode('');
                          setLoginError('');
                        }}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                      >
                        Geri
                      </button>
                      <button
                        type="submit"
                        disabled={loading || verify2FAMutation.isPending}
                        className="flex-1 rounded-xl bg-gradient-to-r from-[#0066CC] to-[#00C49F] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0066CC]/20 transition hover:brightness-110 disabled:opacity-70"
                      >
                        {loading || verify2FAMutation.isPending ? 'Doğrulanıyor…' : 'Doğrula ve Giriş Yap'}
                      </button>
                    </div>
                  </form>
                )}

                <p className="mt-6 text-center text-xs text-white/40">
                  © {new Date().getFullYear()} SK Production • Güvenli giriş
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 