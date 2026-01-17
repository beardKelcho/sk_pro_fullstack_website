# 🔒 SK Production - Security Audit Checklist (Manual)

> **Amaç**: Production’a çıkmadan önce güvenlik risklerini sistematik şekilde taramak ve “bilinen açık” bırakmamak.  
> **Kapsam**: Backend (Express), Frontend (Next.js), CI/CD, altyapı (Render/Vercel/MongoDB Atlas).  
> **Not**: Bu checklist “pen test” yerine geçmez; pen test için de aşağıda hazırlık adımları var.

---

## ✅ 1) Secrets & Environment Variables

- [ ] **Secrets repo’da yok**: `.env`, `.env.local`, `.pem`, `.p12`, `*.key` vb. git’te bulunmuyor.
- [ ] **JWT secret’lar güçlü**: `JWT_SECRET` ve `JWT_REFRESH_SECRET` en az 64 byte random.
- [ ] **Prod’da debug kapalı**: `NODE_ENV=production`.
- [ ] **Sentry DSN / token güvenliği**:
  - [ ] `NEXT_PUBLIC_SENTRY_DSN` sadece DSN (public olabilir).
  - [ ] `SENTRY_AUTH_TOKEN` sadece CI/build ortamında (local repo’da değil).
- [ ] **Email / VAPID / Redis** secret’ları sadece platform env’de.

Hızlı üretim:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## ✅ 2) Dependency & Supply Chain

- [ ] **CI npm audit**: `npm run audit:ci` (root + client + server) **high/critical** seviyesinde geçiyor.
- [ ] **Dependabot aktif**: `.github/dependabot.yml` ile weekly update PR’ları geliyor.
- [ ] **Lockfile mevcut**: `package-lock.json`’lar committed.
- [ ] **Kritik paket güncellemeleri**: auth/crypto/network ile ilgili major değişimler kontrollü uygulanıyor.

---

## ✅ 3) Authentication & Session Security (Backend)

- [ ] **JWT cookie’leri HttpOnly** ve prod’da `secure` (HTTPS) aktif.
- [ ] **Refresh token rotasyonu** / iptal stratejisi net.
- [ ] **2FA** prod’da kritik roller için açık.
- [ ] **Brute force koruması**:
  - [ ] `/api/auth/*` rate limiting aktif
  - [ ] login hata mesajları “user enumeration” yaratmıyor (aşırı detay yok).
- [ ] **RBAC**: admin/modül endpoint’leri rol bazlı korunuyor.
- [ ] **Password politikası**: minimum uzunluk, hash (bcrypt) round uygun.

---

## ✅ 4) Input Validation & Injection Koruması

- [ ] **Validation**: kritik endpoint’lerde schema/validator var (login, upload, create/update).
- [ ] **NoSQL injection**: request sanitization aktif (mongo sanitize).
- [ ] **XSS**: user-content sanitize (örn: email template preview/render) kontrolü.
- [ ] **File upload**:
  - [ ] content-type / uzantı allowlist
  - [ ] max size limit
  - [ ] path traversal guard

---

## ✅ 5) Security Headers & CORS

- [ ] **CORS allowlist** sadece gerekli origin’leri içeriyor.
- [ ] **CSRF mitigasyonu**: state-changing request’lerde origin allowlist aktif.
- [ ] **Headers**:
  - [ ] HSTS (prod)
  - [ ] X-Content-Type-Options
  - [ ] Frameguard
  - [ ] Referrer-Policy
  - [ ] CSP (frontend ve backend için politikalar gözden geçirildi)

---

## ✅ 6) Logging, PII ve Audit Trail

- [ ] **PII loglanmıyor**: password, token, refresh token, OTP, tam email/telefon gibi hassas veriler maskeleniyor.
- [ ] **Request correlation**: requestId loglara düşüyor.
- [ ] **Audit log**: kritik aksiyonlar (role change, delete, export) audit trail’de.
- [ ] **Prod log formatı**: log aggregation için stdout uyumlu (opsiyonel JSON).

---

## ✅ 7) Monitoring & Alerting

- [ ] **Health/Readiness**:
  - [ ] `/api/livez` (process up)
  - [ ] `/api/readyz` (DB + opsiyonel Redis)
  - [ ] `/api/health` (durum + commit + redis snapshot)
- [ ] **Sentry Alerts**:
  - [ ] yeni issue spike
  - [ ] error rate artışı
  - [ ] performans degradasyonu

---

## ✅ 8) Platform / Infra Kontrolleri (Render/Vercel/Atlas)

- [ ] **MongoDB Atlas**:
  - [ ] IP allowlist dar (0.0.0.0/0 yok)
  - [ ] least-privilege user (mümkünse atlas admin yerine db scoped)
  - [ ] backup stratejisi
- [ ] **Render**:
  - [ ] Health check path (öneri: `/api/readyz`)
  - [ ] log retention/aggregation planı
- [ ] **Vercel**:
  - [ ] env vars scope doğru (preview vs prod)
  - [ ] domain yönlendirmeleri/redirect’ler doğru

---

## 🧪 PenTest Hazırlık (Dış Test için)

- [ ] Scope tanımı (public site + admin + API)
- [ ] Test kullanıcıları (rol bazlı: admin/teknisyen/depo)
- [ ] Rate limit threshold’ları (pentest sırasında false-positive olmasın)
- [ ] Sentry + loglarda test döneminde noise yönetimi
- [ ] Rapor formatı + fix SLA (kritik: 24-48 saat)

