'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getNotificationSettings,
  updateNotificationSettings,
  NotificationSettings,
} from '@/services/notificationSettingsService';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { trackApiError } from '@/utils/errorTracking';

const NOTIFICATION_TYPES = [
  { key: 'TASK_ASSIGNED', label: 'Görev Atamaları' },
  { key: 'TASK_UPDATED', label: 'Görev Güncellemeleri' },
  { key: 'PROJECT_STARTED', label: 'Proje Başlangıçları' },
  { key: 'PROJECT_UPDATED', label: 'Proje Güncellemeleri' },
  { key: 'PROJECT_COMPLETED', label: 'Proje Tamamlanmaları' },
  { key: 'MAINTENANCE_REMINDER', label: 'Bakım Hatırlatmaları' },
  { key: 'MAINTENANCE_DUE', label: 'Bakım Süresi Doldu' },
  { key: 'EQUIPMENT_ASSIGNED', label: 'Ekipman Atamaları' },
  { key: 'USER_INVITED', label: 'Kullanıcı Davetleri' },
  { key: 'SYSTEM', label: 'Sistem Bildirimleri' },
] as const;

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    isSupported: pushSupported,
    isSubscribed: pushSubscribed,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
  } = usePushNotifications();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotificationSettings();
      setSettings(data);
    } catch (err: any) {
      trackApiError(err, '/notification-settings', 'GET');
      setError(err.message || 'Ayarlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      await updateNotificationSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      trackApiError(err, '/notification-settings', 'PUT');
      setError(err.message || 'Ayarlar kaydedilirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handlePushToggle = async () => {
    if (!pushSupported) return;

    try {
      if (pushSubscribed) {
        await unsubscribePush();
      } else {
        try {
          await subscribePush();
        } catch (error) {
          setError('Push notification izni verilmedi veya bir hata oluştu');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Push notification ayarı değiştirilemedi');
    }
  };

  const updatePushType = (type: string, value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      pushTypes: {
        ...settings.pushTypes,
        [type]: value,
      },
    });
  };

  const updateEmailType = (type: string, value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      emailTypes: {
        ...settings.emailTypes,
        [type]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Ayarlar yüklenemedi. Lütfen sayfayı yenileyin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Bildirim Ayarları
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Bildirim tercihlerinizi yönetin ve hangi bildirimleri almak istediğinizi seçin.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">Ayarlar başarıyla kaydedildi!</p>
        </div>
      )}

      {/* Push Notification Ayarları */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Push Bildirimleri
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Tarayıcı push bildirimlerini etkinleştirin veya devre dışı bırakın
            </p>
          </div>
          <div className="flex items-center gap-4">
            {pushSupported ? (
              <>
                <span
                  className={`text-sm font-medium ${
                    pushSubscribed ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {pushSubscribed ? 'Aktif' : 'Pasif'}
                </span>
                <button
                  onClick={handlePushToggle}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    pushSubscribed
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {pushSubscribed ? 'Devre Dışı Bırak' : 'Etkinleştir'}
                </button>
              </>
            ) : (
              <span className="text-sm text-gray-500">
                Bu tarayıcı push bildirimlerini desteklemiyor
              </span>
            )}
          </div>
        </div>

        {pushSupported && (
          <>
            <div className="mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pushEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, pushEnabled: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  Push bildirimlerini etkinleştir
                </span>
              </label>
            </div>

            {settings.pushEnabled && (
              <div className="mt-4 space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Push Bildirim Tipleri:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {NOTIFICATION_TYPES.map((type) => (
                    <label
                      key={type.key}
                      className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={settings.pushTypes[type.key as keyof typeof settings.pushTypes]}
                        onChange={(e) => updatePushType(type.key, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Email Notification Ayarları */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            Email Bildirimleri
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Email bildirimlerini etkinleştirin veya devre dışı bırakın
          </p>
        </div>

        <div className="mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.emailEnabled}
              onChange={(e) =>
                setSettings({ ...settings, emailEnabled: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              Email bildirimlerini etkinleştir
            </span>
          </label>
        </div>

        {settings.emailEnabled && (
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Email Bildirim Tipleri:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {NOTIFICATION_TYPES.map((type) => (
                <label
                  key={type.key}
                  className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={settings.emailTypes[type.key as keyof typeof settings.emailTypes]}
                    onChange={(e) => updateEmailType(type.key, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* In-App Notification Ayarları */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            Uygulama İçi Bildirimler
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Uygulama içi bildirimler her zaman aktif olacaktır
          </p>
        </div>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.inAppEnabled}
            onChange={(e) =>
              setSettings({ ...settings, inAppEnabled: e.target.checked })
            }
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-gray-700 dark:text-gray-300">
            Uygulama içi bildirimleri göster
          </span>
        </label>
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          İptal
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  );
}

