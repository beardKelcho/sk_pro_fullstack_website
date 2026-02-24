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
SENTRY_AUTH_TOKEN=<your-auth-token>
NEXT_PUBLIC_APP_VERSION=3.0.0
```

---

## 🚑 Acil Durum Kontrol Listesi (Dashboard Check)

Eğer sistemde beklenmeyen 500 hataları veya "Error Tracking Error" dönüşleri alıyorsanız aşağıdaki adımları kontrol edin:

### 1- Bağlantı Testi (Health Check)
```bash
# Sentry'nin Backend iletişimi için
curl -X GET "https://<your-production-url>/api/sentry-test" \
  -H "Authorization: Bearer <YOUR_SENTRY_TEST_TOKEN>"
```

Veya Browser konsolundan manuel log tetikleme (Frontend için):
```javascript
if (window.Sentry) {
  window.Sentry.captureException(new Error('Sentry Manuel Tetikleme Testi'));
}
```

### 2- Dashboard İncelemesi
- [Sentry.io](https://sentry.io/) paneline giriş yaparak `Issues` sekmesinde son 24 saatin loglarına bakın.
- Stack trace, User Context ve Request Body verilerinin gelip gelmediğini kontrol edin.
- `Releases` sayfasına bakarak en son Vercel/Render dağıtımınız ile güncel versiyonun (`NEXT_PUBLIC_APP_VERSION`) uyuştuğunu test edin.

---

## 🔔 Önerilen Alert (Alarm) Kuralları

- **Error Rate Anomaly:** Hata sıklığı > 10 req/minute ise `Slack/Email bildirim`.
- **Performance Threshold:** P95 response time hesabı > 2 Saniye ise uyarı.
- **Fatal Alarm:** Hata Level = `fatal` parametresi geçerse anında SMS / C-Level iletişim.

---

## 🔒 Güvenlik Notu (Veri Maskeleme)

Sentry'e gönderilen **hiçbir veride (Source-map veya Replay dahil)** Password, CreditCard ve benzeri KVKK/GDPR kapsamında korunan kişisel veriler ham olarak aktarılamaz. `sentry.client.config.ts` içerisindeki Data Privacy Scrubbing maskelemelerinin aktif olduğundan emin olun.
