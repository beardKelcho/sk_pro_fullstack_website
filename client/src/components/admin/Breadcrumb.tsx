'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import StructuredData, { createBreadcrumbListSchema } from '@/components/common/StructuredData';

interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

export default function Breadcrumb({ items, showHome = true }: BreadcrumbProps) {
  const pathname = usePathname();
  
  // Eğer items verilmemişse, pathname'den otomatik oluştur
  const breadcrumbItems = useMemo(() => {
    if (items) return items;
    
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    if (showHome) {
      breadcrumbs.push({ name: 'Ana Sayfa', url: '/' });
    }
    
    const isObjectId = (segment: string) => /^[a-f0-9]{24}$/i.test(segment);

    // Admin panel route'ları için daha okunabilir isimler
    const labelMap: Record<string, string> = {
      admin: 'Admin',
      dashboard: 'Dashboard',
      users: 'Kullanıcılar',
      projects: 'Projeler',
      equipment: 'Ekipmanlar',
      tasks: 'Görevler',
      clients: 'Müşteriler',
      customers: 'Müşteriler',
      maintenance: 'Bakım',
      calendar: 'Takvim',
      'site-images': 'Site Görselleri',
      'site-content': 'Site İçeriği',
      'project-gallery': 'Proje Galerisi',
      notifications: 'Bildirimler',
      'notification-settings': 'Bildirim Ayarları',
      permissions: 'Yetkiler',
      sessions: 'Oturumlar',
      monitoring: 'İzleme',
      'qr-codes': 'QR Kodlar',
      'two-factor': '2FA',
      profile: 'Profil',
      view: 'Görüntüle',
      edit: 'Düzenle',
      add: 'Ekle',
      new: 'Yeni',
      login: 'Giriş',
      forbidden: 'Erişim Yok',
    };

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;

      // Mongo ObjectId gibi dinamik segmentleri breadcrumb'da göstermeyelim
      // Örn: /admin/users/edit/6959d9... => "6959d9..." yerine sadece "Düzenle" kalsın.
      if (isObjectId(path)) {
        return;
      }

      const name =
        labelMap[path] ||
        path
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      
      // Son öğe için URL ekleme (mevcut sayfa)
      if (index === paths.length - 1) {
        breadcrumbs.push({ name, url: currentPath });
      } else {
        breadcrumbs.push({ name, url: currentPath });
      }
    });
    
    return breadcrumbs;
  }, [pathname, items, showHome]);
  
  const breadcrumbSchema = useMemo(() => {
    return createBreadcrumbListSchema(breadcrumbItems);
  }, [breadcrumbItems]);

  return (
    <>
      <StructuredData type="breadcrumbList" data={breadcrumbSchema} />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <svg
                  className="w-4 h-4 text-gray-400 mx-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {item.url && index < breadcrumbItems.length - 1 ? (
                <Link
                  href={item.url}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  className={index === breadcrumbItems.length - 1 
                    ? 'text-gray-900 dark:text-white font-medium' 
                    : 'text-gray-500 dark:text-gray-400'
                  }
                  aria-current={index === breadcrumbItems.length - 1 ? 'page' : undefined}
                >
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

