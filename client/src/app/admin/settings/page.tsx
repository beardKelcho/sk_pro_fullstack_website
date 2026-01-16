'use client';

import Link from 'next/link';

type SettingsCard = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

const SettingsPage = () => {
  const cards: SettingsCard[] = [
    {
      title: 'Profil',
      description: 'Profil bilgilerinizi görüntüleyin ve güncelleyin.',
      href: '/admin/profile',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      title: 'Bildirim Ayarları',
      description: 'Bildirim tercihlerinizi yönetin.',
      href: '/admin/notification-settings',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
    },
    {
      title: '2FA (İki Faktörlü Doğrulama)',
      description: 'Hesabınız için ek güvenlik katmanı ekleyin.',
      href: '/admin/two-factor',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ayarlar</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Panel ayarlarınızı buradan yönetin.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-gray-100 p-2 text-gray-700 transition group-hover:bg-blue-50 group-hover:text-blue-700 dark:bg-gray-700 dark:text-gray-200 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-300">
                {card.icon}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{card.title}</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{card.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;

