import { usePushNotifications } from '@/hooks/usePushNotifications';

export function PushNotificationToggle() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={isLoading}
        className={`
          px-4 py-2 rounded-md text-sm font-medium
          ${isSubscribed
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        `}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Yükleniyor...
          </span>
        ) : isSubscribed ? (
          'Bildirimleri Kapat'
        ) : (
          'Bildirimleri Aç'
        )}
      </button>

      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}

      {isSubscribed && (
        <div className="text-sm text-green-500">
          Bildirimler aktif
        </div>
      )}
    </div>
  );
} 