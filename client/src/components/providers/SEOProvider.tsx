import { useEffect } from 'react';
import Script from 'next/script';
import { generateJsonLd } from '@/utils/seo';

interface SEOProviderProps {
  children: React.ReactNode;
  type?: 'Organization' | 'WebSite' | 'Article' | 'Product';
  data?: any;
}

export function SEOProvider({ children, type = 'WebSite', data = {} }: SEOProviderProps) {
  useEffect(() => {
    // Sayfa başlığını güncelle
    if (data.title) {
      document.title = `${data.title} | SK Production`;
    }

    // Meta açıklamayı güncelle
    if (data.description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', data.description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = data.description;
        document.head.appendChild(meta);
      }
    }

    // Canonical URL'i güncelle
    if (data.url) {
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', data.url);
      } else {
        const link = document.createElement('link');
        link.rel = 'canonical';
        link.href = data.url;
        document.head.appendChild(link);
      }
    }
  }, [data]);

  return (
    <>
      {/* JSON-LD şeması */}
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateJsonLd({ type, data })),
        }}
      />

      {/* Open Graph meta etiketleri */}
      {data.title && (
        <meta property="og:title" content={`${data.title} | SK Production`} />
      )}
      {data.description && <meta property="og:description" content={data.description} />}
      {data.image && <meta property="og:image" content={data.image} />}
      {data.url && <meta property="og:url" content={data.url} />}
      <meta property="og:type" content={type.toLowerCase()} />
      <meta property="og:site_name" content="SK Production" />
      <meta property="og:locale" content="tr_TR" />

      {/* Twitter Card meta etiketleri */}
      <meta name="twitter:card" content="summary_large_image" />
      {data.title && (
        <meta name="twitter:title" content={`${data.title} | SK Production`} />
      )}
      {data.description && <meta name="twitter:description" content={data.description} />}
      {data.image && <meta name="twitter:image" content={data.image} />}

      {children}
    </>
  );
} 