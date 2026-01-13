# 🔧 Sentry Entegrasyonu - Kurulum Rehberi

> **Tarih**: 2026-01-08  
> **Durum**: Entegrasyon tamamlandı ✅

---

## 📊 Durum

Sentry entegrasyonu tamamlandı ve mevcut `errorTracker` utility'sine entegre edildi. Sentry, production'da otomatik olarak aktif olacak (DSN varsa).

---

## ✅ Yapılan İşler

### 1. Sentry Config Dosyaları Oluşturuldu
- ✅ `client/sentry.client.config.ts` - Client-side error tracking
- ✅ `client/sentry.server.config.ts` - Server-side error tracking
- ✅ `client/sentry.edge.config.ts` - Edge runtime error tracking

### 2. ErrorTracker Utility Güncellendi
- ✅ Sentry entegrasyonu eklendi
- ✅ Mevcut error tracking sistemi korundu
- ✅ Fallback mekanizması (Sentry yoksa local tracking)

### 3. Next.js Config Güncellendi
- ✅ `withSentryConfig` wrapper eklendi
- ✅ Source map upload konfigürasyonu
- ✅ Conditional loading (sadece production'da)

---

## 🚀 Kurulum Adımları

### 1. Sentry Hesabı Oluştur
1. https://sentry.io adresine git
2. Hesap oluştur (ücretsiz plan yeterli)
3. Yeni bir proje oluştur (Next.js seç)

### 2. DSN Al
1. Sentry Dashboard'da projeye git
2. **Settings** > **Client Keys (DSN)** bölümüne git
3. DSN'i kopyala (örn: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)

### 3. Environment Variables Ekle
`.env.local` dosyasına ekle:

```bash
# Client-side DSN (public) ✅ EKLENDİ
NEXT_PUBLIC_SENTRY_DSN=https://98ac147513246ac9c269fbbc6f5f55b2@o4510671889367040.ingest.de.sentry.io/4510671891988560

# Server-side DSN (opsiyonel - aynı DSN kullanılabilir)
SENTRY_DSN=https://98ac147513246ac9c269fbbc6f5f55b2@o4510671889367040.ingest.de.sentry.io/4510671891988560

# Source map upload için (opsiyonel)
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token

# App version (release tracking için)
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**✅ DSN Eklendi**: Sentry DSN başarıyla `.env.local` dosyasına eklendi.

### 4. Source Map Upload (Opsiyonel)
Source map upload için Sentry CLI token'ı gerekli:
1. Sentry Dashboard > **Settings** > **Auth Tokens**
2. Yeni token oluştur (`project:releases` scope)
3. `SENTRY_AUTH_TOKEN` olarak ekle

---

## 📋 Özellikler

### Otomatik Error Tracking
- ✅ Unhandled errors
- ✅ Unhandled promise rejections
- ✅ React Error Boundary hataları
- ✅ API hataları (errorTracker üzerinden)

### Filtreleme
- ✅ Development hataları gönderilmez
- ✅ Network hataları filtrelenir (noise azaltma)
- ✅ Browser extension hataları filtrelenir
- ✅ Validation hataları filtrelenir (server-side)

### Performance Monitoring
- ✅ Transaction tracking (%10 sample rate)
- ✅ Session Replay (%10 normal, %100 hatalı session'lar)

### Release Tracking
- ✅ Her build'de release oluşturulur
- ✅ Version tracking (`NEXT_PUBLIC_APP_VERSION`)

---

## 🔧 Kullanım

### Manuel Error Tracking
```typescript
import { errorTracker } from '@/utils/errorTracking';

// Basit error
errorTracker.logError(new Error('Something went wrong'));

// Context ile
errorTracker.logError(error, {
  userId: '123',
  action: 'createProject',
  projectId: '456',
}, 'high');

// React Error Boundary
errorTracker.captureException(error, errorInfo);
```

### Sentry'ye Özel
```typescript
import * as Sentry from '@sentry/nextjs';

// User context ekle
Sentry.setUser({
  id: '123',
  email: 'user@example.com',
  username: 'username',
});

// Custom context ekle
Sentry.setContext('custom', {
  feature: 'dashboard',
  action: 'load',
});

// Breadcrumb ekle
Sentry.addBreadcrumb({
  category: 'navigation',
  message: 'User navigated to dashboard',
  level: 'info',
});
```

---

## ⚙️ Konfigürasyon

### Sample Rates
- **Traces**: %10 (performans için)
- **Session Replay**: %10 normal, %100 hatalı
- **Errors**: %100 (tüm hatalar gönderilir)

### Filtreleme
- Development hataları gönderilmez
- Network hataları filtrelenir
- Browser extension hataları filtrelenir
- Validation hataları filtrelenir (server-side)

---

## 🧪 Test

### Development'ta Test
```bash
# Sentry DSN'i geçici olarak ekle
NEXT_PUBLIC_SENTRY_DSN=your-dsn npm run dev

# Test error fırlat
# Browser console'da: errorTracker.logError(new Error('Test error'))
```

### Production'da Test
1. Production build yap
2. Sentry Dashboard'da hataları kontrol et
3. Test error fırlat ve Sentry'de göründüğünü doğrula

---

## 📊 Monitoring

### Sentry Dashboard
- **Issues**: Tüm hatalar
- **Performance**: Transaction tracking
- **Releases**: Version tracking
- **Replays**: Session replays

### Alerting
Sentry Dashboard'da alert kuralları oluştur:
- Yeni error türleri
- Error rate artışı
- Performance degradation

---

## 🔒 Güvenlik

### DSN Güvenliği
- ✅ Client-side DSN public (sadece error göndermek için)
- ✅ Server-side DSN private (environment variable)
- ✅ Source map upload için auth token gerekli

### Data Privacy
- ✅ Session Replay'de tüm text maskelenir
- ✅ Medya içeriği engellenir
- ✅ Hassas veriler filtrelenir

---

## 💡 Öneriler

### Production'da
1. **DSN'i ekle** - `.env.production` veya deployment platform'da
2. **Source map upload** - Daha iyi error tracking için
3. **Alert kuralları** - Kritik hatalar için
4. **Release tracking** - Her deployment'da version güncelle

### Development'ta
- Sentry DSN ekleme (development hataları gönderilmez ama test için eklenebilir)
- Local error tracking yeterli

---

## 🐛 Troubleshooting

### Sentry çalışmıyor
1. DSN kontrolü: `NEXT_PUBLIC_SENTRY_DSN` var mı?
2. Environment kontrolü: `NODE_ENV=production` mu?
3. Browser console'da Sentry hataları var mı?

### Source map upload çalışmıyor
1. `SENTRY_AUTH_TOKEN` var mı?
2. `SENTRY_ORG` ve `SENTRY_PROJECT` doğru mu?
3. Token'ın `project:releases` scope'u var mı?

---

## 📝 Notlar

- Sentry sadece **production'da** aktif olur
- Development'ta local error tracking kullanılır
- DSN yoksa Sentry sessizce devre dışı kalır
- Mevcut `errorTracker` sistemi korunur (fallback)

---

*Son Güncelleme: 2026-01-08*

