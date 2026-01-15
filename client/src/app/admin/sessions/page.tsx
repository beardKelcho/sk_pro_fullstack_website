'use client';

import React, { useState } from 'react';
import { useActiveSessions, useTerminateSession, useTerminateAllOtherSessions } from '@/services/sessionService';
import { toast } from 'react-toastify';
// Basit tarih formatlama fonksiyonları
const formatDistanceToNow = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} gün önce`;
  if (hours > 0) return `${hours} saat önce`;
  if (minutes > 0) return `${minutes} dakika önce`;
  return 'Az önce';
};

const getDeviceIcon = (deviceInfo?: { browser?: string; os?: string }) => {
  const os = deviceInfo?.os?.toLowerCase() || '';
  const browser = deviceInfo?.browser?.toLowerCase() || '';

  if (os.includes('windows') || os.includes('win')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    );
  } else if (os.includes('mac') || os.includes('ios')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  } else if (os.includes('android') || os.includes('linux')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
};

const getBrowserName = (deviceInfo?: { browser?: string }) => {
  const browser = deviceInfo?.browser?.toLowerCase() || '';
  if (browser.includes('chrome')) return 'Chrome';
  if (browser.includes('firefox')) return 'Firefox';
  if (browser.includes('safari')) return 'Safari';
  if (browser.includes('edge')) return 'Edge';
  if (browser.includes('opera')) return 'Opera';
  return deviceInfo?.browser || 'Bilinmeyen';
};

const getOSName = (deviceInfo?: { os?: string }) => {
  const os = deviceInfo?.os?.toLowerCase() || '';
  if (os.includes('windows')) return 'Windows';
  if (os.includes('mac')) return 'macOS';
  if (os.includes('ios')) return 'iOS';
  if (os.includes('android')) return 'Android';
  if (os.includes('linux')) return 'Linux';
  return deviceInfo?.os || 'Bilinmeyen';
};

export default function SessionsPage() {
  const { data, isLoading, error, refetch } = useActiveSessions();
  const terminateSession = useTerminateSession();
  const terminateAllOther = useTerminateAllOtherSessions();
  const [terminatingId, setTerminatingId] = useState<string | null>(null);

  const sessions = data?.sessions || [];
  const currentSessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null;

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm('Bu oturumu sonlandırmak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setTerminatingId(sessionId);
      await terminateSession.mutateAsync(sessionId);
      toast.success('Oturum başarıyla sonlandırıldı');
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Oturum sonlandırılırken bir hata oluştu');
    } finally {
      setTerminatingId(null);
    }
  };

  const handleTerminateAllOther = async () => {
    if (!confirm('Tüm diğer oturumları sonlandırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      await terminateAllOther.mutateAsync();
      toast.success('Tüm diğer oturumlar başarıyla sonlandırıldı');
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Oturumlar sonlandırılırken bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">Oturumlar yüklenirken bir hata oluştu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Oturum Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Aktif oturumlarınızı görüntüleyin ve yönetin
          </p>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={handleTerminateAllOther}
            disabled={terminateAllOther.isPending}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {terminateAllOther.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sonlandırılıyor...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Tüm Diğer Oturumları Sonlandır
              </>
            )}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Aktif Oturum</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{sessions.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Bu Cihaz</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {sessions.filter(s => s._id === currentSessionId).length > 0 ? 'Aktif' : 'Pasif'}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Diğer Cihazlar</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {sessions.filter(s => s._id !== currentSessionId).length}
          </p>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Aktif Oturumlar</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sessions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Aktif oturum bulunmuyor</p>
            </div>
          ) : (
            sessions.map((session) => {
              const isCurrentSession = session._id === currentSessionId;
              const lastActivity = new Date(session.lastActivity);
              const createdAt = new Date(session.createdAt);
              const expiresAt = new Date(session.expiresAt);

              return (
                <div
                  key={session._id}
                  className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    isCurrentSession ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Device Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getDeviceIcon(session.deviceInfo)}
                      </div>

                      {/* Session Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {getBrowserName(session.deviceInfo)} - {getOSName(session.deviceInfo)}
                          </h3>
                          {isCurrentSession && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              Bu Cihaz
                            </span>
                          )}
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>IP: {session.deviceInfo?.ipAddress || 'Bilinmiyor'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Son aktivite: {formatDistanceToNow(lastActivity)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Oluşturulma: {createdAt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Bitiş: {expiresAt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 ml-4">
                      {!isCurrentSession && (
                        <button
                          onClick={() => handleTerminateSession(session._id)}
                          disabled={terminatingId === session._id}
                          className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {terminatingId === session._id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                              Sonlandırılıyor...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Sonlandır
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200">Güvenlik Önerileri</h3>
            <ul className="mt-2 text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Tanımadığınız cihazlardan gelen oturumları hemen sonlandırın</li>
              <li>• Düzenli olarak oturumlarınızı kontrol edin</li>
              <li>• Şüpheli aktivite fark ederseniz tüm oturumları sonlandırın ve şifrenizi değiştirin</li>
              <li>• Ortak bilgisayarlarda &quot;Beni Hatırla&quot; özelliğini kullanmayın</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

