# 🚀 SK Production - Deployment ve Geliştirme Rehberi

> **Production'da Güvenli Geliştirme ve Deployment**  
> Bu rehber, projeyi production'a almak ve yayındayken geliştirme yapmak için gereken tüm bilgileri içerir.

---

## 📋 Hızlı Başlangıç

### 1. Branch Yapısını Kur

```bash
# Branch'leri oluştur ve yapılandır
./scripts/setup-branches.sh
```

Bu script:
- `main` branch'ini oluşturur (production)
- `develop` branch'ini oluşturur (staging)
- Remote'a push eder

### 2. Environment Variables Ayarla

```bash
# Server için
cd server
cp .env.example .env
# .env dosyasını düzenle

# Client için
cd ../client
cp .env.example .env.local
# .env.local dosyasını düzenle
```

### 3. İlk Deployment

**Staging'e deploy:**
```bash
./scripts/deploy-staging.sh
```

**Production'a deploy:**
```bash
./scripts/deploy-production.sh
```

---

## 🌿 Git Branch Stratejisi

### Branch Yapısı

```
main (production)
  │
  ├── develop (staging)
  │     │
  │     ├── feature/admin-improvements
  │     ├── feature/new-dashboard
  │     └── feature/calendar-enhancements
  │
  └── hotfix/critical-bug
```

### Branch Açıklamaları

- **`main`**: Production ortamı, sadece hazır kodlar
- **`develop`**: Staging ortamı, geliştirmeler burada birleşir
- **`feature/*`**: Yeni özellikler için
- **`hotfix/*`**: Kritik bug düzeltmeleri için

---

## 💻 Günlük Geliştirme Akışı

### Yeni Özellik Ekleme

```bash
# 1. develop branch'ine geç
git checkout develop
git pull origin develop

# 2. Feature branch oluştur
git checkout -b feature/my-feature

# 3. Geliştir ve commit et
git add .
git commit -m "feat(admin): Add new feature"

# 4. Push et
git push origin feature/my-feature

# 5. GitHub'da Pull Request oluştur
# Base: develop, Compare: feature/my-feature

# 6. PR merge edildikten sonra staging'e otomatik deploy olur
```

### Staging'de Test

```bash
# develop branch'ine merge edildikten sonra
# Staging'e otomatik deploy olur:
# - Frontend: https://skproduction-staging.vercel.app
# - Backend: https://skproduction-api-staging.onrender.com

# Test et ve onayla
```

### Production'a Deploy

```bash
# Staging'de test edildikten sonra
./scripts/deploy-production.sh
```

---

## 🚨 Hotfix Süreci

### Kritik Bug Düzeltme

```bash
# 1. Hotfix branch oluştur
./scripts/create-hotfix.sh security-patch

# 2. Bug'ı düzelt
# ... kod değişiklikleri ...

# 3. Test et
npm run dev
npm run test:all

# 4. Commit et
git add .
git commit -m "fix(security): Fix authentication vulnerability"

# 5. Push et
git push origin hotfix/security-patch

# 6. main'e merge et (manuel)
git checkout main
git merge hotfix/security-patch
git push origin main

# 7. develop'a da merge et
git checkout develop
git merge hotfix/security-patch
git push origin develop
```

---

## 🔧 Environment Variables

### Server (.env)

```bash
cd server
cp .env.example .env
```

**Gerekli değişkenler:**
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Güçlü, rastgele string
- `JWT_REFRESH_SECRET`: Güçlü, rastgele string
- `CLIENT_URL`: Frontend URL
- `CORS_ORIGIN`: CORS için frontend URL

### Client (.env.local)

```bash
cd client
cp .env.example .env.local
```

**Gerekli değişkenler:**
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_BACKEND_URL`: Backend base URL

---

## 🚀 Deployment Senaryoları

### Senaryo 1: İlk Production Deployment

```bash
# 1. Branch'leri kur
./scripts/setup-branches.sh

# 2. Environment variables ayarla
# server/.env ve client/.env.local

# 3. Production'a deploy
./scripts/deploy-production.sh
```

### Senaryo 2: Normal Geliştirme

```bash
# 1. Feature branch oluştur
git checkout -b feature/new-feature

# 2. Geliştir ve commit et
git commit -m "feat: Add feature"

# 3. PR oluştur → develop'a merge
# 4. Staging'de test et
# 5. Production'a deploy
./scripts/deploy-production.sh
```

### Senaryo 3: Kritik Bug

```bash
# 1. Hotfix oluştur
./scripts/create-hotfix.sh bug-name

# 2. Düzelt ve test et
# 3. main'e merge → Production'a deploy
# 4. develop'a da merge
```

---

## 📊 CI/CD Pipeline

### Otomatik İşlemler

**GitHub Actions** otomatik olarak:

1. **Pull Request'lerde:**
   - Lint kontrolü
   - Type check
   - Test çalıştırma
   - Build kontrolü

2. **develop branch'ine push:**
   - Staging'e otomatik deploy (Vercel + Render)

3. **main branch'ine push:**
   - Production'a otomatik deploy (Vercel + Render)
   - Version tag oluşturma

### Manuel Kontroller

- [ ] Test'ler geçiyor
- [ ] Lint hataları yok
- [ ] Type check geçiyor
- [ ] Build başarılı
- [ ] Staging'de test edildi (production için)

---

## 🛠️ Yardımcı Komutlar

### Branch Yönetimi

```bash
# Tüm branch'leri listele
git branch -a

# Branch sil
git branch -d feature/old-feature

# Remote branch sil
git push origin --delete feature/old-feature
```

### Deployment Kontrolü

```bash
# Production health check
curl https://api.skproduction.com/api/health

# Staging health check
curl https://skproduction-api-staging.onrender.com/api/health
```

### Test ve Build

```bash
# Tüm test'ler
npm run test:all

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

---

## 📝 Commit Mesajları

**Format:** `type(scope): message`

**Örnekler:**
```bash
feat(admin): Add advanced filtering
fix(auth): Fix login redirect issue
refactor(dashboard): Improve performance
docs(readme): Update deployment guide
```

**Type'lar:**
- `feat`: Yeni özellik
- `fix`: Bug düzeltme
- `refactor`: Kod iyileştirme
- `docs`: Dokümantasyon
- `style`: Formatting
- `test`: Test ekleme
- `chore`: Build/config değişiklikleri

---

## ✅ Deployment Checklist

### Staging'e Deploy Öncesi

- [ ] Tüm test'ler geçiyor
- [ ] Lint hataları yok
- [ ] Type check geçiyor
- [ ] Local'de test edildi
- [ ] Code review yapıldı
- [ ] Environment variables doğru

### Production'a Deploy Öncesi

- [ ] Staging'de test edildi
- [ ] Tüm test'ler geçiyor
- [ ] Database migration hazır (varsa)
- [ ] Backup alındı
- [ ] Rollback planı hazır
- [ ] Monitoring aktif
- [ ] Error tracking aktif

---

## 🚨 Sorun Giderme

### Deployment Başarısız

1. GitHub Actions log'larını kontrol et
2. Vercel/Render log'larını kontrol et
3. Environment variables'ları kontrol et
4. Build hatalarını kontrol et

### Staging Çalışmıyor

1. Branch'in `develop` olduğunu kontrol et
2. Environment variables'ları kontrol et
3. MongoDB bağlantısını kontrol et

### Production Çalışmıyor

1. Staging'de test et
2. Database migration'ları kontrol et
3. Rollback yap (gerekirse)

---

## 📚 İlgili Dokümanlar

- **[PRODUCTION_DEPLOYMENT_CHECKLIST.md](./PRODUCTION_DEPLOYMENT_CHECKLIST.md)** - İlk production deployment
- **[PRODUCTION_GELISTIRME_REHBERI.md](./PRODUCTION_GELISTIRME_REHBERI.md)** - Detaylı geliştirme rehberi
- **[KURULUM_REHBERI.md](./KURULUM_REHBERI.md)** - Kurulum rehberi

---

**Başarılar! 🎉**

*Son Güncelleme: 2026-01-08*
