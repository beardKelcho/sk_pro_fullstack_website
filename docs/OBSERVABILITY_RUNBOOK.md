# 📈 SK Production - Observability Runbook

> **Amaç**: Production’da “sistem çalışıyor mu?” ve “sorun olunca nasıl teşhis ederiz?” sorularını hızlı yanıtlamak.

---

## Referans Uç Noktalar

- Frontend: `<your-frontend-url>`
- Backend: `<your-backend-url>`
- Günlük smoke komutu: `npm run smoke:production`

---

## ✅ Sağlık Endpoint’leri (Backend)

Backend base: `https://<backend-host>`

- **`GET /api/livez`**  
  Process ayakta mı? (DB/Redis kontrol etmez.)

- **`GET /api/readyz`**  
  “Trafigi alabilir mi?”  
  - DB connected olmalı  
  - Redis opsiyonel: Redis aktifse ready olmalı
  - Ready değilse **503** döner

- **`GET /api/health`**  
  Snapshot + debug amaçlı:
  - DB readyState
  - Redis snapshot + ping (best-effort)
  - Node version
  - Commit bilgisi (platform env varsa)

Öneri:
- Load balancer / Render health check: **`/api/readyz`**
- Render Blueprint kullanılıyorsa `render.yaml` içindeki `healthCheckPath` alanını bu endpoint ile eşitleyin.

---

## 🧾 Loglar (Backend)

### Log seviyesi
- Varsayılan: `LOG_LEVEL=info`
- Troubleshooting’de geçici: `LOG_LEVEL=debug` (prod’da kısa süre)

### Log formatı
Log aggregation için:
- `LOG_CONSOLE_FORMAT=json` → stdout’ta JSON log (collector dostu)

Not:
- Dev ortamında console log zaten açık.
- Prod’da stdout log’ları özellikle Render gibi platformlarda “tek kaynak” olur.

---

## 🚨 Sentry (Frontend)

Minimum önerilen alert’ler:
- **New issue spike**: 15 dakika içinde `3+` yeni issue
- **Error rate increase**: 15 dakika içinde `10+` adet `5xx`
- **Fatal event**: tek event bile acil inceleme
- **Performance degradation**: Lighthouse veya p95 trendinde belirgin düşüş

Test:
- Uygulama içinden kontrollü bir test event'i üretin veya Sentry dashboard'da son release verisini doğrulayın.

---

## 📊 Monitoring Dashboard (Admin)

Admin tarafındaki monitoring ekranı:
- API response times
- Rate limit (429) metrikleri
- DB query metrikleri (mongoose query monitor)

Not:
- DB down senaryosu için bazı metrikler “degrade” çalışacak şekilde tasarlandı.

---

## ✅ Release Kontrol Rutini (Her Deployment Sonrası)

- [ ] `/api/livez` → 200
- [ ] `/api/readyz` → 200
- [ ] `/api/health` → DB connected + (opsiyonel) redis ready
- [ ] `OPTIONS /api/cms/contact` → frontend origin ile 200/204
- [ ] Admin login + kritik 1-2 ekran smoke test
- [ ] Sentry “Issues” ekranında deploy sonrası spike var mı?
- [ ] GitHub Actions `Production Smoke` workflow son sonucu başarılı mı?
