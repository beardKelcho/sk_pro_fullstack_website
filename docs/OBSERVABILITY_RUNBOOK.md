# 📈 SK Production - Observability Runbook

> **Amaç**: Production’da “sistem çalışıyor mu?” ve “sorun olunca nasıl teşhis ederiz?” sorularını hızlı yanıtlamak.

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
- **New issue spike** (1h içinde X adet yeni issue)
- **Error rate increase** (release bazlı)
- **Performance degradation** (p95/p99)

Test:
- `client/src/app/api/sentry-test/route.ts` üzerinden production’da doğrulama (token ile).

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
- [ ] Admin login + kritik 1-2 ekran smoke test
- [ ] Sentry “Issues” ekranında deploy sonrası spike var mı?

