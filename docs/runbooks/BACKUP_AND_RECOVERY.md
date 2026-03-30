# Backup and Recovery Runbook

> Amaç: Veri kaybı, bozuk deploy veya yanlış içerik değişikliği durumunda geri dönüş sürecini netleştirmek.

---

## Hedefler

- Hedef RPO: `<= 24 saat`
- Hedef RTO: `<= 60 dakika`

Bu hedefler tek kişilik ekip için pratik bir baz çizgidir; trafik artarsa daha sık backup ve daha kısa geri dönüş hedefi tanımlanmalıdır.

---

## Backup Kapsamı

### Zorunlu

- MongoDB verisi
- Medya dosyaları veya storage bucket içeriği
- Production environment variable envanteri
- Son sağlıklı deploy commit bilgisi

### Önerilen

- Sentry release notları
- Admin kullanıcı ve yetki değişikliği kayıtları
- Export şablonları ve email template içerikleri

---

## MongoDB Backup

### Atlas M10 ve üzeri

- Snapshot backup özelliğini aktif tut
- Retention politikasını aylık kontrol et

### Manuel backup

```bash
mongodump --uri="<mongo-uri>" --out="./backups/mongo-$(date +%Y%m%d-%H%M)"
```

### Restore

```bash
mongorestore --drop --uri="<mongo-uri>" "./backups/mongo-YYYYMMDD-HHMM"
```

---

## Medya Backup

### Local uploads kullanılıyorsa

```bash
tar -czf "uploads-backup-$(date +%Y%m%d-%H%M).tar.gz" server/uploads
```

### Cloudinary veya S3 kullanılıyorsa

- Bucket veya media library export politikasını platform tarafında açık tut
- Kritik içerikler için aylık dış yedek al

---

## Environment Backup

- Secret'ları repoya yazma
- Platform env listesini güvenli parola kasasında tut
- Her değişiklikten sonra şu alanları güncelle:
  - `CLIENT_URL`
  - `CORS_ORIGIN`
  - `MONGO_URI`
  - `JWT_SECRET`
  - `JWT_REFRESH_SECRET`
  - mail / push / storage anahtarları

---

## Rollback Stratejisi

### Frontend rollback

1. Son sağlıklı Vercel production deploy'unu belirle
2. Gerekirse o deploy'u yeniden promote et
3. Ana sayfa ve `/admin/login` için smoke kontrol çalıştır

### Backend rollback

1. Son sağlıklı Render deploy veya commit'i belirle
2. İlgili commit'i yeniden deploy et
3. `/api/readyz` ve `/api/health` kontrol et

### Veri rollback

1. Etki alanını doğrula: tüm DB mi, belirli collection mı, yalnız medya mı
2. Restore öncesi mevcut bozuk durumu da ayrı backup olarak sakla
3. Restore sonrası `npm run smoke:production` ile kontrol et

---

## Olay Sonrası Doğrulama

1. `npm run smoke:production`
2. Admin login
3. Contact form CORS preflight
4. Son 30 dakikada yeni Sentry issue var mı kontrol
5. Render ve Vercel son deploy durumlarını kayda geçir

---

## Ne Zaman Tatbikat Yapılmalı

- En az ayda bir kez backup restore provası
- Büyük refactor, auth değişikliği veya storage migrasyonu sonrası ekstra prova
