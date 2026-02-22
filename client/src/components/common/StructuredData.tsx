import React from 'react';

export type SchemaType = 'LocalBusiness' | 'Service' | 'SoftwareApplication';

interface StructuredDataProps {
  data: Record<string, any>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Helper functions to generate common schema payloads
export const generateLocalBusinessSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "SK Production",
    "image": "https://skpro.com.tr/images/sk-logo.png",
    "@id": "https://skpro.com.tr",
    "url": "https://skpro.com.tr",
    "telephone": "+902120000000",
    "email": "info@skpro.com.tr",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "SK Production Merkez",
      "addressLocality": "Istanbul",
      "addressRegion": "TR",
      "postalCode": "34000",
      "addressCountry": "TR"
    }
  };
};

export const generateServiceSchema = (serviceName: string, description: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": serviceName,
    "provider": {
      "@type": "LocalBusiness",
      "name": "SK Production"
    },
    "description": description
  };
};

export const createBreadcrumbListSchema = (items: { name: string; url?: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url ? `https://skpro.com.tr${item.url}` : `https://skpro.com.tr`
    }))
  };
};
