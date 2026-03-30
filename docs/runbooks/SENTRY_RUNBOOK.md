# 🚨 Sentry Error Tracking Runbook

> **Tarih**: 2026-02-24
> **Durum**: Entegrasyon aktif ve production ready ✅
> **Hedef**: Sistem üzerindeki Unhandled promise rejections, React Error sınırları ve API hatalarının izlenmesi ile performansı yönetmek.

---

## 💻 Kurulum ve DSN Bağlantısı

Sentry sadece üretim (Production) ortamında çalışır. Dev ortamındaki hataları Sentry'e paslamaz. Sentry konfigürasyonları `sentry.client.config.ts`, `sentry.server.config.ts`, ve `sentry.edge.config.ts` aracılığıyla projeye dahildir.

`.env` dosyanızda şu değerler projenizle uyuşmalıdır:

```bash
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
SENTRY_DSN=<your-sentry-dsn>
SENTRY_ORG=<your-org-slug>
SENTRY_PROJECT=<your-project-slug>
NEXT_PUBLIC_APP_VERSION=3.0.0
```

Not:
- `SENTRY_AUTH_TOKEN` yalnızca yönetim veya entegrasyon işlemleri için gerekir.
- Bu token repoda tutulmamalı ve yalnızca platform secret store içinde saklanmalıdır.

---

## 🚑 Acil Durum Kontrol Listesi (Dashboard Check)

Eğer sistemde beklenmeyen 500 hataları veya "Error Tracking Error" dönüşleri alıyorsanız aşağıdaki adımları kontrol edin:

### 1- Bağlantı Testi (Health Check)
```bash
# Uygulama içinden kontrollü bir test event'i üretin
# veya Sentry dashboard'dan son release ve issue akışını doğrulayın
```

### 2- Dashboard İncelemesi
- [Sentry.io](https://sentry.io/) paneline giriş yaparak `Issues` sekmesinde son 24 saatin loglarına bakın.
- Stack trace, User Context ve Request Body verilerinin gelip gelmediğini kontrol edin.
- `Releases` sayfasına bakarak en son Vercel/Render dağıtımınız ile güncel versiyonun (`NEXT_PUBLIC_APP_VERSION`) uyuştuğunu test edin.

---

## 🔔 Önerilen Alert (Alarm) Kuralları

- **New Issue Spike:** 15 dakika içinde `3+` yeni issue.
- **Error Rate Anomaly:** 15 dakika içinde `10+` adet `5xx`.
- **Fatal Alarm:** Hata seviyesi `fatal` ise anında bildirim.
- **Auth / Contact Regression:** Login veya contact form kaynaklı art arda hata görüldüğünde release notu ile birlikte inceleme.

## 🧹 Issue Hijyeni

- Son deploy'dan önce görülüp yeni event almayan issue'ları `resolved` durumuna çekin.
- Yeni event gelmeyen ama açık kalan kayıtlar için release ve `last seen` bilgisini kontrol edin.
- Stale issue temizliğini haftalık operasyon rutininin parçası yapın.

---

## 🔒 Güvenlik Notu (Veri Maskeleme)

Sentry'e gönderilen **hiçbir veride (Source-map veya Replay dahil)** Password, CreditCard ve benzeri KVKK/GDPR kapsamında korunan kişisel veriler ham olarak aktarılamaz. `sentry.client.config.ts` içerisindeki Data Privacy Scrubbing maskelemelerinin aktif olduğundan emin olun.
