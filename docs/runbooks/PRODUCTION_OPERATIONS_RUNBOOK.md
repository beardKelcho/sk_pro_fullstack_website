# Production Operations Runbook

> Amaç: Canlı sistemde deploy, sağlık kontrolü, alarm takibi ve ilk müdahale akışını tek yerde toplamak.

---

## Canlı Referansları

- Frontend: `https://www.skpro.com.tr`
- Backend: `https://sk-pro-backend.onrender.com`
- Render health check path: `/api/readyz`
- Smoke komutu: `npm run smoke:production`

---

## Günlük Operasyon Rutini

1. `npm run smoke:production` çalıştır.
2. Backend `GET /api/livez`, `GET /api/readyz`, `GET /api/health` sonuçlarını kontrol et.
3. Admin login sayfasının ve ana sayfanın erişilebilir olduğunu doğrula.
4. Sentry `Issues` ekranında son 24 saatte yeni issue spike var mı bak.
5. Render deploy geçmişinde son deploy `live`, Vercel deploy geçmişinde son deploy `READY / PROMOTED` olmalı.

---

## Deploy Sonrası Kontrol

1. Render backend deploy tamamlanınca `/api/readyz` 200 dönmeli.
2. Vercel frontend deploy tamamlanınca ana sayfa ve `/admin/login` 200 dönmeli.
3. `OPTIONS /api/cms/contact` preflight testi frontend origin ile 200 veya 204 dönmeli.
4. Gerekirse manuel admin smoke:
   - login
   - dashboard
   - site content kaydetme
   - export

---

## Alarm Kuralları

### Kritik

- `readyz != 200` ardışık 2 kontrol: acil müdahale
- Sentry `fatal` seviye event: anında inceleme
- Login başarısızlıklarında ani artış: auth veya rate-limit regresyonu ihtimali
- Contact form CORS preflight başarısızlığı: public lead akışı etkilenir

### Yüksek

- 15 dakika içinde 3+ yeni Sentry issue
- 15 dakika içinde 10+ adet `5xx`
- 15 dakika içinde 50+ adet `429`

### Orta

- Lighthouse mobile performance skorunda belirgin düşüş
- Bundle size budget aşımı

---

## İlk Müdahale Akışı

1. Sorunun frontend mi backend mi olduğunu `smoke:production` sonucu ile ayır.
2. Backend sorunuysa önce `readyz`, sonra Render logları, sonra DB/Redis durumunu kontrol et.
3. Frontend sorunuysa son Vercel deploy, env değişikliği ve Sentry release bilgisini kontrol et.
4. Auth veya admin sorunuysa önce `/api/auth/profile`, sonra cookie/session, sonra 401/429 loglarını incele.
5. CORS sorunuysa frontend origin, backend `CLIENT_URL` ve `CORS_ORIGIN` değerlerini doğrula.

---

## Haftalık Bakım

1. `npm run audit:ci`
2. `npm run perf:check`
3. Sentry resolved/stale issue temizliği
4. Kritik endpoint'lerde log gürültüsü veya yeni warning var mı kontrolü
5. Backup alınabildiğini ve restore adımlarının güncel olduğunu teyit et

---

## Aylık Bakım

1. Dependency güncelleme penceresi aç
2. Backup restore tatbikatı yap
3. Rate limit ve security header gözden geçirmesi yap
4. Product backlog önceliklerini canlı geri bildirimle tekrar sırala
