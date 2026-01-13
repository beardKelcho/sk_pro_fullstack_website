import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  image = '/images/og-image.jpg',
  url = 'https://skproduction.com',
  type = 'website',
  publishedTime,
  modifiedTime,
}: SEOProps): Metadata {
  const siteName = 'SK Production';
  const fullTitle = `${title} | ${siteName}`;
  const fullUrl = url.startsWith('http') ? url : `https://skproduction.com${url}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: type === 'product' ? 'website' : type,
      locale: 'tr_TR',
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: fullUrl,
    },
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1,
    },
    themeColor: '#000000',
    manifest: '/manifest.json',
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  };

  return metadata;
}

// Sitemap oluşturma fonksiyonu
export async function generateSitemap() {
  const baseUrl = 'https://skproduction.com';
  const pages = [
    '',
    '/hakkimizda',
    '/hizmetler',
    '/projeler',
    '/iletisim',
    '/blog',
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages
        .map(
          (page) => `
        <url>
          <loc>${baseUrl}${page}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
          <priority>${page === '' ? '1.0' : '0.8'}</priority>
        </url>
      `
        )
        .join('')}
    </urlset>
  `;

  return sitemap;
}

// Robots.txt oluşturma fonksiyonu
export function generateRobotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

Sitemap: https://skproduction.com/sitemap.xml`;
}

// JSON-LD şeması oluşturma fonksiyonu
export function generateJsonLd({
  type,
  data,
}: {
  type: 'Organization' | 'WebSite' | 'Article' | 'Product';
  data: any;
}) {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  switch (type) {
    case 'Organization':
      return {
        ...baseSchema,
        name: 'SK Production',
        url: 'https://skproduction.com',
        logo: 'https://skproduction.com/images/logo.png',
        description: 'Profesyonel görüntü rejisi ve medya server çözümleri',
        ...data,
      };

    case 'WebSite':
      return {
        ...baseSchema,
        name: 'SK Production',
        url: 'https://skproduction.com',
        description: 'Profesyonel görüntü rejisi ve medya server çözümleri',
        ...data,
      };

    case 'Article':
      return {
        ...baseSchema,
        headline: data.title,
        description: data.description,
        image: data.image,
        datePublished: data.publishedTime,
        dateModified: data.modifiedTime,
        author: {
          '@type': 'Organization',
          name: 'SK Production',
        },
        ...data,
      };

    case 'Product':
      return {
        ...baseSchema,
        name: data.name,
        description: data.description,
        image: data.image,
        brand: {
          '@type': 'Brand',
          name: 'SK Production',
        },
        ...data,
      };

    default:
      return baseSchema;
  }
} 