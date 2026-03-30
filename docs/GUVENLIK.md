# 🔒 SK Production - Güvenlik Rehberi

> **Güvenlik Kontrolleri ve Best Practices**  
> Bu rehber, projenin güvenlik durumunu ve alınması gereken önlemleri içerir.

---

## 📋 İçindekiler

1. [Güvenlik Kontrol Listesi](#güvenlik-kontrol-listesi)
2. [Güvenlik Ayarları](#güvenlik-ayarları)
3. [Production Güvenlik Checklist](#production-güvenlik-checklist)
4. [Güvenlik Best Practices](#güvenlik-best-practices)

---

## ✅ Güvenlik Kontrol Listesi

### Authentication & Authorization

- [x] JWT tabanlı kimlik doğrulama (HttpOnly cookies)
- [x] Refresh token mekanizması
- [x] 2FA (İki Faktörlü Kimlik Doğrulama)
- [x] Rol bazlı erişim kontrolü (RBAC)
- [x] Permission-based yetkilendirme
- [x] Rate limiting (IP ve kullanıcı bazlı)
- [x] Password hashing (bcrypt)

### API Güvenliği

- [x] CORS yapılandırması
- [x] Helmet security headers
- [x] Rate limiting
- [x] Input validation (express-validator)
- [x] XSS koruması
- [x] SQL/NoSQL injection koruması
- [x] CSRF koruması

### Data Güvenliği

- [x] Environment variables güvenliği
- [x] Secrets management
- [x] MongoDB network access kısıtlaması
- [x] Data encryption (HTTPS)
- [x] Sensitive data masking

### Infrastructure Güvenliği

- [x] HTTPS aktif
- [x] Security headers aktif
- [x] MongoDB network access kısıtlı
- [x] Firewall rules
- [x] Regular security updates

---

## 🔧 Güvenlik Ayarları

### Backend Güvenlik

#### Environment Variables

```env
# Güçlü JWT secrets (64 bytes)
JWT_SECRET=<güçlü-random-string>
JWT_REFRESH_SECRET=<güçlü-random-string>

# MongoDB network access kısıtlı
MONGO_URI=<mongodb-atlas-connection-string>

# CORS sadece frontend domain'i
CLIENT_URL=<your-frontend-url>
CORS_ORIGIN=<your-frontend-url>
```

#### Security Headers (Helmet)

- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (HSTS)
- Referrer-Policy

#### Rate Limiting

- Login endpoint: 5 istek/15 dakika
- API endpoints: 100 istek/15 dakika
- Upload endpoints: 10 istek/15 dakika

### Frontend Güvenlik

#### Security Headers (next.config.js)

- Strict-Transport-Security
- X-XSS-Protection
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

#### Environment Variables

- Sadece `NEXT_PUBLIC_` prefix'i ile başlayanlar client-side'da kullanılabilir
- Hassas bilgiler (API keys, secrets) `NEXT_PUBLIC_` ile başlamamalı

---

## 📋 Production Güvenlik Checklist

### Pre-Deployment

- [ ] Tüm environment variables production değerleriyle ayarlandı
- [ ] JWT secrets güçlü ve rastgele (64 bytes)
- [ ] MongoDB network access sadece backend IP'si
- [ ] CORS ayarları sadece frontend domain'i
- [ ] Bootstrap admin hesabı güçlü bir şifre ile oluşturuldu
- [ ] 2FA aktif edildi (opsiyonel ama önerilir)

### Post-Deployment

- [ ] HTTPS aktif ve çalışıyor
- [ ] Security headers aktif
- [ ] Rate limiting çalışıyor
- [ ] `npm run smoke:production` geçti
- [ ] Error messages hassas bilgi içermiyor
- [ ] Log'lar hassas bilgi içermiyor
- [ ] Backup stratejisi oluşturuldu

### Ongoing

- [ ] Düzenli security audit (aylık)
- [ ] Dependency güncellemeleri (haftalık)
- [ ] Security patch'ler uygulanıyor
- [ ] Monitoring aktif (error tracking, uptime)
- [ ] Backup restore tatbikatı yapılıyor

---

## 🛡️ Güvenlik Best Practices

### 1. Secrets Management

- ✅ Environment variables kullanın (`.env` dosyaları)
- ✅ Secrets'ları asla commit etmeyin
- ✅ Production'da güçlü, rastgele secret'lar kullanın
- ✅ Secret'ları düzenli olarak rotate edin

**Secret Oluşturma:**
```bash
npm run generate:secrets
```

### 2. Authentication

- ✅ HttpOnly cookies kullanın (XSS koruması)
- ✅ Secure flag kullanın (HTTPS için)
- ✅ SameSite attribute kullanın (CSRF koruması)
- ✅ Token expiration süreleri makul olsun
- ✅ Refresh token mekanizması kullanın

### 3. Authorization

- ✅ Role-based access control (RBAC) kullanın
- ✅ Permission-based yetkilendirme
- ✅ Her endpoint'te authorization kontrolü yapın
- ✅ Principle of least privilege

### 4. Input Validation

- ✅ Tüm user input'ları validate edin
- ✅ express-validator kullanın
- ✅ XSS koruması (sanitize-html)
- ✅ NoSQL injection koruması (Mongoose)

### 5. Error Handling

- ✅ Hassas bilgileri error message'larında göstermeyin
- ✅ Generic error message'lar kullanın
- ✅ Detaylı error'ları sadece log'larda tutun
- ✅ Error tracking (Sentry) kullanın

### 6. Monitoring

- ✅ Error tracking aktif (Sentry)
- ✅ Uptime monitoring aktif
- ✅ Security event logging
- ✅ Regular security audits

---

## 🔍 Security Audit

### Manuel Kontroller

1. **Dependency Audit:**
   ```bash
   npm run audit:ci
   ```

2. **Environment Variables Kontrolü:**
   ```bash
   npm run validate:env
   ```

3. **Security Headers Kontrolü:**
   - Browser DevTools → Network → Headers
   - Security headers'ları kontrol edin

### Otomatik Kontroller

- GitHub Actions security audit (CI/CD)
- npm audit (dependency vulnerabilities)
- Code scanning (opsiyonel)

---

## 📚 İlgili Dokümanlar

- **[Production Deployment](./PRODUCTION_DEPLOYMENT.md)** - Production güvenlik ayarları
- **[Observability Runbook](./OBSERVABILITY_RUNBOOK.md)** - Monitoring ve logging

---

**Başarılar! 🔒**

*Son Güncelleme: 2026-01-08*
