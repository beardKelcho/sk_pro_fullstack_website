'use client';

import React, { useState } from 'react';
import { use2FAStatus, useSetup2FA, useVerify2FA, useDisable2FA } from '@/services/twoFactorService';
import { toast } from 'react-toastify';
import Link from 'next/link';
import PasswordInput from '@/components/ui/PasswordInput';
import LazyImage from '@/components/common/LazyImage';

export default function TwoFactorPage() {
  const { data: status, isLoading, refetch } = use2FAStatus();
  const setupMutation = useSetup2FA();
  const verifyMutation = useVerify2FA();
  const disableMutation = useDisable2FA();

  const [step, setStep] = useState<'status' | 'setup' | 'verify' | 'disable'>('status');
  const [qrCode, setQrCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [token, setToken] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [disableToken, setDisableToken] = useState('');
  const [disableBackupCode, setDisableBackupCode] = useState('');

  const is2FAEnabled = status?.is2FAEnabled || false;

  const handleSetup = async () => {
    try {
      const result = await setupMutation.mutateAsync();
      setQrCode(result.qrCode);
      setBackupCodes(result.backupCodes);
      setStep('verify');
      toast.success('QR kod oluşturuldu. Lütfen uygulamanızla tarayın ve doğrulama kodunu girin.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || '2FA kurulumu başlatılırken bir hata oluştu');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token && !backupCode) {
      toast.error('Lütfen doğrulama kodu veya backup kod girin');
      return;
    }

    try {
      await verifyMutation.mutateAsync({ token, backupCode });
      toast.success('2FA başarıyla aktif edildi!');
      setStep('status');
      setToken('');
      setBackupCode('');
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || '2FA doğrulama başarısız');
    }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) {
      toast.error('Lütfen şifrenizi girin');
      return;
    }

    try {
      await disableMutation.mutateAsync({
        password: disablePassword,
        token: disableToken || undefined,
        backupCode: disableBackupCode || undefined,
      });
      toast.success('2FA başarıyla devre dışı bırakıldı');
      setStep('status');
      setDisablePassword('');
      setDisableToken('');
      setDisableBackupCode('');
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || '2FA devre dışı bırakma başarısız');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/profile" className="inline-flex items-center text-[#0066CC] dark:text-primary-light hover:underline mb-2">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Profil Ayarları
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">İki Faktörlü Kimlik Doğrulama (2FA)</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Hesabınızı ekstra bir güvenlik katmanı ile koruyun
          </p>
        </div>
      </div>

      {/* Status Card */}
      {step === 'status' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                2FA Durumu
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {is2FAEnabled ? (
                  <span className="text-green-600 dark:text-green-400 font-medium">2FA Aktif</span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">2FA Devre Dışı</span>
                )}
              </p>
            </div>
            {is2FAEnabled ? (
              <button
                onClick={() => setStep('disable')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-colors"
              >
                2FA'yı Devre Dışı Bırak
              </button>
            ) : (
              <button
                onClick={handleSetup}
                disabled={setupMutation.isPending}
                className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {setupMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Kurulum Başlatılıyor...
                  </>
                ) : (
                  "2FA'yı Etkinleştir"
                )}
              </button>
            )}
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200">2FA Hakkında</h3>
                <ul className="mt-2 text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• 2FA, hesabınıza ekstra bir güvenlik katmanı ekler</li>
                  <li>• Google Authenticator veya benzeri bir uygulama kullanmanız gerekir</li>
                  <li>• Her girişte telefonunuzdan bir doğrulama kodu girmeniz gerekir</li>
                  <li>• Backup kodlarınızı güvenli bir yerde saklayın</li>
                  <li>• 2FA zorunlu değildir, ancak önerilir</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Setup Step - QR Code */}
      {step === 'verify' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              QR Kodu Tarayın
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Google Authenticator veya benzeri bir uygulama ile QR kodu tarayın
            </p>
            <div className="flex justify-center mb-6">
              {qrCode && (
                <LazyImage
                  src={qrCode}
                  alt="2FA QR Code"
                  className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white"
                  width={256}
                  height={256}
                  sizes="256px"
                  quality={100}
                  priority
                />
              )}
            </div>
          </div>

          {/* Backup Codes */}
          {backupCodes.length > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-2">
                ⚠️ Backup Kodlarınızı Kaydedin
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                Bu kodlar sadece bir kez gösterilir. Güvenli bir yerde saklayın:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="p-2 bg-white dark:bg-gray-800 rounded border border-yellow-300 dark:border-yellow-700 font-mono text-sm text-center">
                    {code}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verify Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Doğrulama Kodu (6 haneli)
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:bg-gray-700 dark:text-white text-center text-2xl tracking-widest"
              />
            </div>
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm">veya</div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Backup Kod
              </label>
              <input
                type="text"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:bg-gray-700 dark:text-white text-center font-mono"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep('status');
                  setToken('');
                  setBackupCode('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={verifyMutation.isPending}
                className="flex-1 px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyMutation.isPending ? 'Doğrulanıyor...' : 'Doğrula ve Aktif Et'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Disable Step */}
      {step === 'disable' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              2FA'yı Devre Dışı Bırak
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Güvenlik için şifrenizi ve 2FA kodunuzu girmeniz gerekiyor
            </p>
          </div>

          <form onSubmit={handleDisable} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Şifre <span className="text-red-500">*</span>
              </label>
              <PasswordInput
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Doğrulama Kodu (Opsiyonel ama önerilir)
              </label>
              <input
                type="text"
                value={disableToken}
                onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:bg-gray-700 dark:text-white text-center text-2xl tracking-widest"
              />
            </div>
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm">veya</div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Backup Kod (Opsiyonel ama önerilir)
              </label>
              <input
                type="text"
                value={disableBackupCode}
                onChange={(e) => setDisableBackupCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:bg-gray-700 dark:text-white text-center font-mono"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep('status');
                  setDisablePassword('');
                  setDisableToken('');
                  setDisableBackupCode('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={disableMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {disableMutation.isPending ? 'Devre Dışı Bırakılıyor...' : "2FA'yı Devre Dışı Bırak"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

