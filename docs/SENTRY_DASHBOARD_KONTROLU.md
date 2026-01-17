# Sentry Error Dashboard Kontrol Rehberi

## 📋 Genel Bakış

Bu dokümantasyon, Sentry error dashboard'unun doğru çalışıp çalışmadığını kontrol etmek için adım adım bir rehber içerir.

## ✅ Önkoşullar

1. Sentry DSN environment variable'ı tanımlı olmalı
2. Sentry config dosyaları oluşturulmuş olmalı
3. Production'da test endpoint'i çalışıyor olmalı

## 🔍 Kontrol Adımları

### 1. Sentry Dashboard'a Giriş

1. [Sentry.io](https://sentry.io) adresine gidin
2. Projenize giriş yapın
3. SK Production projesini seçin

### 2. Error Tracking Testi

#### Backend Test Endpoint'i

```bash
# Test token ile error gönder
curl -X GET "https://api.skpro.com.tr/api/sentry-test" \
  -H "Authorization: Bearer YOUR_SENTRY_TEST_TOKEN"
```

#### Frontend Test

1. Browser console'u açın (F12)
2. Şu kodu çalıştırın:
```javascript
// Sentry test error
if (window.Sentry) {
  window.Sentry.captureException(new Error('Test error from frontend'));
  console.log('✅ Test error sent to Sentry');
} else {
  console.error('❌ Sentry not initialized');
}
```

### 3. Dashboard Kontrolleri

#### Issues Sayfası
- [ ] Son 24 saat içinde error var mı?
- [ ] Error'lar doğru kategorize edilmiş mi?
- [ ] Stack trace'ler görünüyor mu?
- [ ] User context bilgileri var mı?

#### Performance Sayfası
- [ ] Transaction'lar görünüyor mu?
- [ ] API endpoint'lerin response time'ları görünüyor mu?
- [ ] Slow query'ler tespit edilmiş mi?

#### Releases Sayfası
- [ ] Yeni release'ler otomatik oluşturuluyor mu?
- [ ] Release'ler commit SHA ile ilişkilendirilmiş mi?

### 4. Alert Kontrolleri

1. **Settings > Alerts** sayfasına gidin
2. Kontrol edin:
   - [ ] Error rate alert'leri aktif mi?
   - [ ] Performance alert'leri aktif mi?
   - [ ] Email/Slack entegrasyonu çalışıyor mu?

### 5. Source Maps Kontrolü

1. **Settings > Source Maps** sayfasına gidin
2. Kontrol edin:
   - [ ] Source map'ler yüklenmiş mi?
   - [ ] Stack trace'lerde dosya isimleri ve satır numaraları görünüyor mu?

## 🐛 Sorun Giderme

### Error'lar görünmüyor

1. **Environment variable kontrolü:**
   ```bash
   # Backend
   echo $SENTRY_DSN
   
   # Frontend
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```

2. **Sentry config kontrolü:**
   - `client/sentry.client.config.ts` dosyasını kontrol edin
   - `client/sentry.server.config.ts` dosyasını kontrol edin
   - `client/sentry.edge.config.ts` dosyasını kontrol edin

3. **Network kontrolü:**
   - Browser Network tab'ında Sentry istekleri görünüyor mu?
   - CORS hatası var mı?

### Source map'ler çalışmıyor

1. **Build kontrolü:**
   ```bash
   cd client
   npm run build
   # Source map'lerin oluşturulduğunu kontrol edin
   ```

2. **Sentry CLI kontrolü:**
   ```bash
   # Sentry CLI kurulu mu?
   npm list @sentry/cli
   
   # Source map upload test
   npx @sentry/cli releases files VERSION upload-sourcemaps .next
   ```

## 📊 Önerilen Alert Kuralları

### Error Rate Alert
- **Trigger:** Error rate > 10 errors/minute
- **Action:** Email + Slack notification

### Performance Alert
- **Trigger:** P95 response time > 2 seconds
- **Action:** Email notification

### Critical Error Alert
- **Trigger:** New error with level "fatal"
- **Action:** Immediate email + SMS (if configured)

## 🔗 İlgili Dosyalar

- `client/sentry.*.config.ts` - Sentry configuration
- `client/src/utils/errorTracking.ts` - Error tracking utilities
- `server/src/utils/logger.ts` - Server-side logging
- `docs/SENTRY_ENTEGRASYON.md` - Sentry entegrasyon detayları

## 📝 Notlar

- Sentry dashboard kontrolü **manuel** bir işlemdir
- Production'da düzenli olarak (haftada bir) kontrol edilmelidir
- Yeni error'lar için alert'ler kurulmalıdır
- Source map'ler production build'lerde otomatik yüklenmelidir

---

*Son Güncelleme: 2026-01-17*
